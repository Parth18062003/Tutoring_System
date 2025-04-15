// components/learning/instruction-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

interface OptionsInstructionCardProps {
  message: string;
}

export function OptionsInstructionCard({ message }: OptionsInstructionCardProps) {
  return (
    <Card className="bg-muted/40">
      <CardContent className="p-3 text-sm flex items-start gap-2">
        <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <div>{message}</div>
      </CardContent>
    </Card>
  );
}