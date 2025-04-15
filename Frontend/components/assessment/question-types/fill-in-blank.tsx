// components/learning/question-types/fill-in-blank.tsx
import { Input } from "@/components/ui/input";
import { AssessmentQuestion } from "@/types/assessment-types";
import { OptionsInstructionCard } from "../instruction-card";

interface FillInBlankQuestionProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function FillInBlankQuestion({
  question,
  value,
  onChange,
  disabled = false
}: FillInBlankQuestionProps) {
  // Replace _____ or [blank] with an input field
  const questionText = question.question;
  const parts = questionText.split(/(\[blank\]|_{3,})/g);
  
  return (
    <div className="space-y-6">
      <div className="text-lg font-medium">
        {parts.length > 1 ? (
          <div className="space-y-2">
            {parts.map((part, index) => {
              if (part === '[blank]' || /_{3,}/.test(part)) {
                return (
                  <Input
                    key={index}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="inline-block w-40 mx-2"
                    placeholder="Fill in..."
                  />
                );
              }
              return <span key={index}>{part}</span>;
            })}
          </div>
        ) : (
          // If no blank placeholders found in question text
          <>
            {questionText}
            <div className="mt-4">
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Your answer..."
              />
            </div>
          </>
        )}
      </div>
      
      {question.hint && (
        <OptionsInstructionCard message={question.hint} />
      )}
    </div>
  );
}