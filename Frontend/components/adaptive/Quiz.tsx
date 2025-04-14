// src/app/(app)/learn/quiz/page.tsx (Complete, Corrected Assessment & Feedback Flow)
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLearningSessionStore } from "@/lib/store"; // Adjust path if necessary
import {
  fetchAdaptiveContent,
  submitInteractionFeedback,
} from "@/lib/adaptive-api"; // Adjust path if necessary
import {
  StructuredContentResponse,
  ContentSection,
  FeedbackPayload,
  InteractionMetadata,
} from "@/types/adaptive"; // Adjust path if necessary
import LoadingSkeleton from "@/components/adaptive/LoadingSkeleton"; // Adjust path if necessary
import { ErrorMessage } from "@/components/adaptive/ErrorMessage"; // Adjust path if necessary
import { ActionControls } from "@/components/adaptive/ActionControls"; // Adjust path if necessary
// Assuming QuizQuestionInteractive correctly passes option *text* for MCQs in onAnswerChange
import { QuizQuestionInteractive } from "@/components/adaptive/QuizQuestionInteractive"; // Adjust path if necessary
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Send,
  BrainCircuit,
  BarChart4,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MarkdownRenderer } from "../MarkdownRenderer";

// Define QuizResult interface
interface QuizResult {
  scorePercentage: number;
  correctCount: number;
  totalQuestions: number;
}

// --- Answer Extraction Logic ---

// Helper to parse MCQ options from the question text, returning array of option texts
const parseMcqOptionTexts = (text: string | undefined): string[] | null => {
  if (!text) return null;
  const lines = text.trim().split("\n");
  const options: string[] = [];
  const optionRegex = /^\s*\([A-Z]\)\s*(.*)/i; // Matches "(A) Option Text"
  let foundOptions = false;

  for (const line of lines) {
    const match = line.match(optionRegex);
    if (match && match[1]) {
      options.push(match[1].trim());
      foundOptions = true;
    } else if (foundOptions && line.trim() !== "") {
      // If we found options and hit a non-empty line that isn't an option,
      // assume options block ended (depends on LLM formatting)
      // break;
    } else if (!foundOptions && line.trim() === "") {
      // Allow blank lines before options start
      continue;
    }
  }
  // Require at least 2 options to consider it MCQ format parsed successfully
  return options.length >= 2 ? options : null;
};

// Helper to extract the *text* of the correct answer option OR direct text answer
const extractCorrectAnswerText = (
  answerDetail: string | undefined,
  mcqOptions: string[] | null
): string | null => {
  if (!answerDetail) return null;

  // 1. Try to find the Key first, then map to option text if options were parsed
  const keyMatch = answerDetail.match(/Correct Answer:\s*\(?([A-Z])\)?/i);
  if (keyMatch && keyMatch[1] && mcqOptions) {
    const correctKey = keyMatch[1].toUpperCase();
    const keyIndex = correctKey.charCodeAt(0) - 65; // A=0, B=1...
    if (keyIndex >= 0 && keyIndex < mcqOptions.length) {
      console.debug(
        `[extractCorrect] Found key ${correctKey}, matching text: ${mcqOptions[keyIndex]}`
      );
      return mcqOptions[keyIndex].trim(); // Return the text from the options array
    } else {
      console.warn(
        `[extractCorrect] Extracted key ${correctKey} out of bounds for options`,
        mcqOptions
      );
      // Fall through to text extraction attempt
    }
  }

  // 2. If key extraction/mapping failed OR it's not MCQ, extract text directly after "Correct Answer:"
  const textMatch = answerDetail.match(
    /Correct Answer:\s*(.*?)(?:\nHint:|\nExplanation:|\nGuiding Question:|$)/i
  );
  if (textMatch && textMatch[1]) {
    const extractedText = textMatch[1].trim();
    // Avoid returning just the MCQ key format like "(A)" or "A."
    if (!/^\s*\(?[A-Z]\)?\.?\s*$/.test(extractedText)) {
      console.debug(`[extractCorrect] Found text directly: ${extractedText}`);
      return extractedText;
    }
  }

  console.warn(
    "[extractCorrect] Could not extract correct answer text from detail:",
    answerDetail
  );
  return null; // Indicate failure
};

export default function QuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizContent, setQuizContent] =
    useState<StructuredContentResponse | null>(null);
  // Store user answers as { questionIndex: selectedValue } - could be option text or textarea text
  const [userAnswers, setUserAnswers] = useState<
    Record<number, string | string[]>
  >({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isSubmittingRatings, setIsSubmittingRatings] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const {
    currentSubject: subjectFromStore,
    currentTopic: topicFromStore,
    setInteraction,
  } = useLearningSessionStore();

  const quizInteractionIdRef = useRef<string | null>(null);

  const initialSubject = useMemo(
    () => searchParams.get("subject") || subjectFromStore || "Science",
    [searchParams, subjectFromStore]
  );
  const initialTopic = useMemo(
    () => searchParams.get("topic") || topicFromStore,
    [searchParams, topicFromStore]
  );

  // --- Load Quiz Content ---
  const loadQuiz = useCallback(
    async (subject: string, topic: string | null) => {
      if (!subject || !topic) {
        setError("Subject and Topic are required.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      setQuizContent(null);
      setUserAnswers({});
      setSubmitted(false);
      setResults(null);
      setStartTime(0);
      quizInteractionIdRef.current = null;

      try {
        console.log(`Fetching quiz for Subject: ${subject}, Topic: ${topic}`);
        // Assume fetchAdaptiveContent handles potential prior feedback submission if needed
        const { metadata, content } = await fetchAdaptiveContent({
          content_type: "quiz",
          subject: subject,
          topic: topic,
        });

        if (
          !content ||
          content.contentType !== "quiz" ||
          !Array.isArray(content.sections) ||
          content.sections.length === 0
        )
          throw new Error("Invalid/empty quiz content.");
        if (!metadata.interactionId)
          throw new Error("Missing Interaction ID for quiz.");

        setQuizContent(content);
        quizInteractionIdRef.current = metadata.interactionId;
        setStartTime(Date.now());
      } catch (err: any) {
        console.error("Failed to load quiz:", err);
        setError(err.message);
        setQuizContent(null);
        toast.error("Failed to load quiz", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // --- Initial Load Effect ---
  useEffect(() => {
    if (initialSubject && initialTopic && !hasInitiallyLoaded) {
      loadQuiz(initialSubject, initialTopic);
      setHasInitiallyLoaded(true);
    } else if ((!initialSubject || !initialTopic) && !isLoading) {
      setError("Subject/Topic required.");
      setIsLoading(false);
    }
  }, [initialSubject, initialTopic, hasInitiallyLoaded, loadQuiz]);

  // --- Handle Answer Changes ---
  const handleAnswerChange = useCallback(
    (questionIndex: number, answer: string | string[]) => {
      // Store the raw answer returned by QuizQuestionInteractive (option text or textarea content)
      const rawAnswer = Array.isArray(answer) ? answer[0] : answer;
      setUserAnswers((prev) => ({ ...prev, [questionIndex]: rawAnswer }));
    },
    []
  );

  // --- Handle Quiz Submission & Assessment ---
  const handleSubmitQuiz = useCallback(async () => {
    const interactionIdForSubmit = quizInteractionIdRef.current;
    if (!quizContent || !interactionIdForSubmit) {
      toast.error("Cannot submit quiz.");
      return;
    }

    setIsSubmittingQuiz(true);
    setSubmitted(true);

    let correctCount = 0;
    const totalQuestions = quizContent.sections.length;
    const assessmentLog: string[] = [];

    quizContent.sections.forEach((section, index) => {
      if (
        section.sectionType !== "quiz_question" ||
        !section.questionText ||
        !section.answerDetail
      )
        return;

      const userAnswerRaw = userAnswers[index];
      // Parse options here to pass to the extractor helper
      const mcqOptions = parseMcqOptionTexts(section.questionText);
      // Extract the *TEXT* of the correct answer using the helper
      const correctAnswerText = extractCorrectAnswerText(
        section.answerDetail,
        mcqOptions
      );

      let isCorrect = false;
      // Normalize both user answer and correct answer for comparison
      // Handles potential arrays from multi-select (though not currently supported by interactive comp)
      const userAnswerNorm = String(
        Array.isArray(userAnswerRaw) ? userAnswerRaw[0] : (userAnswerRaw ?? "")
      )
        .trim()
        .toLowerCase();
      const correctAnswerNorm =
        typeof correctAnswerText === "string"
          ? correctAnswerText.trim().toLowerCase()
          : null;

      if (correctAnswerNorm !== null && userAnswerNorm === correctAnswerNorm) {
        isCorrect = true;
        correctCount++;
      }

      assessmentLog.push(
        `Q${index + 1}: User='${userAnswerNorm}', Correct='${correctAnswerNorm ?? "N/A"}', Result=${isCorrect}`
      );
    });
    console.log("Quiz Assessment Details:\n" + assessmentLog.join("\n"));

    const scorePercentage =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;
    const calculatedResults: QuizResult = {
      scorePercentage,
      correctCount,
      totalQuestions,
    };
    setResults(calculatedResults);

    // --- Submit objective results feedback ---
    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
    const feedbackPayload: FeedbackPayload = {
      interaction_id: interactionIdForSubmit,
      assessment_score: scorePercentage,
      time_spent_seconds: timeSpentSeconds,
      completion_percentage: 100, // Mark as complete on submission
      // Subjective fields are null/undefined here
    };

    try {
      console.log("Submitting quiz results feedback:", feedbackPayload);
      await submitInteractionFeedback(feedbackPayload);
      toast.success(`Quiz submitted! Score: ${scorePercentage}%`);
    } catch (err: any) {
      console.error("Failed submit feedback:", err);
      toast.error("Failed to submit results", { description: err.message });
    } finally {
      setIsSubmittingQuiz(false);
    }
  }, [quizContent, userAnswers, startTime]);

  // --- Handle Navigation/Next Content ---
  const handleRequestNextContent = useCallback(
    async (contentType: string, topic?: string | null) => {
      const subjectToRequest = quizContent?.subject || initialSubject;
      const topicToRequest = topic || quizContent?.topic || initialTopic;
      if (quizInteractionIdRef.current) {
        // Update store with completed quiz info
        setInteraction(
          quizInteractionIdRef.current,
          subjectToRequest,
          topicToRequest ?? null
        ); // Only 3 args
      }
      if (contentType === "lesson") {
        router.push(
          `/learn?subject=${encodeURIComponent(subjectToRequest)}&topic=${encodeURIComponent(topicToRequest || "")}`
        );
      } else if (contentType === "quiz") {
        setHasInitiallyLoaded(false); /* Let useEffect reload */
      } else {
        console.log(`Requesting unhandled type: ${contentType}`);
      }
    },
    [quizContent, initialSubject, initialTopic, router, results, setInteraction]
  );

  // --- Handle Subjective Feedback ---
  const handleSubmitSubjectiveFeedback = useCallback(
    async (payload: FeedbackPayload) => {
      const interactionIdForFeedback = quizInteractionIdRef.current;
      if (!interactionIdForFeedback) {
        toast.error("Quiz ID missing.");
        return;
      }
      if (
        payload.engagement_rating == null &&
        payload.helpful_rating == null &&
        !payload.feedback_text
      )
        return;
      setIsSubmittingRatings(true);
      try {
        const subjectivePayload: FeedbackPayload = {
          interaction_id: interactionIdForFeedback,
          engagement_rating: payload.engagement_rating,
          helpful_rating: payload.helpful_rating,
          feedback_text: payload.feedback_text?.trim() || null,
        };
        await submitInteractionFeedback(subjectivePayload);
        toast.info("Ratings submitted.");
      } catch (err: any) {
        toast.error("Failed to submit ratings", { description: err.message });
      } finally {
        setIsSubmittingRatings(false);
      }
    },
    []
  );

  // --- Render Functions ---
  const renderHeader = () => {
    const topic = quizContent?.topic || initialTopic || "Quiz";
    const subject = quizContent?.subject || initialSubject;
    return (
      <div className="mb-6">
        {" "}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {" "}
          <div>
            {" "}
            <div className="flex items-center gap-2 mb-1">
              {" "}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => router.back()}
              >
                {" "}
                <ArrowLeft className="h-4 w-4 mr-1" /> Back{" "}
              </Button>{" "}
              <Badge variant="outline" className="text-sm">
                {subject}
              </Badge>{" "}
            </div>{" "}
            <h1 className="text-3xl font-bold tracking-tight">
              {topic} - Quiz
            </h1>{" "}
          </div>{" "}
          {quizContent?.sections && (
            <p className="text-muted-foreground text-sm">
              {" "}
              {quizContent.sections.length} Question
              {quizContent.sections.length !== 1 ? "s" : ""}{" "}
            </p>
          )}{" "}
        </div>{" "}
        {quizContent?.instructionalPlan && (
          <Card className="bg-muted/40">
            {" "}
            <CardContent className="p-4">
              {" "}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {" "}
                <div>
                  {" "}
                  <p className="text-muted-foreground mb-1 flex items-center gap-1">
                    <BrainCircuit className="h-3.5 w-3.5" /> Strategy
                  </p>{" "}
                  <p className="font-medium">
                    {quizContent.instructionalPlan.teachingStrategy}
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="text-muted-foreground mb-1 flex items-center gap-1">
                    <BarChart4 className="h-3.5 w-3.5" /> Difficulty
                  </p>{" "}
                  <p className="font-medium capitalize">
                    {quizContent.instructionalPlan.targetDifficulty}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>
        )}{" "}
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading && !quizContent) return <LoadingSkeleton content="quiz" />;
    if (error)
      return <ErrorMessage title="Failed to load Quiz" message={error} />;
    if (!quizContent || quizContent.sections.length === 0)
      return (
        <ErrorMessage title="No Questions" message="No quiz questions found." />
      );
    return (
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>Questions</CardTitle>{" "}
          {!submitted && (
            <CardDescription>Answer the following questions.</CardDescription>
          )}{" "}
        </CardHeader>{" "}
        <CardContent className="space-y-6">
          {" "}
          {quizContent.sections.map((section, index) => {
            if (
              section.sectionType !== "quiz_question" ||
              !section.questionText ||
              !section.answerDetail
            ) {
              console.warn(`Skipping rendering section ${index}`);
              return null;
            }
            const qNum = section.questionNumber || index + 1;
            const userAnswer = userAnswers[index];
            const mcqOptions = parseMcqOptionTexts(section.questionText);
            const correctAnswerText = submitted
              ? extractCorrectAnswerText(section.answerDetail, mcqOptions)
              : null;
            let isCorrect = false;
            if (submitted) {
              const userAnswerNorm = String(
                Array.isArray(userAnswer) ? userAnswer[0] : (userAnswer ?? "")
              )
                .trim()
                .toLowerCase();
              const correctAnswerNorm =
                typeof correctAnswerText === "string"
                  ? correctAnswerText.trim().toLowerCase()
                  : null;
              if (
                correctAnswerNorm !== null &&
                userAnswerNorm === correctAnswerNorm
              ) {
                isCorrect = true;
              }
            }
            return (
              <div
                key={`question-${index}`}
                className={`p-4 border rounded-md relative transition-colors duration-300 ease-in-out ${submitted ? (isCorrect ? "border-green-300 bg-green-50/30" : "border-red-300 bg-red-50/30") : ""}`}
              >
                {" "}
                <QuizQuestionInteractive
                  questionNumber={qNum}
                  questionText={section.questionText}
                  onAnswerChange={(idx, ans) => handleAnswerChange(index, ans)}
                  /* Pass correct index */ initialAnswer={userAnswers[index]}
                />{" "}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 pt-4 border-t"
                  >
                    {" "}
                    <div className="flex items-center gap-2 mb-2">
                      {" "}
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}{" "}
                      <p
                        className={`font-semibold ${isCorrect ? "text-green-600" : "text-destructive"}`}
                      >
                        {" "}
                        {isCorrect ? "Correct!" : "Incorrect"}{" "}
                      </p>{" "}
                      {!isCorrect && correctAnswerText && (
                        <p className="text-sm text-muted-foreground ml-auto">
                          {" "}
                          Correct answer: {correctAnswerText}{" "}
                        </p>
                      )}{" "}
                    </div>{" "}
                    {section.answerDetail && (
                      <Alert
                        variant={isCorrect ? "default" : "destructive"}
                        className="text-sm"
                      >
                        <AlertTitle>Explanation / Hint</AlertTitle>
                        <AlertDescription>
                          <MarkdownRenderer content={section.answerDetail} />
                        </AlertDescription>
                      </Alert>
                    )}{" "}
                  </motion.div>
                )}{" "}
              </div>
            );
          })}{" "}
        </CardContent>{" "}
      </Card>
    );
  };

  const renderResults = () => {
    if (!submitted || !results) return null;
    const getResultMessage = (): string => {
      if (results.scorePercentage >= 90) return "Excellent!";
      if (results.scorePercentage >= 70) return "Good job!";
      if (results.scorePercentage >= 50) return "Keep practicing!";
      return "Review this topic.";
    };
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        {" "}
        <Card className="border-primary">
          {" "}
          <CardHeader>
            <CardTitle className="text-center text-2xl">Quiz Results</CardTitle>
          </CardHeader>{" "}
          <CardContent className="text-center space-y-3">
            {" "}
            <p className="text-4xl font-bold">
              {results.scorePercentage}%
            </p>{" "}
            <p className="text-muted-foreground">
              ({results.correctCount} out of {results.totalQuestions} correct)
            </p>{" "}
            <p className="text-lg font-medium">{getResultMessage()}</p>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </motion.div>
    );
  };

  const renderActions = () => {
    if (isLoading && !quizContent) return null;
    if (error) return null;
    if (!submitted) {
      const canSubmit =
        quizContent &&
        Object.keys(userAnswers).length === quizContent.sections.length;
      return (
        <div className="mt-8 text-center">
          {" "}
          <Button
            size="lg"
            onClick={handleSubmitQuiz}
            disabled={isSubmittingQuiz || !canSubmit}
          >
            {" "}
            {isSubmittingQuiz ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Submit Quiz
              </>
            )}{" "}
          </Button>{" "}
          {!canSubmit && quizContent && (
            <p className="text-xs text-muted-foreground mt-2">
              Please answer all {quizContent.sections.length} questions.
            </p>
          )}{" "}
        </div>
      );
    } else {
      if (!results) return null;
      return (
        <div className="mt-8">
          {" "}
          <Separator className="mb-6" />{" "}
          <ActionControls
            interactionId={quizInteractionIdRef.current}
            isLoading={isLoading || isSubmittingRatings}
            onSubmitFeedback={handleSubmitSubjectiveFeedback}
            onRequestNextContent={handleRequestNextContent}
            showNextLessonButton={true}
            showQuizButton={true}
            nextActionLabel="Next Lesson"
            nextActionContentType="lesson"
            completionData={{
              assessment_score: results.scorePercentage,
              time_spent_seconds: Math.floor((Date.now() - startTime) / 1000),
              completion_percentage: 100,
            }}
          />{" "}
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
