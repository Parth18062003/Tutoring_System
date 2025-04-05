// types/adaptive.ts
export enum LearningStyles {
  VISUAL = 0,
  AUDITORY = 1,
  READING = 2,
  KINESTHETIC = 3,
}
export enum TeachingStrategies {
  EXPLANATION = 0,
  DEMONSTRATION = 1,
  PRACTICE = 2,
  EXPLORATION = 3,
  ASSESSMENT = 4,
  INTERACTIVE = 5,
  STORYTELLING = 6,
  GAMIFICATION = 7,
  SPACED_REVIEW = 8,
}
export enum DifficultyLevel {
  EASIER = 0,
  NORMAL = 1,
  HARDER = 2,
}
export enum ScaffoldingLevel {
  NONE = 0,
  HINTS = 1,
  GUIDANCE = 2,
}
export enum FeedbackType {
  CORRECTIVE = 0,
  HINT = 1,
  ELABORATED = 2,
  SOCRATIC = 3,
}
export enum ContentLength {
  CONCISE = 0,
  STANDARD = 1,
  DETAILED = 2,
}


export interface GenerationConfig {
  max_length?: number | null; // Corresponds to num_predict
  temperature?: number | null;
  top_p?: number | null;
  top_k?: number | null;
}

export interface ContentRequestPayload {
  content_type: string; // e.g., 'lesson', 'quiz', 'flashcard', 'explanation', 'feedback', 'cheatsheet'
  subject: string; // e.g., 'Science'
  topic?: string | null; // Optional user override, full topic name like 'Science-Components of Food'
  subtopic?: string | null;
  previous_response?: string | null; 
  user_input?: string | null;
  config?: GenerationConfig | null;
}

export interface FeedbackPayload {
  interaction_id: string; // The ID received in the content response headers
  time_spent_seconds?: number | null;
  completion_percentage?: number | null; // 0-100
  assessment_score?: number | null; // 0-100 (e.g., Quiz score)
  engagement_rating?: number | null; // User subjective rating (e.g., 1-5)
  helpful_rating?: number | null; // User subjective rating (e.g., 1-5)
  feedback_text?: string | null; // User's qualitative feedback
}

export interface InteractionMetadata {
  interactionId: string;
  strategy: string;
  topic: string;
  difficultyChoice: string;
  scaffoldingChoice: string;
  feedbackChoice: string;
  lengthChoice: string;
  subject: string;
  contentType: string;
  difficultyLevelDesc: string;
  masteryAtRequest: string; 
  effectiveDifficultyValue: string;
  prereqSatisfaction: string;
}

export interface ContentSection {
  sectionType: string; // e.g., "lesson_introduction", "quiz_question", "flashcard_front"
  title: string; // Human-readable title
  contentMarkdown: string; // The actual content in Markdown format
  questionNumber?: number;
  questionText?: string;
  answerDetail?: string;
}

export interface StructuredContentResponse {
  contentType: string;
  topic: string;
  subject: string;
  instructionalPlan: {
    teachingStrategy: string;
    targetDifficulty: string;
    effectiveDifficultyScore: number;
    contentLength: string;
    scaffoldingLevel: string;
    feedbackStyle: string;
  };
  sections: ContentSection[];
}

export interface FeedbackResponse {
  status: string;
  message: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp_utc: string;
  dependencies: {
    ollama_connection: "ok" | "unavailable" | string;
    mongodb_connection: "ok" | "unavailable" | string;
    rl_model_status:
      | "loaded"
      | "load_failed_or_missing"
      | "sb3_unavailable"
      | string;
  };
  rl_info?: {
    num_topics?: number;
    max_steps?: number;
    model_path?: string;
    num_strategies?: number;
  } | null;
}
