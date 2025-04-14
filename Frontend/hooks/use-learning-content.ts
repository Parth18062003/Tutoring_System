// lib/hooks/use-learning-content.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ContentRequest,
  ContentResponse,
  InteractionMetadata,
} from "@/types/api-types";
import { useLearningStore } from "@/lib/learning-store";

export function useLearningContent() {
  const {
    currentContent,
    currentMetadata,
    loadingContent,
    contentError,
    lastInteractionStartTime,
    currentInteractionTime,
    completionPercentage,
    setCurrentContent,
    setCurrentMetadata,
    setLoadingContent,
    setContentError,
    addToHistory,
    startInteraction,
    updateInteractionTime,
    updateCompletionPercentage,
    clearCurrentContent,
    resetInteractionData,
  } = useLearningStore();

  const [streamProgress, setStreamProgress] = useState<number>(0);
  const [completeResponse, setCompleteResponse] = useState<boolean>(false);

  // References to track intervals and content processing
  const contentBuffer = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRequestRef = useRef<boolean>(false);
  const requestIdRef = useRef<number>(0);

  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      activeRequestRef.current = false;
    };
  }, []);

  // Update interaction time periodically
  useEffect(() => {
    if (lastInteractionStartTime && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        updateInteractionTime();
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [lastInteractionStartTime, updateInteractionTime]);

  const processContentStream = useCallback(
    async (
      stream: ReadableStream<Uint8Array>,
      onProgress: (percent: number) => void,
      requestId: number
    ): Promise<ContentResponse | null> => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedContentObj: ContentResponse | null = null;

      try {
        while (true) {
          // Check if this request is still the current one
          if (requestIdRef.current !== requestId) {
            console.log(`Abandoning stale request #${requestId} processing`);
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Update the progress indicator
          onProgress(Math.min((buffer.length / 1000) * 5, 95));

          // Try to parse complete JSON objects
          try {
            // Sometimes the backend sends multiple JSON objects split by newlines
            const jsonLines = buffer.split("\n").filter((line) => line.trim());

            for (const line of jsonLines) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.contentType && Array.isArray(parsed.sections)) {
                  receivedContentObj = parsed;
                  // Only update content if this is still the current request
                  if (requestIdRef.current === requestId) {
                    setCurrentContent(parsed);
                  }
                }
              } catch (lineParseError) {
                // Skip invalid JSON lines
              }
            }

            // If we found valid content, store it
            if (receivedContentObj) {
              buffer = ""; // Clear buffer after successful parse
            }
          } catch (parseError) {
            // Continue collecting more chunks if JSON is incomplete
          }
        }

        // Check one more time before final processing
        if (requestIdRef.current !== requestId) {
          return null;
        }

        // Final parsing attempt for any remaining data
        if (!receivedContentObj && buffer.trim()) {
          try {
            receivedContentObj = JSON.parse(buffer.trim());
            setCurrentContent(receivedContentObj);
          } catch (e) {
            console.error("Error parsing final content JSON:", e);
            setContentError("Failed to parse content response");
          }
        }

        onProgress(100);
        return receivedContentObj;
      } catch (error: unknown) {
        // Only process error if this is still the current request
        if (requestIdRef.current === requestId) {
          const errorMessage =
            error instanceof Error ? error.message : "Stream processing error";
          console.error("Stream processing error:", error);
          setContentError(errorMessage);
        }
        return null;
      } finally {
        reader.releaseLock();
      }
    },
    [setCurrentContent, setContentError]
  );

  const fetchContent = useCallback(
    async (request: ContentRequest) => {
     if (!request || !request.content_type || !request.subject) {
        console.error("Invalid content request - missing required fields");
        setContentError("Invalid request: missing required fields");
        return;
      }
      // Critical check: Don't allow multiple active requests
      if (activeRequestRef.current) {
        console.log("Request already in progress, ignoring duplicate request");
        return;
      }

      // Increment request ID to track the current request
      const currentRequestId = ++requestIdRef.current;
      
      // Mark request as active
      activeRequestRef.current = true;
      setLoadingContent(true);
      
      // Create abort controller for the request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      // Reset state
      setContentError(null);
      setStreamProgress(0);
      contentBuffer.current = "";
      setCompleteResponse(false);
      resetInteractionData();
      clearCurrentContent();

      try {
        console.log(`Starting content request #${currentRequestId}: ${request.content_type}, ${request.topic}`);

        // Make API request through proxy route for proper authentication handling
        const response = await fetch("/api/learning/content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal,
        });

        // Stop processing if a newer request was started
        if (requestIdRef.current !== currentRequestId) {
          console.log(`Abandoning stale request #${currentRequestId}`);
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || response.statusText);
        }

        // Extract metadata from headers
        const metadata: InteractionMetadata = {
          interaction_id: response.headers.get("X-Interaction-Id") || "",
          strategy: response.headers.get("X-Strategy") || "",
          topic: response.headers.get("X-Topic") || "",
          difficulty_choice: response.headers.get("X-Difficulty-Choice") || "",
          scaffolding_choice:
            response.headers.get("X-Scaffolding-Choice") || "",
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

        // Store metadata
        setCurrentMetadata(metadata);

        // Start timing the interaction
        startInteraction();

        // Process the stream
        const content = await processContentStream(
          response.body!,
          (progress) => {
            if (requestIdRef.current === currentRequestId) {
              setStreamProgress(progress);
            }
          },
          currentRequestId
        );

        // Check again if this is still the current request
        if (requestIdRef.current !== currentRequestId) {
          return;
        }

        // Record in history if we have valid content
        if (content && metadata.interaction_id) {
          addToHistory({
            interaction_id: metadata.interaction_id,
            topic: metadata.topic,
            contentType: request.content_type,
          });
        }

        setCompleteResponse(true);
        console.log(`Completed request #${currentRequestId}`);

      } catch (error: unknown) {
        // Only process error if this is still the current request
        if (requestIdRef.current === currentRequestId) {
          if (error instanceof DOMException && error.name === "AbortError") {
            console.log(`Request #${currentRequestId} was aborted`);
          } else {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch content";
            console.error(`Error in request #${currentRequestId}:`, error);
            setContentError(errorMessage);
          }
        }
      } finally {
        // Only reset loading state if this is still the current request
        if (requestIdRef.current === currentRequestId) {
          setLoadingContent(false);
          activeRequestRef.current = false;
        }
      }
    },
    [
      setLoadingContent, 
      setContentError, 
      setCurrentMetadata,
      startInteraction,
      processContentStream, 
      addToHistory,
      clearCurrentContent,
      resetInteractionData
    ]
  );

  return {
    fetchContent,
    currentContent,
    metadata: currentMetadata,
    loading: loadingContent,
    error: contentError,
    streamProgress,
    completeResponse,
    interactionTime: currentInteractionTime,
    completionPercentage,
    updateCompletionPercentage,
  };
}