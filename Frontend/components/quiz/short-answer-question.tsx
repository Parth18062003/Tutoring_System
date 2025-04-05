"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShortAnswerQuestion, UserAnswer } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ShortAnswerQuestionCardProps {
  question: ShortAnswerQuestion;
  index: number;
  onAnswer: (answer: UserAnswer) => void;
  userAnswer?: string;
  showCorrectAnswer?: boolean;
}

export default function ShortAnswerQuestionCard({
  question,
  index,
  onAnswer,
  userAnswer,
  showCorrectAnswer = false,
}: ShortAnswerQuestionCardProps) {
  const [inputValue, setInputValue] = useState(userAnswer || "");
  
  // Ensure correctAnswer exists, or provide an empty string as fallback
  const correctAnswer = question.correctAnswer || "";
  const acceptableAnswers = Array.isArray(question.acceptableAnswers) 
    ? question.acceptableAnswers 
    : [];
  
  const handleSubmit = () => {
    onAnswer({
      questionId: question.id,
      type: 'short-answer',
      answer: inputValue.trim(),
    });
  };

  const isCorrect = () => {
    // Fix: Check if userAnswer exists and is a string before calling trim()
    if (!userAnswer || typeof userAnswer !== 'string') return false;
    
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = correctAnswer.toLowerCase();
    
    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      return true;
    }
    
    // Check acceptable answers if provided
    return acceptableAnswers.some(
      answer => normalizedUserAnswer === answer.toLowerCase()
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">
            {index + 1}. {question.question || "Short answer question"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer here"
                disabled={showCorrectAnswer}
                className="flex-grow"
              />
              {!showCorrectAnswer && (
                <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
                  Submit
                </Button>
              )}
            </div>
            
            {showCorrectAnswer && (
              <div className="mt-2">
                {userAnswer && (
                  <div className="flex items-center mb-2">
                    <p className="mr-2">Your answer: <span className="font-medium">{String(userAnswer)}</span></p>
                    {isCorrect() ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
                <p className="font-medium">Correct answer: {correctAnswer}</p>
                {acceptableAnswers.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Also accepted: {acceptableAnswers.join(", ")}
                  </p>
                )}
              </div>
            )}
            
            {showCorrectAnswer && question.explanation && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm font-medium">Explanation:</p>
                <p className="text-sm">{question.explanation}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}