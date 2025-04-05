// Content Types supported by the system
export type ContentType = 'lesson' | 'quiz' | 'flashcard' | 'cheatsheet' | 'explanation' | 'feedback';

// Learning styles from your RL system
export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  READING = 'reading',
  KINESTHETIC = 'kinesthetic'
}

// Teaching strategies as defined in your RL system
export enum TeachingStrategy {
  EXPLANATION = 'EXPLANATION',
  DEMONSTRATION = 'DEMONSTRATION',
  PRACTICE = 'PRACTICE',
  EXPLORATION = 'EXPLORATION', 
  ASSESSMENT = 'ASSESSMENT',
  INTERACTIVE = 'INTERACTIVE',
  STORYTELLING = 'STORYTELLING',
  GAMIFICATION = 'GAMIFICATION',
  SPACED_REVIEW = 'SPACED_REVIEW'
}

// Difficulty levels
export enum DifficultyLevel {
  EASIER = 'EASIER',
  NORMAL = 'NORMAL',
  HARDER = 'HARDER'
}

// Scaffolding levels for content
export enum ScaffoldingLevel {
  NONE = 'NONE',
  HINTS = 'HINTS',
  GUIDANCE = 'GUIDANCE'
}

// Feedback types
export enum FeedbackType {
  CORRECTIVE = 'CORRECTIVE',
  HINT = 'HINT',
  ELABORATED = 'ELABORATED',
  SOCRATIC = 'SOCRATIC'
}

// Content length preferences
export enum ContentLength {
  CONCISE = 'CONCISE',
  STANDARD = 'STANDARD', 
  DETAILED = 'DETAILED'
}

// API request for generating content
export interface ContentRequest {
  content_type: ContentType;
  subject: string;
  topic?: string;
  subtopic?: string; 
  previous_response?: string;
  user_input?: string;
  config?: {
    num_predict?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

// Metadata returned with generated content
export interface ContentMetadata {
  strategy: string;
  topic: string;
  difficulty_choice: string;
  scaffolding_choice: string;
  feedback_choice: string;
  length_choice: string;
  subject: string;
  content_type: string;
  difficulty_level_desc: string;
  mastery_at_request: number;
  effective_difficulty_value: number;
  prereq_satisfaction: number;
  interaction_id: string;
}

// Student feedback submission
export interface SessionFeedback {
  interaction_id: string;
  time_spent_seconds?: number;
  completion_percentage?: number;
  assessment_score?: number;
  engagement_rating?: number;
  helpful_rating?: number;
  feedback_text?: string;
}

// Student learning state
export interface StudentState {
  mastery: Record<string, number>;
  engagement: number;
  attention: number;
  cognitive_load: number;
  motivation: number;
  misconceptions: Record<string, number>;
  recent_performance: number;
}