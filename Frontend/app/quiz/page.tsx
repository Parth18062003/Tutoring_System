"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import QuizForm from "@/components/quiz/quiz-form";
import QuestionFactory from "@/components/quiz/question-factory";
import QuizResults from "@/components/quiz/quiz-results";
import { Button } from "@/components/ui/button";
import { QuizData, QuizResult, UserAnswer } from "@/types/quiz";

export default function QuizPage() {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentStep, setCurrentStep] = useState<"form" | "quiz" | "results">("form");
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleQuizGenerated = useCallback((generatedQuiz: QuizData) => {
    setQuiz(generatedQuiz);
    setUserAnswers([]);
    setCurrentStep("quiz");
  }, []);

  const handleAnswer = useCallback((answer: UserAnswer) => {
    setUserAnswers((prev) => {
      // Remove previous answer for this question if it exists
      const filtered = prev.filter((a) => a.questionId !== answer.questionId);
      return [...filtered, answer];
    });
  }, []);
  
  const handleSubmitQuiz = () => {
    if (!quiz) return;

    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;

    const detailedAnswers = quiz.questions.map((question) => {
      const userAnswer = userAnswers.find((a) => a.questionId === question.id);
      let isCorrect = false;

      // Evaluate correctness based on question type
      if (userAnswer) {
        switch (question.type) {
          case "multiple-choice":
            isCorrect = userAnswer.type === "multiple-choice" && 
              userAnswer.selectedAnswer === question.correctAnswer;
            break;
          case "true-false":
            isCorrect = userAnswer.type === "true-false" && 
              userAnswer.selectedAnswer === question.correctAnswer;
            break;
          case "short-answer":
            if (userAnswer.type === "short-answer") {
              const normalizedAnswer = userAnswer.answer.trim().toLowerCase();
              const normalizedCorrect = question.correctAnswer.toLowerCase();
              
              isCorrect = normalizedAnswer === normalizedCorrect;
              
              // Check acceptable answers too
              if (!isCorrect && question.acceptableAnswers) {
                isCorrect = question.acceptableAnswers.some(
                  a => a.toLowerCase() === normalizedAnswer
                );
              }
            }
            break;
          case "matching":
            if (userAnswer.type === "matching") {
              // All pairs must match correctly
              isCorrect = question.correctPairs.every(correct => {
                return userAnswer.pairs.some(
                  p => p.itemId === correct.itemId && p.matchId === correct.matchId
                );
              }) && userAnswer.pairs.length === question.correctPairs.length;
            }
            break;
          case "fill-in-blank":
            if (userAnswer.type === "fill-in-blank") {
              // All blanks must be filled correctly
              isCorrect = question.blanks.every(blank => {
                const userBlankAnswer = userAnswer.answers.find(a => a.blankId === blank.id);
                if (!userBlankAnswer) return false;
                
                const normalizedUserAnswer = userBlankAnswer.answer.trim().toLowerCase();
                const normalizedCorrect = blank.correctAnswer.toLowerCase();
                
                if (normalizedUserAnswer === normalizedCorrect) return true;
                
                // Check acceptable answers
                return blank.acceptableAnswers?.some(
                  a => a.toLowerCase() === normalizedUserAnswer
                ) || false;
              });
            }
            break;
        }
      }
      
      if (isCorrect) correctAnswers++;

      return {
        questionId: question.id,
        type: question.type,
        isCorrect: isCorrect || false,
        userAnswer: userAnswer || null,
        correctAnswer: question.type === 'multiple-choice' ? question.correctAnswer : 
                      question.type === 'true-false' ? question.correctAnswer :
                      question.type === 'short-answer' ? question.correctAnswer :
                      question.type === 'matching' ? question.correctPairs :
                      question.type === 'fill-in-blank' ? question.blanks.map(b => ({
                        blankId: b.id,
                        answer: b.correctAnswer
                      })) : null,
        explanation: question.explanation,
      };
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const result: QuizResult = {
      score,
      totalQuestions,
      correctAnswers,
      answers: detailedAnswers,
    };

    setQuizResult(result);
    setCurrentStep("results");
  };

  const resetQuiz = () => {
    setQuiz(null);
    setUserAnswers([]);
    setQuizResult(null);
    setCurrentStep("form");
  };

  const getUserAnswerForQuestion = (questionId: string) => {
    return userAnswers.find((a) => a.questionId === questionId);
  };

  const allQuestionsAnswered = quiz
    ? quiz.questions.every((q) => userAnswers.some((a) => a.questionId === q.id))
    : false;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Interactive Learning Quiz
      </h1>

      {currentStep === "form" && <QuizForm onQuizGenerated={handleQuizGenerated} />}

      {currentStep === "quiz" && quiz && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {quiz.description}
            </p>
            <div className="flex justify-between items-center">
              <p className="text-sm">
                {userAnswers.length} of {quiz.questions.length} questions answered
              </p>
              <Button onClick={handleSubmitQuiz} disabled={!allQuestionsAnswered}>
                Submit Quiz
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <QuestionFactory
                key={question.id}
                question={question}
                index={index}
                onAnswer={handleAnswer}
                userAnswer={getUserAnswerForQuestion(question.id)}
              />
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSubmitQuiz} disabled={!allQuestionsAnswered}>
              Submit Quiz
            </Button>
          </div>
        </motion.div>
      )}

      {currentStep === "results" && quiz && quizResult && (
        <QuizResults
          questions={quiz.questions}
          userAnswers={userAnswers}
          result={quizResult}
          onRetry={resetQuiz}
        />
      )}
    </div>
  );
} 