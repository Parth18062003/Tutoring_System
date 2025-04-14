import os
import json
import logging
import asyncio
from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Dict, Optional, Any
from enum import Enum
import numpy as np
import re
import copy
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from pydantic import BaseModel, Field, ConfigDict
from dotenv import load_dotenv
import time
import ollama
import motor.motor_asyncio
from neo4j import GraphDatabase, exceptions as neo4j_exceptions

try:
    from ncert_tutor import (
        NCERTLearningSystem, TeachingStrategies as NCERTTeachingStrategies,
        LearningStyles as NCERTLearningStyles, DifficultyLevel as NCERTDifficultyLevel,
        ScaffoldingLevel as NCERTScaffoldingLevel, FeedbackType as NCERTFeedbackType,
        ContentLength as NCERTContentLength
    )
    if hasattr(NCERTTeachingStrategies, '__members__'):
        NUM_STRATEGIES = len(NCERTTeachingStrategies.__members__)
    else:
        logging.warning(
            "Could not determine NUM_STRATEGIES from imported RL components.")
        NUM_STRATEGIES = 9
    SB3_AVAILABLE = True
    TeachingStrategies = NCERTTeachingStrategies
    LearningStyles = NCERTLearningStyles
    DifficultyLevel = NCERTDifficultyLevel
    ScaffoldingLevel = NCERTScaffoldingLevel
    FeedbackType = NCERTFeedbackType
    ContentLength = NCERTContentLength
    logging.info("Successfully imported RL components from ncert_tutor.")
except ImportError as e:
    logging.error(
        f"Failed to import RL components: {e}. RL features will be disabled.")
    SB3_AVAILABLE = False

    class DummyEnum(Enum):
        pass

    class LearningStyles(DummyEnum):
        VISUAL = 0
        AUDITORY = 1
        READING = 2
        KINESTHETIC = 3

    class TeachingStrategies(DummyEnum):
        EXPLANATION = 0
        DEMONSTRATION = 1
        PRACTICE = 2
        EXPLORATION = 3
        ASSESSMENT = 4
        INTERACTIVE = 5
        STORYTELLING = 6
        GAMIFICATION = 7
        SPACED_REVIEW = 8

    class DifficultyLevel(DummyEnum):
        EASIER = 0
        NORMAL = 1
        HARDER = 2

    class ScaffoldingLevel(DummyEnum):
        NONE = 0
        HINTS = 1
        GUIDANCE = 2

    class FeedbackType(DummyEnum):
        CORRECTIVE = 0
        HINT = 1
        ELABORATED = 2
        SOCRATIC = 3

    class ContentLength(DummyEnum):
        CONCISE = 0
        STANDARD = 1
        DETAILED = 2
    NUM_STRATEGIES = len(TeachingStrategies) if hasattr(
        TeachingStrategies, '__members__') else 9

    class NCERTLearningSystem:
        model = None
        unwrapped_env = None
        def __init__(self, *args, **kwargs): pass
        def load_model(self, path): logging.error(
            "Cannot load model, SB3 unavailable."); return None

load_dotenv()

API_VERSION = "0.6.0"
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
RL_MODEL_PATH = os.environ.get("RL_MODEL_PATH")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST")
OLLAMA_MODEL = os.environ.get(
    "OLLAMA_MODEL", "gemma3:4b")
MONGO_URL = os.environ.get("MONGO_URL")
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME")
NEO4J_URI = os.environ.get("NEO4J_URI")
NEO4J_USERNAME = os.environ.get("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD")
INTERNAL_API_SECRET = os.environ.get(
    "INTERNAL_API_SECRET")

logging.basicConfig(
    level=LOG_LEVEL,
    format='%(asctime)s - %(name)s [%(levelname)s] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("adaptive_content_api")

rl_system: Optional[NCERTLearningSystem] = None
ollama_client: Optional[ollama.AsyncClient] = None
mongo_client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
learning_db: Optional[motor.motor_asyncio.AsyncIOMotorDatabase] = None
neo4j_driver: Optional[GraphDatabase.driver] = None


class StudentProfile(BaseModel):
    student_id: str
    grade: int = Field(default=6)
    learning_style_preferences: Dict[str, float] = Field(
        default_factory=lambda: {ls.name.lower(): 1.0 / len(LearningStyles)
                                 for ls in LearningStyles if isinstance(ls, LearningStyles)}
    )


class StudentState(BaseModel):
    mastery: Dict[str, float] = Field(default_factory=dict)
    engagement: float = Field(default=0.7, ge=0.0, le=1.0)
    attention: float = Field(default=0.8, ge=0.0, le=1.0)
    cognitive_load: float = Field(default=0.4, ge=0.0, le=1.0)
    motivation: float = Field(default=0.7, ge=0.0, le=1.0)
    strategy_history_vector: List[float] = Field(
        default_factory=lambda: [0.0] * NUM_STRATEGIES)
    topic_attempts: Dict[str, float] = Field(default_factory=dict)
    time_since_last_practiced: Dict[str, float] = Field(default_factory=dict)
    misconceptions: Dict[str, float] = Field(default_factory=dict)
    current_topic_idx_persistent: int = Field(default=-1)
    recent_performance: float = Field(default=0.5, ge=0.0, le=1.0)
    steps_on_current_topic: float = Field(default=0.0)


class StudentSessionData(BaseModel):
    student_id: str
    profile: StudentProfile
    state: StudentState
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    last_active: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc))
    learning_path: List[Dict[str, Any]] = Field(default_factory=list)


class GenerationConfig(BaseModel):
    model_config = ConfigDict(extra='allow', populate_by_name=True)
    max_length: Optional[int] = Field(None, alias="num_predict")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    top_p: Optional[float] = Field(None, ge=0.0, le=1.0)
    top_k: Optional[int] = Field(None, ge=1)


class ContentRequest(BaseModel):
    content_type: str = Field(
        ..., description="lesson, quiz, flashcard, cheatsheet, explanation, feedback")
    subject: str
    topic: Optional[str] = None
    subtopic: Optional[str] = None
    previous_response: Optional[str] = None
    user_input: Optional[str] = None
    config: Optional[GenerationConfig] = None


class InteractionMetadata(BaseModel):
    interaction_id: str = Field(default_factory=lambda: str(uuid4()))
    strategy: str
    topic: str
    difficulty_choice: str
    scaffolding_choice: str
    feedback_choice: str
    length_choice: str
    subject: str
    content_type: str
    difficulty_level_desc: str
    mastery_at_request: float
    effective_difficulty_value: float
    prereq_satisfaction: float
    kg_context_used: bool


class SessionFeedback(BaseModel):
    interaction_id: str
    time_spent_seconds: Optional[int] = Field(None, ge=0)
    completion_percentage: Optional[float] = Field(None, ge=0, le=100)
    assessment_score: Optional[float] = Field(None, ge=0, le=100)
    engagement_rating: Optional[int] = Field(None, ge=1, le=5)
    helpful_rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_text: Optional[str] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown events for resource initialization and cleanup."""
    global rl_system, ollama_client, mongo_client, learning_db, neo4j_driver
    logger.info(f"API v{API_VERSION} server starting up...")
    essential_vars = {"MONGO_URL": MONGO_URL,
                      "MONGO_DB_NAME": MONGO_DB_NAME, "OLLAMA_HOST": OLLAMA_HOST}
    missing_vars = [k for k, v in essential_vars.items() if not v]
    if missing_vars:
        logger.critical(
            f"Missing essential environment variables: {', '.join(missing_vars)}. Exiting.")

    if SB3_AVAILABLE and not RL_MODEL_PATH:
        logger.warning(
            "SB3_AVAILABLE is True but RL_MODEL_PATH is not set. RL features will be disabled.")
    if not NEO4J_URI or not NEO4J_PASSWORD:
        logger.warning(
            "NEO4J_URI or NEO4J_PASSWORD not set. Graph RAG features will be disabled.")
    if not INTERNAL_API_SECRET:
        logger.warning(
            "SECURITY WARNING: INTERNAL_API_SECRET is not set. Proxy requests will not be verified.")

    if SB3_AVAILABLE and RL_MODEL_PATH:
        logger.info("Initializing RL System...")
        try:
            rl_system = NCERTLearningSystem(
                log_dir=os.path.dirname(RL_MODEL_PATH))
            rl_system.load_model(RL_MODEL_PATH)
            if rl_system.model is None:
                logger.error(
                    f"RL Model failed to load from {RL_MODEL_PATH}. RL recommendations disabled.")
                rl_system = None
            else:
                logger.info(
                    f"RL Model loaded successfully from {RL_MODEL_PATH}")
                if rl_system.unwrapped_env:
                    logger.info(
                        f"RL Env Observation Space: {rl_system.unwrapped_env.observation_space}")
                else:
                    logger.warning(
                        "Could not access RL Env observation space for verification.")
        except Exception as e:
            logger.error(f"Failed to initialize RL System: {e}", exc_info=True)
            rl_system = None
    else:
        if SB3_AVAILABLE:
            logger.info("RL_MODEL_PATH not provided, RL disabled.")
        else:
            logger.info("SB3 not available, RL disabled.")

    if OLLAMA_HOST:
        logger.info(f"Connecting to Ollama at {OLLAMA_HOST}...")
        try:
            ollama_client = ollama.AsyncClient(
                host=OLLAMA_HOST, timeout=60)
            await ollama_client.list()
            logger.info(f"Ollama client connected successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to Ollama: {e}", exc_info=True)
            ollama_client = None
    else:
        logger.error("OLLAMA_HOST not configured. LLM generation disabled.")

    if MONGO_URL and MONGO_DB_NAME:
        logger.info(f"Connecting to MongoDB at {MONGO_URL}...")
        try:
            mongo_client = motor.motor_asyncio.AsyncIOMotorClient(
                MONGO_URL,
                serverSelectionTimeoutMS=5000,
                uuidRepresentation='standard'
            )
            await mongo_client.admin.command('ping')
            learning_db = mongo_client[MONGO_DB_NAME]
            try:
                await learning_db["learning_states"].create_index("student_id", unique=True, background=True)
                logger.info(
                    "Ensured 'student_id' index exists on 'learning_states' collection.")
            except Exception as idx_e:
                logger.warning(
                    f"Could not ensure MongoDB index (may already exist or permissions issue): {idx_e}")
            logger.info(
                f"MongoDB client connected successfully to db '{MONGO_DB_NAME}'.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}", exc_info=True)
            mongo_client = None
            learning_db = None
    else:
        logger.error(
            "MONGO_URL or MONGO_DB_NAME not configured. Learning state persistence disabled.")

    if NEO4J_URI and NEO4J_PASSWORD:
        logger.info(f"Connecting to Neo4j at {NEO4J_URI}...")
        try:
            neo4j_driver = GraphDatabase.driver(
                NEO4J_URI,
                auth=(NEO4J_USERNAME, NEO4J_PASSWORD),
                connection_timeout=60,
                max_connection_lifetime=3600,
                keep_alive=True
            )
            neo4j_driver.verify_connectivity()
            logger.info("Neo4j driver connected successfully.")

        except neo4j_exceptions.ServiceUnavailable as e:
            logger.error(
                f"Neo4j Service Unavailable: Check DB/URI. Error: {e}")
            neo4j_driver = None
        except neo4j_exceptions.AuthError as e:
            logger.error(f"Neo4j Auth Error: Check credentials. Error: {e}")
            neo4j_driver = None
        except Exception as e:
            logger.error(
                f"Failed to initialize Neo4j driver: {e}", exc_info=True)
            neo4j_driver = None
    else:
        logger.warning("Neo4j credentials not found. Graph RAG disabled.")
        neo4j_driver = None

    yield

    logger.info("API server shutting down...")
    if mongo_client:
        mongo_client.close()
        logger.info("MongoDB connection closed.")
    if neo4j_driver:
        try:
            neo4j_driver.close()
            logger.info("Neo4j driver closed.")
        except Exception as e:
            logger.error(f"Error closing Neo4j driver: {e}", exc_info=True)
    logger.info("Shutdown complete.")

app = FastAPI(
    title="Adaptive Content API",
    description="Streams adaptive content based on RL guidance and Graph RAG.",
    version=API_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_user_id_from_proxy(
    x_authenticated_user_id: str | None = Header(
        None, alias="X-Authenticated-User-Id"),
    x_internal_api_secret: str | None = Header(
        None, alias="X-Internal-Api-Secret")
) -> str:
    """Dependency to securely extract User ID from trusted proxy header."""
    if INTERNAL_API_SECRET:
        if not x_internal_api_secret or x_internal_api_secret != INTERNAL_API_SECRET:
            logger.warning(
                f"Unauthorized internal API access attempt. Secret mismatch or missing.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Invalid or missing internal API credentials.",
            )
    else:
        logger.warning(
            "INTERNAL_API_SECRET not set, skipping verification (Insecure).")

    if x_authenticated_user_id is None:
        logger.error(
            "Header 'X-Authenticated-User-Id' missing from proxy request.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Required user identifier missing from proxy request.",
        )
    return x_authenticated_user_id


async def get_student_session_mongo(user_id: str) -> StudentSessionData | None:
    """Fetches student session data from MongoDB."""
    if learning_db is None:
        logger.error("MongoDB connection unavailable, cannot fetch session.")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="Learning state database unavailable")
    try:
        data = await learning_db["learning_states"].find_one({"student_id": user_id})
        if data:
            data.pop("_id", None)
            return StudentSessionData.model_validate(data)
        return None
    except Exception as e:
        logger.error(
            f"Error fetching session for user {user_id} from MongoDB: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Error accessing learning state")


async def save_student_session_mongo(session_data: StudentSessionData):
    """Saves or updates student session data in MongoDB."""
    if learning_db is None:
        logger.error("MongoDB connection unavailable, cannot save session.")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="Database service unavailable")
    try:
        session_dict = session_data.model_dump(mode='json')
        update_payload = copy.deepcopy(session_dict)
        update_payload.pop('created_at', None)

        await learning_db["learning_states"].update_one(
            {"student_id": session_data.student_id},
            {"$set": update_payload, "$setOnInsert": {
                "created_at": session_data.created_at}},
            upsert=True
        )
    except Exception as e:
        logger.error(
            f"Error saving session for user {session_data.student_id} to MongoDB: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Failed to save learning state")


def prepare_observation_from_state(
    state: StudentState,
    profile: StudentProfile,
    env: Any
) -> Optional[np.ndarray]:
    """Prepares the observation numpy array for the RL model."""
    if not SB3_AVAILABLE or env is None or not hasattr(env, 'num_topics') or env.num_topics <= 0:
        logger.error(
            "Cannot prepare observation: RL Env invalid or SB3 unavailable.")
        return None

    try:
        num_topics = env.num_topics
        topic_map = env.topic_to_idx
        num_strategies = NUM_STRATEGIES
        num_styles = len(LearningStyles)
        mastery_obs = np.zeros(num_topics, dtype=np.float32)
        topic_attempts_obs = np.zeros(num_topics, dtype=np.float32)
        time_since_last_practiced_obs = np.full(
            num_topics, getattr(env, 'max_steps', 250.0), dtype=np.float32)
        misconceptions_obs = np.zeros(num_topics, dtype=np.float32)

        for topic_name, value in state.mastery.items():
            if topic_name in topic_map:
                mastery_obs[topic_map[topic_name]] = np.clip(value, 0.0, 1.0)
        for topic_name, value in state.topic_attempts.items():
            if topic_name in topic_map:
                topic_attempts_obs[topic_map[topic_name]] = value
        for topic_name, value in state.time_since_last_practiced.items():
            if topic_name in topic_map:
                time_since_last_practiced_obs[topic_map[topic_name]] = value
        for topic_name, value in state.misconceptions.items():
            if topic_name in topic_map:
                misconceptions_obs[topic_map[topic_name]
                                   ] = np.clip(value, 0.0, 1.0)

        engagement_obs = np.array([state.engagement], dtype=np.float32)
        attention_obs = np.array([state.attention], dtype=np.float32)
        cognitive_load_obs = np.array([state.cognitive_load], dtype=np.float32)
        motivation_obs = np.array([state.motivation], dtype=np.float32)

        style_prefs_dict = profile.learning_style_preferences if profile else {}
        learning_style_prefs_obs = np.array(
            [style_prefs_dict.get(ls.name.lower(), 1.0 / num_styles)
             for ls in LearningStyles],
            dtype=np.float32
        )
        sum_prefs = np.sum(learning_style_prefs_obs)
        if sum_prefs > 1e-6:
            learning_style_prefs_obs /= sum_prefs
        else:
            learning_style_prefs_obs = np.full(
                num_styles, 1.0 / num_styles, dtype=np.float32)
        strategy_history_obs = np.zeros(num_strategies, dtype=np.float32)
        hist_len = len(state.strategy_history_vector)
        if hist_len == num_strategies:
            strategy_history_obs = np.array(
                state.strategy_history_vector, dtype=np.float32)
        elif hist_len > 0:
            logger.warning(
                f"Strategy history size mismatch: Expected {num_strategies}, Got {hist_len}. Padding/truncating.")
            copy_len = min(hist_len, num_strategies)
            strategy_history_obs[:copy_len] = state.strategy_history_vector[:copy_len]

        topic_idx_max = float(max(1, num_topics))
        current_topic_norm = float(state.current_topic_idx_persistent if 0 <=
                                   state.current_topic_idx_persistent < num_topics else num_topics) / topic_idx_max
        current_topic_normalized_obs = np.array(
            [current_topic_norm], dtype=np.float32)

        recent_performance_obs = np.array(
            [state.recent_performance], dtype=np.float32)
        steps_on_current_topic_obs = np.array(
            [state.steps_on_current_topic], dtype=np.float32)

        observation_list = [
            mastery_obs, engagement_obs, attention_obs, cognitive_load_obs, motivation_obs,
            learning_style_prefs_obs, strategy_history_obs, topic_attempts_obs,
            time_since_last_practiced_obs, misconceptions_obs, current_topic_normalized_obs,
            recent_performance_obs, steps_on_current_topic_obs
        ]
        flat_observation = np.concatenate(observation_list).astype(np.float32)

        expected_shape = env.observation_space.shape[0]
        if flat_observation.shape[0] != expected_shape:
            logger.error(
                f"Observation shape mismatch! Expected {expected_shape}, Got {flat_observation.shape[0]}.")
            if flat_observation.shape[0] < expected_shape:
                padding = np.zeros(
                    expected_shape - flat_observation.shape[0], dtype=np.float32)
                flat_observation = np.concatenate([flat_observation, padding])
            else:
                flat_observation = flat_observation[:expected_shape]
            logger.warning(
                "Observation padded/truncated. Review RL Env definition.")

        return flat_observation

    except AttributeError as ae:
        logger.error(
            f"Error preparing observation due to missing env attribute: {ae}", exc_info=True)
        return None
    except Exception as e:
        logger.error(f"Failed to prepare observation: {e}", exc_info=True)
        return None


def find_best_topic_match(query_topic: str, all_topics: List[str]) -> Optional[int]:
    """Finds the best matching topic index for a user query (simple substring matching)."""
    if not query_topic or not all_topics:
        return None
    query_norm = query_topic.lower().strip().replace('-', ' ').replace('_', ' ')
    if not query_norm:
        return None

    best_match_idx: Optional[int] = None
    best_score = -1.0

    for idx, topic in enumerate(all_topics):
        topic_norm = topic.lower().strip().replace('-', ' ').replace('_', ' ')
        if query_norm == topic_norm:
            return idx
        score = 0.0
        if query_norm in topic_norm:
            score = len(query_norm) / len(topic_norm)
        elif topic_norm in query_norm:
            score = len(topic_norm) / len(query_norm) * \
                0.8

        if score > best_score:
            best_score = score
            best_match_idx = idx

    return best_match_idx if best_score > 0.6 else None


def calculate_prerequisite_satisfaction(topic_idx: int, mastery_dict: Dict[str, float], env: Any) -> float:
    """Calculates prerequisite satisfaction for a topic index based on RL env definition."""
    if not SB3_AVAILABLE or env is None or not hasattr(env, 'prerequisite_matrix') or not hasattr(env, 'topics'):
        logger.warning(
            "Cannot calculate prerequisites: RL Env missing attributes.")
        return 0.5

    try:
        prereq_matrix = env.prerequisite_matrix
        topics = env.topics
        num_topics_env = len(topics)
        if not isinstance(prereq_matrix, np.ndarray) or topic_idx >= prereq_matrix.shape[0]:
            logger.warning(
                f"Invalid prerequisite matrix or topic index {topic_idx}")
            return 0.5

        prereqs_vector = prereq_matrix[topic_idx, :]
        prereq_indices = np.where(prereqs_vector > 0)[0]
        prereq_indices = prereq_indices[(prereq_indices != topic_idx) & (
            prereq_indices < num_topics_env)]

        if len(prereq_indices) == 0:
            return 1.0

        weighted_mastery_sum = 0.0
        total_weight = 0.0
        for idx in prereq_indices:
            topic_name = topics[idx]
            mastery = mastery_dict.get(topic_name, 0.0)
            weight = prereqs_vector[idx]
            weighted_mastery_sum += mastery * weight
            total_weight += weight

        return (weighted_mastery_sum / total_weight) if total_weight > 0 else 1.0

    except Exception as e:
        logger.warning(
            f"Error calculating prerequisites for topic index {topic_idx}: {e}", exc_info=True)
        return 0.5


def update_student_state_history(state: StudentState, topic_name: str, strategy_name: str, topic_map: Dict[str, int]):
    """Updates history components of the student state *before* content generation."""
    try:
        strategy_enum = TeachingStrategies[strategy_name]
        strategy_idx = strategy_enum.value
        decay_factor = 0.85
        new_hist = [h * decay_factor for h in state.strategy_history_vector]
        if 0 <= strategy_idx < len(new_hist):
            new_hist[strategy_idx] = min(
                1.0, new_hist[strategy_idx] + (1.0 - decay_factor))
        state.strategy_history_vector = new_hist
    except (KeyError, IndexError, ValueError):
        logger.warning(
            f"Could not update strategy history for strategy: {strategy_name}")

    state.topic_attempts[topic_name] = state.topic_attempts.get(
        topic_name, 0.0) + 1.0

    for t_name in topic_map.keys():
        state.time_since_last_practiced[t_name] = state.time_since_last_practiced.get(
            t_name, 100.0) + 1.0
    state.time_since_last_practiced[topic_name] = 0.0
    new_topic_idx = topic_map.get(topic_name, -1)
    if new_topic_idx != -1:
        if new_topic_idx == state.current_topic_idx_persistent:
            state.steps_on_current_topic += 1.0
        else:
            state.steps_on_current_topic = 1.0
        state.current_topic_idx_persistent = new_topic_idx
    else:
        state.steps_on_current_topic = 0.0
        state.current_topic_idx_persistent = -1
        logger.warning(
            f"Topic '{topic_name}' not found in RL environment topic map during history update.")


def _run_neo4j_query_sync(driver: GraphDatabase.driver, query: str, parameters: Dict) -> List[Dict]:
    """Synchronous helper to run Neo4j query, intended for use with to_thread."""
    try:
        with driver.session(database="neo4j") as session:
            results = session.run(query, parameters)
            return [record.data() for record in results]
    except neo4j_exceptions.ServiceUnavailable as e:
        logger.error(f"Neo4j Service Unavailable during query: {e}")
        raise
    except neo4j_exceptions.Neo4jError as e:
        logger.error(
            f"Neo4j query failed: {e} | Query: {query[:200]}... | Params: {parameters}")
        raise  # Re-raise
    except Exception as e:
        logger.error(
            f"Unexpected error during Neo4j sync query execution: {e}", exc_info=True)
        raise


async def retrieve_kg_context_neo4j(
    driver: Optional[GraphDatabase.driver],
    chapter_name_sanitized: str,
    query_term: str,
    limit: int = 5,
    chunk_limit: int = 1
) -> str:
    """
    Retrieves context from Neo4j asynchronously using asyncio.to_thread.
    Queries via the :Chapter node for better accuracy.
    """
    if not driver or not chapter_name_sanitized or not query_term:
        logger.debug(
            "Skipping KG retrieval (no driver, chapter, or query term)")
        return ""

    cypher_query = """
    MATCH (chap:Chapter {name: $chapter_name})<-[:PART_OF]-(chunk:Chunk) // Find chunks of the chapter
    MATCH (chunk)-[:MENTIONS]->(c:Concept) // Find concepts mentioned in those chunks
    WHERE toLower(c.name) CONTAINS toLower($query_term) // Filter concepts by query term
    WITH DISTINCT c, chunk // Get distinct concept/chunk pairs matching the term
    LIMIT $limit // Limit initial matching concepts

    // Get relationships (outgoing)
    OPTIONAL MATCH (c)-[r]->(neighbor:Concept)
    WITH c, chunk, collect(DISTINCT {rel_type: COALESCE(r.type, type(r)), neighbor_name: neighbor.name}) AS outgoing_rels

    // Get relationships (incoming)
    OPTIONAL MATCH (neighbor_in:Concept)-[r_in]->(c)
    WITH c, chunk, outgoing_rels, collect(DISTINCT {neighbor_name: neighbor_in.name, rel_type: COALESCE(r_in.type, type(r_in))}) AS incoming_rels

    RETURN c.name AS conceptName,
           outgoing_rels,
           incoming_rels,
           // Return chunk text directly associated with the matched concept instance
           collect(DISTINCT chunk.text)[..$chunk_limit] AS limitedChunkTexts
    LIMIT $limit // Apply final limit on the number of concepts returned
    """

    parameters = {
        "chapter_name": chapter_name_sanitized,
        "query_term": query_term,
        "limit": limit,
        "chunk_limit": chunk_limit,
    }
    context_str = ""
    try:
        logger.debug(
            f"Executing async KG query for chapter '{chapter_name_sanitized}', term '{query_term}'")
        records = await asyncio.to_thread(_run_neo4j_query_sync, driver, cypher_query, parameters)
        logger.debug(f"Neo4j query returned {len(records)} records.")

        context_parts = []
        if records:
            for record in records:
                concept = record.get("conceptName")
                if not concept:
                    continue

                concept_lines = {f"- Concept: {concept}"}

                for rel_data in record.get("outgoing_rels", []):
                    if rel_data and rel_data.get("neighbor_name") and rel_data.get("rel_type"):
                        concept_lines.add(
                            f"  - {concept} --[{rel_data['rel_type']}]--> {rel_data['neighbor_name']}")
                for rel_data in record.get("incoming_rels", []):
                    if rel_data and rel_data.get("neighbor_name") and rel_data.get("rel_type"):
                        concept_lines.add(
                            f"  - {rel_data['neighbor_name']} --[{rel_data['rel_type']}]--> {concept}")

                for text in record.get("limitedChunkTexts", []):
                    if text:
                        max_len = 250
                        truncated_text = text[:max_len] + \
                            ('...' if len(text) > max_len else '')
                        concept_lines.add(f"  - Context: {truncated_text}")

                context_parts.extend(list(concept_lines))

            context_str = "\n".join(context_parts)
            logger.info(
                f"Retrieved {len(context_parts)} context parts from KG for term '{query_term}'.")
        else:
            logger.info(
                f"No KG context found for term '{query_term}' in chapter '{chapter_name_sanitized}'.")

    except Exception as e:
        logger.error(
            f"Error retrieving KG context asynchronously: {e}", exc_info=True)
        context_str = ""

    return context_str


def generate_prompt_template(
    content_type: str,
    strategy: TeachingStrategies,
    topic_full_name: str,
    effective_difficulty: float,
    mastery: float,
    grade: int,
    learning_style_prefs: Dict[str, float],
    request_details: ContentRequest,
    difficulty_choice: DifficultyLevel,
    scaffolding_choice: ScaffoldingLevel,
    feedback_choice: FeedbackType,
    length_choice: ContentLength,
    kg_context: str = ""
) -> str:
    """
    Generates the LLM prompt with clear instructions for KG usage
    and strict JSON-only output, correctly formatted.
    """

    parts = topic_full_name.split('-', 2)
    subject = parts[0].replace('_', ' ') if len(parts) > 0 else "General"
    subsubject_or_topic = parts[1].replace('_', ' ') if len(
        parts) > 1 else topic_full_name.replace('_', ' ')
    specific_topic = parts[2].replace('_', ' ') if len(
        parts) > 2 else subsubject_or_topic
    specific_topic = specific_topic.title()

    primary_style = max(learning_style_prefs.items(), key=lambda item: item[1])[
        0].capitalize() if learning_style_prefs else "Balanced"
    mastery_desc = "new/struggling" if mastery < 0.3 else "developing" if mastery < 0.7 else "familiar"
    difficulty_desc = difficulty_choice.name.lower()
    scaff_desc_map = {ScaffoldingLevel.NONE: "Standard content.", ScaffoldingLevel.HINTS: "Include hints.",
                      ScaffoldingLevel.GUIDANCE: "Provide step-by-step guidance."}
    scaffolding_desc = scaff_desc_map.get(
        scaffolding_choice, "Standard content.")
    length_desc = length_choice.name.lower()
    strategy_name_cap = strategy.name.replace('_', ' ').capitalize()
    content_type_cap = content_type.capitalize()
    feedback_choice_name = getattr(
        feedback_choice, 'name', 'ELABORATED').upper()

    kg_section_text = ""
    if kg_context:
        kg_section_text = f"""
--- START KNOWLEDGE GRAPH CONTEXT ---
Facts & Relationships from NCERT Text for {specific_topic}:
{kg_context}
--- END KNOWLEDGE GRAPH CONTEXT ---

KG Context Usage Instruction: You MUST use the Knowledge Graph Context provided above to ensure factual accuracy and incorporate relevant details/relationships from the NCERT curriculum into the content you generate within the final JSON output. Ground your explanations and examples in these facts where appropriate.
---
"""
    content_specific_instructions = ""

    def get_feedback_instruction(fb_choice_name: str) -> str:
        examples = {"CORRECTIVE": ..., "HINT": ...,
                    "ELABORATED": ..., "SOCRATIC": ...}
        return examples.get(fb_choice_name, "Correct Answer: [Answer]\\nExplanation: [Explanation text]")

    if content_type == "lesson":
        feedback_detail_instruction = get_feedback_instruction(
            feedback_choice_name)
        content_specific_instructions = f"""
*   **JSON Structure for 'lesson'**: `sections` array MUST contain objects with these `sectionType` values IN ORDER: `lesson_introduction`, `lesson_core_concept`, `lesson_example` (optional), `lesson_check_in`, `lesson_summary`.
*   `lesson_introduction`: State topic & objectives ({length_desc}). Title: "Introduction".
*   `lesson_core_concept`: Explain using {strategy_name_cap}. Apply {scaffolding_choice.name} scaffolding ({scaffolding_desc}). Adapt for {primary_style}. Length: {length_desc}. Title: "Core Concepts".
*   `lesson_example`: If included, 1-2 clear, {difficulty_desc} examples. Title: "Examples".
*   `lesson_check_in`: MUST include `questionText` (String, question only) and `answerDetail` (String, formatted like "{feedback_detail_instruction}"). Title: "Check Understanding".
*   `lesson_summary`: Recap main points ({length_desc}). Title: "Summary".
"""

    elif content_type == "quiz" or content_type == "assessment":
        num_questions = 3 if length_choice == ContentLength.CONCISE else 5 if length_choice == ContentLength.STANDARD else 7
        feedback_detail_instruction = get_feedback_instruction(
            feedback_choice_name)
        scaffold_instr = f"Apply {scaffolding_choice.name} hints within `questionText` if applicable." if scaffolding_choice == ScaffoldingLevel.HINTS else ""
        content_specific_instructions = f"""
*   **JSON Structure for 'quiz'/'assessment'**: Generate exactly {num_questions} section objects.
*   Each section MUST have `sectionType`: `quiz_question`.
*   Each section object MUST include: `questionNumber` (Int), `questionText` (String, including options like (A)...), `answerDetail` (String, formatted EXACTLY like "{feedback_detail_instruction}").
*   Target question difficulty: {difficulty_desc}. {scaffold_instr}
*   `title` should be "Question {{questionNumber}}". `contentMarkdown` can be empty or repeat `questionText`.
"""
    else:
        content_specific_instructions = f"""
*   **JSON Structure for '{content_type}'**: Use a single section: `sectionType`: `general_content`, `title`: "{content_type_cap}: {specific_topic}".
*   Generate relevant content about "{specific_topic}" following the Instructional Plan. Use Markdown subheadings (`###`) in `contentMarkdown` if helpful.
"""

    prompt = f"""You are an expert {grade}th grade NCERT curriculum tutor tasked with generating educational content.

{kg_section_text}

**CRITICAL OUTPUT REQUIREMENT:** Your entire response MUST be **ONLY** a single, valid JSON object conforming EXACTLY to the structure specified below. Do NOT include any introductory text, explanations, apologies, or concluding remarks outside the JSON object itself.

**FINAL JSON OUTPUT STRUCTURE:**
{{
  "contentType": "{content_type}",
  "topic": "{specific_topic}",
  "subject": "{subject}",
  "instructionalPlan": {{
    "teachingStrategy": "{strategy_name_cap}",
    "targetDifficulty": "{difficulty_desc}",
    "effectiveDifficultyScore": {effective_difficulty:.2f},
    "contentLength": "{length_desc}",
    "scaffoldingLevel": "{scaffolding_choice.name}",
    "feedbackStyle": "{feedback_choice_name}"
  }},
  "sections": [
    // Array of section objects. The exact structure and content of objects
    // inside this array depend on the 'contentType' and are detailed below
    // in SPECIFIC CONTENT REQUIREMENTS.
    // Example section object (structure varies):
    {{
      "sectionType": "example_type_replace_me",
      "title": "Example Title Replace Me",
      "contentMarkdown": "Example Markdown content for the section."
      // Include other required fields like 'questionText', 'answerDetail' based on contentType
    }}
  ]
}}

**ABSOLUTE RULES FOR YOUR RESPONSE:**
1.  **JSON ONLY:** Start response with `{{` and end with `}}`. NO other text allowed.
2.  **STRICT FOCUS:** Content generated inside the JSON MUST be exclusively about the topic: **{specific_topic}**. Avoid unrelated information.
3.  **NO META-TEXT:** Do not include comments like "Here is the JSON:", "As requested:", "Note:", etc., anywhere in your response.
4.  **GRADE LEVEL:** All content within the JSON must be appropriate for **Grade {grade}**.
5.  **VALID JSON:** Ensure the final output is perfectly valid JSON that can be parsed directly. Pay attention to commas, quotes, and brackets.

**STUDENT & INSTRUCTIONAL CONTEXT:**
*   Student Profile: Grade {grade}, Primary Learning Style: {primary_style}, Topic Mastery: {mastery_desc} ({mastery:.2f}).
*   Request: Generate '{content_type_cap}' for "{specific_topic}" (Subject: {subject}).
*   Instructional Plan (AI Tutor Choice): Use {strategy_name_cap} strategy, {difficulty_desc} difficulty, {length_desc} length, {scaffolding_choice.name} scaffolding, {feedback_choice_name} feedback.

**SPECIFIC CONTENT REQUIREMENTS FOR JSON `sections` ARRAY (based on contentType='{content_type}'):**
{content_specific_instructions}

**FINAL REMINDER:** Generate ONLY the valid JSON object described above. Use the Knowledge Graph Context (if provided) to inform the *content* within the JSON, ensuring factual accuracy. Adhere strictly to the required JSON structure and rules.
"""

    logger.debug(f"Generated Prompt (start): {prompt[:500]}...")
    return prompt


async def stream_llm_response(prompt: str, model_id: str, config: Optional[GenerationConfig]):
    """Streams the response from the Ollama LLM asynchronously."""
    if ollama_client is None:
        logger.error("Ollama client unavailable. Cannot generate content.")
        error_payload = json.dumps(
            {"error": "LLM service unavailable", "message": "Content generation failed."})
        yield error_payload + "\n"
        return

    try:
        options = config.model_dump(
            exclude_none=True, by_alias=True) if config else {}
        if 'temperature' not in options:
            options['temperature'] = 0.7

        logger.info(
            f"Streaming from Ollama model '{model_id}'. Options: {options}. Prompt length: {len(prompt)}")
        stream = await ollama_client.chat(
            model=model_id,
            messages=[{'role': 'user', 'content': prompt}],
            stream=True,
            options=options,
            format="json"
        )

        async for chunk in stream:
            if 'message' in chunk and 'content' in chunk['message']:
                yield chunk['message']['content']
            elif chunk.get('done') and chunk.get('error'):
                error_message = chunk.get('error', 'Unknown Ollama error')
                logger.error(f"Ollama streaming error: {error_message}")
                yield json.dumps({"error": "Ollama Error", "message": error_message}) + "\n"
                break
            elif chunk.get('done'):
                logger.info("Ollama stream finished.")
                break

    except ollama.ResponseError as e:
        logger.error(
            f"Ollama API Response Error: Status={e.status_code}, Error={e.error}", exc_info=False)
        yield json.dumps({"error": "Ollama API Error", "message": f"Status {e.status_code}: {e.error}"}) + "\n"
    except asyncio.TimeoutError:
        logger.error("Ollama request timed out.")
        yield json.dumps({"error": "Timeout", "message": "LLM request timed out."}) + "\n"
    except Exception as e:
        logger.error(f"Error during Ollama streaming: {e}", exc_info=True)
        yield json.dumps({"error": "Streaming Error", "message": "Content generation failed unexpectedly."}) + "\n"


@app.post("/content/next", response_class=StreamingResponse)
async def get_next_content_stream(
    request: ContentRequest,
    user_id: str = Depends(get_user_id_from_proxy),
):
    """
    Endpoint to get the next piece of adaptive content, guided by RL and KG.
    Streams the LLM-generated content (expected JSON format).
    """
    start_time = time.monotonic()
    logger.info(
        f"Received /content/next request for user {user_id}, content type: {request.content_type}")

    if ollama_client is None or learning_db is None:
        logger.error("Core dependency (Ollama or MongoDB) unavailable.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Core services unavailable.")

    session = await get_student_session_mongo(user_id)
    if session is None:
        logger.info(f"No session for user {user_id}. Creating default.")
        default_profile = StudentProfile(student_id=user_id)
        session = StudentSessionData(
            student_id=user_id, profile=default_profile, state=StudentState())
    session.last_active = datetime.now(timezone.utc)
    student_state = session.state
    student_profile = session.profile
    strategy = TeachingStrategies.EXPLANATION
    topic_idx = 0
    difficulty_choice = DifficultyLevel.NORMAL
    scaffolding_choice = ScaffoldingLevel.NONE
    feedback_choice = FeedbackType.ELABORATED
    length_choice = ContentLength.STANDARD
    unwrapped_env = rl_system.unwrapped_env if rl_system else None

    if rl_system and rl_system.model and unwrapped_env:
        observation = prepare_observation_from_state(
            student_state, student_profile, unwrapped_env)
        if observation is not None:
            try:
                action_array, _ = rl_system.model.predict(
                    observation, deterministic=True)
                action = action_array.astype(int)
                strat_idx, topic_idx, diff_idx, scaff_idx, feed_idx, len_idx = action
                strategy = TeachingStrategies(strat_idx)
                difficulty_choice = DifficultyLevel(diff_idx)
                scaffolding_choice = ScaffoldingLevel(scaff_idx)
                feedback_choice = FeedbackType(feed_idx)
                length_choice = ContentLength(len_idx)
                logger.info(
                    f"RL Action: Strat={strategy.name}, TopicIdx={topic_idx}, ...")
            except ValueError as e:
                logger.error(
                    f"RL action contained invalid enum index: {action}. Error: {e}. Using defaults.")
            except Exception as e:
                logger.error(f"RL model prediction failed: {e}", exc_info=True)
        else:
            logger.warning(
                f"Failed to prepare observation for user {user_id}. Using defaults.")
    else:
        logger.warning(
            "RL system unavailable or model not loaded. Using default actions.")

    final_topic_name = "Default Topic"
    final_topic_idx = topic_idx
    topic_map = {}
    all_env_topics = []
    if unwrapped_env and hasattr(unwrapped_env, 'topics') and unwrapped_env.topics:
        all_env_topics = unwrapped_env.topics
        topic_map = unwrapped_env.topic_to_idx
        if request.topic:
            matched_idx = find_best_topic_match(request.topic, all_env_topics)
            if matched_idx is not None:
                final_topic_idx = matched_idx
                logger.info(f"User override topic index: {final_topic_idx}")
            else:
                logger.warning(
                    f"User topic '{request.topic}' not matched, using RL index {topic_idx}.")
        final_topic_idx = np.clip(final_topic_idx, 0, len(all_env_topics) - 1)
        final_topic_name = all_env_topics[final_topic_idx]
    else:
        logger.error(
            "Cannot determine final topic: RL env topics unavailable. Using fallback.")

    mastery = student_state.mastery.get(final_topic_name, 0.0)
    prereq_satisfaction = calculate_prerequisite_satisfaction(
        final_topic_idx, student_state.mastery, unwrapped_env)
    base_difficulty = 0.5
    if unwrapped_env and hasattr(unwrapped_env, 'topic_base_difficulty') and len(unwrapped_env.topic_base_difficulty) > final_topic_idx:
        base_difficulty = unwrapped_env.topic_base_difficulty[final_topic_idx]
    difficulty_adjustment = {DifficultyLevel.EASIER: -0.2, DifficultyLevel.NORMAL: 0.0,
                             DifficultyLevel.HARDER: 0.2}.get(difficulty_choice, 0.0)
    mastery_difficulty_effect = -0.3 * mastery
    effective_difficulty = np.clip(
        base_difficulty + difficulty_adjustment + mastery_difficulty_effect, 0.05, 0.95)
    difficulty_level_desc = f"{difficulty_choice.name.capitalize()} ({effective_difficulty:.2f})"

    kg_context = ""
    kg_context_retrieved = False
    if neo4j_driver:
        chapter_name_sanitized = re.sub(r'\W+', '_', final_topic_name)
        query_term = request.subtopic if request.subtopic else final_topic_name.split(
            '-')[-1].replace('_', ' ')
        kg_context = await retrieve_kg_context_neo4j(
            driver=neo4j_driver, chapter_name_sanitized=chapter_name_sanitized,
            query_term=query_term, limit=5, chunk_limit=1)
        if kg_context:
            kg_context_retrieved = True
    else:
        logger.debug("Neo4j driver unavailable, skipping KG retrieval.")

    prompt = generate_prompt_template(
        content_type=request.content_type, strategy=strategy, topic_full_name=final_topic_name,
        effective_difficulty=effective_difficulty, mastery=mastery, grade=student_profile.grade,
        learning_style_prefs=student_profile.learning_style_preferences, request_details=request,
        difficulty_choice=difficulty_choice, scaffolding_choice=scaffolding_choice,
        feedback_choice=feedback_choice, length_choice=length_choice,
        kg_context=kg_context
    )

    subject = final_topic_name.split(
        '-')[0].replace('_', ' ') if '-' in final_topic_name else "General"
    metadata = InteractionMetadata(
        strategy=strategy.name, topic=final_topic_name, difficulty_choice=difficulty_choice.name,
        scaffolding_choice=scaffolding_choice.name, feedback_choice=feedback_choice.name, length_choice=length_choice.name,
        subject=subject, content_type=request.content_type, difficulty_level_desc=difficulty_level_desc,
        mastery_at_request=mastery, effective_difficulty_value=effective_difficulty, prereq_satisfaction=prereq_satisfaction,
        kg_context_used=kg_context_retrieved
    )
    update_student_state_history(
        student_state, final_topic_name, strategy.name, topic_map)

    interaction_log = metadata.model_dump()
    interaction_log["timestamp_utc"] = session.last_active.isoformat()
    session.learning_path.append(interaction_log)

    await save_student_session_mongo(session)

    logger.info(
        f"Streaming content for User {user_id}, Topic '{final_topic_name}', KG: {kg_context_retrieved}, Time: {(time.monotonic() - start_time)*1000:.2f}ms")
    stream_generator = stream_llm_response(
        prompt, OLLAMA_MODEL, request.config)
    headers = {f"X-{k.replace('_', '-').title()}": str(v)
               for k, v in metadata.model_dump(exclude={'interaction_id'}).items() if v is not None}
    headers["X-Interaction-Id"] = metadata.interaction_id
    return StreamingResponse(stream_generator, media_type="application/x-ndjson; charset=utf-8", headers=headers)


@app.post("/feedback/submit", status_code=status.HTTP_202_ACCEPTED)
async def submit_feedback(
    feedback_data: SessionFeedback,
    user_id: str = Depends(get_user_id_from_proxy),
):
    """Receives feedback on an interaction and updates the student's learning state."""
    start_time = time.monotonic()
    logger.info(
        f"Received /feedback/submit for user {user_id}, interaction ID: {feedback_data.interaction_id}")

    if learning_db is None:
        logger.error("MongoDB unavailable, cannot process feedback.")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="Database service unavailable")

    session = await get_student_session_mongo(user_id)
    if session is None:
        logger.warning(
            f"Session not found for user {user_id} during feedback submission.")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User session not found.")

    now_utc = datetime.now(timezone.utc)
    session.last_active = now_utc
    student_state = session.state

    try:
        interaction_log = None
        interaction_index = -1
        for i, log_entry in enumerate(reversed(session.learning_path)):
            if log_entry.get("interaction_id") == feedback_data.interaction_id:
                if isinstance(log_entry, dict):
                    interaction_log = log_entry
                    interaction_index = len(session.learning_path) - 1 - i
                    break
                else:
                    logger.warning(
                        f"Found matching interaction ID {feedback_data.interaction_id} but entry is not a dict: {type(log_entry)}")

        if interaction_log is None:
            logger.warning(
                f"Interaction ID {feedback_data.interaction_id} not found in learning path for user {user_id}")
            topic_name = None
        else:
            topic_name = interaction_log.get("topic")

        mastery_before = student_state.mastery.get(
            topic_name, 0.0) if topic_name else 0.0
        new_mastery = mastery_before
        mastery_gain = 0.0

        if topic_name:
            base_rate = 0.15
            max_gain_potential = max(
                0.05, (1.0 - mastery_before))

            perf_score = 0.5
            if feedback_data.assessment_score is not None:
                score_norm = feedback_data.assessment_score / 100.0
                perf_score = score_norm
                mastery_gain = base_rate * 1.5 * score_norm * max_gain_potential
                if score_norm < 0.5:
                    mastery_gain -= base_rate * 0.3 * (0.5 - score_norm)
                student_state.recent_performance = np.clip(
                    0.6 * student_state.recent_performance + 0.4 * score_norm, 0.0, 1.0)
            elif feedback_data.completion_percentage is not None:
                comp_norm = feedback_data.completion_percentage / 100.0
                perf_score = comp_norm * 0.8
                mastery_gain = base_rate * 0.5 * comp_norm * max_gain_potential

            rating_modifier = 1.0
            if feedback_data.helpful_rating is not None:
                rating_norm = (feedback_data.helpful_rating -
                               1) / 4.0
                rating_modifier = 0.8 + (0.4 * rating_norm)
                mastery_gain *= rating_modifier

            new_mastery = np.clip(mastery_before + mastery_gain, 0.0, 1.0)
            student_state.mastery[topic_name] = new_mastery
            logger.info(
                f"Feedback Update User {user_id}, Topic '{topic_name}': Mastery {mastery_before:.3f} -> {new_mastery:.3f} (Gain: {mastery_gain:.4f})")
        else:
            logger.warning(
                f"Cannot update mastery for interaction {feedback_data.interaction_id}, topic name unknown.")

        if feedback_data.engagement_rating is not None:
            rating_norm = (feedback_data.engagement_rating -
                           1) / 4.0
            student_state.engagement = np.clip(
                0.7 * student_state.engagement + 0.3 * rating_norm, 0.1, 0.95)

        motivation_change = 0.0
        if mastery_gain > 0.01:
            motivation_change += 0.02
        if mastery_gain > 0.05:
            motivation_change += 0.03
        if feedback_data.helpful_rating is not None:
            motivation_change += (feedback_data.helpful_rating - 3) * 0.015
        if feedback_data.assessment_score is not None and feedback_data.assessment_score < 40:
            motivation_change -= 0.03
        student_state.motivation = np.clip(
            student_state.motivation + motivation_change, 0.1, 0.95)

        # 4. Update Misconceptions (Heuristic - Requires better input or analysis)
        # Example: Increase if score is low despite high time/completion
        # if topic_name and perf_score < 0.4 and (feedback_data.time_spent_seconds > 120 or feedback_data.completion_percentage > 80):
        #      mc_increase = 0.1 * (1.0 - perf_score)
        #      student_state.misconceptions[topic_name] = np.clip(student_state.misconceptions.get(topic_name, 0.0) + mc_increase, 0.0, 0.8)

        if interaction_index != -1:
            feedback_log_details = feedback_data.model_dump()
            feedback_log_details["feedback_received_utc"] = now_utc.isoformat()
            feedback_log_details["mastery_after_feedback"] = new_mastery
            feedback_log_details["mastery_gain_from_feedback"] = mastery_gain
            session.learning_path[interaction_index].update(
                feedback_log_details)
        else:
            logger.warning(
                f"Could not find interaction log {feedback_data.interaction_id} to store feedback details.")

        await save_student_session_mongo(session)

        logger.info(
            f"Feedback processed for user {user_id}, interaction {feedback_data.interaction_id}. Time: {(time.monotonic() - start_time)*1000:.2f}ms")
        return {"status": "success", "message": "Feedback processed."}

    except Exception as e:
        logger.error(
            f"Error processing feedback for user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to process feedback.")


@app.get("/healthcheck")
async def healthcheck():
    """Provides health status of the API and its dependencies."""
    ollama_status = "unavailable"
    mongo_status = "unavailable"
    rl_model_status = "unavailable"
    neo4j_status = "unavailable"

    if ollama_client:
        try:
            await ollama_client.list()
            ollama_status = "ok"
        except Exception:
            logger.warning("Healthcheck: Ollama connection failed.")
            pass

    if mongo_client is not None and learning_db is not None:
        try:
            await mongo_client.admin.command('ping')
            mongo_status = "ok"
        except Exception:
            logger.warning("Healthcheck: MongoDB connection failed.")
            pass

    if SB3_AVAILABLE and rl_system and rl_system.model:
        rl_model_status = "loaded"
    elif SB3_AVAILABLE and not rl_system:
        rl_model_status = "load_failed"
    elif not SB3_AVAILABLE:
        rl_model_status = "sb3_unavailable"
    else:
        rl_model_status = "config_missing"

    if neo4j_driver:
        try:
            await asyncio.to_thread(neo4j_driver.verify_connectivity)
            neo4j_status = "ok"
        except Exception:
            logger.warning("Healthcheck: Neo4j connection failed.")
            pass

    rl_info = {}
    if rl_system and rl_system.unwrapped_env:
        try:
            rl_info = {
                "num_topics": getattr(rl_system.unwrapped_env, 'num_topics', 'N/A'),
                "num_strategies": NUM_STRATEGIES,
                "model_path": RL_MODEL_PATH if RL_MODEL_PATH else "N/A"
            }
        except Exception:
            logger.warning("Healthcheck: Failed to get detailed RL info.")
            pass

    is_healthy = all(s == "ok" for s in [mongo_status, ollama_status])
    api_status = "healthy" if is_healthy else "unhealthy"

    return {
        "status": api_status,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "version": API_VERSION,
        "dependencies": {
            "ollama": ollama_status,
            "mongodb": mongo_status,
            "neo4j": neo4j_status,
            "rl_model": rl_model_status,
        },
        "rl_info": rl_info
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server for Adaptive Content API...")
    if not all([MONGO_URL, MONGO_DB_NAME, OLLAMA_HOST]):
        logger.critical(
            "CRITICAL: MONGO_URL, MONGO_DB_NAME, or OLLAMA_HOST not set. Application will likely fail.")
    if not all([NEO4J_URI, NEO4J_PASSWORD]):
        logger.warning("Neo4j env vars not set. Graph RAG will be disabled.")
    if SB3_AVAILABLE and not RL_MODEL_PATH:
        logger.warning(
            "SB3 is available but RL_MODEL_PATH not set. RL features disabled.")
    if not INTERNAL_API_SECRET:
        logger.warning(
            "INTERNAL_API_SECRET not set. Proxy requests are unverified (INSECURE).")

    uvicorn.run(
        "adaptive_content_routes:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000)),
        reload=True,
        log_level=LOG_LEVEL.lower()
    )
