import os
import logging
import re
from uuid import uuid4
from dotenv import load_dotenv
from neo4j import GraphDatabase, exceptions as neo4j_exceptions
import time
from tqdm import tqdm
import argparse
from typing import List, Dict, Optional, Any
import asyncio
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain_core.exceptions import OutputParserException
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_mistralai.chat_models import ChatMistralAI
from langchain_mistralai.embeddings import MistralAIEmbeddings

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s [%(levelname)s] - %(message)s'
)
logger = logging.getLogger("kg_builder")

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL_NAME", "mistral-embed")
try:
    EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIMENSION", 1024))
except (TypeError, ValueError):
    logger.critical(
        "EMBEDDING_DIMENSION missing or invalid in .env! Must be an integer.")
    exit(1)
LLM_MODEL = os.getenv("LLM_MODEL_NAME", "mistral-large-latest")

CHUNK_SIZE = 1500
CHUNK_OVERLAP = 150
MIN_CHUNK_LENGTH_CHARS = 100
LLM_RETRIES = 3
LLM_RETRY_DELAY = 8
NEO4J_BATCH_SIZE = 50


def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.replace('\n', ' ').strip()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'Activity\s*\d+\.\d+', '', text, flags=re.IGNORECASE)
    return text


def generate_chunk_id(doc_id, seq_id):
    return f"{doc_id}_chunk_{seq_id}"


class Node(BaseModel):
    id: str = Field(
        description="Unique identifier for the node (concept name, normalized).")
    type: str = Field(
        default="Concept", description="Node type (e.g., 'Concept', 'Definition', 'Example').")
    description: Optional[str] = Field(
        None, description="Optional brief description or definition extracted from text.")


class Relationship(BaseModel):
    source: str = Field(
        description="Source node ID (normalized concept name).")
    target: str = Field(
        description="Target node ID (normalized concept name).")
    type: str = Field(
        description="Type of relationship (e.g., IS_A, PART_OF, EXAMPLE_OF).")


class KnowledgeGraph(BaseModel):
    nodes: List[Node] = Field(default_factory=list,
                              description="List of nodes.")
    relationships: List[Relationship] = Field(
        default_factory=list, description="List of relationships.")


def get_neo4j_driver():
    if not all([NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD]):
        raise ValueError("Neo4j credentials missing in .env")
    try:
        driver = GraphDatabase.driver(NEO4J_URI,
                                      auth=(NEO4J_USERNAME, NEO4J_PASSWORD),
                                      connection_timeout=20)
        driver.verify_connectivity()
        logger.info(
            f"Neo4j driver initialized for database '{NEO4J_DATABASE}'.")
        return driver
    except neo4j_exceptions.ServiceUnavailable as e:
        logger.error(f"Neo4j Unavailable ({NEO4J_URI}): {e}")
        raise
    except neo4j_exceptions.AuthError as e:
        logger.error(f"Neo4j Auth Error (User: {NEO4J_USERNAME}): {e}")
        raise
    except Exception as e:
        logger.error(f"Failed Neo4j init: {e}", exc_info=True)
        raise


def get_embedding_model():
    if not MISTRAL_API_KEY:
        raise ValueError("MISTRAL_API_KEY missing.")
    logger.info(f"Initializing MistralAIEmbeddings (Model: {EMBEDDING_MODEL})")
    return MistralAIEmbeddings(api_key=MISTRAL_API_KEY, model=EMBEDDING_MODEL)


def get_llm():
    if not MISTRAL_API_KEY:
        raise ValueError("MISTRAL_API_KEY missing.")
    logger.info(f"Initializing ChatMistralAI (Model: {LLM_MODEL})")
    return ChatMistralAI(
        api_key=MISTRAL_API_KEY,
        model=LLM_MODEL,
        temperature=0.1,
        model_kwargs={"response_format": {"type": "json_object"}},
        max_retries=1
    )


def setup_neo4j(driver):
    """Ensures constraints and vector index exist in Neo4j."""
    constraints_and_indices = [
        "CREATE CONSTRAINT chapter_name_unique IF NOT EXISTS FOR (c:Chapter) REQUIRE c.name IS UNIQUE;",
        "CREATE CONSTRAINT chunk_id_unique IF NOT EXISTS FOR (c:Chunk) REQUIRE c.id IS UNIQUE;",
        "CREATE CONSTRAINT concept_name_unique IF NOT EXISTS FOR (c:Concept) REQUIRE c.name IS UNIQUE;",
        f"""
        CREATE VECTOR INDEX chunkVectorIndex IF NOT EXISTS
        FOR (c:Chunk) ON (c.embedding)
        OPTIONS {{
            indexConfig: {{
                `vector.dimensions`: {EMBEDDING_DIM},
                `vector.similarity_function`: 'cosine'
            }}
        }}
        """
    ]
    try:
        logger.info(f"Ensuring Neo4j setup for database '{NEO4J_DATABASE}'...")
        with driver.session(database=NEO4J_DATABASE) as session:
            for query in tqdm(constraints_and_indices, desc="Setup Neo4j Constraints/Indices"):
                try:
                    session.run(query)
                except neo4j_exceptions.ClientError as e:
                    if "already exists" in str(e).lower():
                        logger.debug(f"Constraint/Index exists.")
                    else:
                        raise e
        logger.info("Neo4j constraints and vector index ensured.")
    except Exception as e:
        logger.error(f"Neo4j setup failed: {e}", exc_info=True)
        raise


def load_and_split_pdf(pdf_path: str) -> List[Any]:
    """Loads PDF using PyPDFLoader and splits using RecursiveCharacterTextSplitter."""
    logger.info(f"Loading PDF: {pdf_path}")
    try:
        loader = PyPDFLoader(pdf_path, extract_images=False)
        pages = loader.load()
        if not pages:
            logger.warning(f"PyPDFLoader returned no pages for {pdf_path}.")
            return []
        logger.info(f"Loaded {len(pages)} pages.")

        for i, page in enumerate(pages):
            page.metadata["source"] = os.path.basename(pdf_path)
            if "page" not in page.metadata:
                page.metadata["page"] = i

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            length_function=len,
            add_start_index=True,
            separators=["\n\n", "\n", ". ", ", ", " ", ""],
        )
        chunks = text_splitter.split_documents(pages)
        logger.info(f"Split into {len(chunks)} LangChain chunks.")
        return chunks
    except Exception as e:
        logger.error(
            f"Failed loading/splitting PDF {pdf_path}: {e}", exc_info=True)
        return []


async def generate_embeddings_mistral(
    embedding_client: MistralAIEmbeddings,
    texts: List[str],
    batch_size: int = 32
) -> List[Optional[List[float]]]:
    """Generates embeddings using MistralAIEmbeddings async."""
    logger.info(
        f"Generating embeddings for {len(texts)} texts using '{EMBEDDING_MODEL}'...")
    try:
        all_embeddings = await embedding_client.aembed_documents(texts)
        num_successful = len(all_embeddings)
        logger.info(
            f"Embedding generation complete. Successfully generated {num_successful}/{len(texts)} embeddings.")
        if num_successful > 0 and all_embeddings[0] and len(all_embeddings[0]) != EMBEDDING_DIM:
            logger.warning(
                f"Generated embedding dimension ({len(all_embeddings[0])}) != expected ({EMBEDDING_DIM})!")
        if len(all_embeddings[0]) != EMBEDDING_DIM:
            logger.error(
                f"Dimension mismatch! Expected {EMBEDDING_DIM}, Got {len(all_embeddings[0])}")
            raise ValueError("Embedding dimension mismatch")

        return all_embeddings
    except Exception as e:
        logger.error(
            f"Error generating Mistral embeddings: {e}", exc_info=True)
        return [None] * len(texts)


def get_kg_extraction_prompt():
    return ChatPromptTemplate.from_messages([
        ("system",
         """You are an expert knowledge graph extractor focusing ONLY on the NCERT Grade 6 Science chapter context provided.
         Your task is to identify key concepts and relationships based *strictly* on the provided text chunk.
         Output Format: Respond ONLY with a valid JSON object matching this Pydantic schema:
         {{
           "nodes": [
             {{"id": "normalized_concept_name", "type": "Concept | Definition | Example", "description": "Optional brief description..."}}
           ],
           "relationships": [
             {{"source": "source_node_id", "target": "target_node_id", "type": "RELATIONSHIP_TYPE"}}
           ]
         }}
         """),
        ("human",
         "Extract nodes and relationships from this Text Chunk (from chapter '{chapter_name}'):\ntext\n{chunk_text}\n"),
    ])


async def extract_knowledge_graph_mistral(
    llm: ChatMistralAI,
    chunk_text: str,
    chapter_name: str
) -> KnowledgeGraph:
    """Extracts KG components using Mistral LLM and structured output."""
    extraction_prompt = get_kg_extraction_prompt()
    chain = extraction_prompt | llm.with_structured_output(
        KnowledgeGraph, method="json_mode")
    default_kg = KnowledgeGraph()

    for attempt in range(LLM_RETRIES):
        try:
            logger.debug(
                f"Invoking KG extraction chain (Attempt {attempt+1}/{LLM_RETRIES})...")
            extracted_kg = await chain.ainvoke({
                "chapter_name": chapter_name.replace('_', ' '),
                "chunk_text": chunk_text
            })
            if isinstance(extracted_kg, KnowledgeGraph):
                logger.debug(
                    f"Extraction successful (attempt {attempt+1}). Nodes: {len(extracted_kg.nodes)}, Rels: {len(extracted_kg.relationships)}")
                return extracted_kg
            logger.warning(
                f"Structured output did not return KnowledgeGraph object (attempt {attempt+1}). Type: {type(extracted_kg)}")
        except OutputParserException as e:
            logger.warning(
                f"LLM output parsing failed (Attempt {attempt+1}/{LLM_RETRIES}): {e}.")
        except Exception as e:
            status_code = getattr(e, 'status_code', 'N/A')
            message = getattr(e, 'message', str(e))
            if status_code == 429:
                logger.warning(f"Attempt {attempt+1}: Hit Rate Limit (429).")
            else:
                logger.warning(
                    f"Attempt {attempt+1}: Mistral API/Network Error: Status={status_code} Msg='{message}'")

        if attempt < LLM_RETRIES - 1:
            logger.info(f"Retrying KG extraction after {LLM_RETRY_DELAY}s...")
            await asyncio.sleep(LLM_RETRY_DELAY)

    logger.error(f"KG extraction failed after {LLM_RETRIES} attempts.")
    return default_kg


def _merge_chapter_tx(tx, chapter_name):
    tx.run("MERGE (ch:Chapter {name: $name})", name=chapter_name)


def _merge_chunk_tx(tx, chunk_list):
    query = """
    UNWIND $chunk_data AS chunk
    MERGE (c:Chunk {id: chunk.id})
    ON CREATE SET
        c.text = chunk.text,
        c.seq_id = chunk.seq_id,
        c.start_page = chunk.start_page,
        c.end_page = chunk.end_page,
        c.embedding = chunk.embedding,
        c.created = timestamp()
    ON MATCH SET
        c.text = chunk.text,
        c.embedding = chunk.embedding,
        c.start_page = chunk.start_page,
        c.end_page = chunk.end_page,
        c.updated = timestamp()
    WITH c, chunk.chapter_name as chapterName
    MATCH (ch:Chapter {name: chapterName})
    MERGE (c)-[r:PART_OF]->(ch)
    """
    tx.run(query, chunk_data=chunk_list)


def _merge_concepts_tx(tx, node_list):
    query = """
    UNWIND $node_data AS node
    MERGE (c:Concept {name: node.id})
    ON CREATE SET
        c.type = node.type,
        c.description = node.description,
        c.created = timestamp()
    ON MATCH SET
        c.type = node.type,
        c.description = node.description,
        c.updated = timestamp()
    """
    tx.run(query, node_data=node_list)


def _merge_relationships_tx(tx, relationship_list):
    query = """
    UNWIND $relationship_data AS rel
    MATCH (source:Concept {name: rel.source})
    MATCH (target:Concept {name: rel.target})
    MERGE (source)-[r:RELATED_TO {type: rel.type}]->(target)
    ON CREATE SET
        r.source_chunk_id = rel.chunk_id,
        r.created = timestamp()
    ON MATCH SET
        r.source_chunk_id = rel.chunk_id,
        r.updated = timestamp()
    WITH source, target, r, rel.chunk_id AS chunkId
    MATCH (chunk:Chunk {id: chunkId})
    MERGE (chunk)-[:MENTIONS]->(source)
    MERGE (chunk)-[:MENTIONS]->(target)
    """
    tx.run(query, relationship_data=relationship_list)


async def process_pdf_to_graph_async(driver, embedding_client, llm, pdf_path, chapter_name):
    """Async orchestrator for loading, processing, and storing PDF data."""
    start_time = time.monotonic()
    logger.info(
        f"Starting processing for Chapter: '{chapter_name}', PDF: '{os.path.basename(pdf_path)}'")

    if not os.path.exists(pdf_path):
        logger.error(f"PDF not found: {pdf_path}")
        return

    try:
        langchain_chunks = await asyncio.to_thread(load_and_split_pdf, pdf_path)
        if not langchain_chunks:
            logger.warning("No chunks generated from PDF.")
            return
    except Exception as e:
        logger.error(f"Error loading/splitting PDF: {e}", exc_info=True)
        return

    doc_id = re.sub(r'\W+', '_', os.path.basename(pdf_path))
    chunks_data = []
    texts_to_embed = []
    for i, chunk_doc in enumerate(langchain_chunks):
        text = clean_text(chunk_doc.page_content)
        if len(text) >= MIN_CHUNK_LENGTH_CHARS:
            chunk_id = generate_chunk_id(doc_id, i)
            metadata = chunk_doc.metadata
            page_num = metadata.get('page', -1)
            chunks_data.append({
                "id": chunk_id, "text": text, "seq_id": i, "chapter_name": chapter_name,
                "start_page": page_num, "end_page": page_num, "embedding": None, "kg_data": None
            })
            texts_to_embed.append(text)
    logger.info(f"Prepared {len(chunks_data)} processable chunks.")
    if not chunks_data:
        return

    all_embeddings = await generate_embeddings_mistral(embedding_client, texts_to_embed)
    successful_embeddings = 0
    for i, emb in enumerate(all_embeddings):
        if i < len(chunks_data):
            chunks_data[i]['embedding'] = emb
            if emb:
                successful_embeddings += 1
    logger.info(
        f"Assigned {successful_embeddings}/{len(chunks_data)} embeddings.")

    logger.info(
        f"Extracting knowledge graphs for {len(chunks_data)} chunks...")

    LLM_CONCURRENCY_LIMIT = 3
    semaphore = asyncio.Semaphore(LLM_CONCURRENCY_LIMIT)

    async def fetch_kg_with_semaphore(chunk):
        """Wrapper to acquire semaphore before calling LLM extraction."""
        async with semaphore:
            await asyncio.sleep(0.5)
            return await extract_knowledge_graph_mistral(
                llm, chunk['text'], chapter_name.replace('_', ' ')
            )

    kg_extraction_tasks = [
        fetch_kg_with_semaphore(chunk) for chunk in chunks_data
    ]

    kg_results: List[KnowledgeGraph] = await asyncio.gather(*kg_extraction_tasks)

    all_nodes_dict: Dict[str, Dict] = {}
    all_relationships: List[Dict] = []
    total_valid_rels = 0
    for i, kg in enumerate(kg_results):
        if i < len(chunks_data):
            chunks_data[i]['kg_data'] = kg
            if kg and isinstance(kg, KnowledgeGraph):
                for node in kg.nodes:
                    node_id_normalized = node.id.strip().title()
                    if node_id_normalized not in all_nodes_dict:
                        node_data = node.dict()
                        node_data['id'] = node_id_normalized
                        all_nodes_dict[node_id_normalized] = node_data
                    elif node.description and not all_nodes_dict[node_id_normalized].get("description"):
                        all_nodes_dict[node_id_normalized]["description"] = node.description
                for rel in kg.relationships:
                    source_norm = rel.source.strip().title()
                    target_norm = rel.target.strip().title()
                    if source_norm in all_nodes_dict and target_norm in all_nodes_dict:
                        rel_data = rel.dict()
                        rel_data['source'] = source_norm
                        rel_data['target'] = target_norm
                        rel_data['chunk_id'] = chunks_data[i]['id']
                        all_relationships.append(rel_data)
                        total_valid_rels += 1
                    else:
                        logger.warning(
                            f"Rel '{rel.source}'->'{rel.target}' skipped: Node(s) not in extracted set.")

    logger.info(
        f"KG Extraction complete. Total valid relationships: {total_valid_rels}. Unique concepts: {len(all_nodes_dict)}")

    logger.info("Storing graph data in Neo4j...")
    try:
        with driver.session(database=NEO4J_DATABASE) as session:
            session.execute_write(_merge_chapter_tx, chapter_name)
            for i in tqdm(range(0, len(chunks_data), NEO4J_BATCH_SIZE), desc="Storing Chunks"):
                batch = [{k: v for k, v in c.items() if k in ['id', 'text', 'seq_id', 'chapter_name',
                                                              'start_page', 'end_page', 'embedding']} for c in chunks_data[i:i + NEO4J_BATCH_SIZE]]
                session.execute_write(_merge_chunk_tx, batch)
            nodes_to_store = list(all_nodes_dict.values())
            for i in tqdm(range(0, len(nodes_to_store), NEO4J_BATCH_SIZE), desc="Storing Concepts"):
                session.execute_write(_merge_concepts_tx,
                                      nodes_to_store[i:i + NEO4J_BATCH_SIZE])
            for i in tqdm(range(0, len(all_relationships), NEO4J_BATCH_SIZE), desc="Storing Relationships"):
                session.execute_write(
                    _merge_relationships_tx, all_relationships[i:i + NEO4J_BATCH_SIZE])
        logger.info("Neo4j storage complete.")
    except neo4j_exceptions.Neo4jError as e:
        logger.error(f"Neo4j Error during storage: {e}", exc_info=True)
    except Exception as e:
        logger.error(
            f"Unexpected error during Neo4j storage: {e}", exc_info=True)

    end_time = time.monotonic()
    logger.info(
        f"Finished processing '{os.path.basename(pdf_path)}' in {end_time - start_time:.2f} seconds.")


async def main():
    parser = argparse.ArgumentParser(
        description="Build KG: PDF -> LangChain/MistralAI -> Neo4j.")
    parser.add_argument("pdf_path", help="Path to PDF.")
    parser.add_argument(
        "chapter_name", help="Unique chapter name (use underscores).")
    args = parser.parse_args()

    if not all([NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, MISTRAL_API_KEY]):
        logger.critical(
            "Missing required environment variables. Check .env file.")
        return

    sane_chapter_name = re.sub(r'\W+', '_', args.chapter_name)
    if not os.path.exists(args.pdf_path):
        logger.error(f"PDF file not found: {args.pdf_path}")
        return

    neo4j_driver = None
    try:
        neo4j_driver = get_neo4j_driver()
        embedding_client = get_embedding_model()
        llm_client = get_llm()
        setup_neo4j(neo4j_driver)
        await process_pdf_to_graph_async(neo4j_driver, embedding_client, llm_client, args.pdf_path, sane_chapter_name)
    except Exception as e:
        logger.error(f"Critical error: {e}", exc_info=True)
    finally:
        if neo4j_driver:
            try:
                neo4j_driver.close()
                logger.info("Neo4j driver closed.")
            except Exception:
                logger.error("Error closing Neo4j", exc_info=True)

if __name__ == "__main__":
    asyncio.run(main())
