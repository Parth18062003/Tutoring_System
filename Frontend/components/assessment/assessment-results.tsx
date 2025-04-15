// components/learning/assessment-results.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AssessmentQuestion } from "@/types/assessment-types";
import { motion } from "framer-motion";
import { Markdown } from "../learning/markdown";

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
  onBack
}: AssessmentResultsProps) {
  const masteryChange = result.mastery_after - result.mastery_before;
  const formattedScore = Math.round(result.overall_score);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Assessment Results</h1>
          <p className="text-sm text-muted-foreground">{result.topic} • {result.subject}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{formattedScore}%</div>
              <Progress value={formattedScore} className="h-2 mb-4" />
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Mastery Impact</div>
                  <div className="flex items-center">
                    {masteryChange > 0 ? (
                      <Badge className="bg-green-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{(masteryChange * 100).toFixed(1)}%
                      </Badge>
                    ) : masteryChange < 0 ? (
                      <Badge variant="destructive">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {(masteryChange * 100).toFixed(1)}%
                      </Badge>
                    ) : (
                      <Badge variant="outline">No change</Badge>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {result.common_misconceptions && result.common_misconceptions.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Identified Misconceptions</div>
                    <ul className="text-sm space-y-1">
                      {result.common_misconceptions.slice(0, 3).map((m: any, i: number) => (
                        <li key={i} className="flex items-start">
                          <ChevronRight className="h-4 w-4 mr-1 shrink-0 text-muted-foreground" />
                          <span>{m.misconception}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Recommendations</div>
                    <ul className="text-sm space-y-1">
                      {result.recommendations.map((r: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <ChevronRight className="h-4 w-4 mr-1 shrink-0 text-muted-foreground" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 md:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Question Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, index) => {
                const userResponse = responses[question.id];
                const evaluation = result.evaluations?.[question.id];
                const isCorrect = evaluation?.correct;
                const score = evaluation?.score || 0;
                
                return (
                  <div key={question.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-base">Question {index + 1}</h3>
                      <div className="flex gap-2 items-center">
                        <Badge variant={isCorrect ? "default" : "outline"} className={isCorrect ? "bg-green-600" : ""}>
                          {score}%
                        </Badge>
                        {isCorrect ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm mb-2">{question.question}</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Your Answer</div>
                        <div className="p-2 bg-muted/50 rounded-md text-sm">
                          {userResponse || "No answer provided"}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Correct Answer</div>
                        <div className="p-2 bg-muted/50 rounded-md text-sm">
                          {question.correct_answer}
                        </div>
                      </div>
                    </div>
                    
                    {evaluation?.feedback && (
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1">Feedback</div>
                        <div className="p-2 bg-muted/50 rounded-md text-sm">
                          <Markdown>{evaluation.feedback}</Markdown>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}