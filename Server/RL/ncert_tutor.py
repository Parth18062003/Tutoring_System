import numpy as np
import gymnasium as gym
from gymnasium import spaces
from stable_baselines3 import PPO
from stable_baselines3.common.env_checker import check_env
from stable_baselines3.common.monitor import Monitor
from stable_baselines3.common.vec_env import DummyVecEnv, SubprocVecEnv
from stable_baselines3.common.callbacks import EvalCallback, CheckpointCallback

import matplotlib.pyplot as plt
from typing import List, Optional, Any, Tuple, Dict
import os
from enum import Enum

# --- Configuration ---
DEBUG_MODE = False  # Set to True for verbose step-by-step logging
LEARNING_ACCELERATION = 2.0  # Global multiplier for base learning rate

# --- Curriculum Definition --- #


class NCERT_CURRICULUM:
    SUBJECTS = {
        "Science": [
            "Food: Where Does It Come From?",
            "Components of Food",
            "Fibre to Fabric",
            "Sorting Materials into Groups",
            "Separation of Substances",
            "Changes Around Us",
            "Getting to Know Plants",
            "Body Movements",
            "The Living Organisms and Their Surroundings",
            "Motion and Measurement of Distances",
            "Light, Shadows and Reflection",
            "Electricity and Circuits",
            "Fun with Magnets",
            "Water",
            "Air Around Us",
            "Garbage In, Garbage Out"
        ],
        "Mathematics": [
            "Knowing Our Numbers",
            "Whole Numbers",
            "Playing with Numbers",
            "Basic Geometrical Ideas",
            "Understanding Elementary Shapes",
            "Integers",
            "Fractions",
            "Decimals",
            "Data Handling",
            "Mensuration",
            "Algebra",
            "Ratio and Proportion",
            "Symmetry",
            "Practical Geometry"
        ],
        "Social_Science": {
            "History": [
                "What, Where, How and When?",
                "On the Trail of the Earliest People",
                "From Gathering to Growing Food",
                "In the Earliest Cities",
                "What Books and Burials Tell Us",
                "Kingdoms, Kings and an Early Republic",
                "New Questions and Ideas",
                "Ashoka, the Emperor Who Gave Up War",
                "Vital Villages, Thriving Towns",
                "Tribes, Nomads and Settled Communities"
            ],
            "Geography": [
                "The Earth in the Solar System",
                "Globe: Latitudes and Longitudes",
                "Motion of the Earth",
                "Maps",
                "Major Domains of the Earth",
                "Major Landforms of the Earth",
                "Our Country – India",
                "India: Climate, Vegetation and Wildlife"
            ],
            "Civics": [
                "Understanding Diversity",
                "Diversity and Discrimination",
                "What is Government?",
                "Key Elements of a Democratic Government",
                "Panchayati Raj",
                "Rural Administration",
                "Urban Administration",
                "Disaster Management",
                "The Constitution"
            ]
        }
    }

    # Difficulty estimates for each topic (1-10 scale)
    TOPIC_DIFFICULTY = {
        "Science": {
            "Food: Where Does It Come From?": 3,
            "Components of Food": 4,
            "Fibre to Fabric": 4,
            "Sorting Materials into Groups": 3,
            "Separation of Substances": 5,
            "Changes Around Us": 4,
            "Getting to Know Plants": 5,
            "Body Movements": 4,
            "The Living Organisms and Their Surroundings": 5,
            "Motion and Measurement of Distances": 6,
            "Light, Shadows and Reflection": 6,
            "Electricity and Circuits": 7,
            "Fun with Magnets": 5,
            "Water": 4,
            "Air Around Us": 4,
            "Garbage In, Garbage Out": 3
        },
        "Mathematics": {
            "Knowing Our Numbers": 3,
            "Whole Numbers": 4,
            "Playing with Numbers": 5,
            "Basic Geometrical Ideas": 4,
            "Understanding Elementary Shapes": 5,
            "Integers": 6,
            "Fractions": 7,
            "Decimals": 6,
            "Data Handling": 5,
            "Mensuration": 7,
            "Algebra": 8,
            "Ratio and Proportion": 7,
            "Symmetry": 5,
            "Practical Geometry": 6
        },
        "Social_Science": {
            "History": {
                "What, Where, How and When?": 3,
                "On the Trail of the Earliest People": 4,
                "From Gathering to Growing Food": 5,
                "In the Earliest Cities": 5,
                "What Books and Burials Tell Us": 5,
                "Kingdoms, Kings and an Early Republic": 6,
                "New Questions and Ideas": 6,
                "Ashoka, the Emperor Who Gave Up War": 7,
                "Vital Villages, Thriving Towns": 6,
                "Tribes, Nomads and Settled Communities": 5
            },
            "Geography": {
                "The Earth in the Solar System": 4,
                "Globe: Latitudes and Longitudes": 5,
                "Motion of the Earth": 5,
                "Maps": 4,
                "Major Domains of the Earth": 6,
                "Major Landforms of the Earth": 5,
                "Our Country – India": 6,
                "India: Climate, Vegetation and Wildlife": 7
            },
            "Civics": {
                "Understanding Diversity": 4,
                "Diversity and Discrimination": 5,
                "What is Government?": 4,
                "Key Elements of a Democratic Government": 5,
                "Panchayati Raj": 6,
                "Rural Administration": 5,
                "Urban Administration": 5,
                "Disaster Management": 6,
                "The Constitution": 7
            }
        }
    }

    # Define prerequisites between topics
    PREREQUISITES = {
        ("Science", "Components of Food"): [("Science", "Food: Where Does It Come From?")],
        ("Science", "Separation of Substances"): [("Science", "Sorting Materials into Groups")],
        ("Science", "Light, Shadows and Reflection"): [("Science", "Getting to Know Plants")],
        ("Science", "Electricity and Circuits"): [("Science", "Changes Around Us")],
        ("Mathematics", "Whole Numbers"): [("Mathematics", "Knowing Our Numbers")],
        ("Mathematics", "Playing with Numbers"): [("Mathematics", "Whole Numbers")],
        ("Mathematics", "Integers"): [("Mathematics", "Whole Numbers")],
        ("Mathematics", "Fractions"): [("Mathematics", "Whole Numbers")],
        ("Mathematics", "Decimals"): [("Mathematics", "Fractions")],
        ("Mathematics", "Ratio and Proportion"): [("Mathematics", "Fractions")],
        ("Mathematics", "Algebra"): [("Mathematics", "Integers"), ("Mathematics", "Playing with Numbers")],
        ("Social_Science-History", "On the Trail of the Earliest People"): [("Social_Science-History", "What, Where, How and When?")],
        ("Social_Science-Geography", "Globe: Latitudes and Longitudes"): [("Social_Science-Geography", "The Earth in the Solar System")]
    }


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
    SPACED_REVIEW = 8  # Adjusted index


NUM_STRATEGIES = len(TeachingStrategies)  # Now 9


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
# --- End Enums ---


# Training phases for hyperparameter scheduling (Curriculum Learning)
training_phases = [
    # Phase 1: High Exploration, Focus on Basic Learning
    {'timesteps': 1_500_000, 'learning_rate': 3e-4, 'ent_coef': 0.015},
    # Phase 2: Reduced Exploration, Refine Policy
    {'timesteps': 2_000_000, 'learning_rate': 1e-4, 'ent_coef': 0.005},
    # Phase 3: Fine-tuning, Low LR, Low Entropy
    {'timesteps': 1_500_000, 'learning_rate': 5e-5, 'ent_coef': 0.002},
]
TOTAL_TRAINING_STEPS = sum(p['timesteps'] for p in training_phases)


class NCERTStudentEnv(gym.Env):
    metadata = {'render_modes': ['human']}

    def __init__(self, num_students=10, max_steps=250, curriculum=NCERT_CURRICULUM):  # Increased max_steps
        super(NCERTStudentEnv, self).__init__()
        self.curriculum = curriculum
        self._initialize_curriculum()
        self._build_curriculum_graph()
        self.max_steps = max_steps
        self.num_students = num_students
        # Action Space definition (kept as before)
        self.action_space = spaces.MultiDiscrete([
            NUM_STRATEGIES, self.num_topics, len(DifficultyLevel),
            len(ScaffoldingLevel), len(FeedbackType), len(ContentLength)
        ])
        # Observation Space definition (kept as before)
        self.observation_space = spaces.Dict({
            'mastery': spaces.Box(low=0, high=1, shape=(self.num_topics,), dtype=np.float32),
            'engagement': spaces.Box(low=0, high=1, shape=(1,), dtype=np.float32),
            'attention': spaces.Box(low=0, high=1, shape=(1,), dtype=np.float32),
            'cognitive_load': spaces.Box(low=0, high=1, shape=(1,), dtype=np.float32),
            'motivation': spaces.Box(low=0, high=1, shape=(1,), dtype=np.float32),
            'learning_style_prefs': spaces.Box(low=0, high=1, shape=(len(LearningStyles),), dtype=np.float32),
            'strategy_history': spaces.Box(low=0, high=1, shape=(NUM_STRATEGIES,), dtype=np.float32),
            'topic_attempts': spaces.Box(low=0, high=100, shape=(self.num_topics,), dtype=np.float32),
            'time_since_last_practiced': spaces.Box(low=0, high=max_steps*2, shape=(self.num_topics,), dtype=np.float32),
            'misconceptions': spaces.Box(low=0, high=1, shape=(self.num_topics,), dtype=np.float32),
            'current_topic_idx': spaces.Discrete(self.num_topics + 1),
            'recent_performance': spaces.Box(low=0, high=1, shape=(1,), dtype=np.float32),
            'steps_on_current_topic': spaces.Box(low=0, high=max_steps, shape=(1,), dtype=np.float32),
        })
        self.student_profiles = self._create_student_profiles(num_students)
        self.current_student: Dict[str, Any] | None = None
        self.current_step = 0
        self.history: List[Dict] = []
        self.episode_metrics: Dict = {}  # To store metrics collected at end

    def _debug_print(self, *args, **kwargs):
        if DEBUG_MODE:
            print(*args, **kwargs)

    def _initialize_curriculum(self):
        # (Implementation as before)
        self.topics = []
        topic_base_difficulty_map = {}
        for subject, content in self.curriculum.SUBJECTS.items():
            if isinstance(content, list):
                for topic in content:
                    full_name = f"{subject}-{topic}"
                    self.topics.append(full_name)
                    difficulty = self.curriculum.TOPIC_DIFFICULTY.get(
                        subject, {}).get(topic, 5.0)
                    topic_base_difficulty_map[full_name] = np.clip(
                        difficulty / 10.0, 0.1, 0.9)
            else:
                for subsubject, subtopics in content.items():
                    for topic in subtopics:
                        full_name = f"{subject}-{subsubject}-{topic}"
                        self.topics.append(full_name)
                        difficulty = self.curriculum.TOPIC_DIFFICULTY.get(
                            subject, {}).get(subsubject, {}).get(topic, 5.0)
                        topic_base_difficulty_map[full_name] = np.clip(
                            difficulty / 10.0, 0.1, 0.9)
        self.num_topics = len(self.topics)
        if self.num_topics == 0:
            raise ValueError("No topics found.")
        self.topic_to_idx = {topic: idx for idx,
                             topic in enumerate(self.topics)}
        self.topic_base_difficulty = np.array(
            [topic_base_difficulty_map[topic] for topic in self.topics], dtype=np.float32)

    def _build_curriculum_graph(self):
        # (Implementation as before)
        self.prerequisite_matrix = np.zeros(
            (self.num_topics, self.num_topics), dtype=np.float32)
        if not hasattr(self.curriculum, 'PREREQUISITES') or not self.curriculum.PREREQUISITES:
            return
        for target_tuple, prereq_list in self.curriculum.PREREQUISITES.items():
            target_key = "-".join(map(str, target_tuple)
                                  ) if isinstance(target_tuple, tuple) else str(target_tuple)
            if target_key in self.topic_to_idx:
                target_idx = self.topic_to_idx[target_key]
                for prereq_tuple in prereq_list:
                    prereq_key = "-".join(map(str, prereq_tuple)) if isinstance(
                        prereq_tuple, tuple) else str(prereq_tuple)
                    if prereq_key in self.topic_to_idx:
                        prereq_idx = self.topic_to_idx[prereq_key]
                        self.prerequisite_matrix[target_idx, prereq_idx] = 1.0

    def _create_student_profiles(self, num_students):
        # (Using previously refined profile creation)
        profiles = []
        for _ in range(num_students):
            profile = {
                # Apply global acceleration
                'base_learning_rate': np.random.uniform(0.08, 0.30) * LEARNING_ACCELERATION,
                'subject_aptitudes': {'Science': np.random.uniform(0.8, 1.2), 'Mathematics': np.random.uniform(0.7, 1.3), 'Social_Science': np.random.uniform(0.8, 1.2)},
                'forgetting_rate': np.random.uniform(0.005, 0.03),
                'memory_strength_factor': np.random.uniform(0.5, 0.9),
                'attention_span': np.random.uniform(0.7, 1.0),
                # Slower decay
                'attention_decay': np.random.uniform(0.97, 0.998),
                'engagement_factors': {'interest_boost': np.random.uniform(0.05, 0.15), 'success_boost': np.random.uniform(0.05, 0.15), 'failure_penalty': np.random.uniform(0.1, 0.25), 'variety_seeking': np.random.uniform(0.0, 0.1), 'challenge_seeking': np.random.uniform(-0.05, 0.1)},
                'cognitive_traits': {'working_memory': np.random.uniform(0.6, 1.0), 'processing_speed': np.random.uniform(0.7, 1.1)},
                'learning_style_prefs': np.random.dirichlet([1.5] * len(LearningStyles)),
                # Higher persistence & intrinsic start
                'motivation_factors': {'intrinsic': np.random.uniform(0.5, 0.95), 'extrinsic_sensitivity': np.random.uniform(0.3, 0.8), 'persistence': np.random.uniform(0.98, 0.998), 'mastery_goal_orientation': np.random.uniform(0.3, 0.7)},
                'misconception_propensity': np.random.uniform(0.03, 0.15),
                'scaffolding_benefit': np.random.uniform(0.1, 0.4),
                'feedback_sensitivity': np.random.uniform(0.8, 1.2),
            }
            profiles.append(profile)
        return profiles

    def _initialize_student_state(self, profile_idx=None):
        # (Using previously refined initialization)
        if profile_idx is None:
            profile_idx = np.random.randint(len(self.student_profiles))
        profile = self.student_profiles[profile_idx]
        student = {
            'profile_idx': profile_idx, 'profile': profile,
            'mastery': np.random.uniform(0.01, 0.15, size=self.num_topics).astype(np.float32),
            'engagement': np.array([np.random.uniform(0.6, 0.9)], dtype=np.float32),
            'attention': np.array([profile['attention_span']], dtype=np.float32),
            'cognitive_load': np.array([np.random.uniform(0.2, 0.4)], dtype=np.float32),
            'motivation': np.array([profile['motivation_factors']['intrinsic']], dtype=np.float32),
            'learning_style_prefs': profile['learning_style_prefs'].astype(np.float32),
            'strategy_history': np.zeros(NUM_STRATEGIES, dtype=np.float32),
            'topic_attempts': np.zeros(self.num_topics, dtype=np.float32),
            'time_since_last_practiced': np.full(self.num_topics, self.max_steps / 5.0, dtype=np.float32),
            'misconceptions': np.zeros(self.num_topics, dtype=np.float32),
            'current_topic_idx': self.num_topics,
            'recent_performance': np.array([0.5], dtype=np.float32),
            'steps_on_current_topic': np.array([0], dtype=np.float32),
            'internal_history': [],
            'last_avg_mastery': 0.0  # Initialize for reward calc
        }
        return student

    def _get_obs(self):
        # (Implementation as before)
        if self.current_student is None:
            raise RuntimeError("Reset env first.")
        obs = {
            'mastery': self.current_student['mastery'], 'engagement': self.current_student['engagement'],
            'attention': self.current_student['attention'], 'cognitive_load': self.current_student['cognitive_load'],
            'motivation': self.current_student['motivation'], 'learning_style_prefs': self.current_student['learning_style_prefs'],
            'strategy_history': self.current_student['strategy_history'], 'topic_attempts': self.current_student['topic_attempts'],
            'time_since_last_practiced': self.current_student['time_since_last_practiced'], 'misconceptions': self.current_student['misconceptions'],
            'current_topic_idx': self.current_student['current_topic_idx'], 'recent_performance': self.current_student['recent_performance'],
            'steps_on_current_topic': self.current_student['steps_on_current_topic'],
        }
        return obs

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        profile_idx = options.get('profile_idx') if options else None
        self.current_student = self._initialize_student_state(profile_idx)
        self.current_step = 0
        self.history = []
        self.episode_metrics = {}  # Reset episode metrics
        return self._get_obs(), {}

    def step(self, action: np.ndarray):
        if self.current_student is None:
            raise ValueError("Reset env first.")

        action_int = action.astype(int)
        strategy_idx, topic_idx, difficulty_idx, scaffold_idx, feedback_idx, length_idx = action_int

        # --- Heuristic Topic Override (Keep but maybe reduce probability later) ---
        topic_priorities = self._calculate_topic_priority()
        override_prob = 0.30  # Slightly lower probability
        if topic_priorities.size > topic_idx and topic_priorities[topic_idx] < 0.3 and np.random.random() < override_prob:
            high_priority_topics = np.where(topic_priorities > 0.6)[0]
            if len(high_priority_topics) > 0:
                new_topic_idx = np.random.choice(high_priority_topics)
                self._debug_print(
                    f"Override topic {topic_idx} (prio {topic_priorities[topic_idx]:.2f}) with {new_topic_idx} (prio {topic_priorities[new_topic_idx]:.2f})")
                topic_idx = new_topic_idx

        topic_idx = np.clip(topic_idx, 0, self.num_topics - 1)

        # Unpack actions
        strategy = TeachingStrategies(strategy_idx)
        difficulty_action = DifficultyLevel(difficulty_idx)
        scaffolding_action = ScaffoldingLevel(scaffold_idx)
        feedback_action = FeedbackType(feedback_idx)
        length_action = ContentLength(length_idx)

        profile = self.current_student['profile']
        prev_mastery = self.current_student['mastery'][topic_idx]
        prev_cog_load = self.current_student['cognitive_load'][0]
        prev_attention = self.current_student['attention'][0]
        prev_engagement = self.current_student['engagement'][0]
        prev_motivation = self.current_student['motivation'][0]
        current_misconception = self.current_student['misconceptions'][topic_idx]

        # --- Update History & Context ---
        self.current_student['strategy_history'] *= 0.85
        self.current_student['strategy_history'][strategy_idx] += 0.15
        self.current_student['topic_attempts'][topic_idx] += 1
        last_topic_idx = self.current_student['current_topic_idx']
        self.current_student['steps_on_current_topic'][0] = self.current_student['steps_on_current_topic'][0] + \
            1 if topic_idx == last_topic_idx else 1
        self.current_student['current_topic_idx'] = topic_idx

        # --- Calculate Factors ---
        prereq_satisfaction = self._calculate_prerequisite_satisfaction(
            topic_idx)
        base_difficulty = self.topic_base_difficulty[topic_idx]
        difficulty_adjustment = {DifficultyLevel.EASIER: -0.2,
                                 DifficultyLevel.NORMAL: 0.0, DifficultyLevel.HARDER: 0.2}[difficulty_action]
        mastery_difficulty_effect = -0.3 * prev_mastery
        effective_difficulty = np.clip(
            base_difficulty + difficulty_adjustment + mastery_difficulty_effect, 0.05, 0.95)
        strategy_style_match = self._calculate_strategy_learning_style_match(
            strategy_idx)
        scaffolding_factor = 1.0
        if scaffolding_action != ScaffoldingLevel.NONE:
            need = np.clip((1.0 - prev_mastery) * effective_difficulty, 0, 1)
            benefit = profile['scaffolding_benefit'] * \
                (1.0 if scaffolding_action == ScaffoldingLevel.GUIDANCE else 0.6)
            scaffolding_factor = 1.0 + benefit * need
        length_factor = {ContentLength.CONCISE: 0.85,
                         ContentLength.STANDARD: 1.0, ContentLength.DETAILED: 1.1}[length_action]

        # --- Update State ---
        # Cog Load (Increased sensitivity, reduced recovery)
        load_increase = effective_difficulty * length_factor * \
            (1.0 - profile['cognitive_traits']
             ['working_memory'] * 0.4)  # Less WM benefit
        load_increase *= (1.0 - profile['scaffolding_benefit']
                          * 0.5 * (scaffolding_factor - 1.0))
        strategy_load_factor = {TeachingStrategies.EXPLANATION: 1.15, TeachingStrategies.PRACTICE: 1.0,
                                # Slightly higher base loads
                                TeachingStrategies.ASSESSMENT: 1.25, TeachingStrategies.EXPLORATION: 0.9}.get(strategy, 1.05)
        load_increase *= strategy_load_factor
        # Further reduced recovery
        natural_recovery = 0.06 * (1.0 - prev_cog_load)
        # Mitigation from high attention/motivation
        load_mitigation = 0.1 * (self.current_student['attention'][0] - 0.5) + 0.05 * (
            self.current_student['motivation'][0] - 0.5)
        final_load_change = load_increase * 0.30 - natural_recovery - \
            max(0, load_mitigation)  # Increased scaling, add mitigation
        # Allow slightly lower min load
        new_cog_load = np.clip(prev_cog_load + final_load_change, 0.05, 0.98)
        self.current_student['cognitive_load'][0] = new_cog_load

        # Attention
        attention_change = 0.0
        strategy_attention_factor = {TeachingStrategies.INTERACTIVE: 0.1, TeachingStrategies.GAMIFICATION: 0.12,
                                     # Slightly nerf explanation
                                     TeachingStrategies.STORYTELLING: 0.08, TeachingStrategies.EXPLANATION: -0.03}.get(strategy, 0.05)
        attention_change += strategy_attention_factor - \
            (length_factor - 1.0) * 0.05 - (new_cog_load - 0.5) * \
            0.15  # Stronger cog load penalty
        new_attention = prev_attention * \
            profile['attention_decay'] + attention_change
        self.current_student['attention'][0] = np.clip(
            new_attention, 0.1, profile['attention_span'])

        # Mastery Gain
        # Already accelerated in profile creation
        base_learn_rate = profile['base_learning_rate']
        subject = self.topics[topic_idx].split('-')[0]
        base_learn_rate *= profile['subject_aptitudes'].get(subject, 1.0)
        learning_efficacy = (
            prereq_satisfaction * strategy_style_match * self.current_student['attention'][0] *
            # Slightly higher floor, reduced cog load impact
            np.clip(1.0 - new_cog_load * 0.7, 0.15, 1.0) *
            self.current_student['motivation'][0]
        )
        max_potential_gain = max(0.001, (1.0 - prev_mastery))
        mastery_gain = base_learn_rate * learning_efficacy * \
            scaffolding_factor * length_factor * max_potential_gain

        # Simulated Performance
        noise = np.random.normal(0, 0.15)
        simulated_performance = np.clip(
            prev_mastery + mastery_gain * 0.8 + noise - effective_difficulty * 0.2, 0.0, 1.0)
        self.current_student['recent_performance'][0] = 0.7 * \
            self.current_student['recent_performance'][0] + \
            0.3 * simulated_performance

        # Misconceptions
        misconception_cleared = False
        misconception_formed = False
        if current_misconception > 0:
            clear_prob = 0.05 + 0.30 * learning_efficacy * \
                profile['feedback_sensitivity']  # Increased base clear prob
            if feedback_action == FeedbackType.ELABORATED:
                clear_prob *= 1.3
            if strategy in [TeachingStrategies.EXPLANATION, TeachingStrategies.DEMONSTRATION]:
                clear_prob *= 1.1
            if np.random.random() < clear_prob:
                reduction = np.random.uniform(
                    0.6, 1.0) * current_misconception  # Higher reduction chance
                self.current_student['misconceptions'][topic_idx] = np.clip(
                    current_misconception - reduction, 0, 1)
                misconception_cleared = True
                mastery_gain *= 1.15  # Slightly larger bonus

        form_risk = profile['misconception_propensity'] * (
            1.0 - prereq_satisfaction + effective_difficulty + (1.0 - simulated_performance)) * (1.0 - prev_mastery)
        if np.random.random() < np.clip(form_risk * 0.15, 0, 0.12) and not misconception_cleared:  # Reduced overall risk slightly
            self.current_student['misconceptions'][topic_idx] = np.random.uniform(
                0.2, 0.6)  # Slightly lower severity
            misconception_formed = True
            mastery_gain *= 0.7  # Less harsh penalty

        # Debug print before clipping gain
        # self._debug_print(f"    DEBUG Pre-Clip Gain: mastery_gain={mastery_gain:.6f}, max_potential_gain={max_potential_gain:.6f}")
        final_mastery_gain = np.clip(mastery_gain, 0, max_potential_gain)
        self.current_student['mastery'][topic_idx] = np.clip(
            prev_mastery + final_mastery_gain, 0, 1)

        # Forgetting (Use Enhanced Version)
        self._apply_enhanced_forgetting(topic_idx)

        # Motivation (Revised Dynamics)
        mot_factors = profile['motivation_factors']
        motivation_change = 0.0
        # Slightly increased intrinsic boost
        intrinsic_boost = 0.015 * mot_factors['intrinsic']
        motivation_change += intrinsic_boost
        # Give direct boost for high mastery gain
        if final_mastery_gain > 0.05:
            # Boost based on goal orientation
            motivation_change += 0.10 * mot_factors['mastery_goal_orientation']

        # Even more weight on gain
        perceived_success = (simulated_performance * 0.4 +
                             final_mastery_gain * 15.0 * 0.6)
        success_threshold = 0.5
        failure_threshold = 0.25
        if perceived_success > success_threshold:
            motivation_change += 0.08 * mot_factors['extrinsic_sensitivity']
        elif perceived_success < failure_threshold:
            # Further reduced penalty
            motivation_change -= 0.04 * \
                (1.0 - mot_factors['mastery_goal_orientation'])
        if misconception_formed:
            motivation_change -= 0.04
        if misconception_cleared:
            motivation_change += 0.08
        persistence_factor = mot_factors.get(
            'persistence', 0.985)  # Ensure high persistence
        new_motivation = prev_motivation * persistence_factor + motivation_change
        self.current_student['motivation'][0] = np.clip(
            new_motivation, 0.20, 0.99)  # Increased lower bound, allow higher max

        # Engagement (Add gain boost)
        eng_factors = profile['engagement_factors']
        engagement_change = 0.01  # Base slight increase
        if final_mastery_gain > 0.05:
            engagement_change += 0.05  # Boost from significant gain
        if perceived_success > 0.6:
            engagement_change += eng_factors['success_boost']
        elif perceived_success < 0.3:
            # Reduced penalty
            engagement_change -= eng_factors['failure_penalty'] * 0.8
        strategy_freq = self.current_student['strategy_history'][strategy_idx]
        engagement_change += eng_factors['variety_seeking'] * \
            (1.0 - strategy_freq) * 0.2
        engagement_change += eng_factors['challenge_seeking'] * \
            (effective_difficulty - 0.5) * 0.1
        engagement_change -= (new_cog_load - 0.4) * \
            0.10  # Reduced cog load penalty
        engagement_change += eng_factors['interest_boost'] * 0.1
        new_engagement = prev_engagement * 0.96 + \
            engagement_change  # Slightly slower decay
        self.current_student['engagement'][0] = np.clip(
            new_engagement, 0.15, 0.98)  # Higher lower bound

        # Time Since Practiced
        self.current_student['time_since_last_practiced'] += 1
        self.current_student['time_since_last_practiced'][topic_idx] = 0

        # --- Calculate Reward (Using complex reward function) ---
        reward = self._calculate_reward(
            final_mastery_gain, prev_mastery,
            effective_difficulty, simulated_performance,
            prereq_satisfaction, strategy_style_match,
            misconception_formed, misconception_cleared,
            # Pass motivation too
            new_cog_load, new_engagement, self.current_student['motivation'][0],
            scaffolding_action, difficulty_action, length_action,
            topic_idx
        )

        # --- Debug Print ---
        if self.current_step % 25 == 0:  # Print less frequently
            self._debug_print(f"--- Step {self.current_step} ---")
            self._debug_print(
                f"  Action: Strat={strategy.name}, Topic={topic_idx}, Diff={difficulty_action.name}, Scaff={scaffolding_action.name}, Len={length_action.name}")
            self._debug_print(
                f"  State In: Prereq={prereq_satisfaction:.2f}, StyleMatch={strategy_style_match:.2f}, Attn={prev_attention:.2f}, CogLd={prev_cog_load:.2f}, Motiv={prev_motivation:.2f}, Mastery={prev_mastery:.3f}")
            self._debug_print(
                f"  Dynamics: EffDiff={effective_difficulty:.2f}, LrnEffic={learning_efficacy:.3f}, ScaffF={scaffolding_factor:.2f}, LenF={length_factor:.2f}")
            self._debug_print(
                f"  Outcome: MasteryGain={final_mastery_gain:.4f}, SimPerf={simulated_performance:.3f}, MisconF={misconception_formed}, MisconC={misconception_cleared}")
            self._debug_print(
                f"  State Out: Attn={self.current_student['attention'][0]:.2f}, CogLd={new_cog_load:.2f}, Motiv={self.current_student['motivation'][0]:.2f}, Eng={new_engagement:.2f}")
            self._debug_print(f"  --> REWARD: {reward:.4f}")

        # --- Termination & Info ---
        self.current_step += 1
        done = False
        truncated = self.current_step >= self.max_steps
        info = {'action': action_int.tolist(), 'mastery_gain': final_mastery_gain, 'sim_performance': simulated_performance, 'engagement': new_engagement, 'cog_load': new_cog_load, 'attention': self.current_student['attention'][
            0], 'motivation': self.current_student['motivation'][0], 'eff_difficulty': effective_difficulty, 'prereq_sat': prereq_satisfaction, 'miscon_formed': misconception_formed, 'miscon_cleared': misconception_cleared, 'reward': reward}
        self.history.append(info)

        # Collect metrics at the end of the episode
        if done or truncated:
            self.episode_metrics = self.collect_episode_metrics()
            # Add to final info dict
            info['episode_metrics'] = self.episode_metrics

        return self._get_obs(), reward, done, truncated, info

    def _calculate_topic_priority(self):
        """Calculate priority scores for each topic (heuristic)."""
        if self.current_student is None:
            return np.zeros(self.num_topics)  # Handle case before reset
        priorities = np.zeros(self.num_topics)
        mastery = self.current_student['mastery']
        time_since = self.current_student['time_since_last_practiced']
        attempts = self.current_student['topic_attempts']

        for i in range(self.num_topics):
            readiness = self._calculate_prerequisite_satisfaction(i)
            # Forgetting risk increases with time and decreases with mastery/attempts
            forgetting_risk = np.clip(
                time_since[i] / (self.max_steps*0.5), 0, 1) * (1 - mastery[i]**0.5) / (1 + attempts[i]*0.1)
            # Learning potential higher if ready and not mastered
            learning_potential = readiness * (1 - mastery[i])
            # Misconception priority
            misconception_factor = 1 + \
                self.current_student['misconceptions'][i] * 0.5

            priorities[i] = (learning_potential * 0.6 +
                             forgetting_risk * 0.3) * misconception_factor
            # Boost topics with low attempts
            if attempts[i] < 2:
                priorities[i] *= 1.2

        # Normalize priorities
        p_sum = np.sum(priorities)
        return priorities / p_sum if p_sum > 0 else np.full(self.num_topics, 1.0/self.num_topics)

    def _calculate_prerequisite_satisfaction(self, topic_idx):
        # (Implementation as before)
        if self.prerequisite_matrix is None or topic_idx >= self.prerequisite_matrix.shape[0]:
            return 1.0
        prereq_indices = np.where(
            self.prerequisite_matrix[topic_idx, :] > 0)[0]
        prereq_indices = prereq_indices[prereq_indices != topic_idx]
        if len(prereq_indices) == 0:
            return 1.0
        # Handle potential index out of bounds if prereq_indices contains invalid values
        valid_indices = prereq_indices[prereq_indices < self.num_topics]
        if len(valid_indices) == 0:
            return 1.0
        masteries = self.current_student['mastery'][valid_indices]
        return np.mean(masteries) if len(masteries) > 0 else 1.0

    def _calculate_strategy_learning_style_match(self, strategy_idx):
        # (Implementation as before)
        style_match_matrix = np.array([[0.6, 0.5, 0.9, 0.2], [0.9, 0.6, 0.5, 0.7], [0.7, 0.5, 0.6, 0.9], [0.6, 0.4, 0.5, 0.9], [
                                      0.5, 0.6, 0.8, 0.5], [0.5, 0.9, 0.6, 0.6], [0.7, 0.9, 0.8, 0.4], [0.8, 0.7, 0.6, 0.9], [0.7, 0.6, 0.8, 0.5]])
        prefs = self.current_student['learning_style_prefs']
        match = np.dot(style_match_matrix[strategy_idx], prefs)
        return max(0.1, match)

    def _apply_enhanced_forgetting(self, current_topic_idx):
        """Ebbinghaus-inspired forgetting curve with repetition effect."""
        profile = self.current_student['profile']
        for i in range(self.num_topics):
            if i == current_topic_idx:
                continue
            m = self.current_student['mastery'][i]
            if m <= 0.01:
                continue

            t = self.current_student['time_since_last_practiced'][i]
            # Consider attempts as repetitions, increasing strength
            # Add 1 to avoid log(0)
            repetitions = self.current_student['topic_attempts'][i] + 1
            # Strength increases logarithmically with repetitions, influenced by base strength factor
            strength = profile['memory_strength_factor'] * \
                np.log1p(repetitions) * 50  # Scaled strength

            # Simplified exponential decay based on time and strength
            # Avoid division by zero, base timescale
            retention_factor = np.exp(-t / max(10, strength))
            target_mastery = m * retention_factor

            # Move current mastery towards target mastery (gradual decay)
            decay_rate = 0.05  # How fast it moves towards target each step
            self.current_student['mastery'][i] = np.clip(
                m - (m - target_mastery) * decay_rate, 0, 1)

    def _calculate_reward(self, mastery_gain, prev_mastery,
                          effective_difficulty, sim_performance,
                          prereq_satisfaction, strategy_style_match,
                          misconception_formed, misconception_cleared,
                          cog_load, engagement, motivation,  # Add motivation here
                          scaffolding_action, difficulty_action, length_action,
                          topic_idx):
        """Refined reward function with state rewards and stronger penalties/bonuses."""
        reward = 0.0

        # --- Core Learning Reward (Increased Weight) ---
        # Primary driver, increased weight
        reward += 50.0 * max(0, mastery_gain)

        # Add progressive mastery bonuses
        if self.current_student['mastery'].mean() > 0.3 and self.current_student['mastery'].mean() > self.current_student.get('last_highest_mastery', 0) + 0.02:
            reward += 10.0  # Big bonus for reaching new mastery milestones
            self.current_student['last_highest_mastery'] = self.current_student['mastery'].mean(
            )

        # --- State Maintenance Rewards ---
        state_reward_factor = 0.15  # Increased weight
        if motivation > 0.6:
            reward += (0.6 * (motivation - 0.6)) * \
                state_reward_factor  # Reward high motivation
        if engagement > 0.6:
            reward += (0.4 * (engagement - 0.6)) * \
                state_reward_factor  # Reward high engagement

        # --- Appropriateness Penalties (No Reduction Factor Anymore) ---
        # Difficulty Match (Zone of Proximal Development)
        # Ideal difficulty target
        target_difficulty = np.clip(0.2 + prev_mastery * 0.5, 0.1, 0.8)
        difficulty_mismatch = abs(effective_difficulty - target_difficulty)
        # Penalize more sharply if far off, less if close
        reward -= 0.8 * (difficulty_mismatch**2)  # Quadratic penalty

        # Scaffolding Appropriateness
        # Adjusted thresholds
        needed_scaffolding = prev_mastery < 0.45 and effective_difficulty > 0.55
        provided_scaffolding = scaffolding_action != ScaffoldingLevel.NONE
        if needed_scaffolding and not provided_scaffolding:
            reward -= 0.5  # Stronger penalty for missing needed scaffold
        elif not needed_scaffolding and provided_scaffolding and scaffolding_action == ScaffoldingLevel.GUIDANCE:
            reward -= 0.25  # Penalize strong scaffolding when not needed

        # Prerequisite Satisfaction
        if prereq_satisfaction < 0.4:  # Stricter threshold
            reward -= 0.6 * (0.4 - prereq_satisfaction)  # Stronger penalty

        # Content Length vs Cognitive Load
        if length_action == ContentLength.DETAILED and cog_load > 0.7:
            reward -= 0.3

        # --- Penalize Working on Mastered Topics ---
        if prev_mastery > 0.95:
            reward -= 0.5  # Discourage selecting already mastered topics

        # --- Misconception Management ---
        if misconception_formed:
            reward -= 2.5  # Increased penalty
        if misconception_cleared:
            reward += 1.5  # Increased reward

        # --- Efficiency / Stagnation Penalty ---
        steps_on_topic = self.current_student['steps_on_current_topic'][0]
        if mastery_gain < 0.005 and prev_mastery < 0.9 and steps_on_topic > 4:
            # Increased stagnation penalty
            reward -= 0.10 * (steps_on_topic - 4)

        # --- Exploration Bonus ---
        attempts = self.current_student['topic_attempts'][topic_idx]
        if attempts < 2:
            # Slightly stronger initial exploration
            reward += 0.2 / (attempts + 1)

        # --- Cognitive Load Penalty ---
        # Penalize sustained high load more
        if cog_load < 0.2:
            reward -= 0.5 * (0.2 - cog_load)  # Penalize too-low cognitive load
        elif cog_load > 0.7:
            # Keep penalizing excessive load
            reward -= 1.2 * (cog_load - 0.7)**2

        # Tiny survival bonus
        reward += 0.001

        self._debug_print(
            f"DEBUG Reward Calc: Gain={mastery_gain:.4f} -> Reward={reward:.4f}")
        return reward

    def render(self, mode='human'):
        # (Implementation as before - minor adjustments for clarity)
        if mode == 'human':
            if not self.current_student:
                print("Env not init.")
                return
            print(f"\n--- Step: {self.current_step} ---")
            idx = self.current_student['current_topic_idx']
            topic = self.topics[idx] if 0 <= idx < self.num_topics else "None"
            print(f"Target Topic: {topic} (Idx: {idx})")
            if self.history:
                info = self.history[-1]
                act = info['action']
                act_desc = f"Strat:{TeachingStrategies(act[0]).name},Topic:{self.topics[act[1]]},Diff:{DifficultyLevel(act[2]).name},Scaf:{ScaffoldingLevel(act[3]).name},Feed:{FeedbackType(act[4]).name},Len:{ContentLength(act[5]).name}"
                print(f"Action: {act_desc}")
                print(f"  Outcome: EffDiff={info['eff_difficulty']:.2f},Prereq={info['prereq_sat']:.2f},Gain={info['mastery_gain']:.3f},SimPerf={info['sim_performance']:.2f},MisconF={info['miscon_formed']},MisconC={info['miscon_cleared']},Rew={info['reward']:.3f}")
            m_val = self.current_student['mastery'][idx] if 0 <= idx < self.num_topics else -1
            att_val = int(
                self.current_student['topic_attempts'][idx]) if 0 <= idx < self.num_topics else -1
            mis_val = self.current_student['misconceptions'][idx] if 0 <= idx < self.num_topics else -1
            print(
                f"State: AvgM={np.mean(self.current_student['mastery']):.3f},Eng={self.current_student['engagement'][0]:.2f},Att={self.current_student['attention'][0]:.2f},CogLd={self.current_student['cognitive_load'][0]:.2f},Mot={self.current_student['motivation'][0]:.2f}")
            print(
                f"  Topic: M={m_val:.3f},Attmpt={att_val},StepsOn={int(self.current_student['steps_on_current_topic'][0])},Miscon={mis_val:.2f}")
        else:
            super().render(mode=mode)

    def collect_episode_metrics(self):
        """Collect detailed metrics at episode end for analysis"""
        if not self.current_student or not self.history:
            return {}  # Return empty if no data

        metrics = {
            'final_avg_mastery': np.mean(self.current_student['mastery']),
            'avg_engagement': np.mean([h.get('engagement', 0) for h in self.history]) if self.history else 0,
            'avg_motivation': np.mean([h.get('motivation', 0) for h in self.history]) if self.history else 0,
            'avg_cog_load': np.mean([h.get('cog_load', 0) for h in self.history]) if self.history else 0,
            # Count non-trivial misconceptions
            'final_misconceptions_count': int(np.sum(self.current_student['misconceptions'] > 0.1)),
            'total_miscon_formed': sum(1 for h in self.history if h.get('miscon_formed')),
            'total_miscon_cleared': sum(1 for h in self.history if h.get('miscon_cleared')),
        }
        return metrics

    def close(self): pass

# --- FlattenObservation Wrapper ---


class FlattenObservation(gym.ObservationWrapper):
    # (Implementation as before - no changes needed here)
    def __init__(self, env: NCERTStudentEnv):
        super().__init__(env)
        self.topics = getattr(env, 'topics', [])
        self.num_topics = getattr(env, 'num_topics', 0)
        self.topic_to_idx = getattr(env, 'topic_to_idx', {})
        self.topic_base_difficulty = getattr(
            env, 'topic_base_difficulty', np.array([]))
        self.prerequisite_matrix = getattr(
            env, 'prerequisite_matrix', np.array([[]]))
        flat_size = 0
        self._component_order = list(env.observation_space.spaces.keys())
        self._component_shapes = {}
        for key in self._component_order:
            space = env.observation_space.spaces[key]
            size = np.prod(space.shape) if isinstance(space, spaces.Box) else 1
            flat_size += int(size)
            self._component_shapes[key] = int(size)
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf, shape=(flat_size,), dtype=np.float32)

    def observation(self, obs: Dict[str, Any]) -> np.ndarray:
        flat_obs_list = []
        for key in self._component_order:
            comp = obs[key]
            if isinstance(comp, np.ndarray):
                flat_obs_list.append(comp.astype(np.float32).flatten())
            elif isinstance(comp, (int, float, np.number)):
                norm_val = float(
                    comp)/float(self.num_topics) if key == 'current_topic_idx' and self.num_topics > 0 else float(comp)
                flat_obs_list.append(np.array(
                    [norm_val] if key == 'current_topic_idx' else [comp], dtype=np.float32))
            else:
                raise TypeError(f"Unexpected type '{key}': {type(comp)}")
        final_obs = np.concatenate(flat_obs_list)
        if final_obs.shape[0] != self.observation_space.shape[0]:
            raise ValueError(
                f"Shape mismatch: Exp {self.observation_space.shape[0]}, Got {final_obs.shape[0]}")
        return final_obs

# --- NCERTLearningSystem ---


class NCERTLearningSystem:
    # (Implementation as before - minor change to eval logging)
    def __init__(self, num_students=20, max_steps=250, log_dir="./ncert_tutor_logs_enhanced", num_cpu=4):
        self.num_students = num_students
        self.max_steps = max_steps
        self.log_dir = log_dir
        self.num_cpu = max(1, num_cpu)
        os.makedirs(log_dir, exist_ok=True)
        os.makedirs(f"{log_dir}/models", exist_ok=True)
        os.makedirs(f"{log_dir}/tensorboard", exist_ok=True)
        # Ensure eval_logs exists
        os.makedirs(f"{log_dir}/eval_logs", exist_ok=True)
        env_fns = [self._make_env(i) for i in range(self.num_cpu)]
        self.vec_env = SubprocVecEnv(
            env_fns) if self.num_cpu > 1 else DummyVecEnv(env_fns)
        print(
            f"Using {'SubprocVecEnv' if self.num_cpu > 1 else 'DummyVecEnv'} with {self.num_cpu} process(es).")
        self.model = None

    def _make_env(self, rank: int, seed: int = 0):
        def _init():
            env = NCERTStudentEnv(
                num_students=self.num_students, max_steps=self.max_steps)
            env = FlattenObservation(env)
            log_file = os.path.join(self.log_dir, f"monitor_{rank}.csv")
            # Add more keys to monitor if needed, especially those used in reward
            env = Monitor(env, log_file, info_keywords=('reward', 'mastery_gain', 'engagement',
                          'cog_load', 'motivation', 'eff_difficulty', 'miscon_formed', 'miscon_cleared'))
            env.reset(seed=seed+rank)
            return env
        return _init

    @property
    def unwrapped_env(self) -> NCERTStudentEnv:
        """Access the base environment, handling both DummyVecEnv and SubprocVecEnv."""
        try:
            # For DummyVecEnv which has direct access to environments
            if hasattr(self.vec_env, 'envs'):
                base_env = self.vec_env.envs[0]
                if isinstance(base_env, Monitor):
                    base_env = base_env.env
                if isinstance(base_env, FlattenObservation):
                    base_env = base_env.env
                return base_env if isinstance(base_env, NCERTStudentEnv) else None
            # For SubprocVecEnv which requires remote access
            elif hasattr(self.vec_env, 'get_attr'):
                # Return a proxy object with key attributes
                class EnvProxy:
                    def __init__(self, vec_env):
                        self.vec_env = vec_env
                        # Cache commonly accessed attributes
                        try:
                            self.num_topics = vec_env.get_attr('num_topics')[0]
                            self.max_steps = vec_env.get_attr('max_steps')[0]
                            self.topics = vec_env.get_attr('topics')[0]
                            self.topic_to_idx = vec_env.get_attr('topic_to_idx')[
                                0]
                            self.topic_base_difficulty = vec_env.get_attr(
                                'topic_base_difficulty')[0]
                            self.prerequisite_matrix = vec_env.get_attr(
                                'prerequisite_matrix')[0]
                        except (IndexError, AttributeError):
                            pass

                    def __getattr__(self, name):
                        try:
                            return self.vec_env.get_attr(name)[0]
                        except (IndexError, AttributeError):
                            return None
                return EnvProxy(self.vec_env)
        except Exception as e:
            print(f"Error accessing environment: {e}")
            return None

    def create_model(self, policy="MlpPolicy", learning_rate=1e-4, gamma=0.99, verbose=1, ent_coef=0.01, **ppo_kwargs):
        # Consider [512, 256] if needed
        default_policy_kwargs = dict(
            net_arch=dict(pi=[256, 256], vf=[256, 256]))
        final_policy_kwargs = {**default_policy_kwargs,
                               **ppo_kwargs.pop('policy_kwargs', {})}
        self.model = PPO(policy, self.vec_env, verbose=verbose, tensorboard_log=f"{self.log_dir}/tensorboard/", learning_rate=learning_rate, gamma=gamma,
                         n_steps=2048, batch_size=64, n_epochs=15, gae_lambda=0.95, clip_range=0.2, ent_coef=ent_coef, policy_kwargs=final_policy_kwargs, **ppo_kwargs)
        print(f"PPO Model Created. LR={learning_rate}, EntCoef={ent_coef}")
        return self.model

    def train_model(self, total_timesteps=2_000_000, eval_freq=50000, save_freq=200000, n_eval_episodes=20):
        if self.model is None:
            self.create_model()
        # Ensure eval log directory exists
        eval_log_path = f"{self.log_dir}/eval_logs"
        os.makedirs(eval_log_path, exist_ok=True)
        # Use distinct rank for eval monitor
        eval_env = self._make_env(rank=999)()
        eval_callback = EvalCallback(eval_env, best_model_save_path=f"{self.log_dir}/models/best", log_path=eval_log_path, eval_freq=max(
            eval_freq//self.num_cpu, 1), n_eval_episodes=n_eval_episodes, deterministic=True, render=False)
        checkpoint_callback = CheckpointCallback(save_freq=max(
            save_freq//self.num_cpu, 1), save_path=f"{self.log_dir}/models/checkpoints", name_prefix="ncert_tutor_enhanced")
        print(f"Starting training phase for {total_timesteps} timesteps...")
        try:
            # Pass reset_num_timesteps=False when continuing training phases
            self.model.learn(total_timesteps=total_timesteps, callback=[
                             eval_callback, checkpoint_callback], progress_bar=True, reset_num_timesteps=(self.model.num_timesteps == 0))
        except KeyboardInterrupt:
            print("\nTraining interrupted.")
        # Saving is handled by callbacks and final save after all phases

    def save_final_model(self):
        if self.model:
            final_path = f"{self.log_dir}/models/final_model_phased"
            self.model.save(final_path)
            print(f"Final model saved to {final_path}")
        else:
            print("No model to save.")

    def load_model(self, path):
        # (Implementation as before)
        if not os.path.exists(path):
            print(f"Error: Model path not found - {path}")
            self.model = None
            return None
        try:
            self.model = PPO.load(path, env=self.vec_env)
            print(f"Model loaded: {path}")
            return self.model
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
            return None

    def evaluate_model(self, n_episodes=20, render=False):
        """Evaluate the trained model and collect detailed metrics."""
        if self.model is None:
            print("No model loaded.")
            return None

        eval_env = self._make_env(rank=998)()  # Single env for eval
        all_rewards, all_lengths, all_final_masteries = [], [], []
        all_episode_metrics = []

        print(f"\n--- Evaluation ({n_episodes} episodes) ---")
        for i in range(n_episodes):
            obs, _ = eval_env.reset()
            done, truncated = False, False
            total_r, steps = 0, 0
            while not (done or truncated):
                action, _ = self.model.predict(obs, deterministic=True)
                obs, r, done, truncated, info = eval_env.step(action)
                total_r += r
                steps += 1
                if render:
                    eval_env.render()

            all_rewards.append(total_r)
            all_lengths.append(steps)
            # Access final metrics from the info dict if Monitor logged them
            ep_info = info.get("episode")
            final_mastery = -1.0
            if ep_info and hasattr(eval_env, 'env') and hasattr(eval_env.env, 'env'):
                # Get metrics collected by the environment at the end
                episode_end_metrics = eval_env.env.env.episode_metrics
                final_mastery = episode_end_metrics.get(
                    'final_avg_mastery', -1.0)
                all_episode_metrics.append(episode_end_metrics)
            else:
                # Fallback if metrics not found in info dict
                all_episode_metrics.append({})  # Append empty dict

            all_final_masteries.append(final_mastery)
            print(
                f"Ep {i+1}: R={total_r:.2f}, Len={steps}, FinalM={final_mastery:.3f}")

        # Aggregate detailed metrics
        avg_final_m = np.mean([m for m in all_final_masteries if m >= 0]) if any(
            m >= 0 for m in all_final_masteries) else -1.0
        avg_detailed = {}
        if all_episode_metrics:
            keys_to_avg = ['avg_engagement', 'avg_motivation',
                           'avg_cog_load', 'final_misconceptions_count']
            for key in keys_to_avg:
                valid_vals = [
                    m.get(key) for m in all_episode_metrics if m.get(key) is not None]
                if valid_vals:
                    avg_detailed[key] = np.mean(valid_vals)

        print(f"\n--- Evaluation Summary ---")
        print(
            f"  Avg Reward: {np.mean(all_rewards):.2f} +/- {np.std(all_rewards):.2f}")
        print(
            f"  Avg Length: {np.mean(all_lengths):.1f} +/- {np.std(all_lengths):.1f}")
        print(f"  Avg Final Mastery: {avg_final_m:.3f}")
        if avg_detailed:
            print("  Avg Detailed Metrics:")
            for key, val in avg_detailed.items():
                print(f"    {key}: {val:.3f}")

        return {'rewards': all_rewards, 'lengths': all_lengths, 'final_masteries': all_final_masteries, 'avg_detailed_metrics': avg_detailed}


# --- Main Execution ---
if __name__ == "__main__":
    LOG_DIR = "./ncert_tutor_logs_v1"  # Use a new log directory
    # Leave one CPU free
    N_CPUS = max(1, os.cpu_count() - 1) if os.cpu_count() else 4
    EVAL_FREQ = 100_000  # Evaluate less frequently during long runs
    SAVE_FREQ = 250_000

    print("Initializing NCERTLearningSystem...")
    system = NCERTLearningSystem(
        num_students=20, max_steps=250, log_dir=LOG_DIR, num_cpu=N_CPUS)

    print("\nChecking environment...")
    try:
        check_env(system.unwrapped_env)
        print("Env check OK.")
    except Exception as e:
        print(f"Env check FAILED: {e}. Proceeding cautiously.")

    # --- Phased Training ---
    print(
        f"\nStarting phased training for {TOTAL_TRAINING_STEPS} total steps...")
    total_steps_completed = 0

    for phase_idx, phase in enumerate(training_phases):
        print(f"\n--- Training Phase {phase_idx+1}/{len(training_phases)} ---")
        print(
            f"Target Steps: {phase['timesteps']}, LR: {phase['learning_rate']}, Entropy: {phase['ent_coef']}")

        # Create model for phase 1, update hyperparameters for subsequent phases
        if phase_idx == 0:
            system.create_model(
                learning_rate=phase['learning_rate'], ent_coef=phase['ent_coef'])
        else:
            if system.model is None:  # Load previous phase's best if starting mid-way or after interruption
                last_best = os.path.join(
                    LOG_DIR, "models", "best", "best_model.zip")
                print(f"Loading model from previous phase: {last_best}")
                if not system.load_model(last_best):
                    print(
                        "ERROR: Cannot load previous model to continue training. Exiting.")
                    exit()
            # Update hyperparameters for the current phase
            print(
                f"Updating model LR to {phase['learning_rate']} and EntCoef to {phase['ent_coef']}")
            system.model.learning_rate = phase['learning_rate']
            system.model.ent_coef = phase['ent_coef']
            # You might need to re-initialize parts of the optimizer if changing LR significantly,
            # but PPO often handles LR schedules internally if set via .learn() or .set_parameters()

        # Train for the timesteps specified in this phase
        system.train_model(
            total_timesteps=phase['timesteps'],  # Steps for *this phase*
            eval_freq=EVAL_FREQ,
            save_freq=SAVE_FREQ,
            n_eval_episodes=15  # Fewer eval episodes during training phases
        )

        # Save a checkpoint tagged with the phase number
        phase_model_path = f"{LOG_DIR}/models/phase_{phase_idx+1}_model"
        system.model.save(phase_model_path)
        print(
            f"End of Phase {phase_idx+1}. Model checkpoint saved to {phase_model_path}.zip")

    # --- Final Saving & Evaluation ---
    print("\nPhased training complete.")
    system.save_final_model()  # Save the model after the last phase

    best_model_path = os.path.join(LOG_DIR, "models", "best", "best_model.zip")
    print(
        f"\nLoading best overall model for final evaluation: {best_model_path}")
    if system.load_model(best_model_path):
        print("\nEvaluating final best model...")
        system.evaluate_model(n_episodes=30)  # More episodes for final eval
    else:
        print("Could not load best model for final evaluation.")

    print(f"\nRun finished. Logs/models in: {LOG_DIR}")
