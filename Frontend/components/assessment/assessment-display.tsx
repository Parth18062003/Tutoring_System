// components/learning/assessment-display.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  PenTool,
} from "lucide-react";
import { useAssessment } from "@/hooks/use-assessment";
import { MultipleChoiceQuestion } from "./question-types/multiple-choice";
import { ShortAnswerQuestion } from "./question-types/short-answer";
import { TrueFalseQuestion } from "./question-types/true-false";
import { FillInBlankQuestion } from "./question-types/fill-in-blank";
import { AssessmentResults } from "./assessment-results";

interface AssessmentDisplayProps {
  subject: string;
  topic: string;
  questionCount?: number;
  onBack: () => void;
  onComplete?: (result: any) => void;
}

export function AssessmentDisplay({
  subject,
  topic,
  questionCount = 5,
  onBack,
  onComplete,
}: AssessmentDisplayProps) {
  const {
    assessmentId,
    questions,
    currentQuestionIndex,
    currentQuestion,
    responses,
    evaluationResult,
    loading,
    evaluating,
    error,
    completionPercentage,
    fetchAssessment,
    submitResponse,
    nextQuestion,
    previousQuestion,
    submitAssessment,
    totalQuestions,
    hasNextQuestion,
    hasPreviousQuestion,
    isComplete,
    getResponse,
    setQuestionIndex,
  } = useAssessment();

  const [activeTime, setActiveTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      fetchAssessment({
        subject,
        topic,
        question_count: questionCount,
        question_types: ["multiple_choice", "short_answer", "true_false"],
      })
      setHasInitiallyLoaded(true);
    }
  }, [fetchAssessment, subject, topic, questionCount, hasInitiallyLoaded]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setActiveTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleResponse = (response: string) => {
    if (!currentQuestion) return;
    submitResponse(currentQuestion.id, response);
  };

  const handleNext = () => {
    if (!currentQuestion || !getResponse(currentQuestion.id)) {
      toast.error("Please answer the question before proceeding");
      return;
    }
    nextQuestion();
  };

  const handleSubmitAssessment = async () => {
    if (!isComplete) {
      const unansweredCount = totalQuestions - Object.keys(responses).length;
      toast.error(
        `Please answer all questions. ${unansweredCount} remain unanswered.`
      );
      return;
    }

    const result = await submitAssessment();
    if (result) {
      setShowResults(true);
      if (onComplete) {
        onComplete(result);
      }
    }
  };

  const renderQuestionComponent = () => {
    if (!currentQuestion) return null;

    const questionProps = {
      question: currentQuestion,
      value: getResponse(currentQuestion.id),
      onChange: handleResponse,
      disabled: evaluating || showResults,
    };

    switch (currentQuestion.exercise_type) {
      case "multiple_choice":
        return <MultipleChoiceQuestion {...questionProps} />;
      case "true_false":
        return <TrueFalseQuestion {...questionProps} />;
      case "fill_in_blank":
        return <FillInBlankQuestion {...questionProps} />;
      default:
        return <ShortAnswerQuestion {...questionProps} />;
    }
  };

  if (showResults && evaluationResult) {
    return (
      <AssessmentResults
        result={evaluationResult}
        questions={questions}
        responses={responses}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{topic} Assessment</h1>
            <p className="text-sm text-muted-foreground">{subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {Math.floor(activeTime / 60)}:
              {(activeTime % 60).toString().padStart(2, "0")}
            </span>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <PenTool className="h-3 w-3" />
            <span>
              {Object.keys(responses).length}/{totalQuestions}
            </span>
          </Badge>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-3/4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />

            <div className="pt-4 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="text-destructive font-bold mb-2">
              Error Loading Assessment
            </div>
            <p className="mb-4">{error}</p>
            <Button
              onClick={() =>
                fetchAssessment({
                  subject,
                  topic,
                  question_count: questionCount,
                })
              }
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Question navigator */}
            <div className="md:w-48 w-full space-y-4">
              <Card>
                <CardContent className="p-3">
                  <h3 className="font-medium mb-3">Questions</h3>
                  <div className="flex flex-row md:flex-col gap-2 flex-wrap">
                    {questions.map((q, index) => (
                      <Button
                        key={q.id}
                        variant={
                          currentQuestionIndex === index
                            ? "default"
                            : responses[q.id]
                              ? "secondary"
                              : "outline"
                        }
                        size="sm"
                        className="w-10 h-10 md:w-full"
                        onClick={() => setQuestionIndex(index)}
                      >
                        {index + 1}
                        {responses[q.id] && (
                          <CheckCircle className="h-3 w-3 ml-2 hidden md:inline" />
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current question */}
            <div className="flex-1">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>
                          Question {currentQuestionIndex + 1}
                        </CardTitle>
                        <Badge variant="outline">
                          {currentQuestion.exercise_type.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>{renderQuestionComponent()}</CardContent>
                    <CardFooter className="border-t p-4 flex justify-between">
                      <Button
                        variant="outline"
                        onClick={previousQuestion}
                        disabled={!hasPreviousQuestion || evaluating}
                      >
                        Previous
                      </Button>

                      {hasNextQuestion ? (
                        <Button
                          onClick={handleNext}
                          disabled={
                            !getResponse(currentQuestion.id) || evaluating
                          }
                        >
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmitAssessment}
                          disabled={!isComplete || evaluating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {evaluating ? "Evaluating..." : "Submit Assessment"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>

          <div className="w-full space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </>
      )}
    </div>
  );
}
