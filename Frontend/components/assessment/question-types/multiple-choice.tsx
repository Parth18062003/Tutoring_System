// components/learning/question-types/multiple-choice.tsx
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { OptionsInstructionCard } from "../instruction-card";
import { AssessmentQuestion } from "@/types/assessment-types";

interface MultipleChoiceQuestionProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  disabled = false
}: MultipleChoiceQuestionProps) {
  const options = question.options || [];
  
  return (
    <div className="space-y-6">
      <div className="text-lg font-medium">{question.question}</div>
      
      {question.hint && (
        <OptionsInstructionCard message={question.hint} />
      )}
      
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="space-y-3"
      >
        {options.map((option, i) => {
          // Handle both numeric options and letter options (A, B, C, D)
          const optionKey = String.fromCharCode(65 + i);
          const displayValue = option.startsWith(optionKey) ? option : `${optionKey}. ${option}`;
          
          return (
            <div key={i} className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50">
              <RadioGroupItem value={optionKey} id={`option-${i}`} />
              <Label htmlFor={`option-${i}`} className="flex-grow cursor-pointer">
                {displayValue}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}