// components/learning/question-types/short-answer.tsx
import { Textarea } from "@/components/ui/textarea";
import { OptionsInstructionCard } from "../instruction-card";
import { AssessmentQuestion } from "@/types/assessment-types";

interface ShortAnswerQuestionProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ShortAnswerQuestion({
  question,
  value,
  onChange,
  disabled = false
}: ShortAnswerQuestionProps) {
  return (
    <div className="space-y-6">
      <div className="text-lg font-medium">{question.question}</div>
      
      {question.hint && (
        <OptionsInstructionCard message={question.hint} />
      )}
      
      <Textarea
        placeholder="Type your answer here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[120px]"
      />
    </div>
  );
}