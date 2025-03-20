"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, TrendingUp, Award, ArrowRight } from "lucide-react";

interface QuizResultsProps {
  score: {
    total: number;
    correct: number;
  };
  quizContent: string;
  userAnswers: Record<string, string>;
  onTryAgain: () => void;
  onNewQuiz: () => void;
}

// Parse quiz to get questions and answers
const parseQuizForResults = (content: string) => {
  // Extract questions
  const questionRegex = /#{2,3}\s*(Question|Q)\s*(\d+)[^\n]*\n([\s\S]*?)(?=#{2,3}\s*(Question|Q)|#{1,3}\s*Answer Key|$)/gi;
  const questions: any[] = [];
  let match;
  
  while ((match = questionRegex.exec(content)) !== null) {
    const questionNumber = match[2];
    const questionContent = match[3].trim();
    
    // Determine question type
    let type = "shortAnswer";
    if (questionContent.includes("- [ ]") || questionContent.includes("- []")) {
      type = "mcq";
    } else if (questionContent.toLowerCase().includes("true or false") || 
               questionContent.toLowerCase().includes("true/false")) {
      type = "truefalse";
    }
    
    // Extract question text without options
    let questionText = questionContent;
    if (type === "mcq") {
      questionText = questionContent.split(/- \[[ x]\]/)[0].trim();
    }
    
    questions.push({
      id: `q${questionNumber}`,
      number: parseInt(questionNumber),
      content: questionText,
      fullContent: questionContent,
      type
    });
  }
  
  // Extract answer key
  const answerKeyMatch = content.match(/#{1,3}\s*Answer Key\s*[\r\n]+([\s\S]*?)$/i);
  const answerKeyContent = answerKeyMatch ? answerKeyMatch[1].trim() : "";
  
  // Parse individual answers
  const answers: Record<string, string> = {};
  const answerRegex = /(?:Question|Q)[^\d]*(\d+)[^\w\n]*(.*?)(?=(?:Question|Q)|$)/gi;
  let answerMatch;
  
  while ((answerMatch = answerRegex.exec(answerKeyContent)) !== null) {
    const qNum = answerMatch[1];
    const answer = answerMatch[2].trim();
    answers[`q${qNum}`] = answer;
  }
  
  return { questions, answers };
};

export default function QuizResults({ 
  score, 
  quizContent,
  userAnswers,
  onTryAgain,
  onNewQuiz
}: QuizResultsProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const { questions, answers } = parseQuizForResults(quizContent);
  
  // Calculate percentage
  const percentage = Math.round((score.correct / score.total) * 100);
  
  // Determine performance message
  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Excellent! You've mastered this topic!";
    if (percentage >= 75) return "Great job! You have a solid understanding of this topic.";
    if (percentage >= 60) return "Good work! You're on the right track.";
    if (percentage >= 40) return "You're making progress! With a bit more study, you'll improve.";
    return "Keep practicing! This topic needs more review.";
  };
  
  // Determine if answer is correct
  const isAnswerCorrect = (questionId: string) => {
    const userAnswer = userAnswers[questionId] || "";
    const correctAnswer = answers[questionId] || "";
    
    if (!correctAnswer) return false;
    
    const question = questions.find((q: any) => q.id === questionId);
    
    if (question?.type === "mcq" || question?.type === "truefalse") {
      return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    } else {
      // For short answer, check if main keywords match
      const keywords = correctAnswer.toLowerCase().split(/[,.\s]+/).filter(Boolean);
      const userKeywords = userAnswer.toLowerCase().split(/[,.\s]+/).filter(Boolean);
      
      const matchCount = keywords.filter(keyword => 
        userKeywords.some(uk => uk.includes(keyword) || keyword.includes(uk))
      ).length;
      
      return matchCount / keywords.length >= 0.6;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Score summary */}
      <div className="bg-card rounded-lg shadow-md p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
        <div className="flex flex-col items-center">
          <div className="relative inline-flex">
            <div className="w-32 h-32 rounded-full flex items-center justify-center bg-primary/10">
              <span className="text-4xl font-bold">{percentage}%</span>
            </div>
            <svg className="absolute top-0 left-0" width="128" height="128" viewBox="0 0 128 128">
              <circle 
                cx="64" 
                cy="64" 
                r="60" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="8"
                strokeDasharray={`${percentage * 3.77} 377`}
                strokeDashoffset="0"
                className="text-primary"
                transform="rotate(-90 64 64)"
              />
            </svg>
          </div>
          
          <p className="mt-4 text-lg">
            You scored <span className="font-bold">{score.correct}</span> out of <span className="font-bold">{score.total}</span> questions correctly.
          </p>
          
          <p className="mt-2 text-muted-foreground">{getPerformanceMessage()}</p>
          
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <Button
              onClick={onTryAgain}
              className="flex items-center"
              variant="outline"
            >
              <TrendingUp className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button
              onClick={onNewQuiz}
              className="flex items-center"
            >
              <Award className="mr-2 h-4 w-4" /> New Quiz
            </Button>
            <Button
              onClick={() => setShowAnswers(!showAnswers)}
              variant="secondary"
              className="flex items-center"
            >
              {showAnswers ? "Hide Answers" : "Show Answers"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Answer review */}
      {showAnswers && (
        <div className="bg-card rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Answer Review</h3>
          
          <div className="space-y-6">
            {questions.map((question: any) => {
              const isCorrect = isAnswerCorrect(question.id);
              const userAnswer = userAnswers[question.id] || "No answer provided";
              const correctAnswer = answers[question.id] || "Unknown";
              
              return (
                <div 
                  key={question.id}
                  className={`p-4 rounded-md ${
                    isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Question {question.number}</h4>
                      <div className="prose dark:prose-invert max-w-none text-sm mt-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {question.content}
                        </ReactMarkdown>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p><span className="font-medium">Your answer:</span> {userAnswer}</p>
                        <p><span className="font-medium">Correct answer:</span> {correctAnswer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}