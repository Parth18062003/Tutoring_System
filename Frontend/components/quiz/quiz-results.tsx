"use client";

import { Button } from "@/components/ui/button";
import { QuizQuestion, QuizResult, UserAnswer } from "@/types/quiz";
import QuestionFactory from "./question-factory";
import { motion } from "framer-motion";

interface QuizResultsProps {
  questions: QuizQuestion[];
  userAnswers: UserAnswer[];
  result: QuizResult;
  onRetry: () => void;
}

export default function QuizResults({
  questions,
  userAnswers,
  result,
  onRetry,
}: QuizResultsProps) {
  const getUserAnswer = (questionId: string): any => {
    const answer = userAnswers.find((a) => a.questionId === questionId);
    
    // Extract the actual answer value based on answer type
    if (!answer) return undefined;
    
    switch (answer.type) {
      case 'multiple-choice':
        return answer.selectedAnswer;
      case 'true-false':
        return answer.selectedAnswer;
      case 'short-answer':
        return answer.answer; // Return the string answer directly
      case 'matching':
        return answer.pairs;
      case 'fill-in-blank':
        return answer.answers;
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6"
      >
        <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-lg">
              Score: <span className="font-bold">{result.score}%</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {result.correctAnswers} out of {result.totalQuestions} correct
            </p>
          </div>
          <Button onClick={onRetry}>Try Another Quiz</Button>
        </div>
      </motion.div>

      <h3 className="text-xl font-semibold mb-4">Review Questions</h3>
      <div>
        {questions.map((question, index) => (
          <QuestionFactory
            key={question.id}
            question={question}
            index={index}
            onAnswer={() => {}}
            userAnswer={getUserAnswer(question.id)}
            showCorrectAnswer={true}
          />
        ))}
      </div>
    </div>
  );
}