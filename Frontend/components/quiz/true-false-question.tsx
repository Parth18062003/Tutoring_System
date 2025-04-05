"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrueFalseQuestion, UserAnswer } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface TrueFalseQuestionCardProps {
  question: TrueFalseQuestion;
  index: number;
  onAnswer: (answer: UserAnswer) => void;
  userAnswer?: boolean;
  showCorrectAnswer?: boolean;
}

export default function TrueFalseQuestionCard({
  question,
  index,
  onAnswer,
  userAnswer,
  showCorrectAnswer = false,
}: TrueFalseQuestionCardProps) {
  // Local state to track selected option
  const [selected, setSelected] = useState<boolean | undefined>(userAnswer);
  
  // Ensure correctAnswer is a boolean
  const correctAnswer = typeof question.correctAnswer === 'boolean' 
    ? question.correctAnswer 
    : false;
  
  const handleChange = (value: boolean) => {
    setSelected(value);
    onAnswer({
      questionId: question.id,
      type: 'true-false',
      selectedAnswer: value,
    });
  };

  const getOptionClassName = (isTrue: boolean) => {
    if (!showCorrectAnswer) return "";
    
    if (isTrue === correctAnswer) {
      return "bg-green-100 dark:bg-green-900/30";
    }
    
    if (userAnswer === isTrue && isTrue !== correctAnswer) {
      return "bg-red-100 dark:bg-red-900/30";
    }
    
    return "";
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
            {index + 1}. {question.question || "True or false question"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* True option */}
            <div className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${getOptionClassName(true)}`}>
              <input
                type="radio"
                id={`${question.id}-true`}
                name={`question-${question.id}`}
                checked={selected === true}
                onChange={() => handleChange(true)}
                disabled={showCorrectAnswer}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <Label
                htmlFor={`${question.id}-true`}
                className="w-full cursor-pointer py-2"
              >
                True
              </Label>
            </div>

            {/* False option */}
            <div className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${getOptionClassName(false)}`}>
              <input
                type="radio"
                id={`${question.id}-false`}
                name={`question-${question.id}`}
                checked={selected === false}
                onChange={() => handleChange(false)}
                disabled={showCorrectAnswer}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <Label
                htmlFor={`${question.id}-false`}
                className="w-full cursor-pointer py-2"
              >
                False
              </Label>
            </div>
          </div>
          
          {showCorrectAnswer && question.explanation && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm font-medium">Explanation:</p>
              <p className="text-sm">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}