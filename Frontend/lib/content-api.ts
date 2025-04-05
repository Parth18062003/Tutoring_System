/**
 * API client for the RL-backed content generation system
 */

import {
  ContentMetadata,
  ContentRequest,
  SessionFeedback,
} from "@/types/tutor";

// No need for API_BASE_URL as we'll use relative paths to our Next.js API routes
// which will proxy requests to the RL backend

/**
 * Fetches content from the RL-backed system with streaming support
 */
export async function fetchStreamingContent(
  request: ContentRequest,
  onChunk: (chunk: string) => void,
  onMetadata: (metadata: ContentMetadata) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    // Use the Next.js API route as a proxy instead of direct backend access
    const response = await fetch('/api/content', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      // No need for credentials: "include" when using same-origin API routes
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    // Extract metadata from headers
    const metadata: Partial<ContentMetadata> = {};
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith("x-")) {
        const metadataKey = key
          .substring(2)
          .toLowerCase()
          .replace(/-([a-z])/g, (g) => g[1].toUpperCase());

        // Use type assertion with a cast through unknown
        const typedValue = !isNaN(Number(value)) ? Number(value) : value;
        (metadata as any)[metadataKey] = typedValue;
      }
    });

    // Get interaction ID specifically
    const interactionId = response.headers.get("x-interaction-id");
    if (interactionId) {
      metadata.interaction_id = interactionId;
    }

    // Call the metadata callback with type assertion
    onMetadata(metadata as ContentMetadata);

    // Process the stream
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is not readable");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (buffer) onChunk(buffer);
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete chunks (optional: implement custom chunk separation logic)
      onChunk(buffer);
      buffer = "";
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : "Unknown error");
  }
}

/**
 * Submit feedback for a content interaction
 */
export async function submitFeedback(
  feedback: SessionFeedback
): Promise<boolean> {
  try {
    // Use the Next.js API route as a proxy
    const response = await fetch('/api/content/feedback', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
      // No need for credentials: "include" when using same-origin API routes
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit feedback: ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return false;
  }
}

/**
 * Check API health status
 */
export async function checkApiHealth(): Promise<{
  status: string;
  dependencies: Record<string, string>;
}> {
  try {
    // Use the Next.js API route as a proxy
    const response = await fetch('/api/content/health');
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Health check error:", error);
    return {
      status: "error",
      dependencies: {
        ollama_connection: "error",
        mongodb_connection: "error",
        rl_model_status: "error",
      },
    };
  }
}