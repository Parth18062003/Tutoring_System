import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SessionFeedback } from '@/types/tutor';
import { submitFeedback } from '@/lib/content-api';
import { toast } from 'sonner';

interface FeedbackDialogProps {
  interactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: string;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackDialog({
  interactionId,
  open,
  onOpenChange,
  contentType,
  onFeedbackSubmitted
}: FeedbackDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackData, setFeedbackData] = useState<Partial<SessionFeedback>>({
    interaction_id: interactionId,
    engagement_rating: 3,
    helpful_rating: 3,
    completion_percentage: 100
  });
  
  const isQuiz = contentType === 'quiz' || contentType === 'assessment';
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const success = await submitFeedback(feedbackData as SessionFeedback);
      if (success) {
        toast.success("Thank you for your feedback!");
        onOpenChange(false);
        if (onFeedbackSubmitted) onFeedbackSubmitted();
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
      console.error("Feedback submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How was this content?</DialogTitle>
          <DialogDescription>
            Your feedback helps our AI tutor adapt to your needs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="engagement">Engagement (1-5)</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm">😴</span>
              <Slider
                id="engagement"
                min={1}
                max={5}
                step={1}
                value={[feedbackData.engagement_rating || 3]}
                onValueChange={(value) => setFeedbackData({
                  ...feedbackData,
                  engagement_rating: value[0]
                })}
                className="flex-1"
              />
              <span className="text-sm">😃</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="helpful">Helpfulness (1-5)</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm">👎</span>
              <Slider
                id="helpful"
                min={1}
                max={5}
                step={1}
                value={[feedbackData.helpful_rating || 3]}
                onValueChange={(value) => setFeedbackData({
                  ...feedbackData,
                  helpful_rating: value[0]
                })}
                className="flex-1"
              />
              <span className="text-sm">👍</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="completion">Completion</Label>
            <RadioGroup
              value={`${feedbackData.completion_percentage || 100}`}
              onValueChange={(value) => setFeedbackData({
                ...feedbackData,
                completion_percentage: Number(value)
              })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="100" id="complete" />
                <Label htmlFor="complete">Completed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50" id="partial" />
                <Label htmlFor="partial">Partially completed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="browsed" />
                <Label htmlFor="browsed">Just browsed</Label>
              </div>
            </RadioGroup>
          </div>
          
          {isQuiz && (
            <div className="space-y-2">
              <Label htmlFor="score">Quiz Score (0-100)</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="score"
                  min={0}
                  max={100}
                  step={5}
                  value={[feedbackData.assessment_score || 0]}
                  onValueChange={(value) => setFeedbackData({
                    ...feedbackData,
                    assessment_score: value[0]
                  })}
                  className="flex-1"
                />
                <span className="w-10 text-sm">{feedbackData.assessment_score || 0}%</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="feedback-text">Additional Feedback (Optional)</Label>
            <Textarea
              id="feedback-text"
              placeholder="What did you like or dislike about this content?"
              rows={3}
              value={feedbackData.feedback_text || ''}
              onChange={(e) => setFeedbackData({
                ...feedbackData,
                feedback_text: e.target.value
              })}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}