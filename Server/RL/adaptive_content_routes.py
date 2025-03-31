import os
import json
import logging
import asyncio
from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Dict, Optional, Any
from enum import Enum
import numpy as np
from fastapi import FastAPI, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import copy
from contextlib import asynccontextmanager

class LearningStyles(Enum):
    VISUAL = 0
    AUDITORY = 1
    READING = 2
    KINESTHETIC = 3

class TeachingStrategies(Enum):
    EXPLANATION = 0
    DEMONSTRATION = 1
    PRACTICE = 2
    EXPLORATION = 3
    ASSESSMENT = 4
    INTERACTIVE = 5
    STORYTELLING = 6
    GAMIFICATION = 7
    # PEER_LEARNING = 8 # Harder to simulate solo, excluded for now
    SPACED_REVIEW = 8 # Adjusted index

NUM_STRATEGIES = len(TeachingStrategies) # Now 9

class DifficultyLevel(Enum):
    EASIER = 0   # Adjust difficulty downwards (-0.2)
    NORMAL = 1   # Use base difficulty (0.0 adjustment)
    HARDER = 2   # Adjust difficulty upwards (+0.2)

class ScaffoldingLevel(Enum):
    NONE = 0        # No extra support
    HINTS = 1       # Provide hints on request or with questions
    GUIDANCE = 2    # Provide step-by-step guidance or worked examples

class FeedbackType(Enum):
    CORRECTIVE = 0   # Simple correct/incorrect
    HINT = 1         # Hint towards the correct answer/process
    ELABORATED = 2   # Explain why the answer is right/wrong
    SOCRATIC = 3     # Ask guiding questions

class ContentLength(Enum):
    CONCISE = 0      # Shorter content piece
    STANDARD = 1     # Normal length
    DETAILED = 2     # Longer, more in-depth content

# --- Load Environment Variables ---
load_dotenv()

# --- Import RL Components (handle SB3 missing) ---
try:
    # Assuming ncert_tutor.py is in the same directory or accessible via PYTHONPATH
    from ncert_tutor import (
        NCERTLearningSystem, TeachingStrategies as NCERTTeachingStrategies,
        LearningStyles as NCERTLearningStyles, DifficultyLevel as NCERTDifficultyLevel,
        ScaffoldingLevel as NCERTScaffoldingLevel, FeedbackType as NCERTFeedbackType,
        ContentLength as NCERTContentLength, NUM_STRATEGIES
    )
    SB3_AVAILABLE = True
    TeachingStrategies = NCERTTeachingStrategies
    LearningStyles = NCERTLearningStyles
    DifficultyLevel = NCERTDifficultyLevel
    ScaffoldingLevel = NCERTScaffoldingLevel
    FeedbackType = NCERTFeedbackType
    ContentLength = NCERTContentLength
    logging.info("Successfully imported RL components from ncert_tutor.")
except ImportError as e:
    logging.error(f"Failed to import RL components: {e}. RL features will be disabled.")
    SB3_AVAILABLE = False
    # Dummy classes if SB3/RL components are not available
    class DummyTeachingStrategies(Enum):
        EXPLANATION = 0
        DEMONSTRATION = 1
        PRACTICE = 2
        EXPLORATION = 3
        ASSESSMENT = 4
        INTERACTIVE = 5
        STORYTELLING = 6
        GAMIFICATION = 7
        SPACED_REVIEW = 8
    
    class DummyLearningStyles(Enum):
        VISUAL = 0
        AUDITORY = 1
        READING = 2
        KINESTHETIC = 3
    
    class DummyDifficultyLevel(Enum):
        EASIER = 0
        NORMAL = 1
        HARDER = 2
    
    class DummyScaffoldingLevel(Enum):
        NONE = 0
        HINTS = 1
        GUIDANCE = 2
    
    class DummyFeedbackType(Enum):
        CORRECTIVE = 0
        HINT = 1
        ELABORATED = 2
        SOCRATIC = 3
    
    class DummyContentLength(Enum):
        CONCISE = 0
        STANDARD = 1
        DETAILED = 2
    
    TeachingStrategies = DummyTeachingStrategies
    LearningStyles = DummyLearningStyles
    DifficultyLevel = DummyDifficultyLevel
    ScaffoldingLevel = DummyScaffoldingLevel
    FeedbackType = DummyFeedbackType
    ContentLength = DummyContentLength
    NUM_STRATEGIES = len(TeachingStrategies)
    
    class NCERTStudentEnv:
        pass
    class NCERTLearningSystem:
        model = None
        unwrapped_env = None
        def __init__(self, *args, **kwargs): pass
        def load_model(self, path): logging.error("Cannot load model, SB3/RL components not available."); return None

# --- Ollama Client ---
import ollama

# --- MongoDB Client ---
import motor.motor_asyncio

# --- Logging Configuration ---
log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("adaptive-content-api")

# --- Configuration ---
RL_MODEL_PATH = os.environ.get("RL_MODEL_PATH", "./ncert_tutor_logs_enhanced_v3/models/best/best_model.zip")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma3:4b")
MONGO_URL = os.environ.get("MONGO_URL", "mongodb+srv://2021parthkadam:nUSZGp8RgC7Vf44k@brainwave.fukadlt.mongodb.net/?retryWrites=true&w=majority&appName=BrainWave")
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "BrainWave")
INTERNAL_API_SECRET = os.environ.get("INTERNAL_API_SECRET") # Load shared secret

# --- Global Variables ---
rl_system: Optional[NCERTLearningSystem] = None
ollama_client: Optional[ollama.AsyncClient] = None
mongo_client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
learning_db = None # MongoDB database object

# --- Pydantic Models ---
# (Ensure these match the frontend types/fastapi.ts and RL state)
class StudentProfile(BaseModel):
    student_id: str
    grade: int = Field(default=6) # Default grade, should ideally be fetched
    learning_style_preferences: Dict[str, float] = Field(
        default_factory=lambda: {ls.name.lower(): 1.0 / len(LearningStyles) for ls in LearningStyles if isinstance(ls, LearningStyles)}
    )

class StudentState(BaseModel):
    mastery: Dict[str, float] = Field(default_factory=dict) # topic_name -> mastery_level (0-1)
    engagement: float = Field(default=0.7)
    attention: float = Field(default=0.8)
    cognitive_load: float = Field(default=0.4)
    motivation: float = Field(default=0.7)
    # History/Context (used for observation prep)
    strategy_history_vector: List[float] = Field(default_factory=lambda: [0.0] * len(TeachingStrategies)) # Store the vector directly
    topic_attempts: Dict[str, float] = Field(default_factory=dict) # topic_name -> attempts
    time_since_last_practiced: Dict[str, float] = Field(default_factory=dict) # topic_name -> steps since
    misconceptions: Dict[str, float] = Field(default_factory=dict) # topic_name -> severity (0-1)
    current_topic_idx_persistent: int = Field(default=-1) # Store index of last topic, -1 if none
    recent_performance: float = Field(default=0.5)
    steps_on_current_topic: float = Field(default=0.0)
    # --- Deprecated fields, kept for potential backward compatibility during transition ---
    # recent_topics: List[str] = Field(default_factory=list) # Replaced by topic history within RL state
    # recent_strategies: List[str] = Field(default_factory=list) # Replaced by strategy_history_vector

class StudentSessionData(BaseModel):
    student_id: str # Primary key (matches User.id from auth)
    profile: StudentProfile
    state: StudentState
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_active: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    learning_path: List[Dict[str, Any]] = Field(default_factory=list) # Log of interactions

class GenerationConfig(BaseModel):
    max_length: Optional[int] = Field(None, alias="num_predict")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    top_p: Optional[float] = Field(None, ge=0.0, le=1.0)
    top_k: Optional[int] = Field(None, ge=1)
    # difficulty_adjustment is now determined by RL, remove from API config
    # difficulty_adjustment: float = 0.0

    class Config:
        populate_by_name = True

class ContentRequest(BaseModel):
    content_type: str = Field(..., description="lesson, quiz, flashcard, cheatsheet, explanation, feedback")
    subject: str
    topic: Optional[str] = None # User preferred topic override
    subtopic: Optional[str] = None
    previous_response: Optional[str] = None # Context for follow-up
    user_input: Optional[str] = None # e.g., answer to a quiz question for feedback
    config: Optional[GenerationConfig] = None

class InteractionMetadata(BaseModel):
    # Data captured when content is requested
    interaction_id: str = Field(default_factory=lambda: str(uuid4()))
    # Action chosen by RL
    strategy: str
    topic: str # Actual topic chosen (user pref or RL)
    difficulty_choice: str # EASIER, NORMAL, HARDER
    scaffolding_choice: str
    feedback_choice: str
    length_choice: str
    # Context for the choice
    subject: str
    content_type: str # Requested by user
    difficulty_level_desc: str # Description like "Easy (Introductory)"
    mastery_at_request: float
    effective_difficulty_value: float # Calculated difficulty used for prompt
    prereq_satisfaction: float
    # Pydantic v2: Use model_config for aliasing if needed
    # model_config = ConfigDict(populate_by_name=True)


class SessionFeedback(BaseModel):
    # Data received from frontend after interaction
    interaction_id: str
    time_spent_seconds: Optional[int] = Field(None, ge=0)
    completion_percentage: Optional[float] = Field(None, ge=0, le=100)
    assessment_score: Optional[float] = Field(None, ge=0, le=100) # e.g., Quiz score %
    engagement_rating: Optional[int] = Field(None, ge=1, le=5) # User subjective rating
    helpful_rating: Optional[int] = Field(None, ge=1, le=5)   # User subjective rating
    feedback_text: Optional[str] = None


# --- FastAPI App Setup ---
app = FastAPI(
    title="Adaptive Content API",
    description="Streams adaptive content based on RL guidance and user state.",
    version="0.4.0" # Incremented version
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000"], # Adjust for production (e.g., ["http://localhost:3000", "https://yourdomain.com"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependency Functions ---

async def get_user_id_from_proxy(
    x_authenticated_user_id: str | None = Header(None, alias="X-Authenticated-User-Id"),
    x_internal_api_secret: str | None = Header(None, alias="X-Internal-Api-Secret")
) -> str:
    """
    Dependency to extract User ID from header sent by trusted Next.js proxy.
    Verifies a shared secret if configured.
    """
    if INTERNAL_API_SECRET: # Check only if secret is configured
        if not x_internal_api_secret:
             logger.warning("Internal API secret missing from request header.")
             raise HTTPException(
                 status_code=status.HTTP_401_UNAUTHORIZED,
                 detail="Missing credentials for internal API.",
             )
        if x_internal_api_secret != INTERNAL_API_SECRET:
             logger.warning("Invalid internal API secret received.")
             raise HTTPException(
                 status_code=status.HTTP_403_FORBIDDEN,
                 detail="Access denied: Invalid credentials for internal API.",
             )
    else:
         # Log warning if secret is not set in environment (less secure)
         logger.warning("INTERNAL_API_SECRET is not set. Proceeding without secret verification (Less Secure).")


    if x_authenticated_user_id is None:
        logger.error("Header 'X-Authenticated-User-Id' missing from proxy request.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Required user identifier missing.",
        )
    return x_authenticated_user_id


# --- Database Functions (MongoDB) ---

async def get_student_session_mongo(user_id: str) -> StudentSessionData | None:
    """Fetches student session data from MongoDB."""
    if learning_db is None:
        logger.error("MongoDB database object not initialized.")
        # Raise 503 Service Unavailable if DB connection failed at startup
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Learning state database unavailable")
    try:
        data = await learning_db["learning_states"].find_one({"student_id": user_id})
        if data:
            if "_id" in data: # Exclude Mongo's internal ID
                data.pop("_id", None)
            # Use model_validate for Pydantic v2
            return StudentSessionData.model_validate(data)
        return None
    except Exception as e:
        logger.error(f"Error fetching session for user {user_id} from MongoDB: {e}", exc_info=True)
        # Raise internal server error for DB issues during fetch
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error accessing learning state")

async def save_student_session_mongo(session_data: StudentSessionData):
    """Saves or updates student session data in MongoDB."""
    if learning_db is None:
        logger.error("MongoDB database object not initialized. Cannot save session.")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")
    try:
        session_dict = session_data.model_dump(mode='json')
        update_payload = copy.deepcopy(session_dict)
        update_payload.pop('created_at', None) # Exclude from $set

        await learning_db["learning_states"].update_one(
            {"student_id": session_data.student_id},
            {
                "$set": update_payload,
                "$setOnInsert": { "created_at": session_data.created_at }
            },
            upsert=True
        )
    except Exception as e:
        logger.error(f"Error saving session for user {session_data.student_id} to MongoDB: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save learning state")

# --- Helper Functions ---

def prepare_observation_from_state(state: StudentState, env: Any) -> Optional[np.ndarray]:
    """
    Prepares the observation numpy array expected by the FLAT RL model's observation space,
    based on the Pydantic StudentState model.
    ORDER MUST MATCH FlattenObservation concatenation order.
    """
    if not SB3_AVAILABLE or env is None or not hasattr(env, 'num_topics') or env.num_topics == 0:
        logger.error("Cannot prepare observation: RL Env missing, SB3 unavailable, or env not properly initialized.")
        return None

    try:
        # Get dimension information from environment
        num_topics = env.num_topics
        topic_map = env.topic_to_idx
        
        # Get exact values from original environment
        num_strategies = NUM_STRATEGIES  # Use the global constant
        num_styles = 4  # Fixed value: VISUAL, AUDITORY, READING, KINESTHETIC
        
        # Get expected shape to ensure matching dimensions
        expected_shape = env.observation_space.shape[0] if hasattr(env, 'observation_space') else 248
        logger.debug(f"Preparing observation with dimensions: topics={num_topics}, strategies={num_strategies}, styles={num_styles}, expected total={expected_shape}")

        # Initialize arrays with default values matching env expectations
        mastery_obs = np.zeros(num_topics, dtype=np.float32)
        engagement_obs = np.array([state.engagement], dtype=np.float32)
        attention_obs = np.array([state.attention], dtype=np.float32)
        cognitive_load_obs = np.array([state.cognitive_load], dtype=np.float32)
        motivation_obs = np.array([state.motivation], dtype=np.float32)

        # Fixed learning style preferences with guaranteed size
        learning_style_prefs_obs = np.zeros(num_styles, dtype=np.float32)
        if hasattr(state, 'profile') and hasattr(state.profile, 'learning_style_preferences'):
            style_names = ['visual', 'auditory', 'reading', 'kinesthetic']
            for i, style_name in enumerate(style_names):
                learning_style_prefs_obs[i] = state.profile.learning_style_preferences.get(style_name, 0.25)
        
        # Ensure sum = 1.0 for learning style preferences
        sum_prefs = np.sum(learning_style_prefs_obs)
        if sum_prefs > 0:
            learning_style_prefs_obs = learning_style_prefs_obs / sum_prefs
        else:
            learning_style_prefs_obs = np.full(num_styles, 0.25, dtype=np.float32)

        # Strategy history with guaranteed size
        strategy_history_obs = np.zeros(num_strategies, dtype=np.float32)
        if len(state.strategy_history_vector) == num_strategies:
            strategy_history_obs = np.array(state.strategy_history_vector, dtype=np.float32)
        elif len(state.strategy_history_vector) > 0:
            logger.warning(f"Strategy history vector size mismatch: expected {num_strategies}, got {len(state.strategy_history_vector)}")
            # Copy what we can
            for i in range(min(len(state.strategy_history_vector), num_strategies)):
                strategy_history_obs[i] = state.strategy_history_vector[i]

        # Topic-related observations
        topic_attempts_obs = np.zeros(num_topics, dtype=np.float32)
        time_since_last_practiced_obs = np.full(num_topics, 100.0, dtype=np.float32)
        misconceptions_obs = np.zeros(num_topics, dtype=np.float32)

        # Fill topic-related observations
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
                misconceptions_obs[topic_map[topic_name]] = np.clip(value, 0.0, 1.0)

        # Handle current topic index, normalize for observation
        topic_idx_max = num_topics
        current_topic_idx = state.current_topic_idx_persistent 
        if current_topic_idx < 0 or current_topic_idx >= num_topics:
            current_topic_idx = topic_idx_max  # Use max value (num_topics) to represent "none"
        
        current_topic_normalized_obs = np.array([float(current_topic_idx) / float(max(1, topic_idx_max))], dtype=np.float32)
        recent_performance_obs = np.array([state.recent_performance], dtype=np.float32)
        steps_on_current_topic_obs = np.array([state.steps_on_current_topic], dtype=np.float32)

        # --- Concatenate in the EXACT order defined/expected by FlattenObservation ---
        observation_list = [
            mastery_obs,                    # [num_topics]
            engagement_obs,                 # [1]
            attention_obs,                  # [1]
            cognitive_load_obs,             # [1]
            motivation_obs,                 # [1]
            learning_style_prefs_obs,       # [num_styles=4]
            strategy_history_obs,           # [num_strategies=9]
            topic_attempts_obs,             # [num_topics]
            time_since_last_practiced_obs,  # [num_topics]
            misconceptions_obs,             # [num_topics]
            current_topic_normalized_obs,   # [1]
            recent_performance_obs,         # [1]
            steps_on_current_topic_obs      # [1]
        ]
        
        flat_observation = np.concatenate(observation_list).astype(np.float32)
        
        # Check for shape mismatch and pad/truncate if necessary
        if flat_observation.shape[0] != expected_shape:
            logger.error(f"FATAL: Observation shape mismatch: Expected {expected_shape}, Got {flat_observation.shape[0]}. Check `prepare_observation_from_state` and `FlattenObservation` order/content.")
            
            component_shapes = [(i, type(obs).__name__, obs.shape) for i, obs in enumerate(observation_list)]
            logger.debug(f"Observation components: {component_shapes}")
            
            # Calculate expected component sizes based on typical environment
            expected_size = 4*num_topics + num_styles + num_strategies + 5  # Basic formula
            logger.debug(f"Formula calculation: 4*{num_topics} + {num_styles} + {num_strategies} + 5 = {expected_size}")
            
            # Pad with zeros or truncate as needed
            if flat_observation.shape[0] < expected_shape:
                padding_size = expected_shape - flat_observation.shape[0]
                padding = np.zeros(padding_size, dtype=np.float32)
                flat_observation = np.concatenate([flat_observation, padding])
                logger.warning(f"Padded observation with {padding_size} zeros to match expected shape")
            else:
                flat_observation = flat_observation[:expected_shape]
                logger.warning(f"Truncated observation to match expected shape {expected_shape}")
                
        return flat_observation

    except Exception as e:
        logger.error(f"Failed to prepare observation: {e}", exc_info=True)
        return None
    
def find_best_topic_match(query_topic: str, all_topics: List[str]) -> Optional[int]:
    """Finds the best matching topic index for a user query."""
    if not query_topic or not all_topics:
        return None
    best_match_idx: Optional[int] = None
    best_score = -1
    query_norm = query_topic.lower().strip().replace('-', ' ') # Normalize

    if not query_norm:
        return None

    for idx, topic in enumerate(all_topics):
        topic_norm = topic.lower().strip().replace('-', ' ') # Normalize topic name
        if query_norm == topic_norm:
            return idx  # Exact match

        score = 0
        # Simple substring matching score (can be improved with fuzzy matching)
        if query_norm in topic_norm:
            score = len(query_norm) / len(topic_norm) # Higher score if query is a larger part
        elif topic_norm in query_norm:
            score = len(topic_norm) / len(query_norm)

        # Prefer matches where query is a substring of topic
        score = score * 0.9 if topic_norm in query_norm else score

        if score > best_score:
            best_score = score
            best_match_idx = idx

    # Return index only if score is reasonably high (e.g., > 0.6)
    return best_match_idx if best_score > 0.6 else None


def calculate_prerequisite_satisfaction(topic_idx: int, mastery_dict: Dict[str, float], env: Any) -> float:
    """Calculates prerequisite satisfaction for a given topic index."""
    if not SB3_AVAILABLE or env is None or not hasattr(env, 'prerequisite_matrix') or not hasattr(env, 'topics'):
        logger.warning("Cannot calculate prerequisites: RL Env missing or missing attributes.")
        return 0.5 # Default neutral value

    try:
        prereq_matrix = env.prerequisite_matrix
        topics = env.topics
        if prereq_matrix is None or not isinstance(prereq_matrix, np.ndarray) or prereq_matrix.shape[0] <= topic_idx:
             logger.warning(f"Invalid prerequisite matrix for topic index {topic_idx}")
             return 0.5

        prereqs_vector = prereq_matrix[topic_idx, :]
        prereq_indices = np.where(prereqs_vector > 0)[0]
        prereq_indices = prereq_indices[prereq_indices != topic_idx] # Exclude self

        if len(prereq_indices) == 0:
            return 1.0 # No prerequisites

        weighted_mastery_sum = 0.0
        total_weight = 0.0
        for idx in prereq_indices:
            if idx >= len(topics): continue # Index out of bounds
            topic_name = topics[idx]
            mastery = mastery_dict.get(topic_name, 0.0) # Default to 0 if not found
            weight = prereqs_vector[idx] # Use weight from matrix (though currently only 1.0)
            weighted_mastery_sum += mastery * weight
            total_weight += weight

        return (weighted_mastery_sum / total_weight) if total_weight > 0 else 1.0

    except Exception as e:
        logger.warning(f"Error calculating prerequisites for topic index {topic_idx}: {e}", exc_info=True)
        return 0.5 # Default neutral value on error

def update_student_state_history(state: StudentState, topic_name: str, strategy_name: str, topic_attempts_map: Dict[str, float], env: Any):
    """Updates simple history parts of the student state after an action is chosen."""
    # This function primarily updates history vectors/maps needed for the *next* observation.
    # Actual mastery/engagement updates happen in the feedback endpoint.

    if not SB3_AVAILABLE or not isinstance(TeachingStrategies, Enum): return

    # --- Update Strategy History Vector ---
    try:
        strategy_idx = TeachingStrategies[strategy_name].value
        # Apply moving average decay
        new_hist_vector = [h * 0.85 for h in state.strategy_history_vector]
        if 0 <= strategy_idx < len(new_hist_vector):
            new_hist_vector[strategy_idx] += 0.15
        state.strategy_history_vector = new_hist_vector
    except (KeyError, ValueError, IndexError):
        logger.warning(f"Could not update strategy history for strategy: {strategy_name}")


    # --- Update Topic Attempts ---
    state.topic_attempts[topic_name] = state.topic_attempts.get(topic_name, 0.0) + 1.0

    # --- Update Time Since Last Practiced ---
    # Increment time for all topics
    for t_name in topic_attempts_map.keys(): # Iterate through all known topics
         state.time_since_last_practiced[t_name] = state.time_since_last_practiced.get(t_name, 100.0) + 1.0
    # Reset time for the current topic
    state.time_since_last_practiced[topic_name] = 0.0

    # --- Update Current Topic Index and Steps ---
    if env and hasattr(env, 'topic_to_idx'):
         topic_idx = env.topic_to_idx.get(topic_name, -1)
         if topic_idx != -1:
              if topic_idx == state.current_topic_idx_persistent:
                  state.steps_on_current_topic += 1.0
              else:
                  state.steps_on_current_topic = 1.0
              state.current_topic_idx_persistent = topic_idx
         else:
              # If topic not found in env map, reset steps and index
              state.steps_on_current_topic = 0.0
              state.current_topic_idx_persistent = -1 # Or env.num_topics for the 'None' index
    else:
         # Cannot update index/steps if env map unavailable
         state.steps_on_current_topic = 0.0
         state.current_topic_idx_persistent = -1


#def generate_prompt_template(
#    content_type: str,
#    strategy: TeachingStrategies,
#    topic_full_name: str,
#    effective_difficulty: float, # Calculated difficulty (0-1)
#    mastery: float, # Current mastery (0-1)
#    grade: int,
#    learning_style_prefs: Dict[str, float],
#    request_details: ContentRequest,
#    difficulty_choice: DifficultyLevel,
#    scaffolding_choice: ScaffoldingLevel,
#    feedback_choice: FeedbackType,
#    length_choice: ContentLength
#) -> str:
#    """Generates a detailed prompt for the LLM based on RL actions and student state."""
#
#    # Deconstruct topic name
#    parts = topic_full_name.split('-', 2) # Split max 2 times
#    subject = parts[0] if len(parts) > 0 else "General"
#    subsubject_or_topic = parts[1] if len(parts) > 1 else topic_full_name
#    specific_topic = parts[2] if len(parts) > 2 else subsubject_or_topic
#    specific_topic = specific_topic.replace('-', ' ') # Make more readable
#
#    # Get dominant learning style
#    primary_style = "balanced"
#    if learning_style_prefs:
#         primary_style_name = max(learning_style_prefs.items(), key=lambda item: item[1])[0]
#         # Map name back to enum if needed, or just use capitalized name
#         primary_style = primary_style_name.capitalize()
#
#
#    # Descriptions based on state/action
#    mastery_desc = "new to this topic or struggling" if mastery < 0.3 else "developing understanding" if mastery < 0.7 else "quite familiar"
#    difficulty_desc = difficulty_choice.name.lower() # Use RL choice name
#    scaffolding_desc = {
#        ScaffoldingLevel.NONE: "Provide standard content.",
#        ScaffoldingLevel.HINTS: "Include hints where appropriate (e.g., in quizzes).",
#        ScaffoldingLevel.GUIDANCE: "Provide step-by-step guidance or worked examples prominently."
#    }[scaffolding_choice]
#    length_desc = length_choice.name.lower() # concise, standard, detailed
#    strategy_name_cap = strategy.name.capitalize()
#
#    # --- Base Prompt ---
#    prompt = f"""Act as an expert {grade}th grade NCERT curriculum tutor generating educational content.
#
#**Student Context:**
#*   Grade: {grade}
#*   Topic: {specific_topic} (Subject: {subject})
#*   Mastery Level: {mastery_desc} (Score: {mastery:.2f})
#*   Primary Learning Style: {primary_style}
#*   Requested Content Type: {content_type.capitalize()}
#
#**Instructional Plan (from AI Tutor):**
#*   Teaching Strategy: Use a **{strategy_name_cap}** approach.
#*   Target Difficulty: Aim for a **{difficulty_desc}** level relative to the student's mastery (Effective Difficulty Score: {effective_difficulty:.2f}).
#*   Pacing/Length: Keep the content **{length_desc}**.
#*   Scaffolding: {scaffolding_desc}
#
#**Task:**
#Generate the requested "{content_type.capitalize()}" content for "{specific_topic}".
#Ensure it's engaging, accurate, suitable for the student's grade and mastery, formatted clearly using Markdown, and adheres to the Instructional Plan above.
#"""
#
#    # --- Content Type Specific Instructions ---
#    # Incorporate strategy, scaffolding, length, feedback type where relevant
#    if content_type == "lesson":
#        prompt += f"""
#**Lesson Requirements:**
#1.  **Introduction:** Briefly state topic & learning objectives ({length_desc}).
#2.  **Core Content:** Explain key concepts using the **{strategy_name_cap}** approach. {scaffolding_desc} Adapt for {primary_style} learning. Use {grade}th grade examples. Adhere to **{length_desc}** pacing.
#3.  **Check-in:** Include 1-2 simple questions or a reflection prompt.
#4.  **Summary:** Briefly recap main points ({length_desc})."""
#    elif content_type == "quiz" or content_type == "assessment":
#        num_questions = 3 if length_choice == ContentLength.CONCISE else 5 if length_choice == ContentLength.STANDARD else 7
#        feedback_instr = { # Instructions based on feedback type choice
#            FeedbackType.CORRECTIVE: "Provide only the correct answer.",
#            FeedbackType.HINT: "Provide the correct answer and a brief hint towards the solution.",
#            FeedbackType.ELABORATED: "Provide the correct answer and a clear, concise explanation.",
#            FeedbackType.SOCRATIC: "Provide the correct answer, and ask a short Socratic question to prompt deeper thinking about why it's correct."
#        }[feedback_choice]
#        scaffold_instr = "Include optional hints for challenging questions." if scaffolding_choice == ScaffoldingLevel.HINTS else ""
#
#        prompt += f"""
#**Quiz/Assessment Requirements:**
#*   Generate {num_questions} questions for "{specific_topic}".
#*   Target difficulty should be **{difficulty_desc}** relative to the student's mastery ({mastery_desc}).
#*   Include a mix of question types (e.g., Multiple Choice, Short Answer).
#*   {scaffold_instr}
#*   For each question, provide the answer details following this feedback style: **{feedback_instr}**
#
#**Format:**
#**1. [Question Text]**
#   (A) [Option A] ... (if applicable)
#   **Answer Details:** [Based on feedback style: Answer, optional Hint/Explanation/Socratic Question]
#---
#(Repeat for other questions)"""
#    elif content_type == "flashcard":
#        num_flashcards = 3 if length_choice == ContentLength.CONCISE else 5
#        prompt += f"""
#**Flashcard Requirements:**
#*   Generate {num_flashcards} flashcards for key concepts/terms in "{specific_topic}" suitable for {mastery_desc}.
#*   Front should be a question or term, Back should be a concise answer/definition. Keep it **{length_desc}**.
#
#**Format:**
#**Flashcard 1:**
#**Front:** [Term or Question]
#**Back:** [Concise Answer/Definition]
#---
#(Repeat {num_flashcards} times)"""
#    elif content_type == "cheatsheet":
#        prompt += f"""
#**Cheatsheet Requirements:**
#*   Create a concise summary sheet ({length_desc}) for "{specific_topic}".
#*   Include key definitions, formulas, steps, or important facts.
#*   Use headings, bullet points, and bold text for easy scanning. Focus on quick reference suitable for {mastery_desc}."""
#    elif content_type == "explanation":
#        prompt += f"""
#**Explanation Requirements:**
#*   Provide a clear explanation of "{request_details.subtopic or specific_topic}".
#*   Use the **{strategy_name_cap}** approach. {scaffolding_desc}
#*   Target difficulty: **{difficulty_desc}**. Keep it **{length_desc}**.
#*   Address potential confusion points based on the student context ({mastery_desc})."""
#    elif content_type == "feedback":
#         feedback_instr = {
#            FeedbackType.CORRECTIVE: "Confirm if the input is correct or incorrect. If incorrect, state the correct answer briefly.",
#            FeedbackType.HINT: "Acknowledge the input. If incorrect, provide a hint towards the correct solution/concept.",
#            FeedbackType.ELABORATED: "Acknowledge the input. Explain why it's correct or incorrect, referencing the key concepts of '{specific_topic}'.",
#            FeedbackType.SOCRATIC: "Acknowledge the input. Ask a guiding question related to '{specific_topic}' to help the student reflect on their answer (correct or incorrect)."
#        }[feedback_choice]
#         prompt += f"""
#**Feedback Requirements:**
#*   Student Context: Grade {grade}, Topic '{specific_topic}', Mastery {mastery_desc}.
#*   Student Input Provided: `{request_details.user_input or "[No input provided]"}`
#*   Task: Provide constructive feedback on the student's input using this style: **{feedback_instr}**
#*   Keep the feedback supportive and **{length_desc}**."""
#    else:
#        # Fallback for unknown content types
#        prompt += f"\nGenerate general educational content about '{specific_topic}' using the **{strategy_name_cap}** approach, tailored for the student's context (Grade {grade}, Mastery {mastery_desc}, Difficulty {difficulty_desc}, Length {length_desc}). {scaffolding_desc}"
#
#    prompt += "\n\nGenerate the content now:"
#    return prompt
def generate_prompt_template(
    content_type: str,
    strategy: 'TeachingStrategies',
    topic_full_name: str,
    effective_difficulty: float,
    mastery: float,
    grade: int,
    learning_style_prefs: Dict[str, float],
    request_details: 'ContentRequest',
    difficulty_choice: 'DifficultyLevel',
    scaffolding_choice: 'ScaffoldingLevel',
    feedback_choice: 'FeedbackType',
    length_choice: 'ContentLength'
) -> str:
    """
    Generates a detailed prompt for the LLM designed to elicit a structured
    JSON output suitable for an ITS frontend.
    """

    # --- Prepare context variables ---
    parts = topic_full_name.split('-', 2)
    subject = parts[0] if len(parts) > 0 else "General"
    subsubject_or_topic = parts[1] if len(parts) > 1 else topic_full_name
    specific_topic = parts[2] if len(parts) > 2 else subsubject_or_topic
    specific_topic = specific_topic.replace('-', ' ').title() # Title case for display

    primary_style = "balanced"
    if learning_style_prefs:
        # Ensure keys are lowercase for consistent matching if needed, though max works fine
        primary_style_name = max(learning_style_prefs.items(), key=lambda item: item[1])[0]
        primary_style = primary_style_name.capitalize()

    mastery_desc = "new to this topic or struggling" if mastery < 0.3 else "developing understanding" if mastery < 0.7 else "quite familiar"
    difficulty_desc = difficulty_choice.name.lower()
    scaffolding_desc = {
        ScaffoldingLevel.NONE: "Provide standard content without extra hints or detailed steps unless part of the core explanation.",
        ScaffoldingLevel.HINTS: "Include subtle hints or guiding questions where appropriate (e.g., within practice questions or explanations).",
        ScaffoldingLevel.GUIDANCE: "Provide explicit step-by-step guidance, worked examples, or detailed breakdowns prominently."
    }[scaffolding_choice]
    length_desc = length_choice.name.lower()
    # Replace underscores in strategy names for better readability if needed
    strategy_name_cap = strategy.name.replace('_', ' ').capitalize()
    content_type_cap = content_type.capitalize()

    # Safely get feedback choice name, default if somehow invalid
    feedback_choice_name = getattr(feedback_choice, 'name', 'UNKNOWN').upper()

    # --- Determine Content-Type Specific Instructions ---
    content_specific_instructions = ""

    # Local helper to avoid repetition in feedback instruction generation
    def get_feedback_instruction(fb_choice_name: str) -> str:
        examples = {
            "CORRECTIVE": "Correct Answer: [Answer]",
            "HINT": "Correct Answer: [Answer]\\nHint: [Hint text]",
            "ELABORATED": "Correct Answer: [Answer]\\nExplanation: [Explanation text]",
            "SOCRATIC": "Correct Answer: [Answer]\\nGuiding Question: [Socratic question text]"
        }
        return examples.get(fb_choice_name, "Correct Answer: [Answer]") # Default to corrective

    if content_type == "lesson":
        feedback_detail_instruction = get_feedback_instruction(feedback_choice_name)
        content_specific_instructions = f"""
**If `contentType` is "lesson":**
*   Use these `sectionType` values in order: `lesson_introduction`, `lesson_core_concept`, `lesson_example`, `lesson_check_in`, `lesson_summary`.
*   `lesson_introduction`: State topic & 1-2 learning objectives ({length_desc}) in `contentMarkdown`. Set `title` to "Introduction".
*   `lesson_core_concept`: Explain key ideas using {strategy_name_cap} approach in `contentMarkdown`. Apply {scaffolding_choice.name} scaffolding. Adapt for {primary_style} learners. Keep content {length_desc}. Set `title` to "Core Concepts".
*   `lesson_example`: Provide 1-2 clear, {difficulty_desc} examples or illustrations in `contentMarkdown`. Apply {scaffolding_desc}. Set `title` to "Examples".
*   `lesson_check_in`: This section object MUST include fields: `questionText` (String) containing **ONLY** the question text itself and `answerDetail` (String) containing **ONLY** the answer and/or explanation, formatted like "{feedback_detail_instruction}". `contentMarkdown` can add context. Set `title` to "Check Your Understanding".
*   `lesson_summary`: Briefly recap main points ({length_desc}) in `contentMarkdown`. Set `title` to "Summary"."""

    elif content_type == "quiz" or content_type == "assessment":
        # Assume ContentLength Enum has values like CONCISE=0, STANDARD=1, DETAILED=2
        num_questions = 3 if length_choice == ContentLength.CONCISE else 5 if length_choice == ContentLength.STANDARD else 7
        feedback_detail_instruction = get_feedback_instruction(feedback_choice_name)
        scaffold_instr = f"Apply {scaffolding_choice.name} hints within `questionText` if specified." if scaffolding_choice == ScaffoldingLevel.HINTS else ""

        content_specific_instructions = f"""
**If `contentType` is "quiz" or "assessment":**
*   Generate exactly {num_questions} section objects.
*   Each section MUST have `sectionType`: `quiz_question`.
*   Each section object MUST include these fields:
    *   `questionNumber`: (Integer) e.g., 1, 2, ...
    *   `questionText`: (String) The text of the question. Include MC options like (A)... (B)... within this string if applicable.
    *   `answerDetail`: (String) The answer details formatted EXACTLY like this example for the {feedback_choice_name} style: "{feedback_detail_instruction}"
*   Target question difficulty should be {difficulty_desc}.
*   {scaffold_instr}
*   The `contentMarkdown` field can be empty or duplicate `questionText`. The `title` field should be "Question {{questionNumber}}".
"""

    elif content_type == "flashcard":
        num_flashcards = 3 if length_choice == ContentLength.CONCISE else 5
        content_specific_instructions = f"""
**If `contentType` is "flashcard":**
*   Generate exactly {num_flashcards} pairs of section objects (total {num_flashcards*2} sections).
*   For each flashcard (N = 1 to {num_flashcards}):
    *   Create one section object with `sectionType`: `flashcard_front`, `title`: "Flashcard {{N}} - Front". `contentMarkdown` contains the term or question ({length_desc}).
    *   Create one section object with `sectionType`: `flashcard_back`, `title`: "Flashcard {{N}} - Back". `contentMarkdown` contains the concise answer/definition ({length_desc}).
*   Ensure content is suitable for {mastery_desc} mastery level."""

    elif content_type == "cheatsheet":
        content_specific_instructions = f"""
**If `contentType` is "cheatsheet":**
*   Use `sectionType` values like `cheatsheet_introduction`, `cheatsheet_key_definitions`, `cheatsheet_formulas`, `cheatsheet_key_steps`, etc., as appropriate for the topic "{specific_topic}". Choose relevant types.
*   Provide a relevant `title` for each section (e.g., "Key Definitions", "Important Formulas").
*   Use `contentMarkdown` for bullet points, bold text, etc., focusing on quick reference ({length_desc}). You can use Markdown subheadings (`### Subheading`) within `contentMarkdown` for further structure."""

    elif content_type == "explanation":
        explanation_target = (request_details.subtopic or specific_topic).replace('-', ' ').title()

        content_specific_instructions = f"""
**If `contentType` is "explanation":**
*   Use these `sectionType` values in order: `explanation_main`, `explanation_key_points`, `explanation_example` (only include example section if relevant and helpful).
*   Set the main `topic` field in the root JSON object to "{explanation_target}".
*   `explanation_main`: Provide the core explanation of "{explanation_target}" in `contentMarkdown`. Use {strategy_name_cap} approach. Target {difficulty_desc} difficulty. Keep it {length_desc}. Apply {scaffolding_choice.name} scaffolding ({scaffolding_desc}). Address potential confusion points based on {mastery_desc} mastery. Set `title` to "Explanation".
*   `explanation_key_points`: Summarize 2-3 crucial takeaways in bullet points within `contentMarkdown`. Set `title` to "Key Points".
*   `explanation_example`: If included, provide one clear, illustrative example in `contentMarkdown`. Set `title` to "Example"."""

    elif content_type == "feedback":
        user_input_context = request_details.user_input or "[No input provided, assume general feedback request]"
        # Basic sanitization (escape backticks and potentially other Markdown characters)
        user_input_context = user_input_context.replace('`', '\\`').replace('{', '\\{').replace('}', '\\}')

        feedback_style_instruction = {
            "CORRECTIVE": "Confirm if the input is correct or incorrect. If incorrect, state the correct answer briefly.",
            "HINT": "Acknowledge the input. If incorrect, provide a hint towards the correct solution/concept without giving the full answer.",
            "ELABORATED": "Acknowledge the input. Explain clearly why it's correct or incorrect, referencing the key concepts of '{specific_topic}'.", # specific_topic will be replaced later
            "SOCRATIC": "Acknowledge the input. Ask a short, specific guiding question related to '{specific_topic}' to help the student reflect on their answer (correct or incorrect) and discover the reasoning themselves."
        }.get(feedback_choice_name, "Provide general constructive feedback.")
        # Substitute the topic name into the instruction if needed
        feedback_style_instruction = feedback_style_instruction.format(specific_topic=specific_topic)

        content_specific_instructions = f"""
**If `contentType` is "feedback":**
*   Use a single section object with `sectionType`: `feedback_content`.
*   Set the `title` to "Feedback".
*   The `contentMarkdown` MUST contain the feedback text itself.
*   Base the feedback on the following student input: `{user_input_context}`
*   The feedback MUST follow the {feedback_choice_name} style: "{feedback_style_instruction}"
*   Keep the feedback supportive, encouraging, and {length_desc}."""

    else: # Fallback for unknown types
         content_specific_instructions = f"""
**If `contentType` is "{content_type}" (General):**
*   Use a single section object with `sectionType`: `general_content`.
*   Set the `title` to "{content_type_cap}: {specific_topic}".
*   Generate relevant educational content about "{specific_topic}" in `contentMarkdown`.
*   Follow the overall Instructional Plan (Strategy: {strategy_name_cap}, Difficulty: {difficulty_desc}, Length: {length_desc}, Scaffolding: {scaffolding_choice.name}).
*   Use Markdown subheadings (`### Subheading`) within `contentMarkdown` for structure if helpful."""

    # --- Construct the Final Prompt ---
    prompt = f"""You are an expert {grade}th grade NCERT curriculum tutor. Generate educational content that is STRICTLY focused on the topic without any extraneous material.

**OUTPUT REQUIREMENT: Return ONLY a valid JSON object - no introductions, explanations, or additional text.**

**JSON STRUCTURE:**
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
    {{
      "sectionType": "example_section_type",
      "title": "Example Section Title",
      "contentMarkdown": "Example content in markdown format"
      // Additional fields as needed per content type
    }}
  ]
}}

**IMPORTANT RULES:**
1. Your entire response must be ONLY the JSON object - nothing else
2. Do NOT include phrases like "as a tutor", "future work", "note to teacher", etc.
3. Focus EXCLUSIVELY on {specific_topic} - avoid unrelated topics
4. Do NOT include introductory or concluding meta-commentary
5. Start your response with {{ and end with }}
6. All content must be appropriate for grade {grade}

**STUDENT CONTEXT:**
- Grade: {grade}
- Topic: {specific_topic} (Subject: {subject})
- Mastery Level: {mastery_desc} ({mastery:.2f}/1.0)
- Learning Style: {primary_style}
- Content Requested: {content_type_cap}

**INSTRUCTIONAL PLAN:**
- Teaching Strategy: {strategy_name_cap}
- Difficulty Level: {difficulty_desc} (Score: {effective_difficulty:.2f})
- Content Length: {length_desc}
- Scaffolding Level: {scaffolding_choice.name} ({scaffolding_desc})
- Feedback Style: {feedback_choice_name}

**SPECIFIC CONTENT REQUIREMENTS:**
{content_specific_instructions}

Remember: Generate ONLY the JSON object with educational content strictly related to {specific_topic}. No additional text.
"""

    return prompt

async def stream_llm_response(prompt: str, model_id: str, config: Optional[GenerationConfig]):
    """Streams the response from the Ollama LLM."""
    if ollama_client is None:
        logger.error("Ollama client not available.")
        yield json.dumps({"error": "LLM service unavailable"}) + "\n"
        return

    try:
        options = {}
        if config:
            # Use model_dump for Pydantic v2, exclude None values
            options = config.model_dump(exclude_none=True, by_alias=True) # by_alias uses 'num_predict'

        logger.info(f"Streaming from Ollama model '{model_id}'. Options: {options}. Prompt length: {len(prompt)}")
        stream = await ollama_client.chat(
            model=model_id,
            messages=[{'role': 'user', 'content': prompt}],
            stream=True,
            options=options
        )
        async for chunk in stream:
            if 'message' in chunk and 'content' in chunk['message']:
                yield chunk['message']['content']
            elif chunk.get('done') and chunk.get('error'):
                error_message = chunk.get('error', 'Unknown Ollama error')
                logger.error(f"Ollama streaming error: {error_message}")
                yield f"\n[Ollama Error: {error_message}]\n"
                break
            elif chunk.get('done'):
                logger.info("Ollama stream finished successfully.")
                break # Explicitly break on done=True if no error

    except asyncio.TimeoutError:
        logger.error("Ollama request timed out.")
        yield "\n[Error: LLM request timed out.]\n"
    except Exception as e:
        logger.error(f"Error during Ollama streaming: {e}", exc_info=True)
        yield f"\n[Error: An unexpected error occurred during content generation.]\n"


# --- API Lifecycle Events ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global rl_system, ollama_client, mongo_client, learning_db
    logger.info("API server starting up...")

    # Initialize RL System
    if SB3_AVAILABLE:
        logger.info("Initializing RL System...")
        # Ensure parameters match how the env was trained if loading a model
        rl_system = NCERTLearningSystem(log_dir=os.path.dirname(RL_MODEL_PATH)) # Provide log_dir if needed by system
        rl_system.load_model(RL_MODEL_PATH)
        if rl_system.model is None:
            logger.error(f"RL Model failed to load from {RL_MODEL_PATH}. RL recommendations disabled.")
        else:
             logger.info(f"RL Model loaded successfully from {RL_MODEL_PATH}")
             # Verify observation space compatibility if possible
             if rl_system.vec_env and hasattr(rl_system.vec_env, 'observation_space'):
                 logger.info(f"RL Env Observation Space: {rl_system.vec_env.observation_space}")
             else:
                  logger.warning("Could not access RL Env observation space for verification.")

    else:
        logger.warning("Stable-Baselines3 not found. RL features disabled.")

    # Initialize Ollama Client
    logger.info(f"Connecting to Ollama at {OLLAMA_HOST}...")
    try:
        ollama_client = ollama.AsyncClient(host=OLLAMA_HOST)
        await ollama_client.list() # Test connection
        logger.info(f"Ollama client connected successfully.")
    except Exception as e:
        logger.error(f"Failed to connect to Ollama: {e}", exc_info=True)
        ollama_client = None

    # Initialize MongoDB Client
    logger.info(f"Connecting to MongoDB at {MONGO_URL}...")
    try:
        mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000) # Add timeout
        # The ismaster command is cheap and does not require auth.
        await mongo_client.admin.command('ping')
        learning_db = mongo_client[MONGO_DB_NAME]
        logger.info(f"MongoDB client connected successfully to db '{MONGO_DB_NAME}'.")
        # Consider creating indexes here if needed (e.g., on student_id)
        # await learning_db["learning_states"].create_index("student_id", unique=True)
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}", exc_info=True)
        mongo_client = None
        learning_db = None

    if not INTERNAL_API_SECRET:
         logger.warning("SECURITY WARNING: INTERNAL_API_SECRET is not set. Requests from the proxy API will not be verified.")

    yield

app = FastAPI(lifespan=lifespan)
#@app.on_event("shutdown")
#async def shutdown_event():
#    logger.info("API server shutting down...")
#    if mongo_client:
#        mongo_client.close()
#        logger.info("MongoDB connection closed.")
#    # No explicit close needed for ollama client or RL model


# --- API Endpoints ---

@app.post("/content/next", response_class=StreamingResponse)
async def get_next_content_stream(
    request: ContentRequest,
    user_id: str = Depends(get_user_id_from_proxy),
):
    """
    Endpoint to get the next piece of adaptive content, guided by RL.
    Streams the content generated by the LLM.
    """
    now_utc = datetime.now(timezone.utc)

    # 1. Fetch or Initialize Student State
    session = await get_student_session_mongo(user_id)
    if session is None:
        logger.info(f"No session found for user {user_id}. Creating default.")
        # Ideally, fetch grade/profile info from user DB via API call to Next.js backend
        default_profile = StudentProfile(student_id=user_id, grade=6) # Using default grade 6
        session = StudentSessionData(
            student_id=user_id,
            profile=default_profile,
            state=StudentState(current_topic_idx_persistent=-1) # Ensure index starts at -1 or num_topics
        )
        # Initial save will happen later via upsert

    session.last_active = now_utc
    student_state = session.state

    # 2. Get RL Action (if RL is available)
    strategy = TeachingStrategies.EXPLANATION # Default strategy
    topic_idx = 0 # Default topic index
    difficulty_choice = DifficultyLevel.NORMAL
    scaffolding_choice = ScaffoldingLevel.NONE
    feedback_choice = FeedbackType.ELABORATED
    length_choice = ContentLength.STANDARD

    unwrapped_env = rl_system.unwrapped_env if rl_system else None

    if rl_system and rl_system.model and unwrapped_env:
        observation = prepare_observation_from_state(student_state, unwrapped_env)
        if observation is not None:
            try:
                action_array, _ = rl_system.model.predict(observation, deterministic=True)
                action = action_array.astype(int) # Convert to integer indices
                # Unpack the full action based on the environment's action space
                strategy_idx, topic_idx, diff_idx, scaff_idx, feed_idx, len_idx = action

                # Convert indices to Enums
                strategy = TeachingStrategies(strategy_idx)
                # topic_idx is used directly
                difficulty_choice = DifficultyLevel(diff_idx)
                scaffolding_choice = ScaffoldingLevel(scaff_idx)
                feedback_choice = FeedbackType(feed_idx)
                length_choice = ContentLength(len_idx)

                logger.info(f"RL Action for User {user_id}: Strategy={strategy.name}, TopicIdx={topic_idx}, Diff={difficulty_choice.name}, Scaff={scaffolding_choice.name}, Feed={feedback_choice.name}, Len={length_choice.name}")

            except Exception as e:
                logger.error(f"RL model prediction failed for user {user_id}: {e}", exc_info=True)
                # Fallback to defaults if prediction fails
        else:
            logger.warning(f"Failed to prepare observation for user {user_id}. Using default actions.")
            # topic_idx = random.randrange(unwrapped_env.num_topics) if unwrapped_env and unwrapped_env.num_topics > 0 else 0 # Random fallback topic
    else:
        logger.warning("RL system unavailable. Using default actions.")
        # topic_idx = random.randrange(unwrapped_env.num_topics) if unwrapped_env and unwrapped_env.num_topics > 0 else 0 # Random fallback topic


    # 3. Determine Final Topic
    final_topic_name = "Default Topic" # Fallback
    final_topic_idx = topic_idx # Start with RL recommendation

    if unwrapped_env and hasattr(unwrapped_env, 'topics') and unwrapped_env.topics:
         # Override with user preference if provided and valid
         if request.topic:
             matched_idx = find_best_topic_match(request.topic, unwrapped_env.topics)
             if matched_idx is not None:
                 final_topic_idx = matched_idx
                 logger.info(f"User topic override '{request.topic}' matched to index {final_topic_idx}.")
             else:
                 logger.warning(f"User topic '{request.topic}' not matched, using RL topic index {topic_idx}.")
         else:
              logger.info(f"No user topic specified, using RL topic index {topic_idx}.")


         # Ensure final index is valid
         final_topic_idx = np.clip(final_topic_idx, 0, unwrapped_env.num_topics - 1)
         final_topic_name = unwrapped_env.topics[final_topic_idx]
    else:
         logger.error("Cannot determine final topic: RL environment topics unavailable.")
         # Handle error, maybe raise HTTPException or use a very generic topic


    # 4. Calculate Effective Difficulty & Prereqs
    mastery = student_state.mastery.get(final_topic_name, 0.0)
    prereq_satisfaction = calculate_prerequisite_satisfaction(final_topic_idx, student_state.mastery, unwrapped_env)

    base_difficulty = unwrapped_env.topic_base_difficulty[final_topic_idx] if unwrapped_env and hasattr(unwrapped_env, 'topic_base_difficulty') and len(unwrapped_env.topic_base_difficulty) > final_topic_idx else 0.5
    difficulty_adjustment = {DifficultyLevel.EASIER: -0.2, DifficultyLevel.NORMAL: 0.0, DifficultyLevel.HARDER: 0.2}[difficulty_choice]
    mastery_difficulty_effect = -0.3 * mastery
    effective_difficulty = np.clip(base_difficulty + difficulty_adjustment + mastery_difficulty_effect, 0.05, 0.95)

    difficulty_level_desc = difficulty_choice.name.capitalize()
    if effective_difficulty < 0.35: difficulty_level_desc += " (Easy)"
    elif effective_difficulty > 0.65: difficulty_level_desc += " (Hard)"
    else: difficulty_level_desc += " (Moderate)"
    if mastery < 0.25: difficulty_level_desc += " - Introductory"
    elif mastery > 0.75: difficulty_level_desc += " - Review"


    # 5. Generate Prompt for LLM
    prompt = generate_prompt_template(
        content_type=request.content_type,
        strategy=strategy,
        topic_full_name=final_topic_name,
        effective_difficulty=effective_difficulty,
        mastery=mastery,
        grade=session.profile.grade,
        learning_style_prefs=session.profile.learning_style_preferences,
        request_details=request,
        difficulty_choice=difficulty_choice,
        scaffolding_choice=scaffolding_choice,
        feedback_choice=feedback_choice,
        length_choice=length_choice
    )

    # 6. Prepare Metadata & Update State History (before saving)
    subject = final_topic_name.split('-')[0] if '-' in final_topic_name else "Unknown"
    metadata = InteractionMetadata(
        strategy=strategy.name,
        topic=final_topic_name,
        difficulty_choice=difficulty_choice.name,
        scaffolding_choice=scaffolding_choice.name,
        feedback_choice=feedback_choice.name,
        length_choice=length_choice.name,
        subject=subject,
        content_type=request.content_type,
        difficulty_level_desc=difficulty_level_desc,
        mastery_at_request=mastery,
        effective_difficulty_value=effective_difficulty,
        prereq_satisfaction=prereq_satisfaction,
    )

    # Update history components of the state *before* saving
    update_student_state_history(
         student_state,
         final_topic_name,
         strategy.name,
         unwrapped_env.topic_to_idx if unwrapped_env else {}, # Pass map for time update
         unwrapped_env # Pass env for index update
    )
    interaction_log = metadata.model_dump();
    interaction_log["timestamp_utc"] = now_utc.isoformat()
    session.learning_path.append(interaction_log)


    # 7. Save State Before Streaming
    await save_student_session_mongo(session)

    # 8. Stream Response
    logger.info(f"Streaming '{request.content_type}' for User {user_id}, Topic '{final_topic_name}', Strategy '{strategy.name}'")
    stream_generator = stream_llm_response(prompt, OLLAMA_MODEL, request.config)

    # Prepare headers for the client (forwarded by proxy)
    headers = {
        f"X-{k.replace('_', '-')}": str(v).encode('utf-8').decode('latin-1')
        for k, v in metadata.model_dump(exclude={'interaction_id'}).items() # Exclude ID here
        if v is not None # Exclude None values
    }
    headers["X-Interaction-Id"] = metadata.interaction_id # Send ID separately

    return StreamingResponse(stream_generator, media_type="text/plain; charset=utf-8", headers=headers)

# Note: Error handling within endpoints is implicitly handled by FastAPI's exception handlers
# for HTTPExceptions raised in helper functions (like DB access or auth). Add more specific
# try/except blocks here if needed for non-HTTPException errors during RL/prompt generation.


@app.post("/feedback/submit", status_code=status.HTTP_202_ACCEPTED)
async def submit_feedback(
    feedback_data: SessionFeedback,
    user_id: str = Depends(get_user_id_from_proxy),
):
    """
    Endpoint to receive feedback on a previous interaction and update student state.
    """
    now_utc = datetime.now(timezone.utc)
    session = await get_student_session_mongo(user_id)

    if session is None:
        # Should not happen if feedback follows content, but handle defensively
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User session not found. Cannot submit feedback.")

    session.last_active = now_utc
    student_state = session.state

    try:
        # Find the interaction log this feedback corresponds to
        interaction_log = None
        interaction_index = -1
        for i, log_entry in enumerate(reversed(session.learning_path)):
            if log_entry.get("interaction_id") == feedback_data.interaction_id:
                interaction_log = log_entry
                interaction_index = len(session.learning_path) - 1 - i
                break

        if interaction_log is None:
             logger.warning(f"Interaction ID {feedback_data.interaction_id} not found in learning path for user {user_id}")
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Interaction '{feedback_data.interaction_id}' not found for this user.")

        # --- Apply Updates Based on Feedback ---
        topic_name = interaction_log.get("topic")
        mastery_before = student_state.mastery.get(topic_name, 0.0) if topic_name else 0.0
        new_mastery = mastery_before
        mastery_gain_from_feedback = 0.0

        # 1. Update Mastery (Prioritize objective score)
        if topic_name:
            base_rate = 0.15 # Base learning rate from feedback event
            max_gain_potential = max(0.05, (1.0 - mastery_before)) # Diminishing returns, min potential

            if feedback_data.assessment_score is not None:
                score_normalized = feedback_data.assessment_score / 100.0
                # Gain depends on score and how much room there is to grow
                mastery_gain_from_feedback = base_rate * 1.5 * score_normalized * max_gain_potential
                # Penalize low scores slightly more
                if score_normalized < 0.5:
                     mastery_gain_from_feedback -= base_rate * 0.3 * (0.5 - score_normalized)
                # Update recent performance state
                student_state.recent_performance = 0.6 * student_state.recent_performance + 0.4 * score_normalized

            elif feedback_data.completion_percentage is not None:
                # Lower gain from just completion
                mastery_gain_from_feedback = base_rate * 0.5 * (feedback_data.completion_percentage / 100.0) * max_gain_potential

            # Modify gain based on subjective ratings (if available)
            rating_modifier = 1.0
            if feedback_data.engagement_rating is not None and feedback_data.helpful_rating is not None:
                avg_rating_norm = ((feedback_data.engagement_rating + feedback_data.helpful_rating) / 10.0) # Avg rating 0-1
                rating_modifier = 0.7 + (0.6 * avg_rating_norm) # Range ~0.7 to 1.3
                mastery_gain_from_feedback *= rating_modifier

            # Apply gain, ensure bounds
            new_mastery = np.clip(mastery_before + mastery_gain_from_feedback, 0.0, 1.0)
            student_state.mastery[topic_name] = new_mastery
            logger.info(f"Feedback Update User {user_id}: Mastery '{topic_name}' {mastery_before:.3f} -> {new_mastery:.3f} (Gain: {mastery_gain_from_feedback:.3f})")
        else:
             logger.warning(f"Feedback received for interaction {feedback_data.interaction_id} but topic name missing in log.")

        # 2. Update Engagement (from rating)
        if feedback_data.engagement_rating is not None:
            rating_norm = feedback_data.engagement_rating / 5.0 # Normalize 0.2 to 1.0
            student_state.engagement = np.clip(0.7 * student_state.engagement + 0.3 * rating_norm, 0.1, 0.95)

        # 3. Update Motivation (loosely based on helpfulness and score)
        motivation_change = 0.0
        if feedback_data.assessment_score is not None:
             if feedback_data.assessment_score > 70: motivation_change += 0.05
             elif feedback_data.assessment_score < 40: motivation_change -= 0.05
        if feedback_data.helpful_rating is not None:
             motivation_change += (feedback_data.helpful_rating - 3) * 0.02 # Adjust based on helpfulness rating relative to average
        student_state.motivation = np.clip(student_state.motivation + motivation_change, 0.1, 0.95)


        # 4. Update Misconceptions (requires more sophisticated analysis or explicit feedback)
        # Example: If score is low and feedback text mentions confusion, increase misconception score?
        # This part is highly heuristic without more structured input.
        # if topic_name and feedback_data.assessment_score is not None and feedback_data.assessment_score < 50:
        #      student_state.misconceptions[topic_name] = np.clip(student_state.misconceptions.get(topic_name, 0.0) + 0.1, 0.0, 0.8)


        # --- Log Feedback Details ---
        feedback_log_details = feedback_data.model_dump()
        feedback_log_details["feedback_received_utc"] = now_utc.isoformat()
        feedback_log_details["mastery_after_feedback"] = new_mastery
        # Merge feedback details into the original interaction log entry
        session.learning_path[interaction_index].update(feedback_log_details)


        # --- Save Updated State ---
        await save_student_session_mongo(session)

        return {"status": "success", "message": "Feedback processed and learning state updated."}

    except HTTPException as he:
        raise he # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error processing feedback for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to process feedback.")


@app.get("/healthcheck")
async def healthcheck():
    """Provides health status of the API and its dependencies."""
    ollama_status = "unavailable"
    mongo_status = "unavailable"
    rl_model_status = "unavailable"

    # Check Ollama
    if ollama_client:
        try:
            await ollama_client.list()
            ollama_status = "ok"
        except Exception:
            logger.warning("Healthcheck: Ollama connection failed.")
            pass

    # Check MongoDB
    if mongo_client is not None and learning_db is not None:
        try:
            await mongo_client.admin.command('ping')
            mongo_status = "ok"
        except Exception:
            logger.warning("Healthcheck: MongoDB connection failed.")
            pass

    # Check RL Model
    if SB3_AVAILABLE and rl_system and rl_system.model:
        rl_model_status = "loaded"
    elif SB3_AVAILABLE:
        rl_model_status = "load_failed_or_missing"
    else:
        rl_model_status = "sb3_unavailable"

    # Get additional RL info if available
    rl_info = {}
    if SB3_AVAILABLE and rl_system and rl_system.unwrapped_env:
        try:
            rl_info = {
                "num_topics": rl_system.unwrapped_env.num_topics,
                "max_steps": rl_system.unwrapped_env.max_steps,
                "model_path": RL_MODEL_PATH,
                "num_strategies": NUM_STRATEGIES
            }
        except Exception:
            logger.warning("Healthcheck: Failed to get detailed RL info.")
            pass

    return {
        "status": "healthy", # API server itself is running
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "dependencies": {
            "ollama_connection": ollama_status,
            "mongodb_connection": mongo_status,
            "rl_model_status": rl_model_status,
        },
        "rl_info": rl_info
    }

# --- Main Execution (for local development) ---
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server for Adaptive Content API...")
    uvicorn.run(
        "adaptive_content_routes:app",
        host="0.0.0.0",
        port=8000,
        reload=True, # Enable auto-reload for development
        log_level=log_level.lower() # Use log level from config
    )