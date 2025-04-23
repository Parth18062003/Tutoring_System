// types/analytics-types.ts

/**
 * Represents the structure of data returned by /metrics/system
 */
export interface SystemMetrics {
  total_users: number;
  active_users_24h: number;
  interactions_total: number;
  interactions_per_user_avg: number;
  content_generation_count: number;
  assessment_count: number;
  assessment_avg_score?: number; // Optional if no assessments yet
  avg_mastery_all_users?: number; // Optional
  strategy_effectiveness_overview: {
    strategy: string;
    avg_gain: number;
    usage_count: number;
  }[];
  // Add other system-wide metrics as needed
}

/**
 * Represents detailed analytics for a single student (/metrics/student/{studentId})
 */
export interface StudentAnalyticsData {
  student_id: string;
  calculated_at: string; // ISO timestamp
  mastery_summary: {
    overall_average: number;
    strongest_topics: { topic: string; mastery: number }[];
    weakest_topics: { topic: string; mastery: number }[];
    mastery_distribution: Record<string, number>; // e.g., { "low": 5, "medium": 10, "high": 3 }
  };
  learning_velocity: {
    overall_velocity: number; // Avg mastery gain per interaction/attempt
    fastest_learning_topics: { topic: string; velocity: number }[];
    slowest_learning_topics: { topic: string; velocity: number }[];
  };
  strategy_effectiveness: {
    most_effective_strategies: {
      strategy: string;
      avg_gain: number;
      avg_rating?: number;
    }[];
    least_effective_strategies: {
      strategy: string;
      avg_gain: number;
      avg_rating?: number;
    }[];
    per_strategy_details: Record<
      string,
      {
        usage_count: number;
        avg_mastery_gain: number;
        avg_helpful_rating?: number;
        avg_engagement_rating?: number;
        avg_completion_percentage?: number;
      }
    >;
  };
  knowledge_structure?: {
    // Optional, depends on Neo4j integration success
    identified_clusters: {
      cluster_id: string;
      topics: string[];
      avg_mastery: number;
    }[];
    potential_knowledge_gaps: string[]; // Topics with low mastery but required for others
  };
  learning_trajectory: {
    overall_learning_rate: number; // Avg mastery gain over time
    topic_improvement_rates: Record<
      string,
      { rate: number; trend: "improving" | "stagnant" | "declining" }
    >;
    recent_mastery_trend: { time: string; mastery: number }[]; // Sample points for chart
  };
  learning_path_summary: {
    total_interactions: number;
    unique_topics_covered: number;
    common_topic_transitions: { from: string; to: string; count: number }[];
    recent_strategies_used: string[];
  };
  stagnation_areas: {
    topic: string;
    attempts: number;
    current_mastery: number;
  }[];
  time_patterns: {
    avg_session_duration_seconds?: number;
    avg_time_between_sessions_hours?: number;
    most_active_day?: number; // 0=Mon, 6=Sun
    most_active_hour?: number; // 0-23
    total_learning_time_seconds?: number;
  };
  assessment_history_summary?: {
    // Include if fetched alongside main analytics
    count: number;
    average_score?: number;
    recent_assessments: {
      assessment_id: string;
      topic: string;
      score?: number;
      completed_at: string;
    }[];
  };
  mastery_heatmap?: {
    // Data for rendering the heatmap
    subjects: string[];
    topic_labels: string[][]; // Per subject
    heatmap_data: number[][]; // Per subject/topic
    image_base64?: string; // Optional pre-rendered heatmap
  };
  // Add any other relevant analytics fields
}

/**
 * Represents the structure of data returned by /metrics/topics
 */
export interface TopicMetrics {
  topic_metrics: Record<
    string,
    {
      // Key is the topic name
      average_mastery: number;
      average_difficulty_encountered: number;
      learning_velocity: number;
      most_effective_strategy?: string;
      usage_count: number;
      stagnation_count: number; // How many students are stuck here
    }
  >;
  topic_clusters?: {
    // Optional, from Neo4j analysis
    cluster_id: string;
    topics: string[];
  }[];
  // Add other topic-level aggregate metrics
}

// General API Response Wrapper (if not already defined elsewhere)
export interface MetricsApiResponse<T> {
  data?: T;
  error?: string;
  status: "success" | "error" | "loading";
}

// Generic Paginated Response Type
export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}

// Heatmap Data Type
export interface HeatmapData {
  subjects: string[];
  topic_labels: (string | null)[][]; // Allow null for empty topic cells
  heatmap_data: (number | null)[][]; // Array of arrays of numbers or null
  image_base64?: string | null;
}

// Keep MetricsApiResponse if used elsewhere
export interface MetricsApiResponse<T> {
  data?: T;
  error?: string;
  status: "success" | "error" | "loading";
}

// types/analytics-types.ts

import { type } from "os";

// --- Main Summary Data Type ---
export interface StudentAnalyticsSummaryData {
  student_id: string;
  calculated_at: string; // ISO timestamp string
  mastery_summary?: {
    // Make outer object optional
    average?: number | null;
    by_topic?: Record<string, number | null>;
    strongest_topics?: { topic: string; mastery: number }[];
    weakest_topics?: { topic: string; mastery: number }[];
    below_threshold?: Record<string, number | null>;
    count?: number | null;
    distribution?: Record<string, number>;
    variance?: number | null;
  };
  learning_velocity?: {
    // Make outer object optional
    by_topic?: Record<string, number | null>;
    fastest_learning?: { topic: string; velocity: number }; // Changed from array
    slowest_learning?: { topic: string; velocity: number }; // Changed from array
    average_velocity?: number | null;
  };
  strategy_effectiveness?: {
    // Make outer object optional
    most_effective_strategies?: {
      strategy: string;
      avg_gain: number;
      avg_rating?: number | null;
    }[];
    least_effective_strategies?: {
      strategy: string;
      avg_gain: number;
      avg_rating?: number | null;
    }[];
    per_strategy_details?: Record<
      string,
      {
        usage_count: number;
        avg_mastery_gain: number;
        avg_helpful_rating?: number | null;
        avg_engagement_rating?: number | null;
        avg_completion_percentage?: number | null;
      }
    >;
  };
  knowledge_structure?: {
    // Make outer object optional
    identified_clusters?: {
      cluster_id: string;
      topics: string[];
      avg_mastery: number;
    }[];
    potential_knowledge_gaps?: string[];
    identified_strengths?: string[];
  };
  learning_trajectory?: {
    // Make outer object optional
    by_topic?: Record<
      string,
      {
        rate?: number | null;
        initial_mastery?: number | null;
        current_mastery?: number | null;
        days_of_learning?: number | null;
        interactions?: number | null;
        trend?: string; // Keep optional
      }
    >;
    overall_learning_rate?: number | null;
    topic_count?: number | null;
  };
  stagnation_areas?: {
    // Make outer object optional
    topic: string;
    attempts?: number | null; // Make optional
    mastery?: number | null; // Renamed from current_mastery, make optional
    severity?: number | null;
  }[];
  time_patterns?: {
    // Make outer object optional
    avg_time_between_sessions_hours?: number | null;
    avg_session_duration_seconds?: number | null;
    most_active_day?: string | null;
    most_active_hour?: number | null;
    days_since_first_activity?: number | null;
    unique_days_active?: number | null;
    day_distribution?: number[];
    hour_distribution?: number[];
    first_activity?: string | null;
    last_activity?: string | null;
  };
}

// --- Learning Path Item Type ---
export interface LearningPathItem {
  interaction_id?: string;
  timestamp_utc: string; // ISO timestamp string
  topic: string;
  strategy?: string;
  content_type?: string;
  mastery_at_request?: number | null;
  mastery_after_feedback?: number | null; // Represents mastery AFTER update from this step's feedback/eval
  feedback_details?: {
    assessment_score?: number | null;
    completion_percentage?: number | null;
    helpful_rating?: number | null;
    engagement_rating?: number | null;
    time_spent_seconds?: number | null;
  } | null;
}

// --- Assessment History Item Type ---
export interface AssessmentHistoryItem {
  assessment_id: string;
  topic: string;
  subject: string; // Added subject
  completed_at?: string | null; // ISO timestamp string
  score?: number | null; // Make optional as it was missing
  mastery_before?: number | null;
  mastery_after?: number | null;
  question_count?: number | null; // Make optional as it was missing
  difficulty?: number | null; // Make optional as it was missing
}

// --- Paginated Response Type ---
export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}

// --- Heatmap Data Type ---
export interface HeatmapData {
  subjects: string[];
  topic_labels: (string | null)[][]; // Array of arrays of strings or null
  heatmap_data: (number | null)[][]; // Array of arrays of numbers or null
  image_base64?: string | null;
}

/**
 * Represents paginated learning path data
 */
export interface LearningPathData extends PaginatedResponse<LearningPathItem> {
  // Contains the base PaginatedResponse fields:
  // page: number
  // limit: number
  // total: number
  // items: LearningPathItem[]
}

/**
 * Represents paginated assessment history data
 */
export interface AssessmentHistoryData extends PaginatedResponse<AssessmentHistoryItem> {
  // Contains the base PaginatedResponse fields:
  // page: number
  // limit: number
  // total: number
  // items: AssessmentHistoryItem[]
}