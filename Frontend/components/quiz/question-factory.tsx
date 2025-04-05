import React, { memo } from 'react';
import QuestionCard from "./question-card";
import TrueFalseQuestionCard from "./true-false-question";
import ShortAnswerQuestionCard from "./short-answer-question";
import MatchingQuestionCard from "./matching-question";
import FillInBlankQuestionCard from "./fill-blank-question";
import { QuizQuestion, UserAnswer } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface QuestionFactoryProps {
  question: QuizQuestion;
  index: number;
  onAnswer: (answer: UserAnswer) => void;
  userAnswer?: any;
  showCorrectAnswer?: boolean;
}

// Memoize the component to prevent unnecessary re-renders
const QuestionFactory = memo(function QuestionFactory({
  question,
  index,
  onAnswer,
  userAnswer,
  showCorrectAnswer = false,
}: QuestionFactoryProps) {
  // Check if question has a type property
  if (!question || !question.type) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">
            {index + 1}. Invalid Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              This question is invalid or missing required data. Please try regenerating the quiz.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  try {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <QuestionCard
            question={question}
            index={index}
            onAnswer={onAnswer}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
        
      case 'true-false':
        return (
          <TrueFalseQuestionCard
            question={question}
            index={index}
            onAnswer={onAnswer}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
        
      case 'short-answer':
        return (
          <ShortAnswerQuestionCard
            question={question}
            index={index}
            onAnswer={onAnswer}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
        
      case 'matching':
        return (
          <MatchingQuestionCard
            question={question}
            index={index}
            onAnswer={onAnswer}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
        
      case 'fill-in-blank':
        return (
          <FillInBlankQuestionCard
            question={question}
            index={index}
            onAnswer={onAnswer}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
        
      default:
        return (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">
                {index + 1}. {question  || "Question"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-sm">
                  Unsupported question type: {question}
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  } catch (error) {
    console.error("Error rendering question:", error);
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">
            {index + 1}. Error Rendering Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              An error occurred while rendering this question. Please try refreshing or generating a new quiz.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
});

export default QuestionFactory;