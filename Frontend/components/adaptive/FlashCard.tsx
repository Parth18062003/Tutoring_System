'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLearningSessionStore } from '@/lib/store';
import { fetchAdaptiveContent, submitInteractionFeedback } from '@/lib/adaptive-api';
import { StructuredContentResponse, ContentSection, FeedbackPayload } from '@/types/adaptive';
import LoadingSkeleton from '@/components/adaptive/LoadingSkeleton';
import { ErrorMessage } from '@/components/adaptive/ErrorMessage';
import { ActionControls } from '@/components/adaptive/ActionControls';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { FlippableCard } from '../FlippableCard';

interface FlashcardData {
    front: string;
    back: string;
}

// Helper function to parse flashcard sections
const parseFlashcardSections = (sections: ContentSection[]): FlashcardData[] => {
  const flashcards: FlashcardData[] = [];
  console.log("Parsing sections:", sections); // Log input sections for debugging

  // Iterate through sections, expecting front/back pairs
  for (let i = 0; i < sections.length; i++) {
      const currentSection = sections[i];

      // Look for a 'front' section
      if (currentSection.sectionType?.includes('front')) {
          // Check if there's a 'back' section immediately following it
          if (i + 1 < sections.length) {
              const nextSection = sections[i + 1];
              if (nextSection.sectionType?.includes('back')) {
                  // Found a pair! Use contentMarkdown from each.
                  flashcards.push({
                      front: currentSection.contentMarkdown || currentSection.title || 'Error: Missing Front Content', // Fallback content
                      back: nextSection.contentMarkdown || nextSection.title || 'Error: Missing Back Content'        // Fallback content
                  });
                  // Skip the next section since we've processed it as the back
                  i++;
              } else {
                  // Found a 'front' but the next section wasn't a 'back'
                  console.warn(`Found a 'front' section at index ${i} but the next section (index ${i+1}) was not a 'back'. Skipping.`);
                   // Optional: Still add the front if you want single-sided cards?
                   // flashcards.push({ front: currentSection.contentMarkdown || 'Front', back: 'Missing Back' });
              }
          } else {
              // Found a 'front' at the very end of the array, no matching 'back' possible
              console.warn(`Found a 'front' section at the end (index ${i}) with no subsequent 'back' section. Skipping.`);
               // Optional: Still add the front?
               // flashcards.push({ front: currentSection.contentMarkdown || 'Front', back: 'Missing Back' });
          }
      } else {
          // This section wasn't a 'front', log it if unexpected
          if (!currentSection.sectionType?.includes('back')) {
               console.log(`Skipping section at index ${i} as it's not a 'front' type (Type: ${currentSection.sectionType})`);
          }
          // We implicitly skip 'back' sections here because we only start pairing from a 'front'
      }
  }

  console.log("Parsed flashcards:", flashcards); // Log the result
  return flashcards;
};


export default function Flashcard() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<StructuredContentResponse | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);

  const {
    currentInteractionId,
    currentSubject: subjectFromStore,
    currentTopic: topicFromStore,
    setInteraction,
  } = useLearningSessionStore();

  const initialSubject = searchParams.get('subject') || subjectFromStore || 'Science';
  const initialTopic = searchParams.get('topic') || topicFromStore;

  // Load flashcards
  const loadFlashcards = useCallback(async (subject: string, topic?: string | null) => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setFlashcards([]);
    setActiveCardIndex(0);
    setStartTime(Date.now());

    // Optional: Submit feedback for previous interaction
    if (currentInteractionId) {
      try {
        await submitInteractionFeedback({ interaction_id: currentInteractionId });
      } catch (feedbackError: any) {
        console.warn("Failed to submit feedback for previous interaction:", feedbackError);
        // Don't block loading flashcards if feedback fails
      }
    }

    // Fetch new flashcard content
    try {
      const { metadata, content } = await fetchAdaptiveContent({
        content_type: 'flashcard',
        subject: subject,
        topic: topic,
      });

      if (!content || !Array.isArray(content.sections)) {
         throw new Error("Received invalid or empty content from API.");
      }

      setApiResponse(content); // Store the full response if needed
      const parsedCards = parseFlashcardSections(content.sections);
      if (parsedCards.length === 0) {
          throw new Error("Could not parse any flashcards from the received content.");
      }
      setFlashcards(parsedCards);
      setInteraction(metadata.interactionId, metadata.subject, metadata.topic);

    } catch (err: any) {
      console.error("Failed to load flashcards:", err);
      setError(err.message || "An unexpected error occurred while loading flashcards.");
      setFlashcards([]);
      toast.error("Failed to load flashcards", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [currentInteractionId, setInteraction]);

    useEffect(() => {
        if (initialSubject && initialTopic) { // Require topic for flashcards
            loadFlashcards(initialSubject, initialTopic);
        } else {
            setError("Please select a subject and topic to view flashcards.");
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSubject, initialTopic]);

  // Card Navigation
  const goToNextCard = useCallback(() => {
    setActiveCardIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
  }, [flashcards.length]);

  const goToPrevCard = useCallback(() => {
    setActiveCardIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Handle action requests (e.g., request quiz after flashcards)
  const handleRequestNextContent = useCallback(async (contentType: string, topic?: string | null) => {
    const subjectToRequest = apiResponse?.subject || initialSubject;
    const topicToRequest = topic || apiResponse?.topic || initialTopic;

    setIsLoading(true);
    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

     if(currentInteractionId) {
        await submitInteractionFeedback({
             interaction_id: currentInteractionId,
             time_spent_seconds: timeSpentSeconds,
             // Could add a 'completion_percentage' based on cards viewed?
             completion_percentage: Math.round(((activeCardIndex + 1) / flashcards.length) * 100)
         });
     }

    if (contentType === 'quiz') {
      console.log(`Requesting Quiz for Subject: ${subjectToRequest}, Topic: ${topicToRequest}`);
      // Navigate to Quiz page
      toast.info("Navigating to Quiz (implementation needed)");
      setIsLoading(false);
    } else if (contentType === 'lesson') {
      console.log(`Requesting Lesson for Subject: ${subjectToRequest}, Topic: ${topicToRequest}`);
       // Navigate to Lesson page
      toast.info("Navigating to Lesson (implementation needed)");
      setIsLoading(false);
    } else {
      console.log(`Requesting unhandled content type: ${contentType}`);
      setIsLoading(false);
    }
  }, [apiResponse, initialSubject, initialTopic, startTime, currentInteractionId, activeCardIndex, flashcards.length]);

  // Handle feedback submission (called by ActionControls)
  const handleSubmitFeedbackAndProceed = useCallback(async (payload: FeedbackPayload) => {
     if (!payload.interaction_id) {
       await handleRequestNextContent('quiz'); // Default next action
       return;
     }

     setIsLoading(true);
     try {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const completion = Math.round(((activeCardIndex + 1) / flashcards.length) * 100);
        const finalPayload = {
            ...payload,
            time_spent_seconds: payload.time_spent_seconds ?? timeSpent,
            completion_percentage: payload.completion_percentage ?? completion,
        };
       await submitInteractionFeedback(finalPayload);
       toast.success("Feedback submitted!");
       // ActionControls will call handleRequestNextContent
     } catch (err: any) {
       toast.error("Failed to submit feedback", { description: err.message });
     } finally {
       setIsLoading(false);
     }
   }, [startTime, activeCardIndex, flashcards.length, handleRequestNextContent]);

  // Memoize current card data
  const currentCard = useMemo(() => {
    return flashcards.length > 0 ? flashcards[activeCardIndex] : null;
  }, [flashcards, activeCardIndex]);

  // Render header
  const renderHeader = () => {
    const topic = apiResponse?.topic || initialTopic;
    const subject = apiResponse?.subject || initialSubject;
    return (
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <Button
                 variant="ghost"
                 size="sm"
                 className="text-muted-foreground"
                 onClick={() => window.history.back()}
               >
                 <ArrowLeft className="h-4 w-4 mr-1" /> Back
               </Button>
               <Badge variant="outline" className="text-sm">{subject}</Badge>
             </div>
            <h1 className="text-3xl font-bold tracking-tight">{topic} - Flashcards</h1>
          </div>
          {/* Optional: Add Print/Download if useful for flashcards */}
        </div>
      </div>
    );
  };

  // Render main content
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton content='flashcard' />;
    }

    if (error) {
      return <ErrorMessage title="Failed to load Flashcards" message={error} />;
    }

    if (!currentCard) {
      return <ErrorMessage title="No Content" message="No flashcards were found for this topic." />;
    }

    return (
      <div className="flex flex-col items-center">
         {/* Flashcard Display */}
        <div className="w-full max-w-md mb-6">
           <FlippableCard
             key={activeCardIndex} // Add key to force re-render/reset flip state on card change
             frontContent={currentCard.front}
             backContent={currentCard.back}
           />
        </div>

        {/* Navigation and Progress */}
        <div className="flex items-center justify-between w-full max-w-md">
          <Button
            variant="outline"
            onClick={goToPrevCard}
            disabled={activeCardIndex === 0}
            aria-label="Previous card"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Card {activeCardIndex + 1} of {flashcards.length}
          </span>
          <Button
            variant="outline"
            onClick={goToNextCard}
            disabled={activeCardIndex === flashcards.length - 1}
            aria-label="Next card"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {renderHeader()}
      {renderContent()}

      {/* Action Controls */}
      {!isLoading && !error && flashcards.length > 0 && (
        <div className="mt-10">
          <Separator className="mb-6" />
          <ActionControls
            interactionId={currentInteractionId}
            isLoading={isLoading}
            onSubmitFeedback={handleSubmitFeedbackAndProceed}
            onRequestNextContent={handleRequestNextContent}
            showNextLessonButton={false} // Maybe don't need 'Next Lesson' from flashcards
            showQuizButton={true} // Quiz is a common next step
            nextActionLabel="Try a Quiz" // Button will be the quiz button if showNextLessonButton is false
            nextActionContentType="quiz"
            completionData={{ // Pass completion data based on viewed cards
                completion_percentage: Math.round(((activeCardIndex + 1) / flashcards.length) * 100),
                time_spent_seconds: Math.floor((Date.now() - startTime) / 1000)
            }}
          />
        </div>
      )}
    </div>
  );
}