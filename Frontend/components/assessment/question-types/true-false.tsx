// components/learning/question-types/true-false.tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { OptionsInstructionCard } from "../instruction-card";
import { AssessmentQuestion } from "@/types/assessment-types";

interface TrueFalseQuestionProps {
  question: AssessmentQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TrueFalseQuestion({
  question,
  value,
  onChange,
  disabled = false
}: TrueFalseQuestionProps) {
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
        <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50">
          <RadioGroupItem value="true" id="true" />
          <Label htmlFor="true" className="flex-grow cursor-pointer">
            True
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50">
          <RadioGroupItem value="false" id="false" />
          <Label htmlFor="false" className="flex-grow cursor-pointer">
            False
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}