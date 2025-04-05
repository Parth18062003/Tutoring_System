// src/app/(app)/learn/quiz/page.tsx (or similar path)
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLearningSessionStore } from '@/lib/store';
import { fetchAdaptiveContent, submitInteractionFeedback } from '@/lib/adaptive-api';
import { StructuredContentResponse, ContentSection, FeedbackPayload } from '@/types/adaptive';
import LoadingSkeleton from '@/components/adaptive/LoadingSkeleton';
import { ErrorMessage } from '@/components/adaptive/ErrorMessage';
import { ActionControls } from '@/components/adaptive/ActionControls';
import { QuizQuestionInteractive } from '@/components/adaptive/QuizQuestionInteractive'; // Crucial component
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, XCircle, Send, Percent, Clock, BrainCircuit, BarChart4 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface QuizResult {
    scorePercentage: number;
    correctCount: number;
    totalQuestions: number;
    // Optional: could store per-question feedback later
}

// Helper to extract the correct answer from the 'answerDetail' string
// NOTE: This is HIGHLY dependent on the backend's output format within 'answerDetail'.
// Adjust this logic based on how the LLM formats the answer.
const extractCorrectAnswer = (answerDetail: string | undefined): string | null => {
    if (!answerDetail) return null;

    // Attempt 1: Look for "Answer: ..." pattern explicitly
    let match = answerDetail.match(/(?:Correct Answer|Answer):\s*(.*?)($|\nHint:|\nExplanation:|\nWhy:)/i);
    if (match && match[1]) return match[1].trim();

    // Attempt 2: For MCQs, look for "(A)", "(B)" etc. often mentioned first
    // This is less reliable as explanation might mention other options.
    // Example: "Answer Details: (B) Photosynthesis is correct because..."
    match = answerDetail.match(/^\s*\(([A-Z])\)\s*([^(\n]+)/i);
    if (match && match[2]) return match[2].trim(); // Return the text associated with the letter

     // Attempt 3: If it starts with the option text directly (less likely structured this way)
     // Example: "Answer Details: Photosynthesis - This is the process..."
     // We'd need the options list here to compare, making this complex.

    // Fallback: Return the first line if no specific marker found? Risky.
    // const firstLine = answerDetail.split('\n')[0].trim();
    // return firstLine; // Use with caution

    console.warn("Could not reliably extract correct answer from answerDetail:", answerDetail);
    return null; // Indicate failure
};


export default function QuizPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizContent, setQuizContent] = useState<StructuredContentResponse | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const {
    currentInteractionId,
    currentSubject: subjectFromStore,
    currentTopic: topicFromStore,
    setInteraction,
  } = useLearningSessionStore();

  const initialSubject = searchParams.get('subject') || subjectFromStore || 'Science';
  const initialTopic = searchParams.get('topic') || topicFromStore;

  // Load Quiz content
  const loadQuiz = useCallback(async (subject: string, topic?: string | null) => {
    setIsLoading(true);
    setError(null);
    setQuizContent(null);
    setUserAnswers({});
    setSubmitted(false);
    setResults(null);
    setStartTime(Date.now());

    // Optional: Submit feedback for previous non-quiz interaction
    if (currentInteractionId) {
      try {
        // Check if previous interaction was *not* a quiz submission? Maybe not necessary.
        await submitInteractionFeedback({ interaction_id: currentInteractionId });
      } catch (feedbackError: any) {
        console.warn("Failed to submit feedback for previous interaction:", feedbackError);
      }
    }

    // Fetch new quiz content
    try {
      const { metadata, content } = await fetchAdaptiveContent({
        content_type: 'quiz', // Request quiz content
        subject: subject,
        topic: topic,
      });

      if (!content || !Array.isArray(content.sections) || content.sections.length === 0) {
        throw new Error("Received invalid or empty quiz content from API.");
      }

       // Basic validation: ensure sections look like questions
       if (!content.sections.every(s => s.questionText || s.contentMarkdown?.includes('?'))) {
           console.warn("Some sections might not be questions:", content.sections);
           // Proceed anyway, but log a warning
       }

      setQuizContent(content);
      setInteraction(metadata.interactionId, metadata.subject, metadata.topic);

    } catch (err: any) {
      console.error("Failed to load quiz:", err);
      setError(err.message || "An unexpected error occurred while loading the quiz.");
      setQuizContent(null);
      toast.error("Failed to load quiz", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [currentInteractionId, setInteraction]);

  // Initial load effect
  useEffect(() => {
     if (initialSubject && initialTopic) { // Require topic for quiz
        loadQuiz(initialSubject, initialTopic);
    } else {
        setError("Please select a subject and topic to start a quiz.");
        setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSubject, initialTopic]);

  // Handle answer changes from interactive questions
  const handleAnswerChange = useCallback((questionIndex: number, answer: string | string[]) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  }, []);

  // Handle quiz submission
  const handleSubmitQuiz = useCallback(async () => {
    if (!quizContent || !currentInteractionId) {
      toast.error("Cannot submit quiz. Content or Interaction ID missing.");
      return;
    }

    setIsSubmitting(true);
    setSubmitted(true); // Mark as submitted to change UI state

    let correctCount = 0;
    const totalQuestions = quizContent.sections.length;

    quizContent.sections.forEach((section, index) => {
      const userAnswer = userAnswers[index];
      const correctAnswer = extractCorrectAnswer(section.answerDetail); // Get correct answer

      // Simple comparison (needs refinement for different question types/formats)
      // Case-insensitive comparison for strings might be good
      if (correctAnswer !== null && userAnswer !== undefined) {
          const formatAnswer = (ans: string | string[]) =>
              Array.isArray(ans) ? ans.join(',').toLowerCase().trim() : String(ans).toLowerCase().trim();

          if (formatAnswer(userAnswer) === formatAnswer(correctAnswer)) {
             correctCount++;
          }
      }
    });

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const calculatedResults: QuizResult = {
      scorePercentage,
      correctCount,
      totalQuestions,
    };
    setResults(calculatedResults); // Update results state for display

    // Prepare feedback payload for the backend
    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
    const feedbackPayload: FeedbackPayload = {
      interaction_id: currentInteractionId,
      assessment_score: scorePercentage,
      time_spent_seconds: timeSpentSeconds,
      completion_percentage: 100, // Quiz considered 100% completed on submission
      // Could potentially add user ratings here if collected before submission
    };

    try {
      await submitInteractionFeedback(feedbackPayload);
      toast.success(`Quiz submitted! Score: ${scorePercentage}%`);
    } catch (err: any) {
      console.error("Failed to submit quiz feedback:", err);
      toast.error("Failed to submit quiz results", { description: err.message });
      // Keep showing results even if backend feedback fails
    } finally {
      setIsSubmitting(false);
    }
  }, [quizContent, userAnswers, currentInteractionId, startTime]);


  // Handle action requests (after quiz submission)
   const handleRequestNextContent = useCallback(async (contentType: string, topic?: string | null) => {
     const subjectToRequest = quizContent?.subject || initialSubject;
     const topicToRequest = topic || quizContent?.topic || initialTopic;

     setIsLoading(true); // Show loading for next step

     // No extra feedback needed here as quiz submission already sent feedback
     // Navigate or load next content directly

     if (contentType === 'lesson') {
       console.log(`Requesting Lesson for Subject: ${subjectToRequest}, Topic: ${topicToRequest}`);
       // Navigate to Lesson page
       toast.info("Navigating to Lesson (implementation needed)");
       setIsLoading(false);
     } else if (contentType === 'quiz') {
        console.log(`Requesting another Quiz for Subject: ${subjectToRequest}, Topic: ${topicToRequest}`);
        // Reload the quiz page, possibly with the same topic or letting backend decide
        await loadQuiz(subjectToRequest, topicToRequest); // Reloads the component
        // setIsLoading(false); // loadQuiz handles this
     } else {
       console.log(`Requesting unhandled content type: ${contentType}`);
       setIsLoading(false);
     }
   }, [quizContent, initialSubject, initialTopic, loadQuiz]);

   // Callback for ActionControls (used *after* submission)
   const handleSubmitFeedbackAndProceed = useCallback(async (payload: FeedbackPayload) => {
       // Feedback (ratings/text) collected by ActionControls *after* the quiz score is shown
       if (!payload.interaction_id) return; // Should have interaction ID
        setIsLoading(true);
        try {
            // Merge score/time from original submission if needed, though AC usually sends only ratings/text
             const finalPayload = {
                interaction_id: payload.interaction_id,
                // Score/time already sent, only send ratings/text from AC payload
                engagement_rating: payload.engagement_rating,
                helpful_rating: payload.helpful_rating,
                feedback_text: payload.feedback_text,
             };
            await submitInteractionFeedback(finalPayload);
            toast.info("Ratings submitted.");
            // ActionControls will call handleRequestNextContent next
        } catch (err: any) {
            toast.error("Failed to submit ratings", { description: err.message });
        } finally {
            setIsLoading(false);
        }
   }, []);


  // Render header
  const renderHeader = () => {
    const topic = quizContent?.topic || initialTopic;
    const subject = quizContent?.subject || initialSubject;
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
            <h1 className="text-3xl font-bold tracking-tight">{topic} - Quiz</h1>
          </div>
           {/* Maybe add question count here? */}
           {quizContent && (
               <p className="text-muted-foreground text-sm">
                   {quizContent.sections.length} Question{quizContent.sections.length !== 1 ? 's' : ''}
               </p>
           )}
        </div>
        {/* Optional: Display instructional plan details */}
         {quizContent?.instructionalPlan && (
          <Card className="bg-muted/40">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                 <div>
                   <p className="text-muted-foreground mb-1 flex items-center gap-1">
                     <BrainCircuit className="h-3.5 w-3.5" /> Strategy
                   </p>
                   <p className="font-medium">{quizContent.instructionalPlan.teachingStrategy}</p>
                 </div>
                 <div>
                    <p className="text-muted-foreground mb-1 flex items-center gap-1">
                        <BarChart4 className="h-3.5 w-3.5" /> Difficulty
                    </p>
                    <p className="font-medium capitalize">{quizContent.instructionalPlan.targetDifficulty}</p>
                 </div>
                 {/* Add others if relevant (Length, Scaffolding, FeedbackStyle) */}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render the main quiz content area
  const renderContent = () => {
    if (isLoading && !quizContent) { // Show skeleton only on initial load
      return <LoadingSkeleton content='quiz' />;
    }

    if (error) {
      return <ErrorMessage title="Failed to load Quiz" message={error} />;
    }

    if (!quizContent || quizContent.sections.length === 0) {
      return <ErrorMessage title="No Questions" message="No quiz questions available for this topic yet." />;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          {!submitted && <CardDescription>Answer the following questions.</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {quizContent.sections.map((section, index) => {
            const questionNumber = index + 1;
            const userAnswer = userAnswers[index];
            const correctAnswer = submitted ? extractCorrectAnswer(section.answerDetail) : null;
            const isCorrect = submitted && correctAnswer !== null && userAnswer !== undefined &&
                             (Array.isArray(userAnswer) ? userAnswer.join(',') : String(userAnswer)).toLowerCase().trim() ===
                             String(correctAnswer).toLowerCase().trim();

            return (
              <div key={`question-${index}`} className="p-4 border rounded-md relative">
                {/* Question Content */}
                <QuizQuestionInteractive
                  questionNumber={questionNumber}
                  questionText={section.questionText || section.contentMarkdown || `Question ${questionNumber}`}
                  onAnswerChange={(qNum, answer) => handleAnswerChange(index, answer)} // Use index here
                  initialAnswer={userAnswers[index]}
                  // Disable input after submission
                  // disabled={submitted} // Feature needs to be added to QuizQuestionInteractive
                />

                 {/* Feedback Overlay (shown after submission) */}
                 {submitted && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-md"
                     >
                         <div className="text-center">
                            {isCorrect ? (
                                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                            ) : (
                                <XCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
                            )}
                            <p className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                                {isCorrect ? 'Correct!' : 'Incorrect'}
                            </p>
                            {!isCorrect && correctAnswer && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    Correct answer: {correctAnswer}
                                </p>
                            )}
                             {/* Show hint/explanation from answerDetail */}
                             {section.answerDetail && (
                                <Alert className="mt-3 text-left text-sm">
                                    <AlertTitle>Explanation</AlertTitle>
                                    <AlertDescription>
                                        <MarkdownRenderer content={section.answerDetail}/>
                                    </AlertDescription>
                                </Alert>
                             )}
                         </div>
                     </motion.div>
                 )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  // Render the results section after submission
  const renderResults = () => {
    if (!submitted || !results) return null;

    const getResultMessage = () => {
        if (results.scorePercentage >= 90) return "Excellent work!";
        if (results.scorePercentage >= 70) return "Good job!";
        if (results.scorePercentage >= 50) return "Not bad, keep practicing!";
        return "Keep working on this topic!";
    };

    return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
       >
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-4xl font-bold">{results.scorePercentage}%</p>
            <p className="text-muted-foreground">
              ({results.correctCount} out of {results.totalQuestions} correct)
            </p>
            <p className="text-lg font-medium">{getResultMessage()}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

   // Render Submit button or ActionControls
  const renderActions = () => {
    if (isLoading) return null; // No actions while loading initially
    if (error) return null; // No actions if error loading quiz

    if (!submitted) {
      const canSubmit = Object.keys(userAnswers).length === quizContent?.sections.length;
      return (
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={handleSubmitQuiz}
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? 'Submitting...' : <><Send className="mr-2 h-4 w-4" /> Submit Quiz</>}
          </Button>
           {!canSubmit && quizContent && (
               <p className="text-xs text-muted-foreground mt-2">
                  Please answer all {quizContent.sections.length} questions.
               </p>
           )}
        </div>
      );
    } else {
      // Show ActionControls only after submission and results are available
       if (!results) return null; // Don't show AC if results calculation failed somehow

      return (
        <div className="mt-8">
          <Separator className="mb-6" />
          <ActionControls
            interactionId={currentInteractionId} // Use the ID from the loaded quiz
            isLoading={isSubmitting || isLoading} // Disable if submitting feedback or loading next
            onSubmitFeedback={handleSubmitFeedbackAndProceed} // Submits ratings/text
            onRequestNextContent={handleRequestNextContent} // Navigates/loads next content
            showNextLessonButton={true}
            showQuizButton={true} // Option to retry quiz
            nextActionLabel="Next Lesson"
            nextActionContentType="lesson"
            completionData={{
               assessment_score: results.scorePercentage, // Already submitted, but pass for context
               time_spent_seconds: Math.floor((Date.now() - startTime) / 1000), // Updated time
               completion_percentage: 100
            }}
          />
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {renderHeader()}
      {renderContent()}
      {renderResults()}
      {renderActions()}
    </div>
  );
}