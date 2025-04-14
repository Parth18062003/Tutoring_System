import os
import json
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from typing import List, Dict, Optional, Any
from enum import Enum
import numpy as np
import matplotlib.pyplot as plt
import re
import copy
from contextlib import asynccontextmanager
import time
from fastapi import FastAPI, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from pydantic import BaseModel, Field, ConfigDict
from dotenv import load_dotenv
import ollama
import motor.motor_asyncio
from neo4j import GraphDatabase, exceptions as neo4j_exceptions
from langchain_mistralai.embeddings import MistralAIEmbeddings
from langchain_core.embeddings import Embeddings as LangChainEmbeddings
from together_ai import TogetherAIClient
from config import load_config
from difflib import SequenceMatcher
import base64
from collections import defaultdict
import io
from prompt_manager import PromptManager
from response_validator import ResponseValidator
from asyncio import Lock
from functools import lru_cache

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
embedding_lock = Lock()
embedding_cache = {}
API_VERSION = "0.7.1"
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
RL_MODEL_PATH = os.environ.get("RL_MODEL_PATH")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "mistral:latest")
MONGO_URL = os.environ.get("MONGO_URL")
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME")
NEO4J_URI = os.environ.get("NEO4J_URI")
NEO4J_USERNAME = os.environ.get("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD")
NEO4J_DATABASE = os.environ.get("NEO4J_DATABASE", "neo4j")
INTERNAL_API_SECRET = os.environ.get("INTERNAL_API_SECRET")
MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY")
EMBEDDING_MODEL_NAME = os.environ.get("EMBEDDING_MODEL_NAME")
TOGETHER_API_KEY = os.environ.get("TOGETHER_API_KEY")
TOGETHER_MODEL = os.environ.get(
    "TOGETHER_MODEL", "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free")
logger = logging.getLogger("assessment_engine")
logger = logging.getLogger("learning_analytics")
together_client: Optional[TogetherAIClient] = None

try:
    EMBEDDING_DIMENSION = int(os.environ.get("EMBEDDING_DIMENSION"))
except (TypeError, ValueError):
    EMBEDDING_DIMENSION = None
    logging.warning("EMBEDDING_DIMENSION not set or invalid in .env")

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
embedding_client: Optional[LangChainEmbeddings] = None


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
    previous_mastery: Dict[str, float] = Field(default_factory=dict)
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
    knowledge_gaps: Dict[str, float] = Field(default_factory=dict,
                                             description="Identified knowledge gaps by topic")

    error_patterns: Dict[str, List[str]] = Field(default_factory=dict,
                                                 description="Common mistake patterns for targeted remediation")

    learning_trajectory: List[Dict[str, float]] = Field(default_factory=list,
                                                        description="Historical mastery data for trend analysis")

    affective_state: Dict[str, float] = Field(default_factory=lambda: {
        "frustration": 0.1,
        "confusion": 0.2,
        "flow": 0.6,
        "boredom": 0.1
    }, description="Emotional state estimation")

    def update_trajectory(self):
        """Add current mastery snapshot to trajectory"""
        snapshot = {
            "timestamp": datetime.now(timezone.utc).timestamp(),
            **self.mastery
        }
        self.learning_trajectory.append(snapshot)
        if len(self.learning_trajectory) > 30:
            self.learning_trajectory = self.learning_trajectory[-30:]

    def detect_stagnation(self, topic: str, threshold: int = 3) -> bool:
        """Detect if student is stuck on a topic despite multiple attempts"""
        if topic not in self.topic_attempts or self.topic_attempts[topic] < threshold:
            return False

        if self.mastery.get(topic, 0) < 0.4 and self.topic_attempts[topic] >= threshold:
            return True
        return False


class GenerationConfig(BaseModel):
    model_config = ConfigDict(extra='allow', populate_by_name=True)
    max_length: Optional[int] = Field(None, alias="num_predict")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    top_p: Optional[float] = Field(None, ge=0.0, le=1.0)
    top_k: Optional[int] = Field(None, ge=1)


class ContentRequest(BaseModel):
    content_type: str
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


class ExerciseGenerator:
    """Dynamically generates exercises at appropriate difficulty levels"""

    def __init__(self, llm_client, kg_client=None):
        self.llm = llm_client
        self.kg = kg_client
        self.cache = {}

    async def generate_exercise(self, topic: str, difficulty: float,
                                misconceptions: List[str] = None) -> Dict:
        """Generate an exercise targeting specific difficulty and misconceptions"""
        cache_key = f"{topic}_{difficulty}_{','.join(misconceptions or [])}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        kg_context = ""
        if self.kg:
            kg_context = await self.kg.get_topic_context(topic)

        prompt = self._create_exercise_prompt(
            topic, difficulty, misconceptions, kg_context)

        response = await self.llm.complete(prompt)
        exercise = self._parse_exercise_response(response)

        self.cache[cache_key] = exercise
        return exercise

    def _create_exercise_prompt(self, topic: str, difficulty: float, misconceptions: List[str] = None, kg_context: str = ""):
        """Create specialized prompt for exercise generation."""

        difficulty_desc = "basic"
        if difficulty > 0.75:
            difficulty_desc = "challenging"
        elif difficulty > 0.4:
            difficulty_desc = "intermediate"

        misconception_guidance = ""
        if misconceptions and len(misconceptions) > 0:
            misconception_list = "\n".join([f"- {m}" for m in misconceptions])
            misconception_guidance = f"""
    The student has shown the following misconceptions that should be addressed:
    {misconception_list}

    Design your exercise to specifically target and correct these misconceptions.
    """

        kg_section = ""
        if kg_context:
            kg_section = f"""
    --- START CONTEXT FROM KNOWLEDGE GRAPH ---
    {kg_context}
    --- END CONTEXT FROM KNOWLEDGE GRAPH ---

    Base your exercise on the factual information provided above to ensure NCERT curriculum alignment.
    """

        # Create the prompt
        prompt = f"""Create a {difficulty_desc} level educational exercise about "{topic}" for a middle school student.
    {kg_section}
    {misconception_guidance}

    Generate your response as a valid JSON object with the following structure:

    ```json
    {{
      "exercise_type": "multiple_choice|short_answer|fill_in_blank|true_false",
      "question": "The full question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],  // Include for multiple_choice only
      "correct_answer": "The correct answer or option letter for multiple choice",
      "explanation": "Detailed explanation of why this is correct",
      "hint": "A hint to help if the student is stuck",
      "misconception_addressed": "Specific misconception this exercise addresses",
      "difficulty_level": "{difficulty_desc}",
      "topic": "{topic}"
    }}


    Ensure your exercise:

    - Is appropriate for the {difficulty_desc} difficulty level  
    - Is factually correct and aligned with NCERT curriculum standards  
    - Has clear, unambiguous wording  
    - For multiple choice, includes plausible distractors that target common misconceptions  
    - Provides a helpful explanation that clarifies concepts

    Respond ONLY with the JSON object. No additional text.
    """

        return prompt

    def _parse_exercise_response(self, response: str) -> Dict:
        """Parse LLM response into structured exercise."""
        try:
            json_content = response

            if "```json" in response:
                parts = response.split("```json")
                if len(parts) > 1:
                    json_content = parts[1].split("```")[0].strip()

            elif "```" in response:
                parts = response.split("```")
                if len(parts) > 1:
                    json_content = parts[1].strip()

            exercise_data = json.loads(json_content)

            required_fields = ["question", "correct_answer", "explanation"]
            for field in required_fields:
                if field not in exercise_data:
                    exercise_data[field] = f"Missing {field}"

            if "hint" not in exercise_data:
                exercise_data["hint"] = "Think about the key concepts we've covered."

            if "exercise_type" not in exercise_data:
                # Try to detect the type
                if "options" in exercise_data and isinstance(exercise_data["options"], list):
                    exercise_data["exercise_type"] = "multiple_choice"
                else:
                    exercise_data["exercise_type"] = "short_answer"

            if "options" not in exercise_data and exercise_data["exercise_type"] == "multiple_choice":
                exercise_data["options"] = ["Option A",
                                            "Option B", "Option C", "Option D"]

            exercise_data["timestamp"] = datetime.now(timezone.utc).isoformat()
            exercise_data["source"] = "ai_generated"

            return exercise_data

        except json.JSONDecodeError as e:
            return {
                "exercise_type": "short_answer",
                "question": "Exercise generation failed. Please try again.",
                "correct_answer": "N/A",
                "explanation": "There was an error processing the exercise.",
                "error": str(e),
                "raw_response": response[:200] + ("..." if len(response) > 200 else ""),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source": "fallback"
            }
        except Exception as e:
            return {
                "exercise_type": "error",
                "question": "An unexpected error occurred.",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source": "error"
            }


class MetacognitiveSupport:
    """Provides metacognitive scaffolding to help students learn how to learn"""

    def __init__(self, config):
        self.strategies = {
            "planning": self._generate_planning_prompts,
            "monitoring": self._generate_monitoring_prompts,
            "evaluation": self._generate_evaluation_prompts,
            "reflection": self._generate_reflection_prompts
        }
        self.config = config

    async def generate_metacognitive_prompt(self, strategy: str,
                                            student_state: StudentState,
                                            topic: str):
        """Generate metacognitive scaffolding based on learning strategy"""
        if strategy not in self.strategies:
            return None

        return await self.strategies[strategy](student_state, topic)

    async def _generate_planning_prompts(self, student_state, topic):
        """Help students plan their approach to learning a topic"""
        mastery = student_state.mastery.get(topic, 0.0)

        if mastery < 0.3:
            return {
                "title": "Planning Your Learning",
                "content": f"Before diving into {topic}, let's make a plan. What specific parts of {topic} do you want to understand first?"
            }
        elif mastery < 0.7:
            return {
                "title": "Expanding Your Knowledge",
                "content": f"You have some understanding of {topic}. What connections can you make to other topics you've studied?"
            }
        else:
            return {
                "title": "Mastery Planning",
                "content": f"You're becoming proficient with {topic}. How might you apply this knowledge to solve more complex problems?"
            }

    async def _generate_monitoring_prompts(self, student_state, topic):
        """Help students monitor their understanding during learning"""
        mastery = student_state.mastery.get(topic, 0.0)

        if mastery < 0.3:
            return {
                "title": "Check Your Understanding",
                "content": f"As you learn about {topic}, pause and ask yourself: What parts are still unclear to me? What questions do I have?"
            }
        elif mastery < 0.7:
            return {
                "title": "Monitor Your Progress",
                "content": f"You're making progress with {topic}. Can you explain the main concepts in your own words? What areas need more attention?"
            }
        else:
            return {
                "title": "Deepen Your Understanding",
                "content": f"You have a good grasp of {topic}. Challenge yourself: Are there any edge cases or exceptions that test the limits of your understanding?"
            }

    async def _generate_evaluation_prompts(self, student_state, topic):
        """Help students evaluate their learning against goals"""
        mastery = student_state.mastery.get(topic, 0.0)

        if mastery < 0.3:
            return {
                "title": "Learning Goals Check-in",
                "content": f"What were your original goals when starting to learn about {topic}? What progress have you made toward them?"
            }
        elif mastery < 0.7:
            return {
                "title": "Self-Assessment",
                "content": f"On a scale of 1-5, how would you rate your understanding of {topic}? What evidence supports your rating?"
            }
        else:
            return {
                "title": "Mastery Evaluation",
                "content": f"You've developed strong knowledge of {topic}. How might you demonstrate your expertise? What can you create or teach to others?"
            }

    async def _generate_reflection_prompts(self, student_state, topic):
        """Encourage students to reflect on their learning process"""
        mastery = student_state.mastery.get(topic, 0.0)

        if mastery < 0.3:
            return {
                "title": "Initial Reflections",
                "content": f"What approaches have you tried so far in learning about {topic}? Which seem to be working best for you?"
            }
        elif mastery < 0.7:
            return {
                "title": "Learning Process Reflection",
                "content": f"Think about how you've been studying {topic}. What strategies have been most effective? What might you change going forward?"
            }
        else:
            return {
                "title": "Growth Reflection",
                "content": f"Looking back on your journey learning {topic}, what were the key insights that helped your understanding? How has your approach to learning evolved?"
            }


class ContentSelector:
    """Selects optimal content presentation based on learning styles and context"""

    def __init__(self, config):
        self.config = config
        self.modality_formats = {
            "visual": ["diagram", "infographic", "video", "chart"],
            "auditory": ["audio", "discussion", "dialogue"],
            "reading": ["text", "article", "summary"],
            "kinesthetic": ["interactive", "simulation", "exercise"]
        }

    def select_content_modalities(self,
                                  learning_style_prefs: Dict[str, float],
                                  topic_characteristics: Dict[str, bool],
                                  device_capabilities: Dict[str, bool]) -> List[str]:
        """Select best content modalities based on student preferences and context"""
        available_modalities = []

        for style, score in learning_style_prefs.items():
            if score > 0.3 and style in self.modality_formats:
                available_modalities.extend(self.modality_formats[style])

        if topic_characteristics.get("requires_visualization", False):
            available_modalities = [m for m in available_modalities
                                    if m in ["diagram", "infographic", "chart", "video", "simulation"]] or available_modalities

        if not device_capabilities.get("audio", True):
            available_modalities = [
                m for m in available_modalities if m not in ["audio", "video"]]

        if not available_modalities:
            available_modalities = ["text"]

        return list(set(available_modalities))[:3]


class SpacedRepetitionScheduler:
    """Implements spaced repetition to optimize long-term retention"""

    def __init__(self):
        self.forgetting_curve_half_life = 1.0

    def calculate_review_interval(self,
                                  mastery: float,
                                  previous_interval: float,
                                  performance_rating: float) -> float:
        """Calculate next review interval based on spaced repetition principles"""
        if performance_rating < 0.6:
            new_interval = 1.0
        else:
            ease_factor = 1.3 + (performance_rating - 0.6) * 0.8

            mastery_modifier = 0.5 + mastery * 1.0

            if previous_interval < 1:
                new_interval = 1.0
            elif previous_interval < 2:
                new_interval = 3.0 * mastery_modifier
            else:
                new_interval = previous_interval * ease_factor * mastery_modifier

            new_interval = min(new_interval, 60.0)

        return new_interval

    def get_review_schedule(self, student_state: StudentState) -> Dict[str, datetime]:
        """Generate review schedule for all topics"""
        now = datetime.now(timezone.utc)
        schedule = {}

        for topic, mastery in student_state.mastery.items():
            last_practiced = student_state.time_since_last_practiced.get(
                topic, 100)

            last_practiced_days = last_practiced / 10.0

            if topic not in student_state.time_since_last_practiced:
                schedule[topic] = now
                continue

            performance = student_state.recent_performance

            interval = self.calculate_review_interval(
                mastery, last_practiced_days, performance)

            next_review = now + \
                timedelta(days=max(0, interval - last_practiced_days))
            schedule[topic] = next_review

        return schedule


class AssessmentResult(BaseModel):
    """Structured result of an assessment evaluation"""
    score: float = Field(..., description="Score from 0-100", ge=0, le=100)
    correct: bool = Field(
        False, description="Whether the answer is fully correct")
    partial_credit: Optional[float] = Field(
        None, description="Partial credit if applicable", ge=0, le=1.0)
    misconceptions: List[str] = Field(
        default_factory=list, description="Identified misconceptions")
    knowledge_gaps: List[str] = Field(
        default_factory=list, description="Identified knowledge gaps")
    reasoning_patterns: List[str] = Field(
        default_factory=list, description="Identified reasoning patterns")
    feedback: str = Field(..., description="Detailed feedback for the student")
    improvement_suggestions: List[str] = Field(
        default_factory=list, description="Specific improvement suggestions")
    key_concepts_understood: List[str] = Field(
        default_factory=list, description="Key concepts the student understands")
    key_concepts_missed: List[str] = Field(
        default_factory=list, description="Key concepts the student missed")
    response_analysis: Dict[str, Any] = Field(
        default_factory=dict, description="Detailed analysis metadata")


class AssessmentEngine:
    """Evaluates student responses and provides detailed pedagogical feedback"""

    def __init__(self, llm_client, embedding_client=None):
        """Initialize assessment engine with required clients"""
        self.llm = llm_client
        self.embedding_client = embedding_client
        self.evaluation_cache = {}

    async def evaluate_response(self,
                                question: str,
                                student_response: str,
                                correct_answer: str,
                                question_type: str,
                                topic: str,
                                subject: str,
                                grade: int = 6) -> AssessmentResult:
        """
        Evaluate a student's response to a question.

        Args:
            question: The question text
            student_response: Student's submitted answer
            correct_answer: The expected correct answer
            question_type: Type of question (multiple_choice, short_answer, etc.)
            topic: The topic being assessed
            subject: The subject area
            grade: Student grade level

        Returns:
            AssessmentResult: Detailed evaluation results
        """
        cache_key = f"{question}:{student_response}:{correct_answer}"
        if cache_key in self.evaluation_cache:
            return self.evaluation_cache[cache_key]

        if question_type == "multiple_choice":
            result = await self._evaluate_multiple_choice(
                question, student_response, correct_answer, topic
            )
        elif question_type == "true_false":
            result = await self._evaluate_true_false(
                question, student_response, correct_answer, topic
            )
        elif question_type == "fill_in_blank":
            result = await self._evaluate_fill_in_blank(
                question, student_response, correct_answer, topic
            )
        else:
            result = await self._evaluate_with_llm(
                question, student_response, correct_answer, topic, subject, grade
            )

        self.evaluation_cache[cache_key] = result
        return result

    async def _evaluate_multiple_choice(self, question, student_response, correct_answer, topic) -> AssessmentResult:
        """Evaluate a multiple-choice response"""
        student_selection = student_response.strip().upper()
        correct_selection = correct_answer.strip().upper()

        if re.match(r'^[A-D]$', student_selection) and re.match(r'^[A-D]$', correct_selection):
            is_correct = student_selection == correct_selection
            score = 100 if is_correct else 0

            feedback = "That's correct!" if is_correct else f"The correct answer is {correct_selection}."
            return AssessmentResult(
                score=score,
                correct=is_correct,
                feedback=feedback,
                misconceptions=[] if is_correct else [
                    f"Incorrect selection in {topic}"],
                key_concepts_understood=[topic] if is_correct else [],
                key_concepts_missed=[topic] if not is_correct else []
            )

        else:
            similarity = SequenceMatcher(
                None, student_response.lower(), correct_answer.lower()).ratio()
            is_correct = similarity > 0.9
            partial = 0.6 < similarity <= 0.9

            score = 100 if is_correct else (60 if partial else 0)
            feedback_text = "That's correct!" if is_correct else (
                "Partially correct. " if partial else "That's not correct. "
            )

            return AssessmentResult(
                score=score,
                correct=is_correct,
                partial_credit=similarity if partial else None,
                feedback=feedback_text +
                (f"The correct answer is: {correct_answer}" if not is_correct else ""),
                misconceptions=[] if is_correct else [
                    f"Incorrect understanding of {topic}"],
                key_concepts_understood=[topic] if is_correct else [],
                key_concepts_missed=[topic] if not is_correct else []
            )

    async def _evaluate_true_false(self, question, student_response, correct_answer, topic) -> AssessmentResult:
        """Evaluate a true/false response"""
        student_resp_norm = student_response.lower().strip()
        correct_norm = correct_answer.lower().strip()

        true_patterns = ['true', 't', 'yes', 'y', '1', 'correct', 'right']
        false_patterns = ['false', 'f', 'no', 'n', '0', 'incorrect', 'wrong']

        student_is_true = any(p in student_resp_norm for p in true_patterns)
        student_is_false = any(p in student_resp_norm for p in false_patterns)

        correct_is_true = any(p in correct_norm for p in true_patterns)
        correct_is_false = any(p in correct_norm for p in false_patterns)

        if not (student_is_true or student_is_false):
            return AssessmentResult(
                score=0,
                correct=False,
                feedback=f"Could not determine if your answer is True or False. The correct answer is {correct_answer}.",
                misconceptions=[],
                key_concepts_understood=[],
                key_concepts_missed=[topic]
            )

        is_correct = (student_is_true and correct_is_true) or (
            student_is_false and correct_is_false)
        score = 100 if is_correct else 0

        feedback = "That's correct!" if is_correct else f"That's incorrect. The answer is {correct_answer}."

        return AssessmentResult(
            score=score,
            correct=is_correct,
            feedback=feedback,
            misconceptions=[] if is_correct else [
                f"Incorrect understanding of {topic}"],
            key_concepts_understood=[topic] if is_correct else [],
            key_concepts_missed=[topic] if not is_correct else []
        )

    async def _evaluate_fill_in_blank(self, question, student_response, correct_answer, topic) -> AssessmentResult:
        """Evaluate a fill-in-the-blank response"""
        student_resp_norm = student_response.lower().strip()
        correct_norm = correct_answer.lower().strip()

        if student_resp_norm == correct_norm:
            return AssessmentResult(
                score=100,
                correct=True,
                feedback="That's correct!",
                misconceptions=[],
                key_concepts_understood=[topic],
                key_concepts_missed=[]
            )

        similarity = SequenceMatcher(
            None, student_resp_norm, correct_norm).ratio()

        if similarity > 0.8:
            return AssessmentResult(
                score=90,
                correct=True,
                partial_credit=similarity,
                feedback="That's correct! (Note: There was a slight misspelling in your answer)",
                misconceptions=[],
                key_concepts_understood=[topic],
                key_concepts_missed=[]
            )

        if similarity > 0.5:
            return AssessmentResult(
                score=60,
                correct=False,
                partial_credit=similarity,
                feedback=f"Partially correct. The correct answer is: {correct_answer}",
                misconceptions=[f"Partial understanding of {topic}"],
                key_concepts_understood=[],
                key_concepts_missed=[topic]
            )

        return AssessmentResult(
            score=0,
            correct=False,
            feedback=f"That's not correct. The answer is: {correct_answer}",
            misconceptions=[f"Incorrect understanding of {topic}"],
            key_concepts_understood=[],
            key_concepts_missed=[topic]
        )

    async def _evaluate_with_llm(self, question, student_response, correct_answer, topic, subject, grade) -> AssessmentResult:
        """Evaluate a short answer response using an LLM"""
        prompt = f"""As an educational assessment expert, evaluate this student's answer:

Question: {question}
Grade Level: {grade} 
Subject: {subject}
Topic: {topic}
Correct Answer: {correct_answer}
Student Response: {student_response}

Evaluate the answer for:
1. Correctness (score 0-100)
2. Specific misconceptions revealed
3. Knowledge gaps identified
4. Reasoning patterns demonstrated
5. Key concepts understood vs. missed

Return ONLY a valid JSON object matching this schema:
{{
  "score": <0-100>,
  "correct": <boolean>,
  "partial_credit": <float or null>,
  "misconceptions": ["specific misconception 1", "specific misconception 2"],
  "knowledge_gaps": ["specific gap 1", "specific gap 2"],
  "reasoning_patterns": ["pattern description"],
  "feedback": "detailed feedback for student",
  "improvement_suggestions": ["suggestion 1", "suggestion 2"],
  "key_concepts_understood": ["concept 1", "concept 2"],
  "key_concepts_missed": ["concept 3", "concept 4"]
}}

Your assessment must be fair, objective, and grade-appropriate. The "feedback" should be encouraging while identifying specific areas for improvement.
"""

        try:
            response_text = await self.llm.complete(prompt)

            json_match = re.search(r'({.*})', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)

            evaluation = json.loads(response_text)

            result = AssessmentResult(
                score=evaluation.get("score", 0),
                correct=evaluation.get("correct", False),
                partial_credit=evaluation.get("partial_credit"),
                misconceptions=evaluation.get("misconceptions", []),
                knowledge_gaps=evaluation.get("knowledge_gaps", []),
                reasoning_patterns=evaluation.get("reasoning_patterns", []),
                feedback=evaluation.get("feedback", "No feedback provided."),
                improvement_suggestions=evaluation.get(
                    "improvement_suggestions", []),
                key_concepts_understood=evaluation.get(
                    "key_concepts_understood", []),
                key_concepts_missed=evaluation.get("key_concepts_missed", []),
                response_analysis={"raw_llm_response": response_text[:500]}
            )

            return result

        except Exception as e:
            logger.error(f"Error during LLM evaluation: {e}", exc_info=True)

            # Fallback to basic evaluation
            similarity = SequenceMatcher(
                None, student_response.lower(), correct_answer.lower()).ratio()
            score = int(similarity * 100)
            is_correct = score > 80

            return AssessmentResult(
                score=score,
                correct=is_correct,
                feedback=f"Your answer was {'correct' if is_correct else 'incorrect'}. The expected answer is: {correct_answer}",
                misconceptions=[
                    f"Unable to analyze specific misconceptions due to technical error"],
                key_concepts_understood=[],
                key_concepts_missed=[topic],
                response_analysis={"error": str(e), "fallback": True}
            )

    async def batch_evaluate(self, assessments: List[Dict]) -> List[AssessmentResult]:
        """Process multiple assessments in parallel"""
        tasks = []
        for assessment in assessments:
            task = self.evaluate_response(
                question=assessment.get("question", ""),
                student_response=assessment.get("student_response", ""),
                correct_answer=assessment.get("correct_answer", ""),
                question_type=assessment.get("question_type", "short_answer"),
                topic=assessment.get("topic", ""),
                subject=assessment.get("subject", ""),
                grade=assessment.get("grade", 6)
            )
            tasks.append(task)

        return await asyncio.gather(*tasks)

    async def aggregate_results(self, results: List[AssessmentResult], topic: str) -> Dict[str, Any]:
        """Aggregate multiple assessment results into an overall analysis"""
        if not results:
            return {
                "average_score": 0,
                "mastery_estimate": 0,
                "completed": 0,
                "misconceptions": [],
                "knowledge_gaps": [],
                "recommendations": []
            }

        scores = [r.score for r in results]
        average_score = sum(scores) / len(scores)
        mastery_estimate = average_score / 100.0

        all_misconceptions = []
        all_knowledge_gaps = []
        all_concepts_missed = []

        for result in results:
            all_misconceptions.extend(result.misconceptions)
            all_knowledge_gaps.extend(result.knowledge_gaps)
            all_concepts_missed.extend(result.key_concepts_missed)

        from collections import Counter
        misconception_counts = Counter(all_misconceptions)
        knowledge_gap_counts = Counter(all_knowledge_gaps)
        concept_missed_counts = Counter(all_concepts_missed)

        common_misconceptions = [
            {"misconception": m, "frequency": c}
            for m, c in misconception_counts.most_common(3)
        ]

        common_knowledge_gaps = [
            {"gap": g, "frequency": c}
            for g, c in knowledge_gap_counts.most_common(3)
        ]

        missed_concepts = [
            {"concept": c, "frequency": f}
            for c, f in concept_missed_counts.most_common(3)
        ]

        recommendations = []

        if average_score < 60:
            recommendations.append(
                f"Review the fundamentals of {topic} before proceeding")
        elif average_score < 80:
            recommendations.append(
                f"Focus on practicing specific concepts in {topic} that were missed")
        else:
            recommendations.append(
                f"Ready to advance to more complex aspects of {topic}")

        for concept in missed_concepts:
            if concept["frequency"] >= 2:
                recommendations.append(
                    f"Review the concept: {concept['concept']}")

        return {
            "average_score": average_score,
            "mastery_estimate": mastery_estimate,
            "completed": len(results),
            "misconceptions": common_misconceptions,
            "knowledge_gaps": common_knowledge_gaps,
            "missed_concepts": missed_concepts,
            "recommendations": recommendations,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


class LearningAnalytics:
    """Advanced learning analytics for educational insights"""

    def __init__(self, mongo_db, neo4j_driver=None):
        self.db = mongo_db
        self.neo4j_driver = neo4j_driver

    async def get_student_analytics(self, student_id: str) -> Dict[str, Any]:
        """Get comprehensive analytics for a student"""
        session = await self._get_student_session(student_id)
        if not session:
            return {"error": "Student session not found"}

        mastery_stats = self._calculate_mastery_statistics(session)

        topic_velocities = self._calculate_learning_velocity(session)

        strategy_effectiveness = await self._calculate_strategy_effectiveness(session)

        knowledge_map = await self._identify_knowledge_structure(session)

        trajectory_analysis = self._analyze_learning_trajectory(session)

        learning_path = self._generate_learning_path(session)

        stagnation_areas = self._detect_stagnation_areas(session)

        time_analytics = await self._analyze_time_patterns(session)

        return {
            "student_id": student_id,
            "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
            "mastery_summary": mastery_stats,
            "learning_velocity": topic_velocities,
            "strategy_effectiveness": strategy_effectiveness,
            "knowledge_structure": knowledge_map,
            "learning_trajectory": trajectory_analysis,
            "learning_path": learning_path,
            "stagnation_areas": stagnation_areas,
            "time_analytics": time_analytics,
            "affective_state": session.get("affective_state", {})
        }

    async def get_class_analytics(self, class_id: str, student_ids: List[str] = None) -> Dict[str, Any]:
        """Get analytics for an entire class"""
        if not student_ids:
            student_ids = await self._get_students_in_class(class_id)

        if not student_ids:
            return {"error": f"No students found for class {class_id}"}

        student_analytics = []
        for student_id in student_ids:
            analytics = await self.get_student_analytics(student_id)
            student_analytics.append(analytics)

        class_stats = self._aggregate_class_statistics(student_analytics)

        return {
            "class_id": class_id,
            "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
            "num_students": len(student_analytics),
            "class_statistics": class_stats,
            "student_analytics": student_analytics
        }

    async def generate_mastery_heatmap(self, student_id: str) -> Dict[str, Any]:
        """Generate a heatmap visualization of student mastery across topics"""
        session = await self._get_student_session(student_id)
        if not session:
            return {"error": "Student session not found"}

        mastery_data = session.get("state", {}).get("mastery", {})
        if not mastery_data:
            return {"error": "No mastery data available"}

        topics_by_subject = defaultdict(list)

        for topic, mastery in mastery_data.items():
            parts = topic.split('-', 1)
            subject = parts[0] if len(parts) > 1 else "General"
            topics_by_subject[subject].append((topic, mastery))

        visualization_data = {
            "student_id": student_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "subject_areas": [
                {
                    "subject": subject,
                    "topics": [
                        {"topic": topic, "mastery": mastery}
                        for topic, mastery in sorted(topics, key=lambda x: x[1], reverse=True)
                    ]
                }
                for subject, topics in topics_by_subject.items()
            ]
        }

        try:
            plt.figure(figsize=(12, 8))

            subjects = list(topics_by_subject.keys())
            max_topics = max(len(topics)
                             for topics in topics_by_subject.values())

            heatmap_data = np.zeros((len(subjects), max_topics))
            topic_labels = [[""] * max_topics for _ in range(len(subjects))]

            for i, subject in enumerate(subjects):
                topics = topics_by_subject[subject]
                for j, (topic, mastery) in enumerate(topics):
                    if j < max_topics:
                        heatmap_data[i, j] = mastery
                        topic_labels[i][j] = topic.split(
                            '-')[-1].replace('_', ' ')

            plt.imshow(heatmap_data, cmap='RdYlGn',
                       aspect='auto', vmin=0, vmax=1)
            plt.colorbar(label='Mastery Level')

            plt.yticks(range(len(subjects)), subjects)
            plt.title(f'Mastery Heatmap for Student {student_id}')
            plt.tight_layout()

            buf = io.BytesIO()
            plt.savefig(buf, format='png', dpi=100)
            buf.seek(0)
            img_data = base64.b64encode(buf.read()).decode('utf-8')
            plt.close()

            visualization_data["heatmap_image"] = f"data:image/png;base64,{img_data}"

        except Exception as e:
            logger.error(f"Error generating heatmap: {e}", exc_info=True)
            visualization_data["error"] = "Could not generate heatmap visualization"

        return visualization_data

    async def get_prerequisite_chain(self, topic: str) -> Dict[str, Any]:
        """Get prerequisite chains for a topic from the knowledge graph"""
        if not self.neo4j_driver:
            return {"error": "Neo4j not available"}

        try:
            with self.neo4j_driver.session() as session:
                result = session.run("""
                MATCH path = (start:Concept)-[:PREREQUISITE_FOR*1..5]->(target:Concept)
                WHERE target.name = $topic
                WITH start, target, [node IN nodes(path) | node.name] AS chain,
                     length(path) AS depth
                RETURN start.name AS prerequisite, chain, depth
                ORDER BY depth DESC
                LIMIT 10
                """, topic=topic)

                chains = [{"prerequisite": record["prerequisite"],
                          "chain": record["chain"],
                           "depth": record["depth"]}
                          for record in result]

                return {
                    "topic": topic,
                    "prerequisite_chains": chains,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }

        except Exception as e:
            logger.error(
                f"Error retrieving prerequisite chains: {e}", exc_info=True)
            return {"error": f"Could not retrieve prerequisite chains: {str(e)}"}

    async def _get_student_session(self, student_id: str) -> Dict:
        """Retrieve student session data from database"""
        try:
            data = await self.db["learning_states"].find_one({"student_id": student_id})
            if data:
                data.pop("_id", None)
                return data
            return None
        except Exception as e:
            logger.error(
                f"Error fetching session {student_id}: {e}", exc_info=True)
            return None

    async def _get_students_in_class(self, class_id: str) -> List[str]:
        """Get list of student IDs in a class"""
        try:
            class_data = await self.db["classes"].find_one({"class_id": class_id})
            if class_data and "student_ids" in class_data:
                return class_data["student_ids"]
            return []
        except Exception as e:
            logger.error(
                f"Error fetching class {class_id}: {e}", exc_info=True)
            return []

    def _calculate_mastery_statistics(self, session: Dict) -> Dict[str, Any]:
        """Calculate statistics about student mastery"""
        mastery_dict = session.get("state", {}).get("mastery", {})
        if not mastery_dict:
            return {
                "average": 0,
                "by_topic": {},
                "below_threshold": {},
                "count": 0
            }

        mastery_values = list(mastery_dict.values())
        avg_mastery = sum(mastery_values) / \
            len(mastery_values) if mastery_values else 0

        threshold = 0.7
        below_threshold = {topic: mastery for topic,
                           mastery in mastery_dict.items() if mastery < threshold}

        ranges = [0, 0.3, 0.7, 1.0]
        labels = ["low", "medium", "high"]
        distribution = {label: 0 for label in labels}

        for mastery in mastery_values:
            for i, label in enumerate(labels):
                if ranges[i] <= mastery < ranges[i+1]:
                    distribution[label] += 1
                    break

        variance = np.var(mastery_values) if mastery_values else 0

        return {
            "average": avg_mastery,
            "by_topic": mastery_dict,
            "below_threshold": below_threshold,
            "count": len(mastery_dict),
            "distribution": distribution,
            "variance": variance
        }

    def _calculate_learning_velocity(self, session: Dict) -> Dict[str, Any]:
        """Calculate learning velocity (mastery gain per attempt)"""
        state = session.get("state", {})
        mastery_dict = state.get("mastery", {})
        attempts_dict = state.get("topic_attempts", {})

        if not mastery_dict or not attempts_dict:
            return {}

        velocity_dict = {}
        for topic, mastery in mastery_dict.items():
            attempts = attempts_dict.get(topic, 1)
            velocity_dict[topic] = mastery / attempts

        if velocity_dict:
            fastest_topic = max(velocity_dict.items(), key=lambda x: x[1])
            slowest_topic = min(velocity_dict.items(), key=lambda x: x[1])
        else:
            fastest_topic = (None, 0)
            slowest_topic = (None, 0)

        return {
            "by_topic": velocity_dict,
            "fastest_learning": {"topic": fastest_topic[0], "velocity": fastest_topic[1]},
            "slowest_learning": {"topic": slowest_topic[0], "velocity": slowest_topic[1]},
            "average_velocity": sum(velocity_dict.values()) / len(velocity_dict) if velocity_dict else 0
        }

    async def _calculate_strategy_effectiveness(self, session: Dict) -> Dict[str, Any]:
        """Calculate the effectiveness of different teaching strategies"""
        learning_path = session.get("learning_path", [])

        strategy_interactions = defaultdict(list)

        for interaction in learning_path:
            strategy = interaction.get("strategy")
            if not strategy:
                continue

            if "mastery_after_feedback" in interaction and "mastery_at_request" in interaction:
                strategy_interactions[strategy].append(interaction)

        effectiveness = {}
        for strategy, interactions in strategy_interactions.items():
            if not interactions:
                continue

            gains = [i.get("mastery_after_feedback", 0) - i.get("mastery_at_request", 0)
                     for i in interactions]
            avg_gain = sum(gains) / len(gains) if gains else 0

            ratings = [i.get("helpful_rating", 0)
                       for i in interactions if "helpful_rating" in i]
            avg_rating = sum(ratings) / len(ratings) if ratings else None

            completion_percentages = [i.get("completion_percentage", 0)
                                      for i in interactions if "completion_percentage" in i]
            avg_completion = sum(completion_percentages) / \
                len(completion_percentages) if completion_percentages else None

            effectiveness[strategy] = {
                "count": len(interactions),
                "avg_mastery_gain": avg_gain,
                "avg_rating": avg_rating,
                "avg_completion": avg_completion,
                "topics_used": list(set(i.get("topic", "") for i in interactions))
            }

        if effectiveness:
            most_effective = max(effectiveness.items(),
                                 key=lambda x: x[1]["avg_mastery_gain"])
            most_effective_strategy = most_effective[0]
        else:
            most_effective_strategy = None

        return {
            "by_strategy": effectiveness,
            "most_effective": most_effective_strategy,
            "recommendation": f"Consider using {most_effective_strategy} more frequently" if most_effective_strategy else "Need more data to recommend strategies"
        }

    async def _identify_knowledge_structure(self, session: Dict) -> Dict[str, Any]:
        """Identify knowledge structure, clusters, and gaps"""
        mastery_dict = session.get("state", {}).get("mastery", {})

        if not mastery_dict:
            return {}

        knowledge_structure = {}
        if self.neo4j_driver:
            try:
                topics = list(mastery_dict.keys())

                with self.neo4j_driver.session() as neo4j_session:
                    result = neo4j_session.run("""
                    UNWIND $topics AS topic
                    MATCH (c:Concept {name: topic})
                    MATCH (c)-[r:RELATED_TO|PART_OF|IS_A|CAUSES]-(related:Concept)
                    WHERE related.name IN $topics
                    WITH c, collect(related.name) AS related_concepts
                    RETURN c.name AS topic, related_concepts, size(related_concepts) AS connection_count
                    ORDER BY connection_count DESC
                    """, topics=topics)

                    clusters = [{"topic": record["topic"],
                                "related": record["related_concepts"],
                                 "connection_count": record["connection_count"]}
                                for record in result]

                    topic_to_cluster = {}
                    all_clusters = []

                    for i, cluster in enumerate(clusters):
                        center_topic = cluster["topic"]
                        related = set(cluster["related"])
                        related.add(center_topic)

                        overlapping_clusters = []
                        for j, existing_cluster in enumerate(all_clusters):
                            if related & existing_cluster:
                                overlapping_clusters.append(j)

                        if overlapping_clusters:
                            new_cluster = related
                            for j in sorted(overlapping_clusters, reverse=True):
                                new_cluster |= all_clusters[j]
                                all_clusters.pop(j)
                            all_clusters.append(new_cluster)
                        else:

                            all_clusters.append(related)

                    cluster_masteries = []
                    for i, cluster in enumerate(all_clusters):
                        cluster_topics = list(cluster)
                        cluster_mastery = {
                            "id": i,
                            "topics": cluster_topics,
                            "average_mastery": sum(mastery_dict.get(t, 0) for t in cluster_topics) / len(cluster_topics) if cluster_topics else 0,
                            "size": len(cluster_topics)
                        }
                        cluster_masteries.append(cluster_mastery)

                    knowledge_structure["clusters"] = cluster_masteries

            except Exception as e:
                logger.error(
                    f"Error analyzing knowledge structure: {e}", exc_info=True)

        gaps = [topic for topic, mastery in mastery_dict.items()
                if mastery < 0.4]
        strengths = [topic for topic,
                     mastery in mastery_dict.items() if mastery > 0.8]

        knowledge_structure["gaps"] = gaps
        knowledge_structure["strengths"] = strengths

        return knowledge_structure

    def _analyze_learning_trajectory(self, session: Dict) -> Dict[str, Any]:
        """Analyze the learning trajectory over time"""
        learning_path = session.get("learning_path", [])

        topic_trajectory = defaultdict(list)

        for interaction in learning_path:
            topic = interaction.get("topic")
            timestamp_str = interaction.get("timestamp_utc")
            mastery_after = interaction.get("mastery_after_feedback")

            if topic and timestamp_str and mastery_after is not None:
                try:
                    timestamp = datetime.fromisoformat(timestamp_str)
                    topic_trajectory[topic].append((timestamp, mastery_after))
                except ValueError:
                    continue

        for topic in topic_trajectory:
            topic_trajectory[topic].sort(key=lambda x: x[0])

        topic_improvement = {}
        for topic, points in topic_trajectory.items():
            if len(points) < 2:
                continue

            time_delta = (points[-1][0] - points[0][0]
                          ).total_seconds() / (60 * 60 * 24)
            mastery_delta = points[-1][1] - points[0][1]

            if time_delta > 0:
                rate = mastery_delta / time_delta
                topic_improvement[topic] = {
                    "rate": rate,
                    "initial_mastery": points[0][1],
                    "current_mastery": points[-1][1],
                    "days_of_learning": time_delta,
                    "interactions": len(points)
                }

        overall_rates = [data["rate"] for data in topic_improvement.values()]
        overall_learning_rate = sum(
            overall_rates) / len(overall_rates) if overall_rates else 0

        return {
            "by_topic": topic_improvement,
            "overall_learning_rate": overall_learning_rate,
            "topic_count": len(topic_trajectory)
        }

    def _generate_learning_path(self, session: Dict) -> Dict[str, Any]:
        """Generate a visualization of the learning path"""
        learning_path = session.get("learning_path", [])

        if not learning_path:
            return {}

        topic_sequence = []
        mastery_sequence = []
        strategies = []
        timestamps = []

        for interaction in learning_path:
            topic = interaction.get("topic")
            strategy = interaction.get("strategy")
            timestamp_str = interaction.get("timestamp_utc")
            mastery = interaction.get("mastery_after_feedback")

            if topic and timestamp_str:
                try:
                    timestamp = datetime.fromisoformat(timestamp_str)
                    topic_sequence.append(topic)
                    strategies.append(strategy)
                    timestamps.append(timestamp)
                    mastery_sequence.append(
                        mastery if mastery is not None else 0)
                except ValueError:
                    continue

        path_data = []
        for i in range(len(topic_sequence)):
            path_data.append({
                "step": i + 1,
                "topic": topic_sequence[i],
                "strategy": strategies[i],
                "timestamp": timestamps[i].isoformat(),
                "mastery": mastery_sequence[i]
            })

        transitions = defaultdict(int)
        for i in range(1, len(topic_sequence)):
            prev_topic = topic_sequence[i-1]
            curr_topic = topic_sequence[i]
            if prev_topic != curr_topic:
                transitions[(prev_topic, curr_topic)] += 1

        transition_list = [{"from": from_topic, "to": to_topic, "count": count}
                           for (from_topic, to_topic), count in transitions.items()]

        return {
            "path_sequence": path_data,
            "transitions": transition_list,
            "unique_topics": len(set(topic_sequence)),
            "total_steps": len(topic_sequence)
        }

    def _detect_stagnation_areas(self, session: Dict) -> List[Dict[str, Any]]:
        """Detect areas where the student is stagnating"""
        state = session.get("state", {})
        mastery_dict = state.get("mastery", {})
        attempts_dict = state.get("topic_attempts", {})

        if not mastery_dict or not attempts_dict:
            return []

        stagnation_threshold = 3
        mastery_threshold = 0.4

        stagnation_areas = []
        for topic, attempts in attempts_dict.items():
            mastery = mastery_dict.get(topic, 0)
            if attempts >= stagnation_threshold and mastery < mastery_threshold:
                stagnation_areas.append({
                    "topic": topic,
                    "attempts": attempts,
                    "mastery": mastery,
                    "severity": (attempts * (mastery_threshold - mastery)) if mastery < mastery_threshold else 0
                })

        stagnation_areas.sort(key=lambda x: x["severity"], reverse=True)

        return stagnation_areas

    async def _analyze_time_patterns(self, session: Dict) -> Dict[str, Any]:
        """Analyze patterns in learning time"""
        learning_path = session.get("learning_path", [])

        if not learning_path:
            return {}

        interaction_times = []
        time_spent = []
        days_of_week = [0] * 7
        hours_of_day = [0] * 24

        for interaction in learning_path:
            timestamp_str = interaction.get("timestamp_utc")
            duration = interaction.get("time_spent_seconds")

            if timestamp_str:
                try:
                    timestamp = datetime.fromisoformat(timestamp_str)
                    interaction_times.append(timestamp)

                    days_of_week[timestamp.weekday()] += 1
                    hours_of_day[timestamp.hour] += 1

                    if duration:
                        time_spent.append(duration)
                except ValueError:
                    continue

        if not interaction_times:
            return {}

        sorted_times = sorted(interaction_times)
        time_diffs = [(sorted_times[i+1] - sorted_times[i]).total_seconds() / 3600
                      for i in range(len(sorted_times) - 1)]

        avg_time_between = sum(time_diffs) / \
            len(time_diffs) if time_diffs else 0

        most_active_day = days_of_week.index(max(days_of_week))
        most_active_hour = hours_of_day.index(max(hours_of_day))

        avg_session_duration = sum(time_spent) / \
            len(time_spent) if time_spent else 0

        first_day = min(interaction_times)
        last_day = max(interaction_times)
        days_active = (last_day - first_day).days + 1

        unique_days = set((t.year, t.month, t.day) for t in interaction_times)

        return {
            "avg_time_between_sessions_hours": avg_time_between,
            "avg_session_duration_seconds": avg_session_duration,
            "most_active_day": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][most_active_day],
            "most_active_hour": most_active_hour,
            "days_since_first_activity": days_active,
            "unique_days_active": len(unique_days),
            "day_distribution": days_of_week,
            "hour_distribution": hours_of_day,
            "first_activity": first_day.isoformat(),
            "last_activity": last_day.isoformat()
        }

    def _aggregate_class_statistics(self, student_analytics: List[Dict]) -> Dict[str, Any]:
        """Aggregate statistics across multiple students"""
        if not student_analytics:
            return {}

        all_mastery_avgs = [s.get("mastery_summary", {}).get(
            "average", 0) for s in student_analytics]
        avg_mastery = sum(all_mastery_avgs) / \
            len(all_mastery_avgs) if all_mastery_avgs else 0

        all_topics = set()
        for student in student_analytics:
            mastery_by_topic = student.get(
                "mastery_summary", {}).get("by_topic", {})
            all_topics.update(mastery_by_topic.keys())

        topic_averages = {}
        for topic in all_topics:
            topic_masteries = []
            for student in student_analytics:
                mastery = student.get("mastery_summary", {}).get(
                    "by_topic", {}).get(topic)
                if mastery is not None:
                    topic_masteries.append(mastery)

            if topic_masteries:
                topic_averages[topic] = sum(
                    topic_masteries) / len(topic_masteries)

        strategy_counts = defaultdict(int)
        strategy_gains = defaultdict(list)

        for student in student_analytics:
            strategy_data = student.get(
                "strategy_effectiveness", {}).get("by_strategy", {})
            for strategy, data in strategy_data.items():
                strategy_counts[strategy] += data.get("count", 0)
                if "avg_mastery_gain" in data:
                    strategy_gains[strategy].append(data["avg_mastery_gain"])

        strategy_effectiveness = {}
        for strategy, counts in strategy_counts.items():
            gains = strategy_gains.get(strategy, [])
            avg_gain = sum(gains) / len(gains) if gains else 0

            strategy_effectiveness[strategy] = {
                "total_uses": counts,
                "average_mastery_gain": avg_gain
            }

        all_stagnations = []
        for student in student_analytics:
            stagnation_areas = student.get("stagnation_areas", [])
            all_stagnations.extend(
                [(area["topic"], area["severity"]) for area in stagnation_areas])

        stagnation_counts = defaultdict(int)
        for topic, _ in all_stagnations:
            stagnation_counts[topic] += 1

        common_stagnations = [{"topic": topic, "count": count}
                              for topic, count in stagnation_counts.items()]
        common_stagnations.sort(key=lambda x: x["count"], reverse=True)

        return {
            "average_mastery": avg_mastery,
            "mastery_by_topic": topic_averages,
            "strategy_effectiveness": strategy_effectiveness,
            "common_stagnation_areas": common_stagnations[:5],
            "student_count": len(student_analytics)
        }


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown events for resource initialization and cleanup."""
    global rl_system, ollama_client, mongo_client, learning_db, neo4j_driver, embedding_client, mistral_client, together_client, config
    global prompt_manager, response_validator
    config = load_config()
    logger.info(f"API v{config.api.version} server starting up...")

    # Initialize prompt manager
    prompt_manager = PromptManager()
    logger.info("Prompt Manager initialized")

    # Initialize response validator
    response_validator = ResponseValidator()
    logger.info("Response Validator initialized")
    if config.rl.available and SB3_AVAILABLE:
        logger.info(f"Initializing RL System from {config.rl.model_path}...")
        try:
            rl_system = NCERTLearningSystem(
                log_dir=os.path.dirname(config.rl.model_path))
            rl_system.load_model(str(config.rl.model_path))
            if rl_system.model is None:
                logger.error(
                    f"RL Model failed to load from {config.rl.model_path}.")
                rl_system = None
            else:
                logger.info(f"RL Model loaded from {config.rl.model_path}")
        except Exception as e:
            logger.error(f"Failed to initialize RL System: {e}", exc_info=True)
            rl_system = None
    else:
        logger.info(
            "RL system disabled (SB3 unavailable or model path missing).")

    if config.llm.ollama_host:
        logger.info(f"Connecting to Ollama at {config.llm.ollama_host}...")
        try:
            ollama_client = ollama.AsyncClient(
                host=config.llm.ollama_host, timeout=60)
            await ollama_client.list()
            logger.info("Ollama client connected.")
        except Exception as e:
            logger.error(f"Failed to connect to Ollama: {e}", exc_info=True)
            ollama_client = None

    if config.llm.together_api_key:
        logger.info("Initializing Together AI client...")
        try:
            together_client = TogetherAIClient(
                api_key=config.llm.together_api_key)
            connection_valid = await together_client.test_connection()
            if connection_valid:
                logger.info("Together AI client connection verified.")
            else:
                logger.warning(
                    "Together AI client initialization succeeded but connection test failed.")
        except Exception as e:
            logger.error(
                f"Failed to initialize Together AI client: {e}", exc_info=True)
            together_client = None

    if config.database.mongo_url and config.database.mongo_db_name:
        logger.info(f"Connecting to MongoDB at {config.database.mongo_url}...")
        try:
            mongo_client = motor.motor_asyncio.AsyncIOMotorClient(
                config.database.mongo_url,
                serverSelectionTimeoutMS=5000,
                uuidRepresentation='standard'
            )
            await mongo_client.admin.command('ping')
            learning_db = mongo_client[config.database.mongo_db_name]
            await learning_db["learning_states"].create_index("student_id", unique=True, background=True)
            logger.info(
                f"MongoDB client connected to db '{config.database.mongo_db_name}'.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}", exc_info=True)
            mongo_client = None
            learning_db = None

    if config.database.neo4j_uri and config.database.neo4j_password:
        logger.info(f"Connecting to Neo4j at {config.database.neo4j_uri}...")
        try:
            neo4j_driver = GraphDatabase.driver(
                config.database.neo4j_uri,
                auth=(config.database.neo4j_username,
                      config.database.neo4j_password),
                connection_timeout=10,
                max_connection_lifetime=3600,
                keep_alive=True
            )
            neo4j_driver.verify_connectivity()
            logger.info("Neo4j driver connected successfully.")
        except Exception as e:
            logger.error(
                f"Failed to initialize Neo4j driver: {e}", exc_info=True)
            neo4j_driver = None

    if config.embedding.mistral_api_key and config.embedding.embedding_model_name:
        logger.info(
            f"Initializing LangChain MistralAIEmbeddings (Model: {config.embedding.embedding_model_name})")
        try:
            embedding_client = MistralAIEmbeddings(
                api_key=config.embedding.mistral_api_key,
                model=config.embedding.embedding_model_name
            )
            logger.info("LangChain MistralAI Embedding client initialized.")

            # Also initialize direct Mistral client
            from mistralai import Mistral
            mistral_client = Mistral(api_key=config.embedding.mistral_api_key)
            logger.info("Mistral AI client initialized.")
        except Exception as e:
            logger.error(
                f"Failed to initialize Mistral AI clients: {e}", exc_info=True)
            embedding_client = None
            mistral_client = None

    if all(x is not None for x in [together_client, mongo_client, learning_db]):
        await init_advanced_its_components()
        logger.info("Advanced ITS capabilities enabled")
    else:
        logger.warning(
            "Some advanced ITS features will be unavailable due to missing dependencies")

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


async def init_advanced_its_components():
    global config, exercise_generator, metacognitive_support, content_selector, spaced_repetition

    exercise_generator = ExerciseGenerator(
        llm_client=together_client,
        kg_client=neo4j_driver
    )

    metacognitive_support = MetacognitiveSupport(config)

    content_selector = ContentSelector(config)

    spaced_repetition = SpacedRepetitionScheduler()

    logger.info("Advanced ITS components initialized")


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
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    else:
        logger.warning(
            "INTERNAL_API_SECRET not set, skipping verification (Insecure).")

    if x_authenticated_user_id is None:
        logger.error(
            "Header 'X-Authenticated-User-Id' missing from proxy request.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User identifier missing.")
    return x_authenticated_user_id


async def get_student_session_mongo(user_id: str) -> StudentSessionData | None:
    """Fetches student session data from MongoDB."""
    if learning_db is None:
        logger.error("MongoDB unavailable, cannot fetch session.")
        raise HTTPException(status_code=503, detail="DB unavailable")
    try:
        data = await learning_db["learning_states"].find_one({"student_id": user_id})
        if data:
            data.pop("_id", None)
            return StudentSessionData.model_validate(data)
        return None
    except Exception as e:
        logger.error(f"Error fetching session {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="DB access error")


async def save_student_session_mongo(session_data: StudentSessionData):
    """Saves or updates student session data in MongoDB."""
    if learning_db is None:
        logger.error("MongoDB unavailable, cannot save session.")
        raise HTTPException(status_code=503, detail="DB unavailable")
    try:
        session_dict = session_data.model_dump(mode='json')
        update_payload = copy.deepcopy(session_dict)
        update_payload.pop('created_at', None)
        result = await learning_db["learning_states"].update_one(
            {"student_id": session_data.student_id},
            {"$set": update_payload, "$setOnInsert": {
                "created_at": session_data.created_at}},
            upsert=True
        )
        return True
    except Exception as e:
        logger.error(
            f"Error saving session {session_data.student_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="DB save error")


def prepare_observation_from_state(state: StudentState, profile: StudentProfile, env: Any) -> Optional[np.ndarray]:
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
        for t, v in state.mastery.items():
            if t in topic_map:
                mastery_obs[topic_map[t]] = np.clip(v, 0., 1.)
        for t, v in state.topic_attempts.items():
            if t in topic_map:
                topic_attempts_obs[topic_map[t]] = v
        for t, v in state.time_since_last_practiced.items():
            if t in topic_map:
                time_since_last_practiced_obs[topic_map[t]] = v
        for t, v in state.misconceptions.items():
            if t in topic_map:
                misconceptions_obs[topic_map[t]] = np.clip(v, 0., 1.)
        eng = np.array([state.engagement], dtype=np.float32)
        att = np.array([state.attention], dtype=np.float32)
        cog = np.array([state.cognitive_load], dtype=np.float32)
        mot = np.array([state.motivation], dtype=np.float32)
        style_prefs_dict = profile.learning_style_preferences if profile else {}
        prefs_obs = np.array([style_prefs_dict.get(
            ls.name.lower(), 1./num_styles) for ls in LearningStyles], dtype=np.float32)
        prefs_sum = np.sum(prefs_obs)
        prefs_obs /= (prefs_sum if prefs_sum > 1e-6 else 1.)
        prefs_obs = (np.full(num_styles, 1./num_styles,
                     dtype=np.float32) if prefs_sum <= 1e-6 else prefs_obs)
        strat_hist_obs = np.zeros(num_strategies, dtype=np.float32)
        hist_len = len(state.strategy_history_vector)
        if hist_len == num_strategies:
            strat_hist_obs = np.array(
                state.strategy_history_vector, dtype=np.float32)
        elif hist_len > 0:
            copy_len = min(hist_len, num_strategies)
            strat_hist_obs[:copy_len] = state.strategy_history_vector[:copy_len]
        topic_idx_max = float(max(1, num_topics))
        cur_topic_idx = state.current_topic_idx_persistent
        cur_topic_norm = float(
            cur_topic_idx if 0 <= cur_topic_idx < num_topics else num_topics)/topic_idx_max
        cur_topic_obs = np.array([cur_topic_norm], dtype=np.float32)
        recent_perf = np.array([state.recent_performance], dtype=np.float32)
        steps_obs = np.array([state.steps_on_current_topic], dtype=np.float32)
        obs_list = [mastery_obs, eng, att, cog, mot, prefs_obs, strat_hist_obs, topic_attempts_obs,
                    time_since_last_practiced_obs, misconceptions_obs, cur_topic_obs, recent_perf, steps_obs]
        flat_obs = np.concatenate(obs_list).astype(np.float32)
        exp_shape = env.observation_space.shape[0]
        if flat_obs.shape[0] != exp_shape:
            logger.error(
                f"Obs shape mismatch! Exp {exp_shape}, Got {flat_obs.shape[0]}. Check components/order.")
            # Pad/truncate only as last resort
            if flat_obs.shape[0] < exp_shape:
                flat_obs = np.pad(flat_obs, (0, exp_shape-flat_obs.shape[0]))
            else:
                flat_obs = flat_obs[:exp_shape]
            logger.warning(
                "Observation padded/truncated. Review RL Env/prepare func.")
        return flat_obs
    except Exception as e:
        logger.error(f"Prepare observation failed: {e}", exc_info=True)
        return None


def find_best_topic_match(query_topic: str, all_topics: List[str]) -> Optional[int]:
    if not query_topic or not all_topics:
        return None
    query_norm = query_topic.lower().strip().replace('-', ' ').replace('_', ' ')
    if not query_norm:
        return None
    best_idx: Optional[int] = None
    best_score = -1.0
    for idx, topic in enumerate(all_topics):
        topic_norm = topic.lower().strip().replace('-', ' ').replace('_', ' ')
        if query_norm == topic_norm:
            return idx
        score = 0.0
        if query_norm in topic_norm:
            score = len(query_norm) / len(topic_norm)
        elif topic_norm in query_norm:
            score = len(topic_norm) / len(query_norm) * 0.8
        if score > best_score:
            best_score = score
            best_idx = idx
    return best_idx if best_score > 0.6 else None


def calculate_prerequisite_satisfaction(topic_idx: int, mastery_dict: Dict[str, float], env: Any) -> float:
    if not SB3_AVAILABLE or env is None or not hasattr(env, 'prerequisite_matrix') or not hasattr(env, 'topics'):
        return 0.5
    try:
        prereqs = env.prerequisite_matrix
        topics = env.topics
        n_topics = len(topics)
        if not isinstance(prereqs, np.ndarray) or topic_idx >= prereqs.shape[0]:
            return 0.5
        prereq_indices = np.where(prereqs[topic_idx, :] > 0)[0]
        prereq_indices = prereq_indices[(
            prereq_indices != topic_idx) & (prereq_indices < n_topics)]
        if len(prereq_indices) == 0:
            return 1.0
        masteries = [mastery_dict.get(topics[idx], 0.0)
                     for idx in prereq_indices]
        weights = [prereqs[topic_idx, idx] for idx in prereq_indices]
        total_weight = sum(weights)
        w_sum = sum(m*w for m, w in zip(masteries, weights))
        return (w_sum/total_weight) if total_weight > 0 else 1.0
    except Exception as e:
        logger.warning(f"Calc prereqs failed idx {topic_idx}: {e}")
        return 0.5


def update_student_state_history(state: StudentState, topic_name: str, strategy_name: str, topic_map: Dict[str, int]):
    try:
        strat_idx = TeachingStrategies[strategy_name].value
        decay = 0.85
    except (KeyError, ValueError):
        logger.warning(
            f"Invalid strategy name '{strategy_name}' for history update.")
        strat_idx = -1
    new_hist = [h*decay for h in state.strategy_history_vector]
    if 0 <= strat_idx < len(new_hist):
        new_hist[strat_idx] = min(1.0, new_hist[strat_idx]+(1.0-decay))
    state.strategy_history_vector = new_hist
    state.topic_attempts[topic_name] = state.topic_attempts.get(
        topic_name, 0.)+1.
    for t in topic_map:
        state.time_since_last_practiced[t] = state.time_since_last_practiced.get(
            t, 100.)+1.
    state.time_since_last_practiced[topic_name] = 0.
    new_idx = topic_map.get(topic_name, -1)
    if new_idx != -1:
        state.steps_on_current_topic = (
            state.steps_on_current_topic+1. if new_idx == state.current_topic_idx_persistent else 1.)
        state.current_topic_idx_persistent = new_idx
    else:
        state.steps_on_current_topic = 0.
        state.current_topic_idx_persistent = -1


async def get_embedding_async(text: str) -> Optional[List[float]]:
    """Helper to get embeddings using the official Mistral client with rate limiting and caching."""
    global mistral_client
    if not mistral_client:
        logger.warning("Direct Mistral client unavailable.")
        return None

    # Generate cache key based on text content
    cache_key = hash(text)

    # Check cache first
    if cache_key in embedding_cache:
        logger.debug("Using cached embedding")
        return embedding_cache[cache_key]

    # Use a lock to prevent concurrent embedding requests
    async with embedding_lock:
        try:
            model_name = os.environ.get(
                "EMBEDDING_MODEL_NAME", "mistral-embed")
            logger.debug(f"Requesting embedding (Model: {model_name})")

            def embed_sync():
                return mistral_client.embeddings.create(model=model_name, inputs=[text])

            response = await asyncio.to_thread(embed_sync)

            if response.data and hasattr(response.data[0], 'embedding'):
                emb = response.data[0].embedding
                if EMBEDDING_DIMENSION and len(emb) != EMBEDDING_DIMENSION:
                    logger.error(
                        f"CRITICAL: Embedding dimension mismatch! Got {len(emb)}, expected {EMBEDDING_DIMENSION}.")
                    return None

                # Cache the result
                embedding_cache[cache_key] = emb

                # Add artificial delay to prevent rate limiting
                await asyncio.sleep(0.5)  # 500ms delay between requests

                return emb
            else:
                logger.warning(f"Mistral embedding response missing data.")
                return None

        except Exception as e:
            logger.error(
                f"Error generating Mistral embedding: {e}", exc_info=True)

            # For rate limit errors specifically
            if "429" in str(e) or "rate limit" in str(e).lower():
                logger.warning("Rate limit hit - adding longer delay")
                # Longer cooldown for rate limit errors
                await asyncio.sleep(2.0)

            return None


def _run_neo4j_query_sync(driver: GraphDatabase.driver, query: str, parameters: Dict, database_name: str) -> List[Dict]:
    """Synchronous helper to run Neo4j query against a specific database."""
    logger.debug(
        f"Neo4j Sync Run: DB='{database_name}', Query='{query[:100]}...'")
    param_summary = {k: type(v).__name__ for k, v in parameters.items()}
    if 'queryVector' in param_summary:
        param_summary['queryVector'] = f"List[{len(parameters.get('queryVector', []))}]"
    logger.debug(f"Neo4j Sync Run: Params Summary={param_summary}")
    try:
        with driver.session(database=database_name) as session:
            results = session.run(query, parameters)
            return [record.data() for record in results]
    except neo4j_exceptions.ServiceUnavailable as e:
        logger.error(f"Neo4j Unavailable: {e}")
        raise
    except neo4j_exceptions.ConstraintError as e:
        logger.error(f"Neo4j Constraint Violation: {e}")
        raise
    except neo4j_exceptions.Neo4jError as e:
        logger.error(f"Neo4j Query Error: {e}")
        raise
    except TypeError as te:
        logger.error(f"Neo4j parameter TypeError: {te}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected Neo4j sync query error: {e}", exc_info=True)
        raise


async def retrieve_rag_context_vector_search(
    driver: Optional[GraphDatabase.driver],
    chapter_name_sanitized: str,
    query_text: str,
    database_name: str,
    vector_index_name: str = "chunkVectorIndex",
    top_k_vector: int = 3,
    embedding_dimension: Optional[int] = EMBEDDING_DIMENSION,
    context_chars_per_chunk: int = 600
) -> str:
    """
    Retrieves context from Neo4j using vector search on Chunks first,
    targeting chunks within a specific chapter.
    """
    if not all([driver, chapter_name_sanitized, query_text, database_name,
                isinstance(embedding_dimension, int) and embedding_dimension > 0, mistral_client]):
        logger.warning(
            "Skipping KG vector retrieval due to missing prerequisites.")
        return ""

    query_embedding = await get_embedding_async(query_text)
    if not query_embedding:
        return ""

    vector_search_query = """
        CALL db.index.vector.queryNodes($indexName, $topK, $queryVector) YIELD node, score
        // Ensure the node found by the index is a Chunk and has an embedding
        WHERE node:Chunk AND node.embedding IS NOT NULL
        // Match the chapter this chunk belongs to and filter by chapter name
        MATCH (chap:Chapter {name: $chapter_name})<-[:PART_OF]-(node)
        // Return the text and score of the matching chunks
        RETURN node.text AS chunkText, score
        ORDER BY score DESC
    """

    parameters = {
        "indexName": vector_index_name,
        "topK": top_k_vector,
        "queryVector": query_embedding,
        "chapter_name": chapter_name_sanitized,
    }
    logger.debug(
        f"KG search params: chapter='{chapter_name_sanitized}', index='{vector_index_name}', vector_dim={len(query_embedding)}")
    context_str = ""
    records = []
    try:
        logger.info(
            f"Performing KG vector search for chapter '{chapter_name_sanitized}', query: '{query_text[:50]}...'")
        records = await asyncio.to_thread(
            _run_neo4j_query_sync, driver, vector_search_query, parameters, database_name
        )
        logger.debug(f"Neo4j vector query returned {len(records)} records.")

    except neo4j_exceptions.ClientError as e:
        if "index" in str(e).lower() and "not found" in str(e).lower():
            logger.error(
                f"Neo4j Vector Index '{vector_index_name}' not found!", exc_info=False)
        elif "dimension mismatch" in str(e).lower() or ("IllegalArgumentException" in str(e) and "dimensions" in str(e).lower()):
            logger.error(
                f"Neo4j Vector dimension mismatch detected during query! Check index config vs query vector. Error: {e}", exc_info=False)
        else:
            logger.error(
                f"Neo4j Client Error during vector search: {e}", exc_info=True)
    except Exception as e:
        logger.error(
            f"Error during KG vector search retrieval: {e}", exc_info=True)

    if records:
        context_parts = [
            f"Retrieved relevant context snippets for '{query_text}':"]
        for i, record in enumerate(records):
            text = record.get("chunkText")
            score = record.get("score", 0.0)
            if text:
                truncated = text[:context_chars_per_chunk] + \
                    ('...' if len(text) > context_chars_per_chunk else '')
                context_parts.append(
                    f"- (Similarity: {score:.3f}) {truncated}")
        if len(context_parts) > 1:
            context_str = "\n".join(context_parts)
            logger.info(
                f"Formatted RAG context from {len(records)} chunks for chapter '{chapter_name_sanitized}'.")
        else:
            logger.info(
                f"Vector search returned records, but no usable text found for chapter '{chapter_name_sanitized}'.")
    else:
        logger.info(
            f"Vector search yielded no matching results for chapter '{chapter_name_sanitized}'.")

    return context_str


async def stream_llm_response(prompt: str, model_id: str, config: Optional[GenerationConfig]):
    """Streams the response from the Ollama LLM asynchronously."""
    # if ollama_client is None:
    #    logger.error("Ollama client unavailable.")
    #    yield json.dumps({"error": "LLM service unavailable"}) + "\n"
    #    return

    if together_client is None:
        logger.error("Together AI client unavailable.")
        yield json.dumps({"error": "LLM service unavailable"}) + "\n"
        return

    try:
        temperature = 0.7
        max_tokens = 4000

        if config:
            if config.temperature is not None:
                temperature = config.temperature
            if config.max_length is not None:
                max_tokens = config.max_length

        system_prompt = (
            "You are an expert educational content creator specializing in creating structured JSON responses. "
            "Your output must be valid JSON only. Format your entire response as a single JSON object with no "
            "additional text. Ensure proper escaping of quotes and special characters in JSON strings."
        )

        # Stream the response
        async for chunk in together_client.stream_chat(
            prompt=prompt,
            model=model_id,
            temperature=temperature,
            max_tokens=max_tokens,
            system_prompt=system_prompt
        ):
            yield chunk

    except Exception as e:
        logger.error(f"Together AI streaming error: {e}", exc_info=True)
        yield json.dumps({"error": "Streaming Error", "message": str(e)}) + "\n"
    # try:
    #    options = config.model_dump(
    #        exclude_none=True, by_alias=True) if config else {}
    #    if 'temperature' not in options:
    #        options['temperature'] = 0.7
    #    logger.info(
    #        f"Streaming from Ollama model '{model_id}'. Options: {options}.")
    #    stream = await ollama_client.chat(
    #        model=model_id, messages=[{'role': 'user', 'content': prompt}],
    #        stream=True, options=options, format="json"
    #    )
#
    #    async for chunk in stream:
    #        if 'message' in chunk and 'content' in chunk['message']:
    #            yield chunk['message']['content']
    #        elif chunk.get('done') and chunk.get('error'):
    #            logger.error(f"Ollama error: {chunk['error']}")
    #            yield json.dumps({"error": "Ollama Error", "message": chunk['error']}) + "\n"
    #            break
    #        elif chunk.get('done'):
    #            logger.info("Ollama stream finished.")
    #            break
#
    # except ollama.ResponseError as e:
    #    logger.error(
    #        f"Ollama API Error: Status={e.status_code}, Error={e.error}")
    #    yield json.dumps({"error": "Ollama API Error", "message": f"{e.status_code}: {e.error}"}) + "\n"
    # except asyncio.TimeoutError:
    #    logger.error("Ollama request timed out.")
    #    yield json.dumps({"error": "Timeout"}) + "\n"
    # except Exception as e:
    #    logger.error(f"Ollama streaming error: {e}", exc_info=True)
    #    yield json.dumps({"error": "Streaming Error"}) + "\n"


async def diagnose_kg_issues(driver, chapter_name, database_name):
    """Check for actual chapter names in the knowledge graph."""
    if not driver:
        return "Neo4j driver not available"

    try:
        # List all available chapters
        chapters_query = """
        MATCH (c:Chapter)
        RETURN c.name AS chapter_name
        LIMIT 50
        """

        records = await asyncio.to_thread(
            _run_neo4j_query_sync, driver, chapters_query, {}, database_name
        )

        chapter_names = [r.get('chapter_name')
                         for r in records if r.get('chapter_name')]
        logger.info(f"Available chapters in KG: {chapter_names}")
        return chapter_names
    except Exception as e:
        return f"Diagnosis error: {str(e)}"


@app.post("/content/next", response_class=StreamingResponse)
async def get_next_content_stream(
    request: ContentRequest,
    user_id: str = Depends(get_user_id_from_proxy),
):
    """Endpoint to get adaptive content, guided by RL and Vector RAG."""
    start_time = time.monotonic()
    logger.info(
        f"User {user_id}: /content/next request - Type: {request.content_type}, Topic: {request.topic}, Subtopic: {request.subtopic}")

    # if ollama_client is None or learning_db is None:
    #    logger.error("Critical dependency unavailable (Ollama or MongoDB).")
    #    raise HTTPException(
    #       status_code=503, detail="Core services unavailable.")
    if together_client is None or learning_db is None:
        logger.error("Critical dependency unavailable (Together or MongoDB).")
        raise HTTPException(
            status_code=503, detail="Core services unavailable.")
    use_rag = False
    if neo4j_driver and mistral_client and NEO4J_DATABASE and isinstance(EMBEDDING_DIMENSION, int):
        use_rag = True
    else:
        logger.warning(
            "One or more RAG dependencies missing/invalid. RAG disabled.")

    session = await get_student_session_mongo(user_id)
    if session is None:
        logger.info(f"New session for user {user_id}.")
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
                action, _ = rl_system.model.predict(
                    observation, deterministic=True)
                action = action.astype(int)
                strategy = TeachingStrategies(action[0])
                topic_idx = action[1]
                difficulty_choice = DifficultyLevel(action[2])
                scaffolding_choice = ScaffoldingLevel(action[3])
                feedback_choice = FeedbackType(action[4])
                length_choice = ContentLength(action[5])
                logger.info(f"User {user_id}: RL Action Applied.")
            except Exception as e:
                logger.error(
                    f"User {user_id}: RL prediction failed: {e}", exc_info=True)
        else:
            logger.warning(
                f"User {user_id}: Failed observation prep. Using defaults.")
    else:
        logger.warning(
            f"User {user_id}: RL system unavailable. Using defaults.")

    final_topic_name = "Default_Topic"
    final_topic_idx = -1
    topic_map = {}
    all_env_topics = []
    if unwrapped_env and hasattr(unwrapped_env, 'topics') and unwrapped_env.topics:
        all_env_topics = unwrapped_env.topics
        topic_map = unwrapped_env.topic_to_idx
        effective_topic_idx = topic_idx
        if request.topic:
            matched = find_best_topic_match(request.topic, all_env_topics)
            if matched is not None:
                effective_topic_idx = matched
                logger.info(
                    f"User {user_id}: Topic override '{request.topic}' -> idx {effective_topic_idx}")
            else:
                logger.warning(
                    f"User {user_id}: Topic override '{request.topic}' not matched.")
        if 0 <= effective_topic_idx < len(all_env_topics):
            final_topic_idx = effective_topic_idx
            final_topic_name = all_env_topics[final_topic_idx]
        else:
            logger.error(
                f"Effective topic idx {effective_topic_idx} out of bounds. Using default.")
    else:
        logger.error("RL env topics unavailable. Using default topic.")

    mastery = student_state.mastery.get(final_topic_name, 0.0)
    previous_mastery = student_state.previous_mastery.get(
        final_topic_name, mastery)
    prereq = calculate_prerequisite_satisfaction(
        final_topic_idx, student_state.mastery, unwrapped_env) if final_topic_idx != -1 else 0.5
    base_diff = 0.5
    if unwrapped_env and hasattr(unwrapped_env, 'topic_base_difficulty') and 0 <= final_topic_idx < len(unwrapped_env.topic_base_difficulty):
        base_diff = unwrapped_env.topic_base_difficulty[final_topic_idx]
    diff_adj = {DifficultyLevel.EASIER: -.2, DifficultyLevel.NORMAL: .0,
                DifficultyLevel.HARDER: .2}.get(difficulty_choice, 0.)
    mastery_change = mastery - previous_mastery
    mastery_change_factor = 0.4 * mastery_change

    base_mastery_factor = 0.15 * mastery

    mastery_eff = base_mastery_factor + mastery_change_factor
    eff_diff = np.clip(base_diff+diff_adj+mastery_eff, 0.05, 0.95)

    student_state.previous_mastery[final_topic_name] = mastery
    diff_desc = f"{difficulty_choice.name.capitalize()} ({eff_diff:.2f})"

    kg_context = ""
    kg_used = False
    query_text = request.subtopic if request.subtopic else final_topic_name.split(
        '-')[-1].replace('_', ' ')
    if use_rag and query_text and final_topic_name != "Default_Topic":
        # First diagnose available chapters
        available_chapters = await diagnose_kg_issues(neo4j_driver, final_topic_name, NEO4J_DATABASE)
        logger.info(f"Available chapters: {available_chapters}")

        chapter_name_sanitized = re.sub(r'\W+', '_', final_topic_name)
        chapter_name_alternatives = [
            final_topic_name,
            chapter_name_sanitized,
            final_topic_name.replace(' ', '_'),
            final_topic_name.split('-')[-1].strip()
        ]

        # Try each alternative chapter name
        for chapter_try in chapter_name_alternatives:
            logger.info(
                f"Trying KG retrieval with chapter name: '{chapter_try}'")

            # Modified vector search query with more flexible matching
            vector_search_query = """
                CALL db.index.vector.queryNodes($indexName, $topK, $queryVector) YIELD node, score
                WHERE node:Chunk AND node.embedding IS NOT NULL
                
                // Try multiple matching approaches for chapter
                OPTIONAL MATCH (chap:Chapter)<-[:PART_OF]-(node)
                WHERE chap.name = $chapter_name 
                   OR chap.name CONTAINS $chapter_name 
                   OR $chapter_name CONTAINS chap.name
                
                // Only return results where a chapter was matched
                WITH node, score, chap
                WHERE chap IS NOT NULL
                
                RETURN node.text AS chunkText, score
                ORDER BY score DESC
                LIMIT $topK
            """

            parameters = {
                "indexName": "chunkVectorIndex",
                "topK": 3,
                "queryVector": await get_embedding_async(query_text),
                "chapter_name": chapter_try
            }

            try:
                records = await asyncio.to_thread(
                    _run_neo4j_query_sync, neo4j_driver, vector_search_query, parameters, NEO4J_DATABASE
                )

                if records:
                    logger.info(
                        f"KG match found using chapter name: {chapter_try}")
                    context_parts = [
                        f"Retrieved relevant context snippets for '{query_text}':"]

                    for i, record in enumerate(records):
                        text = record.get("chunkText")
                        score = record.get("score", 0.0)
                        if text:
                            truncated = text[:600] + \
                                ('...' if len(text) > 600 else '')
                            context_parts.append(
                                f"- (Similarity: {score:.3f}) {truncated}")

                    if len(context_parts) > 1:
                        kg_context = "\n".join(context_parts)
                        kg_used = True
                        logger.info(
                            f"KG context successfully retrieved with {len(records)} chunks")
                        break  # Exit loop if successful

            except Exception as e:
                logger.error(
                    f"Error during KG search with '{chapter_try}': {e}", exc_info=True)

        # If still no context found, try a plain text search
        if not kg_used:
            try:
                topic_part = final_topic_name.split(
                    '-')[-1].replace('_', ' ').strip()
                fallback_query = """
                MATCH (c:Chapter)
                WHERE c.name CONTAINS $search_term OR $search_term CONTAINS c.name
                MATCH (c)<-[:PART_OF]-(chunk:Chunk)
                RETURN chunk.text AS chunkText
                LIMIT 3
                """
                fallback_params = {"search_term": topic_part}

                logger.info(
                    f"Attempting fallback text search for '{topic_part}'")
                fallback_records = await asyncio.to_thread(
                    _run_neo4j_query_sync, neo4j_driver, fallback_query, fallback_params, NEO4J_DATABASE
                )

                if fallback_records:
                    context_parts = [
                        f"Retrieved relevant context for '{query_text}' (text match):"]
                    for record in fallback_records:
                        text = record.get("chunkText")
                        if text:
                            truncated = text[:600] + \
                                ('...' if len(text) > 600 else '')
                            context_parts.append(f"- {truncated}")

                    if len(context_parts) > 1:
                        kg_context = "\n".join(context_parts)
                        kg_used = True
                        logger.info(
                            f"KG context retrieved via text fallback with {len(fallback_records)} chunks")
                else:
                    logger.info(
                        f"No context found via fallback search for '{topic_part}'")
            except Exception as e:
                logger.error(
                    f"Error during fallback search: {e}", exc_info=True)
    else:
        logger.debug(
            f"User {user_id}: Skipping RAG retrieval (use_rag={use_rag}, query='{query_text}', topic='{final_topic_name}').")

    kg_section = ""
    if kg_context:
        kg_section = prompt_manager.format_prompt(
            "kg_context_section",
            topic=final_topic_name.split('-')[-1].replace('_', ' '),
            context=kg_context
        )

    content_specific_template = f"content_generation_{request.content_type}"
    if prompt_manager.get_template(content_specific_template):
        # Format with specific template
        scaffolding_desc = {ScaffoldingLevel.NONE: "Standard content.", ScaffoldingLevel.HINTS: "Include subtle hints.",
                            ScaffoldingLevel.GUIDANCE: "Provide explicit step-by-step guidance/examples."}.get(
            scaffolding_choice, "Standard content.")

        fb_choice_name = getattr(feedback_choice, 'name', 'ELABORATED').upper()
        feedback_instr = {"CORRECTIVE": "Correct Answer: [Answer]", "HINT": "Correct Answer: [Answer]\\nHint: [Hint]",
                          "ELABORATED": "Correct Answer: [Answer]\\nExplanation: [Explanation]", "SOCRATIC": "Correct Answer: [Answer]\\nGuiding Question: [Question]"}.get(
            fb_choice_name, "Correct Answer: [Answer]\\nExplanation: [Explanation]")

        content_specific_instructions = prompt_manager.format_prompt(
            content_specific_template,
            length_desc=length_choice.name.lower(),
            strategy_name=strategy.name.replace('_', ' ').capitalize(),
            learning_style=max(student_profile.learning_style_preferences.items(), key=lambda i: i[1])[
                0].capitalize() if student_profile.learning_style_preferences else "Balanced",
            scaffolding_level=scaffolding_choice.name,
            scaffolding_desc=scaffolding_desc,
            difficulty_desc=difficulty_choice.name.lower(),
            feedback_instr=feedback_instr
        )
    else:
        # Fallback to basic instructions
        content_specific_instructions = f"Generate {request.content_type} content about {final_topic_name}"

    prompt = prompt_manager.format_prompt(
        "content_generation_base",
        grade=student_profile.grade,
        kg_section=kg_section,
        content_type=request.content_type,
        specific_topic=final_topic_name.split('-')[-1].replace('_', ' '),
        subject=final_topic_name.split(
            '-')[0].replace('_', ' ') if '-' in final_topic_name else "General",
        strategy_name=strategy.name.replace('_', ' ').capitalize(),
        difficulty_desc=difficulty_choice.name.lower(),
        effective_difficulty=eff_diff,
        length_desc=length_choice.name.lower(),
        scaffolding_level=scaffolding_choice.name,
        feedback_style=getattr(feedback_choice, 'name', 'ELABORATED').upper(),
        content_type_cap=request.content_type.capitalize(),
        learning_style=max(student_profile.learning_style_preferences.items(), key=lambda i: i[1])[
            0].capitalize() if student_profile.learning_style_preferences else "Balanced",
        mastery_desc="new/struggling" if mastery < 0.3 else "developing" if mastery < 0.7 else "familiar",
        mastery=mastery,
        content_specific_instructions=content_specific_instructions
    )

    subject = final_topic_name.split(
        '-')[0].replace('_', ' ') if '-' in final_topic_name else "General"
    metadata = InteractionMetadata(
        strategy=strategy.name, topic=final_topic_name, difficulty_choice=difficulty_choice.name,
        scaffolding_choice=scaffolding_choice.name, feedback_choice=feedback_choice.name,
        length_choice=length_choice.name, subject=subject, content_type=request.content_type,
        difficulty_level_desc=diff_desc, mastery_at_request=mastery,
        effective_difficulty_value=eff_diff, prereq_satisfaction=prereq, kg_context_used=kg_used)
    update_student_state_history(
        student_state, final_topic_name, strategy.name, topic_map)
    interaction_log = metadata.model_dump()
    interaction_log["timestamp_utc"] = session.last_active.isoformat()
    session.learning_path.append(interaction_log)

    await save_student_session_mongo(session)

    proc_time = (time.monotonic() - start_time) * 1000
    logger.info(
        f"User {user_id}: Streaming '{request.content_type}' for '{final_topic_name}'. KG Used: {kg_used}. Prep time: {proc_time:.2f}ms")
    # stream_generator = stream_llm_response(prompt, OLLAMA_MODEL, request.config)
    stream_generator = stream_llm_response(
        prompt, TOGETHER_MODEL, request.config)
    headers = {f"X-{k.replace('_', '-').title()}": str(v)
               for k, v in metadata.model_dump(exclude={'interaction_id'}).items() if v is not None}
    headers["X-Interaction-Id"] = metadata.interaction_id
    return StreamingResponse(stream_generator, media_type="application/x-ndjson; charset=utf-8", headers=headers)


async def response_processor(response_text):
    """Process response after streaming"""
    validation_result = response_validator.validate_content_response(
        response_text)
    if "error" in validation_result:
        logger.error(
            f"Response validation error: {validation_result['error']}")

    # Return the validated/fixed content
    return validation_result["content"]


@app.post("/feedback/submit", status_code=status.HTTP_202_ACCEPTED)
async def submit_feedback(
        feedback_data: SessionFeedback, user_id: str = Depends(get_user_id_from_proxy)):
    start_time = time.monotonic()
    logger.info(
        f"User {user_id}: /feedback/submit - ID: {feedback_data.interaction_id}")
    if learning_db is None:
        raise HTTPException(status_code=503, detail="DB unavailable")
    session = await get_student_session_mongo(user_id)
    if not session:
        raise HTTPException(status_code=404, detail="User session not found.")
    now_utc = datetime.now(timezone.utc)
    session.last_active = now_utc
    student_state = session.state
    try:
        idx = -1
        log = None
        for i, l in enumerate(reversed(session.learning_path)):
            if isinstance(l, dict) and l.get("interaction_id") == feedback_data.interaction_id:
                log = l
                idx = len(session.learning_path)-1-i
                break
        topic = log.get("topic") if log else None
        m_before = student_state.mastery.get(topic, 0.) if topic else 0.
        m_new = m_before
        gain = 0.
        if topic:
            rate = 0.15
            max_g = max(0.05, (1.-m_before))
            score = 0.5
            if feedback_data.assessment_score is not None:
                norm = feedback_data.assessment_score/100.
                score = norm
                gain = rate*1.5*norm*max_g
                if norm < 0.5:
                    gain -= rate*0.3*(0.5-norm)
                student_state.recent_performance = np.clip(
                    0.6*student_state.recent_performance+0.4*norm, 0., 1.)
            elif feedback_data.completion_percentage is not None:
                norm = feedback_data.completion_percentage/100.
                score = norm*0.8
                gain = rate*0.5*norm*max_g
            mod = 1.
            if feedback_data.helpful_rating is not None:
                norm = (feedback_data.helpful_rating-1)/4.
                mod = 0.8+(0.4*norm)
            gain *= mod
            m_new = np.clip(m_before+gain, 0., 1.)
            student_state.mastery[topic] = m_new
            logger.info(
                f"User {user_id}, Topic '{topic}': Mastery {m_before:.3f}->{m_new:.3f} (Gain:{gain:.4f})")
        else:
            logger.warning(
                f"User {user_id}: Cannot update mastery for {feedback_data.interaction_id}, topic unknown.")
        if feedback_data.engagement_rating is not None:
            norm = (feedback_data.engagement_rating-1)/4.
            student_state.engagement = np.clip(
                0.7*student_state.engagement+0.3*norm, 0.1, 0.95)
        mot_chg = 0.
        if gain > 0.01:
            mot_chg += 0.02
        if gain > 0.05:
            mot_chg += 0.03
        if feedback_data.helpful_rating is not None:
            mot_chg += (feedback_data.helpful_rating-3)*0.015
        if feedback_data.assessment_score is not None and feedback_data.assessment_score < 40:
            mot_chg -= 0.03
        student_state.motivation = np.clip(
            student_state.motivation+mot_chg, 0.1, 0.95)
        if idx != -1:
            details = feedback_data.model_dump()
            details["feedback_received_utc"] = now_utc.isoformat()
            details["mastery_after_feedback"] = m_new
            details["mastery_gain_from_feedback"] = gain
            session.learning_path[idx].update(details)
        if feedback_data.assessment_score and feedback_data.assessment_score < 50:
            misconception_strength = (
                50 - feedback_data.assessment_score) / 50 * 0.7
            student_state.misconceptions[topic] = max(
                student_state.misconceptions.get(topic, 0.0),
                misconception_strength
            )
        else:
            logger.warning(
                f"User {user_id}: Could not log feedback details for {feedback_data.interaction_id}.")
        await save_student_session_mongo(session)
        proc_time = (time.monotonic()-start_time)*1000
        logger.info(
            f"User {user_id}: Feedback processed {feedback_data.interaction_id}. Time: {proc_time:.2f}ms")
        return {"status": "success", "message": "Feedback processed."}
    except Exception as e:
        logger.error(f"Feedback error user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail="Feedback processing failed.")


@app.get("/healthcheck")
async def healthcheck():
    """Provides health status of the API and its dependencies."""
    deps = {"ollama": "unavailable", "together": "unavailable", "mongodb": "unavailable", "neo4j": "unavailable",
            "rl_model": "unavailable", "mistral_embed": "unavailable"}
    if ollama_client:
        try:
            await ollama_client.list()
            deps["ollama"] = "ok"
        except Exception:
            pass
    if mongo_client is not None and learning_db is not None:
        try:
            await mongo_client.admin.command('ping')
            deps["mongodb"] = "ok"
        except Exception:
            pass
    if neo4j_driver:
        try:
            await asyncio.to_thread(neo4j_driver.verify_connectivity)
            deps["neo4j"] = "ok"
        except Exception:
            pass
    if mistral_client and embedding_client:
        try:
            await get_embedding_async("hc")
            deps["mistral_embed"] = "ok"
        except Exception:
            logger.warning("HC: Mistral embedding call failed.")
            pass
    elif not mistral_client:
        deps["mistral_embed"] = "client_init_failed"
    else:
        deps["mistral_embed"] = "config_missing"

    if together_client:
        try:
            connection_valid = await together_client.test_connection()
            deps["together"] = "ok" if connection_valid else "auth_error"
        except Exception:
            deps["together"] = "error"

    if SB3_AVAILABLE and rl_system and rl_system.model:
        deps["rl_model"] = "loaded"
    elif SB3_AVAILABLE and not rl_system:
        deps["rl_model"] = "load_failed"
    elif not SB3_AVAILABLE:
        deps["rl_model"] = "sb3_unavailable"
    else:
        deps["rl_model"] = "config_missing"

    rl_info = {}
    if rl_system and rl_system.unwrapped_env:
        try:
            rl_info = {"num_topics": getattr(rl_system.unwrapped_env, 'num_topics', 'N/A'),
                       "num_strategies": NUM_STRATEGIES, "model_path": RL_MODEL_PATH or "N/A"}
        except Exception:
            pass

    is_healthy = all(s == "ok" for s in [deps["mongodb"], deps["ollama"]])
    api_status = "healthy" if is_healthy else "unhealthy"

    return {"status": api_status, "timestamp_utc": datetime.now(timezone.utc).isoformat(), "version": API_VERSION, "dependencies": deps, "rl_info": rl_info}


@app.get("/analytics/student/{student_id}")
async def get_student_analytics(student_id: str):
    session = await get_student_session_mongo(student_id)

    topic_velocities = {}
    for topic, mastery in session.state.mastery.items():
        attempts = session.state.topic_attempts.get(topic, 1)
        topic_velocities[topic] = mastery / attempts

    strategy_effects = {}

    return {
        "mastery_by_topic": session.state.mastery,
        "learning_velocity": topic_velocities,
        "effective_strategies": strategy_effects
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server for Adaptive Content API...")
    if not all([MONGO_URL, MONGO_DB_NAME, OLLAMA_HOST, MISTRAL_API_KEY, EMBEDDING_MODEL_NAME, isinstance(EMBEDDING_DIMENSION, int)]):
        logger.critical(
            "CRITICAL: One or more essential env vars missing or invalid (Mongo, Ollama, Mistral API Key, Embedding Config). Check .env.")
    if not all([NEO4J_URI, NEO4J_PASSWORD]):
        logger.warning("Neo4j env vars not set. Graph RAG disabled.")
    if SB3_AVAILABLE and not RL_MODEL_PATH:
        logger.warning("SB3 available but RL_MODEL_PATH not set. RL disabled.")
    if not INTERNAL_API_SECRET:
        logger.warning(
            "INTERNAL_API_SECRET not set. Proxy requests unverified (INSECURE).")

    uvicorn.run(
        "adaptive_content_routes_v3:app",
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", 8000)),
        reload=True,
        log_level=LOG_LEVEL.lower()
    )
