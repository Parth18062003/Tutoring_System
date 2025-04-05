// src/components/adaptive/ActionControls.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
// Assume FeedbackPayload type is imported from '@/types/adaptive'
import { FeedbackPayload } from '@/types/adaptive';

interface ActionControlsProps {
  interactionId: string | null;
  isLoading?: boolean;
  // Callbacks returning Promises to handle async nature and loading states
  onSubmitFeedback: (payload: FeedbackPayload) => Promise<void>;
  onRequestNextContent: (contentType: string, topic?: string | null) => Promise<void>;

  // Configuration
  showFeedbackSection?: boolean;
  showNextLessonButton?: boolean;
  showQuizButton?: boolean;
  // Optional: label for the "next" action button
  nextActionLabel?: string;
  // Optional: content type for the "next" action button
  nextActionContentType?: string;
  // Pass any additional data needed for feedback on this specific action
  completionData?: { completion_percentage?: number | null; assessment_score?: number | null, time_spent_seconds?: number | null };
}

const StarRating = ({ label, rating, setRating }: { label: string, rating: number, setRating: (r: number) => void }) => (
  <div className="space-y-1">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => setRating(star)} aria-label={`Rate ${star} out of 5`}>
          <Star
            className={cn(
              'h-5 w-5 cursor-pointer transition-colors',
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'
            )}
          />
        </button>
      ))}
    </div>
  </div>
);

export function ActionControls({
  interactionId,
  isLoading = false,
  onSubmitFeedback,
  onRequestNextContent,
  showFeedbackSection = true,
  showNextLessonButton = true,
  showQuizButton = true,
  nextActionLabel = "Next Concept",
  nextActionContentType = "lesson",
  completionData = {}, // Default empty completion data
}: ActionControlsProps) {
  const [helpfulRating, setHelpfulRating] = useState(0);
  const [engagementRating, setEngagementRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Internal loading state for feedback/next

  const canSubmit = !!interactionId;
  const combinedLoading = isLoading || isSubmitting; // Disable if parent is loading OR this component is submitting

  const handleSubmitAndProceed = async (nextContentType: string, nextTopic?: string | null) => {
    if (!interactionId) {
      // Directly request next content if there's no prior interaction to give feedback on
      await onRequestNextContent(nextContentType, nextTopic);
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit feedback first
      await onSubmitFeedback({
        interaction_id: interactionId,
        helpful_rating: helpfulRating || null,
        engagement_rating: engagementRating || null,
        feedback_text: feedbackText.trim() || null,
        ...completionData, // Add completion/score data specific to this context
      });
      // THEN request next content
      await onRequestNextContent(nextContentType, nextTopic);
      // Optionally reset local feedback state after successful sequence
      setHelpfulRating(0);
      setEngagementRating(0);
      setFeedbackText('');
    } catch (error) {
      console.error("Error during submit/proceed:", error);
      // Handle error display (e.g., toast notification) in the parent or via props
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 p-4 border rounded-lg bg-muted/50 space-y-4">
      {showFeedbackSection && canSubmit && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Rate this Content</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <StarRating label="How helpful was this?" rating={helpfulRating} setRating={setHelpfulRating} />
             <StarRating label="How engaging was this?" rating={engagementRating} setRating={setEngagementRating} />
          </div>
          <div>
            <Label htmlFor="feedback-text" className="text-sm font-medium">Additional Feedback (Optional)</Label>
            <Textarea
              id="feedback-text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Any comments?"
              className="mt-1"
              rows={3}
              disabled={combinedLoading}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-end pt-4 border-t">
         {showQuizButton && (
             <Button
                 variant="outline"
                 onClick={() => handleSubmitAndProceed('quiz')}
                 disabled={combinedLoading}
             >
                {combinedLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Try a Quiz
             </Button>
         )}
         {showNextLessonButton && (
             <Button
                onClick={() => handleSubmitAndProceed(nextActionContentType)}
                disabled={combinedLoading}
             >
                 {combinedLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {nextActionLabel}
             </Button>
         )}
         {/* Add other action buttons as needed */}
      </div>
    </div>
  );
}