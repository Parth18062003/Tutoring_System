// lib/adaptive-api.ts
import {
    ContentRequestPayload,
    FeedbackPayload,
    FeedbackResponse,
    HealthCheckResponse,
    InteractionMetadata,
    StructuredContentResponse,
  } from "@/types/adaptive"; // Adjust path
  import {
    streamResponse,
    parseInteractionMetadata,
    parseStructuredContent,
  } from "./stream-utils"; // Adjust path
  
  // Use NEXT_PUBLIC_ variable if calling from client-side components
  // If these helpers are only used server-side, NEXT_PUBLIC_ prefix isn't needed.
  // Assuming called from client-side:
  // const API_PROXY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''; // Your Next.js app URL
  
  /**
   * Fetches adaptive content via the Next.js proxy, handles streaming,
   * and returns parsed metadata and the structured content.
   *
   * @returns Object containing metadata and the parsed structured content, or throws error.
   */
  export async function fetchAdaptiveContent(
    payload: ContentRequestPayload
  ): Promise<{
    metadata: InteractionMetadata;
    content: StructuredContentResponse | null;
  }> {
    const response = await fetch(`/api/adaptive/content`, {
      // Calls the Next.js API route
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error("fetchAdaptiveContent API Error:", errorText);
      throw new Error(
        `Failed to fetch content: ${response.status} - ${errorText}`
      );
    }
    if (!response.body) {
      throw new Error("Content response body is null");
    }
  
    const metadata = parseInteractionMetadata(response.headers);
    let accumulatedJson = "";
  
    try {
      for await (const chunk of streamResponse(response)) {
        accumulatedJson += chunk;
      }
    } catch (streamError) {
      console.error("Error reading content stream:", streamError);
      // Decide if partial content might be parsable or throw
      throw new Error(`Error reading content stream: ${streamError}`);
    }
  
    const structuredContent = parseStructuredContent(accumulatedJson);
  
    if (!structuredContent && accumulatedJson.trim()) {
      // Log the raw output if parsing failed but content exists
      console.warn(
        "Received content but failed to parse as structured JSON. Raw output:",
        accumulatedJson
      );
      // You might choose to return partial data or throw an error
      // For now, returning null content but valid metadata
    }
  
    return { metadata, content: structuredContent };
  }
  
  /**
   * Submits interaction feedback via the Next.js proxy.
   * @returns The response from the backend.
   */
  export async function submitInteractionFeedback(
    payload: FeedbackPayload
  ): Promise<FeedbackResponse> {
    const response = await fetch(`/api/adaptive/feedback`, {
      // Calls the Next.js API route
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    const responseBody = await response.json();
  
    if (!response.ok) {
      console.error("submitInteractionFeedback API Error:", responseBody);
      throw new Error(
        `Failed to submit feedback: ${response.status} - ${responseBody.error || responseBody.detail || "Unknown error"}`
      );
    }
  
    return responseBody as FeedbackResponse;
  }
  
  /**
   * Checks the health of the backend via the Next.js proxy.
   * @returns The health check response.
   */
  export async function checkBackendHealth(): Promise<HealthCheckResponse> {
    const response = await fetch(`/api/adaptive/health`, {
      // Calls the Next.js API route
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  
    const responseBody = await response.json();
  
    // Note: The API route itself handles the case where fetch fails.
    // Here we just check if the response indicates an unhealthy state captured by the backend.
    if (!response.ok && response.status !== 503) {
      // Allow 503 from proxy
      console.error("checkBackendHealth API Error:", responseBody);
      throw new Error(
        `Health check failed: ${response.status} - ${responseBody.error || "Unknown error"}`
      );
    }
  
    return responseBody as HealthCheckResponse;
  }
  