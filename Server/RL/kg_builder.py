import os
import json
import logging
import re
from dotenv import load_dotenv
from neo4j import GraphDatabase, exceptions as neo4j_exceptions
# Correct top-level import based on documentation
from mistralai import Mistral
# No other mistralai imports needed based on snippets
import time
from tqdm import tqdm  # Progress bar
import argparse

# --- Configuration ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Neo4j Aura Credentials
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

# Mistral AI Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_OCR_MODEL = os.getenv(
    "MISTRAL_OCR_MODEL", "mistral-ocr-latest")  # Model for OCR endpoint
MISTRAL_EXTRACT_MODEL = os.getenv(
    "MISTRAL_EXTRACT_MODEL", "mistral-large-latest")  # Model for chat endpoint

# Constants
MIN_CHUNK_LENGTH_CHARS = 100
MAX_TOKENS_PER_CHUNK = 1500
LLM_RETRIES = int(os.getenv("LLM_RETRIES", 3))
LLM_RETRY_DELAY = int(os.getenv("LLM_RETRY_DELAY", 5))

# --- Helper Functions (clean_text, estimate_tokens) ---


def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.replace('\n', ' ').strip()
    text = re.sub(r'\s+', ' ', text)
    return text


def estimate_tokens(text):
    return len(text.split())

# --- Mistral AI Functions ---


def get_mistral_client():
    """Initializes and returns the Mistral AI client based on docs."""
    if not MISTRAL_API_KEY:
        raise ValueError("MISTRAL_API_KEY not found.")
    try:
        # Use the documented class name
        client = Mistral(api_key=MISTRAL_API_KEY)
        logger.info("Mistral client initialized using 'Mistral' class.")
        # Optional: Add a simple test call if desired, e.g., client.models.list()
        return client
    except Exception as e:
        # Catch generic exception as specific ones aren't confirmed
        logger.error(
            f"Failed to initialize Mistral client: {e}", exc_info=True)
        raise RuntimeError(f"Mistral client initialization failed: {e}") from e


def extract_text_with_mistral_ocr(client: Mistral, pdf_path: str):
    """Extracts text using Mistral AI OCR following documentation snippets."""
    if not os.path.exists(pdf_path):
        logger.error(f"PDF file not found: {pdf_path}")
        return None

    uploaded_file_id = None
    pdf_basename = os.path.basename(pdf_path)
    try:
        # 1. Upload the file using client.files.upload
        logger.info(f"Uploading PDF '{pdf_basename}'...")
        with open(pdf_path, "rb") as f:
            # Pass file dict as specified in docs
            uploaded_pdf = client.files.upload(
                file={
                    "file_name": pdf_basename,
                    "content": f,  # Pass the file handle directly
                },
                purpose="ocr"  # Specify purpose
            )
        uploaded_file_id = uploaded_pdf.id
        logger.info(f"PDF uploaded. File ID: {uploaded_file_id}")

        # 2. Get Signed URL
        logger.info(f"Getting signed URL for File ID: {uploaded_file_id}")
        signed_url_obj = client.files.get_signed_url(file_id=uploaded_file_id)
        signed_url = signed_url_obj.url  # Assumes response has .url attribute
        logger.info("Obtained signed URL.")

        # 3. Call OCR process endpoint
        logger.info(f"Starting OCR processing ({MISTRAL_OCR_MODEL})...")
        ocr_response = client.ocr.process(
            model=MISTRAL_OCR_MODEL,
            document={
                "type": "document_url",
                "document_url": signed_url,
            }
        )
        logger.info("OCR processing successful.")

        # Parse response (best guess based on common structures)
        if hasattr(ocr_response, 'pages') and isinstance(ocr_response.pages, list):
            return {"pages": ocr_response.pages}
        elif isinstance(ocr_response, list):  # If response is directly the list of pages
            return {"pages": ocr_response}
        else:
            logger.error(
                f"Could not extract pages list from OCR response. Type: {type(ocr_response)}. Snippet: {str(ocr_response)[:500]}")
            return None

    except Exception as e:  # Catch generic Exception
        # Attempt to get common attributes
        status_code = getattr(e, 'status_code', 'N/A')
        message = getattr(e, 'message', str(e))
        logger.error(
            f"Error during Mistral OCR process: Status={status_code}, Error='{message}'", exc_info=True)
        return None
    finally:
        # Cleanup uploaded file
        if uploaded_file_id and client:
            try:
                logger.info(
                    f"Cleaning up uploaded Mistral file: {uploaded_file_id}")
                # Assuming delete method exists, though not explicitly in snippets
                if hasattr(client.files, 'delete'):
                    client.files.delete(file_id=uploaded_file_id)
                else:
                    logger.warning(
                        "client.files.delete method not found, cannot cleanup file.")
            except Exception as cleanup_e:
                logger.warning(
                    f"Could not clean up Mistral file {uploaded_file_id}: {cleanup_e}")


# --- create_chunks_from_ocr_results (Keep robust version from before) ---
# --- create_chunks_from_ocr_results (MODIFIED AGAIN) ---
def create_chunks_from_ocr_results(ocr_results, doc_id):
    """Creates text chunks suitable for LLM processing from Mistral OCR results."""
    chunks = []
    current_chunk_text = ""
    current_chunk_start_page = 0
    current_chunk_id = 0

    if not ocr_results or 'pages' not in ocr_results or not isinstance(ocr_results['pages'], list):
        logger.warning("OCR results invalid/missing 'pages' list.")
        return chunks

    num_pages = len(ocr_results['pages'])
    logger.info(f"Processing {num_pages} page objects from OCR results...")
    for page_num, page_object in enumerate(tqdm(ocr_results['pages'], desc="Creating Chunks")):
        page_text = ""
        # --- START CHANGE ---
        # Prioritize accessing the 'markdown' attribute based on dir() output
        if hasattr(page_object, 'markdown') and isinstance(page_object.markdown, str):
            # Clean the markdown content
            page_text = clean_text(page_object.markdown)
            # logger.debug(f"Page {page_num}: Extracted text from .markdown attribute.")

        # Fallback: Try model_dump() if markdown doesn't work or isn't present
        elif hasattr(page_object, 'model_dump') and callable(page_object.model_dump):
            try:
                page_dict = page_object.model_dump()
                if isinstance(page_dict, dict):
                    # Look for common text keys within the dumped dictionary
                    if 'text' in page_dict and isinstance(page_dict['text'], str):
                        page_text = clean_text(page_dict['text'])
                    elif 'markdown' in page_dict and isinstance(page_dict['markdown'], str):
                        page_text = clean_text(page_dict['markdown'])
                    elif 'content' in page_dict and isinstance(page_dict['content'], str):
                        page_text = clean_text(page_dict['content'])
                    else:
                        logger.warning(
                            f"Page {page_num}: model_dump() dict missing expected text keys ('text', 'markdown', 'content'). Keys: {page_dict.keys()}")
                else:
                    logger.warning(
                        f"Page {page_num}: model_dump() did not return a dict. Type: {type(page_dict)}")
            except Exception as dump_err:
                logger.warning(
                    f"Page {page_num}: Error calling or processing model_dump(): {dump_err}")
        else:
            # Log if neither .markdown nor .model_dump() could be used
            logger.warning(
                f"Skipping page {page_num}, could not extract text using .markdown or .model_dump(). Object type: {type(page_object)}")
            continue
        # --- END CHANGE ---

        if not page_text or len(page_text) < MIN_CHUNK_LENGTH_CHARS:
            # logger.debug(f"Skipping page {page_num} due to insufficient text length after cleaning.")
            continue

        # --- Rest of the chunking logic remains the same ---
        text_to_add = (" " + page_text) if current_chunk_text else page_text
        potential_chunk_text = current_chunk_text + text_to_add
        potential_tokens = estimate_tokens(potential_chunk_text)

        if potential_tokens > MAX_TOKENS_PER_CHUNK and current_chunk_text:
            chunks.append({
                "id": f"{doc_id}_chunk_{current_chunk_id}", "text": current_chunk_text,
                "start_page": current_chunk_start_page, "end_page": page_num - 1 if page_num > 0 else 0,
                "seq_id": current_chunk_id
            })
            current_chunk_id += 1
            current_chunk_text = page_text
            current_chunk_start_page = page_num
        else:
            if page_text:
                current_chunk_text = potential_chunk_text
                if current_chunk_text == page_text:
                    current_chunk_start_page = page_num

    # Add the last remaining chunk
    if current_chunk_text:
        chunks.append({
            "id": f"{doc_id}_chunk_{current_chunk_id}", "text": current_chunk_text,
            "start_page": current_chunk_start_page, "end_page": num_pages - 1,
            "seq_id": current_chunk_id
        })

    logger.info(f"Created {len(chunks)} chunks.")
    return chunks
# --- get_llm_extraction_prompt (Keep detailed version) ---


def get_llm_extraction_prompt(chunk_text, chapter_name):
    return f"""
    You are an expert knowledge graph extractor...
    OUTPUT FORMAT: Respond ONLY with a valid JSON object... key "triplets"... list...
    Example JSON Output: {{ "triplets": [...] }}
    ...
    """

# --- extract_triplets_with_mistral_large (Use client.chat.complete, generic error handling) ---

# --- extract_triplets_with_mistral_large (MODIFIED VALIDATION) ---


def extract_triplets_with_mistral_large(client: Mistral, chunk_text, chapter_name):
    """Uses Mistral Large API via chat.complete to extract triplets."""
    prompt = get_llm_extraction_prompt(chunk_text, chapter_name)
    for attempt in range(LLM_RETRIES):
        try:
            logger.debug(
                f"Sending chunk to Mistral chat.complete ({MISTRAL_EXTRACT_MODEL}, attempt {attempt+1})...")
            messages = [{"role": "user", "content": prompt}]
            chat_response = client.chat.complete(
                model=MISTRAL_EXTRACT_MODEL,
                messages=messages,
                temperature=0.1
                # response_format={"type": "json_object"}, # Keep commented if not supported on complete
            )

            if not chat_response.choices:
                logger.warning(
                    "Mistral chat.complete response had no choices.")
                continue

            content_str = chat_response.choices[0].message.content

            try:
                # Handle potential markdown code blocks ```json ... ```
                if content_str.strip().startswith("```json"):
                    content_str = content_str.strip()[7:-3].strip()
                elif content_str.strip().startswith("```"):
                    content_str = content_str.strip()[3:-3].strip()

                data = json.loads(content_str)

                if isinstance(data, dict) and "triplets" in data and isinstance(data["triplets"], list):
                    validated_triplets = []
                    for t in data["triplets"]:
                        # --- START CHANGE ---
                        # Check for subject, object, and EITHER relationship OR predicate
                        subj_key = "subject"
                        obj_key = "object"
                        rel_key = None
                        if "relationship" in t:
                            rel_key = "relationship"
                        elif "predicate" in t:
                            rel_key = "predicate"

                        if isinstance(t, dict) and subj_key in t and obj_key in t and rel_key is not None:
                            # --- END CHANGE ---
                            subj = clean_text(t[subj_key]).title()
                            # Use the found key (relationship or predicate) to get the value
                            rel = clean_text(
                                t[rel_key]).upper().replace(" ", "_")
                            obj = clean_text(t[obj_key]).title()

                            if subj and rel and obj and subj != obj:
                                # Store consistently using 'relationship' key internally
                                validated_triplets.append(
                                    {"subject": subj, "relationship": rel, "object": obj})
                            else:
                                logger.debug(
                                    f"Skipping invalid triplet data: {t}")
                        else:
                            # Log which keys were found if validation failed
                            logger.warning(
                                f"Skipping invalid triplet structure (subj/obj/rel|pred keys missing or wrong type). Found keys: {list(t.keys()) if isinstance(t, dict) else 'Not a dict'}")
                    logger.info(
                        f"Attempt {attempt+1}: Extracted {len(validated_triplets)} valid triplets.")
                    return validated_triplets
                else:
                    logger.warning(
                        f"Attempt {attempt+1}: Response JSON missing 'triplets' list. Response: {content_str[:200]}...")

            except json.JSONDecodeError as e:
                logger.warning(
                    f"Attempt {attempt+1}: Failed to decode JSON: {e}. Response: {content_str[:200]}...")

        except Exception as e:
            status_code = getattr(e, 'status_code', 'N/A')
            message = getattr(e, 'message', str(e))
            # Specifically log 429 errors clearly
            if status_code == 429:
                logger.warning(f"Attempt {attempt+1}: Hit Rate Limit (429).")
            else:
                logger.warning(
                    f"Attempt {attempt+1}: Error during Mistral chat.complete: Status={status_code}, Error='{message}'", exc_info=False)

        # Delay before retry
        if attempt < LLM_RETRIES - 1:
            logger.info(
                f"Retrying Mistral chat.complete after {LLM_RETRY_DELAY}s...")
            time.sleep(LLM_RETRY_DELAY)

    logger.error(f"Extraction failed after {LLM_RETRIES} attempts.")
    return []
# --- Neo4j Functions (get_neo4j_driver, setup_neo4j_constraints, etc.) ---
# --- Keep the robust versions from the previous responses ---


def get_neo4j_driver():
    if not NEO4J_URI or not NEO4J_USERNAME or not NEO4J_PASSWORD:
        raise ValueError("Neo4j credentials missing.")
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(
            NEO4J_USERNAME, NEO4J_PASSWORD), connection_timeout=15, max_connection_lifetime=3600)
        driver.verify_connectivity()
        logger.info("Neo4j driver initialized.")
        return driver
    except neo4j_exceptions.ServiceUnavailable as e:
        logger.error(f"Neo4j Unavailable: {e}", exc_info=False)
        raise
    except neo4j_exceptions.AuthError as e:
        logger.error(f"Neo4j Auth Error: {e}", exc_info=False)
        raise
    except Exception as e:
        logger.error(f"Failed Neo4j init: {e}", exc_info=True)
        raise


def setup_neo4j_constraints(driver):
    constraints = [
        "CREATE CONSTRAINT chapter_name_unique IF NOT EXISTS FOR (c:Chapter) REQUIRE c.name IS UNIQUE;",
        "CREATE CONSTRAINT chunk_id_unique IF NOT EXISTS FOR (c:Chunk) REQUIRE c.id IS UNIQUE;",
        "CREATE CONSTRAINT concept_name_unique IF NOT EXISTS FOR (c:Concept) REQUIRE c.name IS UNIQUE;"]
    try:
        with driver.session(database="neo4j") as session:
            for constraint in tqdm(constraints, desc="Setting Constraints"):
                try:
                    session.run(constraint)
                except neo4j_exceptions.ClientError as e:
                    if "already exists" in str(e).lower():
                        logger.debug(
                            f"Constraint exists: {constraint.split(' ')[2]}")
                    else:
                        raise e
        logger.info("Neo4j constraints ensured.")
    except Exception as e:
        logger.error(f"Constraint setup failed: {e}", exc_info=True)
        raise


def add_graph_data_to_neo4j(driver, chapter_name, chunks, all_triplets):
    rels_processed = 0
    concepts = set()
    if not driver:
        logger.error("Neo4j driver unavailable.")
        return 0, 0
    try:
        with driver.session(database="neo4j") as session:
            logger.info(f"Merging Chapter: {chapter_name}")
            session.execute_write(_merge_chapter, chapter_name)
            logger.info("Processing Chunks...")
            for chunk in tqdm(chunks, desc="Adding Chunks"):
                session.execute_write(
                    _merge_chunk_and_link_chapter, chunk['id'], chunk['text'], chunk['seq_id'], chapter_name, chunk['start_page'], chunk['end_page'])
            logger.info("Processing Triplets...")
            for chunk_id, triplets in tqdm(all_triplets.items(), desc="Adding Concepts/Rels"):
                if not triplets:
                    continue
                for triplet in triplets:
                    subj, rel, obj = triplet['subject'], triplet['relationship'], triplet['object']
                    session.execute_write(
                        _merge_concepts_and_relationship, subj, rel, obj, chunk_id)
                    rels_processed += 1
                    concepts.add(subj)
                    concepts.add(obj)
            logger.info(
                f"Neo4j add complete. Rels processed: {rels_processed}. Concepts: {len(concepts)}")
            return rels_processed, len(concepts)
    except neo4j_exceptions.Neo4jError as e:
        # Catch broad Neo4j errors
        logger.error(f"Neo4j Error: {e}", exc_info=True)
    except Exception as e:
        logger.error(f"Error adding to Neo4j: {e}", exc_info=True)
    return rels_processed, len(concepts)

# --- Neo4j Transaction Functions (_merge_chapter, _merge_chunk_and_link_chapter, _merge_concepts_and_relationship) ---


def _merge_chapter(tx, chapter_name): tx.run(
    "MERGE (ch:Chapter {name: $name})", name=chapter_name)


def _merge_chunk_and_link_chapter(tx, id, text, seq, ch_name, start_pg, end_pg):
    q = """MERGE (c:Chunk {id: $id})
           ON CREATE SET c.text=$text, c.seq_id=$seq, c.start_page=$start_pg, c.end_page=$end_pg, c.created=timestamp()
           ON MATCH SET c.text=$text, c.start_page=$start_pg, c.end_page=$end_pg, c.updated=timestamp()
           WITH c MATCH (ch:Chapter {name: $ch_name}) MERGE (c)-[:PART_OF]->(ch)"""
    tx.run(q, id=id, text=text, seq=seq, ch_name=ch_name,
           start_pg=start_pg, end_pg=end_pg)


def _merge_concepts_and_relationship(tx, subj, rel, obj, chunk_id):
    rel_type = re.sub(r'[^A-Z0-9_]', '', rel.upper())
    rel_type = rel_type if rel_type else "RELATED_TO"
    q = f"""MERGE (s:Concept {{name: $subj}}) MERGE (o:Concept {{name: $obj}})
            MERGE (s)-[r:{rel_type}]->(o)
            ON CREATE SET r.type=$rel, r.source_chunk_id=$chunk_id, r.created=timestamp()
            ON MATCH SET r.type=$rel, r.source_chunk_id=$chunk_id, r.updated=timestamp()
            WITH s, o MATCH (c:Chunk {{id: $chunk_id}}) MERGE (c)-[:MENTIONS]->(s) MERGE (c)-[:MENTIONS]->(o)"""
    tx.run(q, subj=subj, obj=obj, rel=rel, chunk_id=chunk_id)


# --- Main Execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Build KG: PDF -> Mistral(OCR/LLM) -> Neo4j.")
    parser.add_argument("pdf_path", help="Path to PDF.")
    parser.add_argument(
        "chapter_name", help="Unique chapter name (use underscores).")
    args = parser.parse_args()

    sane_chapter_name = re.sub(r'\W+', '_', args.chapter_name)
    pdf_basename = os.path.basename(args.pdf_path)
    if not os.path.exists(args.pdf_path):
        logger.error(f"PDF not found: {args.pdf_path}")
        exit(1)

    neo4j_driver = None
    mistral_client = None
    try:
        logger.info("Initializing...")
        mistral_client = get_mistral_client()
        neo4j_driver = get_neo4j_driver()
        setup_neo4j_constraints(neo4j_driver)

        logger.info(f"Starting OCR for '{pdf_basename}'...")
        ocr_results = extract_text_with_mistral_ocr(
            mistral_client, args.pdf_path)
        if not ocr_results:
            raise RuntimeError("OCR failed.")

        safe_doc_id = re.sub(r'\W+', '_', pdf_basename)
        chunks = create_chunks_from_ocr_results(ocr_results, safe_doc_id)
        if not chunks:
            raise RuntimeError("Chunk creation failed.")

        all_triplets = {}
        logger.info(f"Extracting triplets ({MISTRAL_EXTRACT_MODEL})...")
        for chunk in tqdm(chunks, desc="Extracting Triplets"):
            triplets = extract_triplets_with_mistral_large(
                mistral_client, chunk['text'], sane_chapter_name)
            if triplets:
                all_triplets[chunk['id']] = triplets

            time.sleep(3.0)

        count = sum(len(v) for v in all_triplets.values())
        logger.info(f"Extraction complete. Found {count} triplets.")
        if count == 0:
            logger.warning("LLM extracted no triplets.")

        logger.info("Adding data to Neo4j...")
        rels, concepts = add_graph_data_to_neo4j(
            neo4j_driver, sane_chapter_name, chunks, all_triplets)
        logger.info(f"Neo4j update: Rels={rels}, Concepts={concepts}.")

    except (ValueError, RuntimeError) as e:
        logger.error(f"Config/Runtime Error: {e}", exc_info=False)
        exit(1)
    except neo4j_exceptions.Neo4jError as e:
        logger.error(f"Neo4j Error: {e}", exc_info=False)
        exit(1)
    except Exception as e:
        logger.error(f"Unexpected critical error: {e}", exc_info=True)
        exit(1)  # Catch any remaining errors
    finally:
        if neo4j_driver:
            try:
                neo4j_driver.close()
                logger.info("Neo4j driver closed.")
            except Exception:
                logger.error("Error closing Neo4j", exc_info=True)

    logger.info(f"Process for '{sane_chapter_name}' completed.")
