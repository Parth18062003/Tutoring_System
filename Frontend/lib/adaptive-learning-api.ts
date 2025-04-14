// lib/adaptive-learning-api.ts
import { getUserId } from "@/lib/actions";
import {
  ContentRequest,
  SessionFeedback,
  InteractionMetadata,
  StudentAnalytics,
} from "@/types/api-types";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * Sends an authenticated request to the NCERT Learning API
 */
async function sendAuthenticatedRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Get user ID from better-auth
    const { success, userId, error } = await getUserId();

    if (!success || !userId) {
      throw new ApiError(error || "Authentication failed", 401);
    }

    // Add authentication headers
    const headers = new Headers(options.headers || {});
    headers.set("X-Authenticated-User-Id", userId);
    headers.set("X-Internal-Api-Secret", process.env.INTERNAL_API_SECRET || "");

    // Create and send request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `API error: ${errorText || response.statusText}`,
        response.status
      );
    }

    return response;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    const errMsg =
      error instanceof Error ? error.message : "Failed to send request";
    throw new ApiError(`API request failed: ${errMsg}`, 500);
  }
}

/**
 * API client for the NCERT Adaptive Learning System
 */
export const AdaptiveLearningApi = {
  /**
   * Check the health status of the API
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/healthcheck`);
      if (!response.ok) {
        return { status: "error", message: response.statusText };
      }
      return await response.json();
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Failed to fetch health status";
      return {
        status: "error",
        message: errMsg,
      };
    }
  },

  /**
   * Request content with adaptive learning strategies
   */
  async getContent(request: ContentRequest): Promise<{
    metadata: InteractionMetadata;
    response: ReadableStream<Uint8Array>;
  }> {
    const response = await sendAuthenticatedRequest("/content/next", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    // Extract metadata from headers
    const metadata: InteractionMetadata = {
      interaction_id: response.headers.get("X-Interaction-Id") || "",
      strategy: response.headers.get("X-Strategy") || "",
      topic: response.headers.get("X-Topic") || "",
      difficulty_choice: response.headers.get("X-Difficulty-Choice") || "",
      scaffolding_choice: response.headers.get("X-Scaffolding-Choice") || "",
      feedback_choice: response.headers.get("X-Feedback-Choice") || "",
      length_choice: response.headers.get("X-Length-Choice") || "",
      subject: response.headers.get("X-Subject") || "",
      content_type: response.headers.get("X-Content-Type") || "",
      difficulty_level_desc:
        response.headers.get("X-Difficulty-Level-Desc") || "",
      mastery_at_request: parseFloat(
        response.headers.get("X-Mastery-At-Request") || "0"
      ),
      effective_difficulty_value: parseFloat(
        response.headers.get("X-Effective-Difficulty-Value") || "0"
      ),
      prereq_satisfaction: parseFloat(
        response.headers.get("X-Prereq-Satisfaction") || "0"
      ),
      kg_context_used: response.headers.get("X-Kg-Context-Used") === "True",
    };

    // Return both metadata and the stream
    return {
      metadata,
      response: response.body!,
    };
  },

  /**
   * Submit feedback for a learning interaction
   */
  async submitFeedback(
    feedback: SessionFeedback
  ): Promise<{ status: string; message: string }> {
    const response = await sendAuthenticatedRequest("/feedback/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    });

    return await response.json();
  },

  /**
   * Get analytics for the current student
   */
  async getStudentAnalytics(): Promise<StudentAnalytics> {
    // Get authenticated user ID first
    const { success, userId } = await getUserId();
    if (!success || !userId) {
      throw new ApiError("Authentication failed", 401);
    }

    const response = await sendAuthenticatedRequest(
      `/analytics/student/${userId}`
    );
    return await response.json();
  },
};

export default AdaptiveLearningApi;
