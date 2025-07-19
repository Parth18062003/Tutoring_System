/* // components/learning/question-types/multiple-choice.tsx
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
} */
// components/learning/question-types/multiple-choice.tsx
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { OptionsInstructionCard } from "../instruction-card";
import { AssessmentQuestion } from "@/types/assessment-types";
import { cn } from "@/lib/utils"; // Import cn if not already imported

interface MultipleChoiceQuestionProps {
  question: AssessmentQuestion;
  value: string; // This should hold the full text of the selected option
  onChange: (value: string) => void; // This receives the full text
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
        // The value of the group should match the full text of the selected option
        value={value}
        // The onChange handler directly receives the full text of the selected option
        onValueChange={onChange}
        disabled={disabled}
        className="space-y-3"
      >
        {options.map((optionText, i) => {
          // Generate the display label (e.g., "A. Melting ice into water")
          const optionKey = String.fromCharCode(65 + i); // A, B, C...
          const displayLabel = `${optionKey}. ${optionText}`;
          const uniqueId = `option-${question.id}-${i}`; // Create a unique ID

          return (
            <div
              key={uniqueId}
              className={cn(
                "flex items-center space-x-3 border p-4 rounded-md transition-colors",
                "hover:bg-muted/50", // Hover effect
                "has-[input:checked]:border-primary has-[input:checked]:bg-primary/10", // Style when checked
                "has-[input:disabled]:opacity-70 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:hover:bg-transparent" // Style when disabled
              )}
            >
              {/* The value passed to RadioGroupItem is the actual option text */}
              <RadioGroupItem value={optionText} id={uniqueId} disabled={disabled} />
              <Label htmlFor={uniqueId} className="flex-grow cursor-pointer">
                {displayLabel}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}