// lib/types/api-types.ts
export interface ContentRequest {
    content_type: string;
    subject: string;
    topic?: string;
    subtopic?: string;
    previous_response?: string;
    user_input?: string;
    config?: {
      temperature?: number;
      max_length?: number;
      top_p?: number;
      top_k?: number;
    };
  }
  
  export interface InteractionMetadata {
    interaction_id: string;
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
    kg_context_used: boolean;
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
  
  export interface ContentSection {
    sectionType: string;
    title: string;
    contentMarkdown: string;
    questionText?: string;
    answerDetail?: string;
    frontSide?: string;
    backSide?: string;
    difficulty?: string;
    hint?: string;
    questions?: string[];
    concepts?: string[];
  }
  
  export interface ContentResponse {
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
  
  export interface StudentAnalytics {
    mastery_by_topic: Record<string, number>;
    learning_velocity: Record<string, number>;
    effective_strategies: Record<string, any>;
  }
  
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: 'success' | 'error' | 'loading';
  }

  // types/content-types.ts
export interface SavedContentItem {
  content_id: string;
  content_type: string;
  subject: string;
  topic: string;
  title: string;
  created_at: string;
  last_viewed_at: string;
  favorite: boolean;
  metadata: {
    strategy: string;
    difficulty: string;
    scaffolding: string;
    feedback_style: string;
    mastery_at_save: number;
  };
}

export interface SavedContentDetail extends SavedContentItem {
  sections: any[];
  notes: string;
}