// types/assessment-types.ts
export interface AssessmentQuestion {
    id: string;
    exercise_type: "multiple_choice" | "short_answer" | "true_false" | "fill_in_blank";
    question: string;
    options?: string[];
    correct_answer: string;
    explanation: string;
    hint?: string;
    difficulty_level?: string;
    topic: string;
    misconception_addressed?: string;
  }
  
  export interface QuestionEvaluation {
    score: number;
    correct: boolean;
    partial_credit?: number;
    misconceptions: string[];
    knowledge_gaps: string[];
    feedback: string;
    improvement_suggestions: string[];
    key_concepts_understood: string[];
    key_concepts_missed: string[];
  }
  
  export interface AssessmentResponse {
    assessment_id: string;
    topic: string;
    subject: string;
    overall_score: number;
    mastery_before: number;
    mastery_after: number;
    mastery_change: number;
    evaluations: Record<string, QuestionEvaluation>;
    common_misconceptions: { misconception: string; count: number }[];
    common_gaps: { gap: string; count: number }[];
    recommendations: string[];
  }
  
  export interface AssessmentHistory {
    assessment_id: string;
    topic: string;
    subject: string;
    created_at: string;
    completed_at?: string;
    completed: boolean;
    score?: number;
    difficulty: number;
    mastery_before?: number;
    mastery_after?: number;
    question_count: number;
  }