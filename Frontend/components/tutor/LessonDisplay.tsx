'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Star, AlertCircle, ThumbsUp, CheckCircle, Loader2 } from 'lucide-react';
import { submitFeedback } from '@/lib/rl-client';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface LessonDisplayProps {
  content: string;
  error?: string;
  isLoading: boolean;
  interactionId?: string;
}

export function LessonDisplay({ content, error, isLoading, interactionId }: LessonDisplayProps) {
  const [startTime] = useState<number>(Date.now());
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [helpfulRating, setHelpfulRating] = useState<number | null>(null);
  const [engagementRating, setEngagementRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Track when user reaches the bottom for completion percentage
    const handleScroll = () => {
      // Implementation of scroll tracking logic if needed
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleSubmitFeedback = async () => {
    if (!interactionId || !helpfulRating || !engagementRating) return;
    
    try {
      setIsSubmitting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      await submitFeedback({
        interaction_id: interactionId,
        time_spent_seconds: timeSpent,
        completion_percentage: 100, // Assume full completion for now
        helpful_rating: helpfulRating,
        engagement_rating: engagementRating,
      });
      
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStarRating = (
    currentRating: number | null, 
    onChange: (rating: number) => void,
    label: string
  ) => (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`transition-all duration-200 p-1 rounded-md
              ${currentRating && star <= currentRating 
                ? 'bg-yellow-100 dark:bg-yellow-900' 
                : 'hover:bg-muted'}`}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              size={24}
              className={
                (currentRating && star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-gray-400')
              }
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (error) {
    return (
      <Card className="border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold mb-2">Error Generating Content</h3>
              <p>{error}</p>
              <p className="text-sm mt-2 text-muted-foreground">
                Please try again or select a different subject/topic.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md overflow-hidden border-2">
      {isLoading && !content && (
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-32 w-full rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      )}
      
      {content && (
        <>
          <CardContent className="pt-6 prose dark:prose-invert max-w-none lg:prose-lg prose-headings:scroll-mt-20 prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-lg prose-img:mx-auto">            
            {isLoading && (
              <div className="flex items-center justify-center gap-2 p-2 text-sm bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating content...</span>
              </div>
            )}
            
            <MarkdownRenderer content={content} />
          </CardContent>
          
          {!isLoading && interactionId && !feedbackSubmitted && (
            <>
              <Separator />
              <CardFooter className="flex flex-col py-6 px-6 gap-6">
                <div className="w-full flex items-center justify-between text-base font-medium">
                  <h3>How was this learning material?</h3>
                  <p className="text-sm text-muted-foreground">Your feedback helps personalize future content</p>
                </div>
              
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
                  <div className="flex flex-col sm:flex-row gap-8">
                    {renderStarRating(helpfulRating, setHelpfulRating, "How helpful was this content?")}
                    {renderStarRating(engagementRating, setEngagementRating, "How engaging was this content?")}
                  </div>
                  
                  <Button 
                    onClick={handleSubmitFeedback} 
                    disabled={!helpfulRating || !engagementRating || isSubmitting}
                    className="px-6 h-12"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Submit Feedback
                      </span>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
          
          {feedbackSubmitted && (
            <CardFooter className="flex items-center justify-center py-6 text-green-600 border-t bg-green-50 dark:bg-green-950 dark:text-green-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Thank you for your feedback! It helps improve your learning experience.</span>
              </div>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
}