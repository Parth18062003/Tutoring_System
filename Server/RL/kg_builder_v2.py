import os
import logging
import re
import json
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
    domain: Optional[str] = Field(
        None, description="Knowledge domain (Physics, Chemistry, Biology, etc).")
    difficulty: Optional[str] = Field(
        None, description="Difficulty level (Basic, Intermediate, Advanced).")
    prerequisites: List[str] = Field(
        default_factory=list, description="Prerequisite concepts.")
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
        "CREATE CONSTRAINT chunk_id IF NOT EXISTS FOR (c:Chunk) REQUIRE c.id IS UNIQUE;",
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
         '''You are an expert knowledge graph extractor focusing on NCERT Class 6 Science textbook content.
         Your task is to identify key concepts and their relationships based strictly on the provided text chunk. Use the structure and semantics outlined below.
         
         ---
         
         🔷 Step 1: Identify Concept HIERARCHIES (Taxonomic relationships):
         - BROADER_THAN → Hypernym relationship (e.g., "Matter BROADER_THAN Solid")
         - NARROWER_THAN → Hyponym relationship (e.g., "Solid NARROWER_THAN Matter")
         
         🔷 Step 2: Identify LATERAL Relationships:
         - PREREQUISITE_FOR → One concept must be understood before another
         - SIMILAR_TO → Concepts sharing attributes or behavior
         
         ---
         
         🔷 Node Types (choose the most appropriate for each unit of meaning):
         - Concept: Core ideas (e.g., "Evaporation", "Condensation", "Solubility")
         - Definition: Formal definitions (only when explicitly stated)
         - Example: Real-world or textbook examples (e.g., "Water condensing on a cold glass")
         - Process: Sequences or phenomena (e.g., "Water Cycle", "Evaporation Process")
         
         Each node must include:
         1. A normalized, unique ID in PascalCase (e.g., "WaterCycle", "BoilingPoint")
         2. A node type from the list above
         3. A brief description in fluent English
         
         ---
         
         🔷 Relationship Types (between nodes):
         
         Type              | When to Use                                               | Example
         ------------------|-----------------------------------------------------------|---------------------------------------------------------
         IS_A              | One thing is a subtype/class of another                   | "Steam IS_A Gas"
         PART_OF           | Component or phase of a larger system                     | "Evaporation PART_OF WaterCycle"
         EXAMPLE_OF        | A concrete instance illustrating a general concept        | "CondensationOnGlass EXAMPLE_OF Condensation"
         CAUSES            | One concept directly triggers another                     | "Heating CAUSES Evaporation"
         LEADS_TO          | One concept results in or follows from another            | "Evaporation LEADS_TO Condensation"
         PROPERTY_OF       | A trait or quality that belongs to something              | "BoilingPoint PROPERTY_OF Water"
         RELATED_TO        | Associated concepts without a stronger semantic connection| "Solubility RELATED_TO Temperature"
         
         ---
         
         🔷 Output Format:
         Respond ONLY with a valid JSON object using this schema:
         
         {{
           "nodes": [
             {{"id": "PascalCaseID", "type": "Concept | Definition | Example | Process", "description": "Brief description in English"}}
           ],
           "relationships": [
             {{"source": "PascalCaseID", "target": "PascalCaseID", "type": "RELATIONSHIP_TYPE"}}
           ]
         }}
         
         ---
         
         🔷 Guidelines:
         - If the text includes a definition, create a Concept node with the definition in the description. Use "Definition" only if the definition is explicitly called out.
         - Use consistent normalized IDs across chunks.
         - Merge synonymous or duplicate terms under one canonical textbook term (e.g., prefer "Condensation" over "Condensing Vapor").
         - Link Examples to Concepts using EXAMPLE_OF.
         - Link Processes to involved Concepts using PART_OF.
         - If no valid data is found, return: {{ "nodes": [], "relationships": [] }}
         
         ---
         
         🔷 Example Input (from chapter: "Water"):
         
         "Water from oceans, lakes and rivers evaporates due to heat. This water vapor rises and cools down, leading to condensation, which forms clouds. Eventually, the water falls back to the Earth as rain. This continuous process is called the Water Cycle."
         
         🔷 Example Output:
         
         {{
           "nodes": [
             {{"id": "Evaporation", "type": "Concept", "description": "The process of water turning into vapor due to heat"}},
             {{"id": "Condensation", "type": "Concept", "description": "The process where vapor cools and turns into liquid"}},
             {{"id": "Rain", "type": "Concept", "description": "Water falling from clouds to the ground"}},
             {{"id": "WaterCycle", "type": "Process", "description": "A continuous process involving evaporation, condensation and rain"}}
           ],
           "relationships": [
             {{"source": "Evaporation", "target": "Condensation", "type": "LEADS_TO"}},
             {{"source": "Condensation", "target": "Rain", "type": "LEADS_TO"}},
             {{"source": "Evaporation", "target": "WaterCycle", "type": "PART_OF"}},
             {{"source": "Condensation", "target": "WaterCycle", "type": "PART_OF"}},
             {{"source": "Rain", "target": "WaterCycle", "type": "PART_OF"}}
           ]
         }}'''),
        ("human",
         "Extract nodes and relationships from this Text Chunk (from chapter '{chapter_name}'):\n\n{chunk_text}\n"),
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
        c.description = CASE
            WHEN c.description IS NULL THEN node.description
            WHEN node.description IS NULL THEN c.description
            WHEN size(toString(node.description)) > size(toString(c.description)) THEN node.description
            ELSE c.description
        END,
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


def _link_cross_chapter_concepts(driver):
    """Find and link identical or similar concepts across different chapters."""
    logger.info("Linking cross-chapter concepts...")

    try:
        with driver.session(database=NEO4J_DATABASE) as session:
            # First identify exact matches across chapters
            exact_matches = session.run("""
            MATCH (c1:Concept)
            MATCH (c2:Concept)
            WHERE c1.name = c2.name AND id(c1) <> id(c2)
            WITH c1, c2,
                 head([(c1)<-[:MENTIONS]-(chunk1)-[:PART_OF]->(ch1) | ch1.name]) AS chapter1,
                 head([(c2)<-[:MENTIONS]-(chunk2)-[:PART_OF]->(ch2) | ch2.name]) AS chapter2
            WHERE chapter1 < chapter2
            MERGE (c1)-[r:SAME_AS]->(c2)
            SET r.created = CASE WHEN r.created IS NULL THEN timestamp() ELSE r.created END
            RETURN c1.name as concept, chapter1, chapter2
            """)

            matches = [dict(record) for record in exact_matches]

            # Then identify similar concepts (using description similarity)
            similar_matches = session.run("""
            MATCH (c1:Concept), (c2:Concept)
            WHERE c1.name <> c2.name 
              AND c1.description IS NOT NULL 
              AND c2.description IS NOT NULL
              AND apoc.text.jaroWinklerDistance(c1.description, c2.description) > 0.85
            WITH c1, c2,
                 head([(c1)<-[:MENTIONS]-(chunk1)-[:PART_OF]->(ch1) | ch1.name]) AS chapter1,
                 head([(c2)<-[:MENTIONS]-(chunk2)-[:PART_OF]->(ch2) | ch2.name]) AS chapter2,
                 apoc.text.jaroWinklerDistance(c1.description, c2.description) AS similarity
            WHERE chapter1 <> chapter2
            MERGE (c1)-[r:SIMILAR_TO]->(c2)
            SET r.similarity = similarity,
                r.created = CASE WHEN r.created IS NULL THEN timestamp() ELSE r.created END
            RETURN c1.name as concept1, c2.name as concept2, similarity, chapter1, chapter2
            """)

            similar = [dict(record) for record in similar_matches]

            # Finally aggregate concept descriptions across chapters
            session.run("""
            MATCH (c1:Concept)-[:SAME_AS]->(c2:Concept)
            WHERE c1.description IS NOT NULL AND c2.description IS NOT NULL
            WITH c1, c2, 
                 CASE WHEN size(c1.description) > size(c2.description) 
                      THEN c1.description ELSE c2.description END as bestDescription
            SET c1.description = bestDescription,
                c2.description = bestDescription
            """)

            logger.info(
                f"Created {len(matches)} SAME_AS relationships between identical cross-chapter concepts")
            logger.info(
                f"Created {len(similar)} SIMILAR_TO relationships between similar cross-chapter concepts")

        return len(matches), len(similar)
    except Exception as e:
        logger.error(
            f"Error linking cross-chapter concepts: {e}", exc_info=True)
        return 0, 0


def extract_prerequisite_chains(driver):
    """Identify sequences of concepts that build on each other."""
    logger.info("Extracting prerequisite knowledge chains...")

    try:
        with driver.session(database=NEO4J_DATABASE) as session:
            # Find all direct prerequisites
            session.run("""
            MATCH (chunk:Chunk)-[:MENTIONS]->(c1:Concept)
            MATCH (chunk)-[:MENTIONS]->(c2:Concept)
            MATCH (c1)-[r:RELATED_TO]->(c2)
            WHERE r.type IN ['PREREQUISITE_FOR', 'LEADS_TO'] 
            MERGE (c1)-[prereq:PREREQUISITE_FOR]->(c2)
            SET prereq.strength = 1,
                prereq.created = CASE WHEN prereq.created IS NULL THEN timestamp() ELSE prereq.created END
            """)

            # Identify extended prerequisite chains
            chains_result = session.run("""
            MATCH path = (start:Concept)-[:PREREQUISITE_FOR*2..5]->(end:Concept)
            WITH start, end, [node IN nodes(path) | node.name] AS chain, 
                 length(path) AS depth,
                 [rel IN relationships(path) | rel.strength] AS strengths
            WITH start, end, chain, depth, apoc.coll.avg(strengths) AS avg_strength
            WHERE avg_strength > 0.7
            RETURN start.name AS start_concept, end.name AS end_concept, 
                   chain, depth, avg_strength AS strength
            ORDER BY depth DESC, strength DESC
            LIMIT 100
            """)

            chains = [dict(record) for record in chains_result]

            # Store the longest prerequisite chains for curriculum mapping
            for chain in chains:
                if len(chain["chain"]) >= 3:  # Only store significant chains
                    path_id = str(uuid4())
                    session.run("""
                    MATCH (ch:Chapter)<-[:PART_OF]-(chunk:Chunk)-[:MENTIONS]->(c:Concept)
                    WHERE c.name = $start_concept
                    WITH ch, c
                    MERGE (ch)-[:HAS_LEARNING_PATH]->(lp:LearningPath {id: $path_id})
                    SET lp.concepts = $chain,
                        lp.depth = $depth,
                        lp.strength = $strength,
                        lp.created = timestamp()
                    """, path_id=path_id, chain=chain["chain"], depth=chain["depth"],
                                strength=chain["strength"], start_concept=chain["start_concept"])

            logger.info(
                f"Identified {len(chains)} prerequisite knowledge chains")

        return chains
    except Exception as e:
        logger.error(
            f"Error extracting prerequisite chains: {e}", exc_info=True)
        return []


def export_visualization(driver, chapter_name=None, format="d3"):
    """Export knowledge graph in a format suitable for visualization."""
    logger.info(
        f"Exporting knowledge graph visualization for {'all chapters' if chapter_name is None else chapter_name}")

    try:
        with driver.session(database=NEO4J_DATABASE) as session:
            # Build chapter filter
            chapter_clause = ""
            params = {}
            if chapter_name:
                chapter_clause = "WHERE ch.name = $chapter_name"
                params = {"chapter_name": chapter_name}

            # Get all nodes and relationships
            if format == "d3":
                # Get nodes
                nodes_result = session.run(f"""
                MATCH (ch:Chapter)
                {chapter_clause}
                MATCH (ch)<-[:PART_OF]-(chunk:Chunk)-[:MENTIONS]->(concept:Concept)
                WITH DISTINCT concept, ch.name AS chapter
                RETURN
                    concept.name AS id,
                    concept.name AS label,
                    concept.type AS type,
                    concept.description AS description,
                    chapter
                ORDER BY concept.name
                """, **params)

                # Get relationships
                rels_result = session.run(f"""
                MATCH (ch:Chapter)
                {chapter_clause}
                MATCH (ch)<-[:PART_OF]-(chunk:Chunk)
                MATCH (source:Concept)<-[:MENTIONS]-(chunk)-[:MENTIONS]->(target:Concept)
                MATCH (source)-[r:RELATED_TO]->(target)
                RETURN DISTINCT
                    source.name AS source,
                    target.name AS target,
                    r.type AS type,
                    r.source_chunk_id AS chunk_id
                """, **params)

                # Transform to D3.js format
                nodes = [dict(record) for record in nodes_result]
                links = [dict(record) for record in rels_result]

                # Create node groups by type
                node_groups = {}
                for node in nodes:
                    node_type = node.get("type", "Concept")
                    if node_type not in node_groups:
                        node_groups[node_type] = []
                    node_groups[node_type].append(node)

                # Create a D3.js compatible graph structure
                d3_data = {
                    "nodes": nodes,
                    "links": [{"source": r["source"], "target": r["target"], "type": r["type"]} for r in links],
                    "groups": [{"name": k, "count": len(v)} for k, v in node_groups.items()]
                }

                return d3_data

            elif format == "graphml":
                # Implementation for GraphML format
                pass

            elif format == "cytoscape":
                # Implementation for Cytoscape.js format
                pass

            else:
                logger.error(f"Unsupported visualization format: {format}")
                return None

    except Exception as e:
        logger.error(f"Error exporting visualization: {e}", exc_info=True)
        return None


# Add to GraphRAG class
async def visualize(self, chapter_name=None, output_file=None):
    """Generate a visualization of the knowledge graph."""
    try:
        # Export the visualization data
        viz_data = export_visualization(self.driver, chapter_name, format="d3")

        if not viz_data:
            return {"error": "Failed to generate visualization data"}

        # Save to file if requested
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(viz_data, f, ensure_ascii=False, indent=2)
            logger.info(f"Saved visualization data to {output_file}")

        # Add visualization stats
        result = {
            "visualization": viz_data,
            "stats": {
                "nodes": len(viz_data["nodes"]),
                "links": len(viz_data["links"]),
                "groups": viz_data["groups"]
            }
        }

        return result
    except Exception as e:
        logger.error(f"Error generating visualization: {e}", exc_info=True)
        return {"error": str(e)}


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
                        node_data = node.model_dump()  # Updated from .dict() to avoid deprecation
                        node_data['id'] = node_id_normalized
                        all_nodes_dict[node_id_normalized] = node_data
                    elif node.description and not all_nodes_dict[node_id_normalized].get("description"):
                        all_nodes_dict[node_id_normalized]["description"] = node.description
                for rel in kg.relationships:
                    source_norm = rel.source.strip().title()
                    target_norm = rel.target.strip().title()
                    if source_norm in all_nodes_dict and target_norm in all_nodes_dict:
                        rel_data = rel.model_dump()  # Updated from .dict() to avoid deprecation
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

    return {
        "chapter_name": chapter_name,
        "duration_seconds": end_time - start_time,
        "chunks": len(chunks_data),
        "concepts": len(all_nodes_dict),
        "relationships": total_valid_rels
    }


# New RAG query class
class GraphRAG:
    """RAG interface for improved LLM content accuracy using the knowledge graph."""

    def __init__(self, driver):
        self.driver = driver

    async def get_context(self, query, chapter_name=None, max_results=3):
        """Get relevant context from the knowledge graph for a query."""
        try:
            # Generate embedding for query
            embedding_client = get_embedding_model()
            query_embedding = await embedding_client.aembed_query(query)

            # Construct chapter filter if specified
            chapter_clause = ""
            chapter_param = {}
            if chapter_name:
                chapter_clause = "AND chunk.chapter_name = $chapter_name"
                chapter_param = {"chapter_name": chapter_name}

            # Query Neo4j for context
            with self.driver.session(database=NEO4J_DATABASE) as session:
                # First get relevant chunks using vector similarity
                chunks_result = session.run(f"""
                CALL db.index.vector.queryNodes('chunkVectorIndex', $max_results, $embedding)
                YIELD node as chunk, score
                WHERE score > 0.65 {chapter_clause}
                WITH chunk, score
                MATCH (chunk)-[:PART_OF]->(ch:Chapter)
                RETURN chunk.id as chunk_id, chunk.text as text, ch.name as chapter, score
                ORDER BY score DESC
                LIMIT $max_results
                """, embedding=query_embedding, max_results=max_results, **chapter_param)

                chunks = [dict(record) for record in chunks_result]

                # Get concepts and relationships for each chunk
                enriched_chunks = []
                for chunk in chunks:
                    # Get concepts mentioned in this chunk
                    concept_result = session.run("""
                    MATCH (chunk:Chunk {id: $chunk_id})-[:MENTIONS]->(concept:Concept)
                    RETURN concept.name as name, concept.type as type, 
                           concept.description as description
                    """, chunk_id=chunk["chunk_id"])

                    concepts = [dict(record) for record in concept_result]

                    # Get relationships between concepts in this chunk
                    if concepts:
                        concept_names = [c["name"] for c in concepts]
                        rel_result = session.run("""
                        MATCH (c1:Concept)-[r:RELATED_TO]->(c2:Concept)
                        WHERE c1.name IN $concept_names AND c2.name IN $concept_names
                        RETURN c1.name as source, r.type as type, c2.name as target
                        """, concept_names=concept_names)

                        relationships = [dict(record) for record in rel_result]

                        # Add concepts and relationships to the chunk
                        chunk["concepts"] = concepts
                        chunk["relationships"] = relationships

                    enriched_chunks.append(chunk)

                return self._format_context_for_llm(enriched_chunks, query)

        except Exception as e:
            logger.error(f"Error getting RAG context: {e}", exc_info=True)
            return {"context": "", "error": str(e)}

    def _format_context_for_llm(self, chunks, query):
        """Format the context in a way that helps the LLM generate accurate content."""
        if not chunks:
            return {"context": "", "chunks": []}

        formatted_context = f"RELEVANT CONTEXT FOR: '{query}'\n\n"

        for i, chunk in enumerate(chunks):
            formatted_context += f"PASSAGE {i+1} [from {chunk['chapter']}]:\n{chunk['text']}\n\n"

            # Add concepts if available
            if "concepts" in chunk and chunk["concepts"]:
                formatted_context += "KEY CONCEPTS:\n"
                for concept in chunk["concepts"]:
                    formatted_context += f"- {concept['name']}"
                    if concept.get("description"):
                        formatted_context += f": {concept['description']}"
                    formatted_context += "\n"
                formatted_context += "\n"

            # Add relationships if available
            if "relationships" in chunk and chunk["relationships"]:
                formatted_context += "RELATIONSHIPS:\n"
                for rel in chunk["relationships"]:
                    formatted_context += f"- {rel['source']} {rel['type']} {rel['target']}\n"
                formatted_context += "\n"

        return {
            "context": formatted_context,
            "chunks": chunks
        }


async def main():
    parser = argparse.ArgumentParser(
        description="Build KG: PDF -> LangChain/MistralAI -> Neo4j.")
    subparsers = parser.add_subparsers(
        dest="command", help="Command to execute")

    # Build command (original functionality)
    build_parser = subparsers.add_parser(
        "build", help="Build knowledge graph from PDF")
    build_parser.add_argument("pdf_path", help="Path to PDF.")
    build_parser.add_argument(
        "chapter_name", help="Unique chapter name (use underscores).")

    # Query command (new RAG functionality)
    query_parser = subparsers.add_parser(
        "query", help="Query the knowledge graph for RAG context")
    query_parser.add_argument("query_text", help="Query to find context for")
    query_parser.add_argument("--chapter", help="Optional chapter name filter")
    query_parser.add_argument("--results", type=int,
                              default=3, help="Number of results to return")

    viz_parser = subparsers.add_parser(
        "visualize", help="Export knowledge graph for visualization"
    )
    viz_parser.add_argument(
        "--chapter", help="Optional chapter name to visualize")
    viz_parser.add_argument("--format", choices=["d3", "graphml", "cytoscape"],
                            default="d3", help="Export format")
    viz_parser.add_argument("--output", help="Output file path")
    # List command
    list_parser = subparsers.add_parser(
        "list", help="List chapters in the knowledge graph")

    args = parser.parse_args()

    if not all([NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, MISTRAL_API_KEY]):
        logger.critical(
            "Missing required environment variables. Check .env file.")
        return

    neo4j_driver = None
    try:
        neo4j_driver = get_neo4j_driver()

        if args.command == "build":
            # Original build functionality
            sane_chapter_name = re.sub(
                r'[^a-zA-Z0-9 \-]', '_', args.chapter_name)
            if not os.path.exists(args.pdf_path):
                logger.error(f"PDF file not found: {args.pdf_path}")
                return

            embedding_client = get_embedding_model()
            llm_client = get_llm()
            setup_neo4j(neo4j_driver)
            result = await process_pdf_to_graph_async(
                neo4j_driver, embedding_client, llm_client, args.pdf_path, sane_chapter_name)

            if result:
                print(f"\nSuccessfully processed '{result['chapter_name']}':")
                print(f"- Chunks: {result['chunks']}")
                print(f"- Concepts: {result['concepts']}")
                print(f"- Relationships: {result['relationships']}")
                print(f"- Duration: {result['duration_seconds']:.2f} seconds")

        elif args.command == "query":
            # New query functionality
            rag = GraphRAG(neo4j_driver)
            result = await rag.get_context(
                args.query_text,
                chapter_name=args.chapter,
                max_results=args.results
            )

            if result and result.get("context"):
                print("\n" + "="*80)
                print(result["context"])
                print("="*80 + "\n")
                print(
                    "This context can be used to enhance LLM accuracy in your response.")
            else:
                print("No relevant context found.")

        elif args.command == "visualize":
            # Export visualization
            viz_data = export_visualization(
                neo4j_driver,
                chapter_name=args.chapter,
                format=args.format
            )

            if viz_data:
                if args.output:
                    with open(args.output, 'w', encoding='utf-8') as f:
                        json.dump(viz_data, f, ensure_ascii=False, indent=2)
                    print(f"Visualization data exported to {args.output}")
                else:
                    print(json.dumps(viz_data, indent=2))

                print(
                    f"Graph contains {len(viz_data['nodes'])} nodes and {len(viz_data['links'])} relationships")
            else:
                print("Failed to generate visualization data")

        elif args.command == "list":
            # List chapters in the graph
            with neo4j_driver.session(database=NEO4J_DATABASE) as session:
                result = session.run("""
                MATCH (ch:Chapter)
                OPTIONAL MATCH (ch)<-[:PART_OF]-(chunk:Chunk)
                OPTIONAL MATCH (chunk)-[:MENTIONS]->(concept:Concept)
                WITH ch.name as name, count(DISTINCT chunk) as chunks, count(DISTINCT concept) as concepts
                RETURN name, chunks, concepts
                ORDER BY name
                """)

                chapters = [dict(record) for record in result]
                if chapters:
                    print(
                        f"Found {len(chapters)} chapters in the knowledge graph:")
                    for ch in chapters:
                        print(
                            f"- {ch['name']}: {ch['chunks']} chunks, {ch['concepts']} concepts")
                else:
                    print("No chapters found in the knowledge graph.")

        else:
            parser.print_help()

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
