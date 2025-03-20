"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Check, HelpCircle } from "lucide-react";
import QuestionDisplay from "./QuestionDisplay";

interface QuizContentProps {
  quizContent: string;
  onAnswerSubmit: (questionId: string, answer: string) => void;
  userAnswers: Record<string, string>;
  onQuizComplete: (results: {total: number; correct: number}) => void;
}

// Parse quiz from markdown content
const parseQuiz = (content: string) => {
  // Extract introduction (everything before the first question)
  const sections = content.split(/#{2,3}\s*(Question|Q)\s*\d+/i);
  const introduction = sections[0].trim();
  
  // Extract questions
  const questionRegex = /#{2,3}\s*(Question|Q)\s*(\d+)[^\n]*\n([\s\S]*?)(?=#{2,3}\s*(Question|Q)|#{1,3}\s*Answer Key|$)/gi;
  const questions: any[] = [];
  let match;
  
  while ((match = questionRegex.exec(content)) !== null) {
    const questionNumber = match[2];
    const questionContent = match[3].trim();
    
    // Determine question type
    let type = "shortAnswer"; // Default type
    if (questionContent.includes("- [ ]") || questionContent.includes("- []")) {
      type = "mcq";
    } else if (questionContent.toLowerCase().includes("true or false") || 
               questionContent.toLowerCase().includes("true/false")) {
      type = "truefalse";
    }
    
    // Extract difficulty if present
    const difficultyMatch = questionContent.match(/\*\*(Difficulty|Level):\s*([^\*]+)\*\*/i);
    const difficulty = difficultyMatch ? difficultyMatch[2].trim().toLowerCase() : "medium";
    
    // Parse options for MCQ
    const options: string[] = [];
    if (type === "mcq") {
      const optionRegex = /- \[([ x])\]\s*([^\n]+)/g;
      let optionMatch;
      while ((optionMatch = optionRegex.exec(questionContent)) !== null) {
        options.push(optionMatch[2].trim());
      }
    }
    
    // Create question object
    questions.push({
      id: `q${questionNumber}`,
      number: parseInt(questionNumber),
      content: questionContent,
      type,
      difficulty,
      options
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
  
  return {
    introduction,
    questions,
    answers
  };
};

export default function QuizContent({ 
  quizContent, 
  onAnswerSubmit,
  userAnswers,
  onQuizComplete
}: QuizContentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [parsedQuiz, setParsedQuiz] = useState<any>({ introduction: "", questions: [], answers: {} });
  const [showIntroduction, setShowIntroduction] = useState(true);
  
  useEffect(() => {
    if (quizContent) {
      const parsed = parseQuiz(quizContent);
      setParsedQuiz(parsed);
    }
  }, [quizContent]);

  const handleNext = () => {
    if (currentQuestion < parsedQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Calculate score
    let correct = 0;
    const total = parsedQuiz.questions.length;
    
    Object.entries(userAnswers).forEach(([qId, userAnswer]) => {
      const correctAnswer = parsedQuiz.answers[qId];
      
      // Basic answer checking
      if (correctAnswer && userAnswer) {
        // For MCQs, do exact match
        const question = parsedQuiz.questions.find((q: any) => q.id === qId);
        if (question?.type === "mcq") {
          if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            correct++;
          }
        } 
        // For short answer, check if the main keywords are included
        else if (question?.type === "shortAnswer") {
          // Split answer into keywords and check if main ones are present
          const keywords = correctAnswer.toLowerCase().split(/[,.\s]+/).filter(Boolean);
          const userKeywords = userAnswer.toLowerCase().split(/[,.\s]+/).filter(Boolean);
          
          // Check if at least 60% of keywords are present
          const matchCount = keywords.filter(keyword => 
            userKeywords.some(uk => uk.includes(keyword) || keyword.includes(uk))
          ).length;
          
          if (matchCount / keywords.length >= 0.6) {
            correct++;
          }
        }
        // True/False - exact match
        else if (question?.type === "truefalse") {
          if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            correct++;
          }
        }
      }
    });
    
    // Submit results
    onQuizComplete({ total, correct });
  };

  const isQuestionAnswered = (questionId: string) => {
    return !!userAnswers[questionId];
  };

  const allQuestionsAnswered = parsedQuiz.questions.every((q: any) => 
    isQuestionAnswered(q.id)
  );

  if (showIntroduction && parsedQuiz.introduction) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-lg shadow-md p-6 mb-6"
      >
        <h2 className="text-2xl font-bold mb-4">Quiz Introduction</h2>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
          >
            {parsedQuiz.introduction}
          </ReactMarkdown>
        </div>
        <div className="mt-6">
          <Button 
            onClick={() => setShowIntroduction(false)}
            className="flex items-center"
          >
            Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  const currentQuestionData = parsedQuiz.questions[currentQuestion];
  
  if (!currentQuestionData) {
    return <div>No questions available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {parsedQuiz.questions.length}
        </div>
        <div className="flex items-center">
          {allQuestionsAnswered ? (
            <div className="flex items-center text-green-500 mr-4">
              <Check className="h-4 w-4 mr-1" /> All questions answered
            </div>
          ) : (
            <div className="flex items-center text-amber-500 mr-4">
              <AlertTriangle className="h-4 w-4 mr-1" /> {parsedQuiz.questions.length - Object.keys(userAnswers).length} questions unanswered
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${(Object.keys(userAnswers).length / parsedQuiz.questions.length) * 100}%` }}
        ></div>
      </div>
      
      {/* Question */}
      <motion.div
        key={currentQuestionData.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-card rounded-lg shadow-md p-6"
      >
        <QuestionDisplay
          question={currentQuestionData}
          onAnswerSubmit={(answer) => onAnswerSubmit(currentQuestionData.id, answer)}
          userAnswer={userAnswers[currentQuestionData.id] || ""}
        />
      </motion.div>
      
      {/* Navigation and submit buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <div className="flex gap-3">
          {currentQuestion < parsedQuiz.questions.length - 1 ? (
            <Button 
              variant="default" 
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitQuiz}
              disabled={!allQuestionsAnswered}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
      
      {/* Question navigation dots */}
      <div className="flex justify-center gap-2 pt-4">
        {parsedQuiz.questions.map((q: any, index: number) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestion(index)}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentQuestion === index
                ? 'bg-primary text-primary-foreground'
                : isQuestionAnswered(q.id)
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-secondary text-secondary-foreground'
            }`}
            title={`Question ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}