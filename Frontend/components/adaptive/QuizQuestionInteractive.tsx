// src/components/adaptive/QuizQuestionInteractive.tsx
// Note: This is needed by SectionRenderer
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuizQuestionInteractiveProps {
  questionNumber: number;
  questionText: string;
  onAnswerChange: (questionNumber: number, answer: string | string[]) => void;
  initialAnswer?: string | string[];
}

const parseMcqOptions = (text: string): { question: string; options: string[] } | null => {
    const lines = text.trim().split('\n');
    const options: string[] = [];
    let question = '';
    const optionRegex = /^\s*\([A-Z]\)\s*(.*)/i;
    let foundOptions = false;
    let currentQuestionLines: string[] = [];

    for (const line of lines) {
        const match = line.match(optionRegex);
        if (match) {
            options.push(match[1].trim());
            foundOptions = true;
        } else if (!foundOptions) {
            currentQuestionLines.push(line);
        }
    }
    question = currentQuestionLines.join('\n').trim();
    if (options.length > 1 && question) {
        return { question, options };
    }
    return null;
};

export function QuizQuestionInteractive({
  questionNumber,
  questionText,
  onAnswerChange,
  initialAnswer,
}: QuizQuestionInteractiveProps) {
  const [mcqData, setMcqData] = useState<{ question: string; options: string[] } | null>(null);
  const [isMcq, setIsMcq] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(
    typeof initialAnswer === 'string' ? initialAnswer : undefined
  );

  useEffect(() => {
    const parsed = parseMcqOptions(questionText);
    setMcqData(parsed);
    setIsMcq(!!parsed);
    setSelectedAnswer(typeof initialAnswer === 'string' ? initialAnswer : undefined);
  }, [questionText, initialAnswer]);

  const handleRadioChange = useCallback((value: string) => {
    setSelectedAnswer(value);
    onAnswerChange(questionNumber, value);
  }, [onAnswerChange, questionNumber]);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setSelectedAnswer(value);
    onAnswerChange(questionNumber, value);
  }, [onAnswerChange, questionNumber]);

  return (
    <div className="space-y-3">
      {isMcq && mcqData ? (
        <>
          <p className="font-medium">{mcqData.question || 'Select the correct option:'}</p>
          <RadioGroup
            value={selectedAnswer}
            onValueChange={handleRadioChange}
            className="space-y-2"
          >
            {mcqData.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              const optionValue = option;
              return (
                <div key={`${questionNumber}-${index}`} className="flex items-center space-x-2">
                  <RadioGroupItem value={optionValue} id={`q${questionNumber}-opt${index}`} />
                  <Label htmlFor={`q${questionNumber}-opt${index}`} className="cursor-pointer">
                     ({optionLetter}) {option}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </>
      ) : (
        <>
          <Label htmlFor={`q${questionNumber}-text`} className='font-medium'>{questionText || 'Enter your answer:'}</Label>
          <Textarea
             id={`q${questionNumber}-text`}
             placeholder="Your answer..."
             value={selectedAnswer || ''}
             onChange={handleTextChange}
             rows={4}
          />
        </>
      )}
    </div>
  );
}