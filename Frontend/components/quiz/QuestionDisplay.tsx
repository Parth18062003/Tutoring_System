"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuestionDisplayProps {
  question: {
    id: string;
    number: number;
    content: string;
    type: string;
    difficulty: string;
    options: string[];
  };
  onAnswerSubmit: (answer: string) => void;
  userAnswer: string;
}

export default function QuestionDisplay({
  question,
  onAnswerSubmit,
  userAnswer
}: QuestionDisplayProps) {
  const [localAnswer, setLocalAnswer] = useState(userAnswer || "");
  const [truefalseAnswer, setTruefalseAnswer] = useState<"true" | "false" | "">("");
  
  // Extract the question text without the options for cleaner display
  const getQuestionText = () => {
    // Remove options and difficulty from the content
    let text = question.content;
    
    // Remove MCQ options
    text = text.replace(/- \[[ x]\][^\n]+\n?/g, "");
    
    // Remove difficulty tag
    text = text.replace(/\*\*(Difficulty|Level):\s*[^\*]+\*\*/gi, "");
    
    return text.trim();
  };

  useEffect(() => {
    // Update local answer when userAnswer prop changes
    setLocalAnswer(userAnswer);
    
    // For true/false, set appropriate state
    if (question.type === "truefalse") {
      if (userAnswer.toLowerCase() === "true") setTruefalseAnswer("true");
      else if (userAnswer.toLowerCase() === "false") setTruefalseAnswer("false");
    }
  }, [userAnswer, question.type]);

  const handleMCQSelect = (option: string) => {
    setLocalAnswer(option);
    onAnswerSubmit(option);
  };

  const handleShortAnswerSubmit = () => {
    if (localAnswer.trim()) {
      onAnswerSubmit(localAnswer);
    }
  };
  
  const handleTrueFalseSelect = (value: "true" | "false") => {
    setTruefalseAnswer(value);
    onAnswerSubmit(value);
  };

  const renderDifficultyBadge = () => {
    const colorClass = {
      easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }[question.difficulty] || "bg-blue-100 text-blue-800";
    
    return (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${colorClass}`}>
        {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Question {question.number}</h3>
        {renderDifficultyBadge()}
      </div>

      <div className="prose dark:prose-invert max-w-none mb-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {getQuestionText()}
        </ReactMarkdown>
      </div>

      {question.type === "mcq" && question.options.length > 0 && (
        <div className="mt-4 space-y-2">
          <RadioGroup value={localAnswer} onValueChange={handleMCQSelect}>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`${question.id}-option-${index}`} 
                />
                <Label htmlFor={`${question.id}-option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {question.type === "shortAnswer" && (
        <div className="mt-4 space-y-2">
          <Input
            placeholder="Type your answer here..."
            value={localAnswer}
            onChange={(e) => setLocalAnswer(e.target.value)}
            className="w-full"
          />
          <Button 
            onClick={handleShortAnswerSubmit} 
            disabled={!localAnswer.trim()}
            size="sm"
          >
            Save Answer
          </Button>
        </div>
      )}

      {question.type === "truefalse" && (
        <div className="mt-4">
          <RadioGroup value={truefalseAnswer} onValueChange={handleTrueFalseSelect}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.id}-true`} />
              <Label htmlFor={`${question.id}-true`}>True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.id}-false`} />
              <Label htmlFor={`${question.id}-false`}>False</Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
}