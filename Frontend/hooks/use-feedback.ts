// lib/hooks/use-feedback.ts - Modified to prevent duplicate submissions
"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

type FeedbackPayload = {
  interaction_id?: string;
  time_spent_seconds?: number;
  completion_percentage?: number;
  assessment_score?: number;
  engagement_rating?: number;
  helpful_rating?: number;
  feedback_text?: string;
};

export function useFeedback() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add a ref to track if feedback was submitted for this interaction
  const submittedInteractionRef = useRef<string | null>(null);

  const submitFeedback = useCallback(
    async (feedback: FeedbackPayload) => {
      // Skip if already submitting or if this exact interaction already had feedback
      if (
        submitting ||
        (feedback.interaction_id &&
          submittedInteractionRef.current === feedback.interaction_id)
      ) {
        console.log("Preventing duplicate feedback submission");
        return;
      }

      // Reset states
      setError(null);
      setSubmitting(true);

      try {
        // Validate required fields
        if (!feedback.interaction_id) {
          console.error("Missing interaction_id in feedback payload");
          toast.error("Feedback Error! Missing interaction ID");
          setError("Missing interaction ID");
          return;
        }

        // Record that we're submitting feedback for this interaction
        submittedInteractionRef.current = feedback.interaction_id;

        const response = await fetch("/api/learning/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedback),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || response.statusText);
        }

        // Handle successful submission
        setSuccess(true);
        toast.info("Feedback submitted successfully! Thank you for your input.");
      } catch (err: any) {
        setError(err.message || "Failed to submit feedback");
        console.error("Feedback submission error:", err);
        // Don't reset the submitted interaction if there's an error
        // to prevent multiple retry attempts
        submittedInteractionRef.current = null;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, toast]
  );

  return {
    submitFeedback,
    submitting,
    success,
    error,
    reset: () => {
      setSuccess(false);
      setError(null);
      submittedInteractionRef.current = null;
    },
  };
}
