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
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  HelpCircle,
  PenTool,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (initialLoadRef.current) return;
    
    initialLoadRef.current = true;
    
    fetchAssessment({
      subject,
      topic,
      question_count: questionCount,
      question_types: ["multiple_choice", "short_answer", "true_false"],
    }).catch(error => {
      console.error("Failed to fetch assessment:", error);
      initialLoadRef.current = false;
    });
  }, []);

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
    setShowConfirmDialog(false);
    
    if (!isComplete) {
      const unansweredCount = totalQuestions - Object.keys(responses).length;
      toast.error(
        `Please answer all questions. ${unansweredCount} ${unansweredCount === 1 ? 'question remains' : 'questions remain'} unanswered.`
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

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get status badge for a question (answered, current, unanswered)
  const getQuestionStatusClass = (index: number, questionId: string) => {
    if (currentQuestionIndex === index) {
      return "ring-2 ring-primary ring-offset-2";
    } else if (getResponse(questionId)) {
      return "bg-green-50 border-green-300 text-green-700";
    } 
    return "bg-muted";
  };

  // Review summary of answered and unanswered questions
  const renderQuestionReview = () => {
    const answered = Object.keys(responses).length;
    const unanswered = totalQuestions - answered;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-medium">Status</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={unanswered > 0 ? "destructive" : "default"}>
                {unanswered > 0 ? `${unanswered} Unanswered` : "All Answered"}
              </Badge>
              <Badge variant="outline">
                {formatTime(activeTime)} Elapsed
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium">Score</div>
            <div className="text-2xl font-bold">Pending</div>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setQuestionIndex(idx)}
              className={`h-10 w-full rounded-md flex items-center justify-center text-sm font-medium border ${
                getResponse(q.id) 
                  ? "bg-green-50 border-green-300 text-green-700" 
                  : "bg-red-50 border-red-300 text-red-700"
              }`}
            >
              {idx + 1}
              {getResponse(q.id) && <CheckCircle className="ml-1 h-3 w-3" />}
            </button>
          ))}
        </div>
      </div>
    );
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header area with title and stats */}
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{topic} Assessment</h1>
              <p className="text-sm text-muted-foreground">{subject}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(activeTime)}</span>
            </Badge>
            <Badge 
              variant={isComplete ? "default" : "outline"} 
              className={`flex items-center gap-1 px-3 py-1 ${isComplete ? "bg-green-600" : ""}`}
            >
              <PenTool className="h-3 w-3" />
              <span>{Object.keys(responses).length}/{totalQuestions}</span>
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-1">
          <Progress 
            value={completionPercentage} 
            className="h-2" 
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{completionPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      {loading ? (
        <Card className="border border-muted">
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
            <div className="flex flex-col items-center text-center gap-3 py-8">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="text-destructive font-bold text-lg">
                Error Loading Assessment
              </div>
              <p className="text-muted-foreground max-w-md mb-4">{error}</p>
              <Button
                onClick={() =>
                  fetchAssessment({
                    subject,
                    topic,
                    question_count: questionCount,
                    question_types: ["multiple_choice", "short_answer", "true_false"],
                  })
                }
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Question navigator */}
          <div className="md:w-60 w-full space-y-4 order-2 md:order-1">
            <Card className="sticky top-4">
              <CardHeader className="py-3 px-4">
                <h3 className="font-medium text-sm text-muted-foreground">Questions</h3>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="px-4 pb-3">
                  <div className="text-xs flex items-center justify-between mb-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted"></div>
                      <span>Unanswered</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t px-3 py-3 grid grid-cols-3 gap-2 md:flex md:flex-col">
                  {questions.map((q, index) => (
                    <Button
                      key={q.id}
                      variant="outline"
                      size="sm"
                      className={`relative h-10 justify-between ${
                        getQuestionStatusClass(index, q.id)
                      }`}
                      onClick={() => setQuestionIndex(index)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{index + 1}</span>
                        {getResponse(q.id) && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {q.exercise_type.split("_")[0]}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
              
              {isComplete && (
                <CardFooter className="border-t p-4">
                  <Button 
                    onClick={() => setShowConfirmDialog(true)} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Submit Assessment
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Current question */}
          <div className="flex-1 order-1 md:order-2">
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-muted/30">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                          Question {currentQuestionIndex + 1}
                          <Badge variant="outline" className="ml-2">
                            {currentQuestion.exercise_type.replace("_", " ")}
                          </Badge>
                        </CardTitle>
                        <Badge variant={getResponse(currentQuestion.id) ? "default" : "outline"}>
                          {getResponse(currentQuestion.id) ? "Answered" : "Unanswered"}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                      {renderQuestionComponent()}
                    </CardContent>
                    
                    <CardFooter className="border-t p-4 flex justify-between">
                      <div>
                        {hasPreviousQuestion && (
                          <Button
                            variant="outline"
                            onClick={previousQuestion}
                            disabled={evaluating}
                            className="mr-2"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>
                        )}
                      </div>

                      <div>
                        {hasNextQuestion && (
                          <Button
                            onClick={handleNext}
                            disabled={
                              !getResponse(currentQuestion.id) || evaluating
                            }
                          >
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                        
                        {!hasNextQuestion && isComplete && (
                          <Button
                            onClick={() => setShowConfirmDialog(true)}
                            disabled={evaluating}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {evaluating ? "Evaluating..." : "Submit Assessment"}
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your assessment?</DialogTitle>
            <DialogDescription>
              You're about to submit your assessment for evaluation. Once submitted, your answers cannot be changed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {renderQuestionReview()}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Review Again
            </Button>
            <Button 
              onClick={handleSubmitAssessment}
              className="bg-green-600 hover:bg-green-700"
              disabled={evaluating}
            >
              {evaluating ? "Submitting..." : "Confirm Submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}