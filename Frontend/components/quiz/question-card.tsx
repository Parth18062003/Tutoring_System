"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MultipleChoiceQuestion, UserAnswer } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface QuestionCardProps {
  question: MultipleChoiceQuestion;
  index: number;
  onAnswer: (answer: UserAnswer) => void;
  userAnswer?: string;
  showCorrectAnswer?: boolean;
}

export default function QuestionCard({
  question,
  index,
  onAnswer,
  userAnswer,
  showCorrectAnswer = false,
}: QuestionCardProps) {
  // Local state to track selected option
  const [selectedOption, setSelectedOption] = useState(userAnswer || "");
  
  // Ensure these properties exist, or provide fallbacks
  const options = Array.isArray(question.options) ? question.options : [];
  const correctAnswer = question.correctAnswer || "";
  
  // Check if question has valid data
  const isValidQuestion = options.length > 0;
  
  const handleChange = (value: string) => {
    setSelectedOption(value);
    
    // Send the answer to parent component
    onAnswer({
      questionId: question.id,
      type: 'multiple-choice',
      selectedAnswer: value,
    });
  };

  const getOptionClassName = (option: string) => {
    if (!showCorrectAnswer) return "";
    
    if (option === correctAnswer) {
      return "bg-green-100 dark:bg-green-900/30";
    }
    
    if (option === userAnswer && option !== correctAnswer) {
      return "bg-red-100 dark:bg-red-900/30";
    }
    
    return "";
  };
  
  // If question is malformed, render an error message
  if (!isValidQuestion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">
              {index + 1}. {question.question || "Multiple choice question"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                This multiple choice question is missing its options. Please try a different question or regenerate the quiz.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">
            {index + 1}. {question.question || "Multiple choice question"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Use a plain div to avoid RadioGroup re-rendering issues */}
          <div className="space-y-2">
            {options.map((option, i) => (
              <div
                key={i}
                className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${getOptionClassName(option)}`}
              >
                <input
                  type="radio"
                  id={`${question.id}-option-${i}`}
                  name={`question-${question.id}`}
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => handleChange(option)}
                  disabled={showCorrectAnswer}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor={`${question.id}-option-${i}`}
                  className="w-full cursor-pointer py-2"
                >
                  {option}
                </Label>
              </div>
            ))}
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