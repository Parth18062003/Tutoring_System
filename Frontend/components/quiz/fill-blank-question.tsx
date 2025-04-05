"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FillInBlankQuestion, UserAnswer } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

interface FillInBlankQuestionCardProps {
  question: FillInBlankQuestion;
  index: number;
  onAnswer: (answer: UserAnswer) => void;
  userAnswer?: { blankId: string; answer: string }[];
  showCorrectAnswer?: boolean;
}

export default function FillInBlankQuestionCard({
  question,
  index,
  onAnswer,
  userAnswer = [],
  showCorrectAnswer = false,
}: FillInBlankQuestionCardProps) {
  // Ensure question.blanks exists and is an array
  const blanks = Array.isArray(question.blanks) ? question.blanks : [];
  
  // Fix: Use question as text if text field is missing (API format inconsistency)
  const questionText = question.text || question.question;
  
  // Track if we've already processed this answer to prevent infinite loops
  const answersSubmittedRef = useRef(false);
  
  const [answers, setAnswers] = useState<{ blankId: string; answer: string }[]>(
    userAnswer || []
  );

  const handleBlankChange = (blankId: string, value: string) => {
    const updatedAnswers = [...answers.filter(a => a.blankId !== blankId)];
    updatedAnswers.push({ blankId, answer: value });
    setAnswers(updatedAnswers);
  };

  // Reset submission tracker when question changes
  useEffect(() => {
    answersSubmittedRef.current = false;
  }, [question.id, showCorrectAnswer]);

  useEffect(() => {
    // Only submit if all blanks are filled and we haven't already submitted
    if (blanks.length > 0 && 
        answers.length === blanks.length && 
        answers.every(a => a.answer.trim() !== "") &&
        !answersSubmittedRef.current && 
        !showCorrectAnswer) {
      
      answersSubmittedRef.current = true;
      onAnswer({
        questionId: question.id,
        type: 'fill-in-blank',
        answers,
      });
    }
  }, [answers, question.id, blanks, onAnswer, showCorrectAnswer]);

  const getAnswerForBlank = (blankId: string) => {
    return answers.find(a => a.blankId === blankId)?.answer || "";
  };

  const isCorrectAnswer = (blankId: string, answer: string) => {
    if (!answer) return false;
    
    const blank = blanks.find(b => b.id === blankId);
    if (!blank) return false;
    
    // Check primary answer
    if (blank.correctAnswer.toLowerCase() === answer.toLowerCase()) {
      return true;
    }
    
    // Check acceptable alternatives
    if (Array.isArray(blank.acceptableAnswers)) {
      return blank.acceptableAnswers.some(
        acceptable => acceptable.toLowerCase() === answer.toLowerCase()
      );
    }
    
    return false;
  };

  // Check if text contains blank patterns
  const hasBlankPattern = typeof questionText === 'string' && questionText.includes("[blank-");

  // If question doesn't have proper text with blanks, use a simpler display
  if (!hasBlankPattern || blanks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">
              {index + 1}. {question.question || "Fill in the blank question"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blanks.map((blank, i) => (
                <div key={blank.id || `blank-${i}`} className="flex flex-col space-y-2">
                  <p>Blank {i+1}:</p>
                  {showCorrectAnswer ? (
                    <div className={`p-3 rounded-md border ${
                      getAnswerForBlank(blank.id) 
                        ? isCorrectAnswer(blank.id, getAnswerForBlank(blank.id))
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                          : "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200"
                    }`}>
                      <p>Your answer: {getAnswerForBlank(blank.id) || "(not answered)"}</p>
                      <p className="text-green-600">Correct answer: {blank.correctAnswer}</p>
                    </div>
                  ) : (
                    <Input
                      value={getAnswerForBlank(blank.id)}
                      onChange={(e) => handleBlankChange(blank.id, e.target.value)}
                      placeholder={`Enter answer for blank ${i+1}`}
                      className="w-full"
                    />
                  )}
                </div>
              ))}
              
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

  // Render the question with blanks
  const renderQuestionText = () => {
    try {
      // Create a regex pattern that matches all blank patterns like [blank-1], [blank-2], etc.
      const blankPattern = /\[blank-\d+\]/g;
      const parts = questionText.split(blankPattern);
      const blanksMatches = questionText.match(blankPattern) || [];
      
      const result = [];
      for (let i = 0; i < parts.length; i++) {
        result.push(
          <span key={`part-${i}`}>{parts[i]}</span>
        );
        
        if (i < blanksMatches.length) {
          // Extract the blank ID from [blank-X] format
          const blankId = blanksMatches[i].replace('[', '').replace(']', '');
          const userAns = getAnswerForBlank(blankId);
          
          if (showCorrectAnswer) {
            const blank = blanks.find(b => b.id === blankId);
            const isCorrect = isCorrectAnswer(blankId, userAns);
            
            result.push(
              <span 
                key={`blank-${i}`} 
                className={`px-2 py-1 mx-1 rounded ${
                  userAns 
                    ? isCorrect
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {userAns || "(not answered)"}
                {!isCorrect && userAns && blank && (
                  <span className="ml-1 text-green-600">
                    → {blank.correctAnswer}
                  </span>
                )}
              </span>
            );
          } else {
            result.push(
              <Input
                key={`blank-${i}`}
                value={userAns}
                onChange={(e) => handleBlankChange(blankId, e.target.value)}
                className="inline-block w-32 mx-1"
                disabled={showCorrectAnswer}
              />
            );
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error rendering question text:", error);
      return <p className="text-red-500">Error rendering question</p>;
    }
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
            {index + 1}. Fill in the blanks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-lg leading-relaxed">
              {renderQuestionText()}
            </div>
            
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