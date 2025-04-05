// Types that match your backend API
export type LearningStyle = 'visual' | 'auditory' | 'reading' | 'kinesthetic';

export type TeachingStrategy = 
  | 'EXPLANATION' 
  | 'DEMONSTRATION' 
  | 'PRACTICE' 
  | 'EXPLORATION' 
  | 'ASSESSMENT' 
  | 'INTERACTIVE' 
  | 'STORYTELLING' 
  | 'GAMIFICATION' 
  | 'SPACED_REVIEW';

export type DifficultyLevel = 'EASIER' | 'NORMAL' | 'HARDER';
export type ScaffoldingLevel = 'NONE' | 'HINTS' | 'GUIDANCE';
export type FeedbackType = 'CORRECTIVE' | 'HINT' | 'ELABORATED' | 'SOCRATIC';
export type ContentLength = 'CONCISE' | 'STANDARD' | 'DETAILED';
export type ContentType = 'lesson' | 'quiz' | 'flashcard' | 'cheatsheet' | 'explanation' | 'feedback';

export interface GenerationConfig {
  num_predict?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
}

export interface ContentRequest {
  content_type: ContentType;
  subject: string;
  topic?: string;
  subtopic?: string;
  previous_response?: string;
  user_input?: string;
  config?: GenerationConfig;
}

export interface InteractionMetadata {
  interaction_id: string;
  strategy: TeachingStrategy;
  topic: string;
  difficulty_choice: DifficultyLevel;
  scaffolding_choice: ScaffoldingLevel;
  feedback_choice: FeedbackType;
  length_choice: ContentLength;
  subject: string;
  content_type: ContentType;
  difficulty_level_desc: string;
  mastery_at_request: number;
  effective_difficulty_value: number;
  prereq_satisfaction: number;
}

export interface SessionFeedback {
  interaction_id: string;
  time_spent_seconds?: number;
  completion_percentage?: number;
  assessment_score?: number;
  engagement_rating?: number;
  helpful_rating?: number;
  feedback_text?: string;
}