// components/assessment/assessment-results.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  AlertTriangle,
  Award,
  CircleCheck,
  BookOpen,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AssessmentQuestion } from "@/types/assessment-types";
import { motion } from "framer-motion";
import { Markdown } from "../learning/markdown";
import ContentActions from "../learning/content-action";
import { useState } from "react";

interface AssessmentResultsProps {
  result: any;
  questions: AssessmentQuestion[];
  responses: Record<string, string>;
  onBack: () => void;
}

export function AssessmentResults({
  result,
  questions,
  responses,
  onBack,
}: AssessmentResultsProps) {
  const masteryChange = result.mastery_after - result.mastery_before;
  const formattedScore = Math.round(result.overall_score);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(
    null
  );

  // Generate a content summary for content actions
  const generateSummaryContent = () => {
    let summary = `# ${result.topic} Assessment Results\n\n`;
    summary += `**Subject:** ${result.subject}\n`;
    summary += `**Score:** ${formattedScore}%\n`;
    summary += `**Date:** ${new Date().toLocaleDateString()}\n\n`;

    summary += `## Question Breakdown\n\n`;
    questions.forEach((question, index) => {
      const evaluation = result.evaluations?.[question.id];
      const isCorrect = evaluation?.correct;
      const userResponse = responses[question.id];

      summary += `### Question ${index + 1}\n`;
      summary += `${question.question}\n\n`;
      summary += `**Your answer:** ${userResponse || "No answer provided"}\n`;
      summary += `**Correct answer:** ${question.correct_answer}\n`;
      summary += `**Result:** ${isCorrect ? "Correct" : "Incorrect"} (${evaluation?.score || 0}%)\n`;

      if (evaluation?.feedback) {
        summary += `**Feedback:** ${evaluation.feedback}\n`;
      }
      summary += `\n`;
    });

    if (result.recommendations && result.recommendations.length > 0) {
      summary += `## Recommendations\n\n`;
      result.recommendations.forEach((rec: string, i: number) => {
        summary += `${i + 1}. ${rec}\n`;
      });
    }

    return summary;
  };

  // Compute correct answers count
  const correctAnswers = Object.values(result.evaluations || {}).filter(
    (evaluation: any) => evaluation.correct
  ).length;

  // Get color class based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card rounded-lg border shadow-sm p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assessment Results</h1>
            <p className="text-sm text-muted-foreground">
              {result.topic} • {result.subject}
            </p>
          </div>
        </div>

        <ContentActions
          content={generateSummaryContent()}
          filename={`${result.subject}-${result.topic}-assessment`}
        />
      </div>

      {/* Score overview and insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1"
        >
          <Card className="h-full">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg">Performance Summary</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="text-center mb-4">
                <div
                  className={`text-5xl font-bold ${getScoreColorClass(formattedScore)}`}
                >
                  {formattedScore}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {correctAnswers} of {questions.length} correct
                </div>
              </div>

              <Progress value={formattedScore} className="h-2 mb-6" />

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm">Mastery Change</div>
                  <div className="flex items-center font-medium">
                    {masteryChange > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                        <span className="text-green-600">
                          +{(masteryChange * 100).toFixed(1)}%
                        </span>
                      </>
                    ) : masteryChange < 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                        <span className="text-red-500">
                          {(masteryChange * 100).toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span>No change</span>
                    )}
                  </div>
                </div>

                {result.strengths && result.strengths.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <h3 className="text-sm font-medium">Strengths</h3>
                    </div>
                    <ul className="text-sm space-y-1 pl-6 list-disc">
                      {result.strengths
                        .slice(0, 2)
                        .map((strength: string, i: number) => (
                          <li key={i}>{strength}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {result.common_misconceptions &&
                  result.common_misconceptions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <h3 className="text-sm font-medium">
                          Areas to Improve
                        </h3>
                      </div>
                      <ul className="text-sm space-y-1 pl-6 list-disc">
                        {result.common_misconceptions
                          .slice(0, 2)
                          .map((m: any, i: number) => (
                            <li key={i}>{m.misconception}</li>
                          ))}
                      </ul>
                    </div>
                  )}
              </div>
            </CardContent>

            {result.recommendations && result.recommendations.length > 0 && (
              <CardFooter className="flex-col items-start border-t pt-4 gap-2">
                <div className="flex items-center gap-2 w-full">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Next Steps</h3>
                </div>
                <ul className="text-sm space-y-2 w-full">
                  {result.recommendations
                    .slice(0, 3)
                    .map((r: string, i: number) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="flex items-start p-2 rounded-md bg-primary/5"
                      >
                        <CircleCheck className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary" />
                        <span>{r}</span>
                      </motion.li>
                    ))}
                </ul>
              </CardFooter>
            )}
          </Card>
        </motion.div>

        {/* Question Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 md:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Question Review</CardTitle>
              <div className="flex gap-1">
                {questions.map((question, index) => {
                  const evaluation = result.evaluations?.[question.id];
                  const isCorrect = evaluation?.correct;

                  return (
                    <button
                      key={question.id}
                      className={`h-7 w-7 text-xs rounded-full flex items-center justify-center border ${
                        activeQuestionIndex === index
                          ? "ring-2 ring-primary"
                          : ""
                      } ${
                        isCorrect
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                      onClick={() =>
                        setActiveQuestionIndex(
                          activeQuestionIndex === index ? null : index
                        )
                      }
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y">
                {questions.map((question, index) => {
                  const userResponse = responses[question.id];
                  const evaluation = result.evaluations?.[question.id];
                  const isCorrect = evaluation?.correct;
                  const score = evaluation?.score || 0;

                  // If a question is selected, only show that one
                  if (
                    activeQuestionIndex !== null &&
                    activeQuestionIndex !== index
                  ) {
                    return null;
                  }

                  return (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                          >
                            Q{index + 1}
                          </Badge>
                          <h3 className="font-medium">
                            {question.exercise_type.replace("_", " ")}
                          </h3>
                        </div>

                        <div className="flex gap-2 items-center">
                          <Badge
                            variant={isCorrect ? "default" : "outline"}
                            className={
                              isCorrect ? "bg-green-600" : "text-red-500"
                            }
                          >
                            {score}%
                          </Badge>
                          {isCorrect ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>

                      <div className="text-sm mb-4 bg-muted/30 p-3 rounded-md">
                        {question.question}
                      </div>
                      {question.exercise_type === "multiple_choice" &&
                        question.options && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground mb-1">
                              Options:
                            </div>
                            <ul className="text-sm space-y-1">
                              {question.options.map(
                                (option: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className={`flex items-start ${
                                      String.fromCharCode(65 + idx) ===
                                      userResponse
                                        ? "font-medium"
                                        : ""
                                    }`}
                                  >
                                    <span className="mr-2">
                                      {String.fromCharCode(65 + idx)}.
                                    </span>
                                    <span>{option}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div
                          className={`p-3 rounded-md ${
                            isCorrect
                              ? "bg-green-50 border border-green-100"
                              : "bg-red-50 border border-red-100"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            Your Answer
                          </div>
                          <div className="text-sm font-medium">
                            {userResponse || "No answer provided"}
                          </div>
                        </div>

                        <div className="p-3 rounded-md bg-green-50 border border-green-100">
                          <div className="text-xs text-muted-foreground mb-1">
                            Correct Answer
                          </div>
                          <div className="text-sm font-medium">
                            {question.correct_answer}
                          </div>
                        </div>
                      </div>

                      {evaluation?.feedback && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">
                            Feedback
                          </div>
                          <div className="text-sm">
                            <Markdown>{evaluation.feedback}</Markdown>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>

            {activeQuestionIndex !== null && (
              <CardFooter className="border-t p-4 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setActiveQuestionIndex(null)}
                >
                  Show All Questions
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setActiveQuestionIndex(
                        Math.max(0, activeQuestionIndex - 1)
                      )
                    }
                    disabled={activeQuestionIndex <= 0}
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setActiveQuestionIndex(
                        Math.min(questions.length - 1, activeQuestionIndex + 1)
                      )
                    }
                    disabled={activeQuestionIndex >= questions.length - 1}
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
