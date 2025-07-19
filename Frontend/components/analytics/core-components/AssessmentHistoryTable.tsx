import React from "react";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MasteryBadge } from "../mastery-badge";
import { AssessmentHistoryItem } from "@/types/analytics-types";
import { Badge } from "@/components/ui/badge";

interface AssessmentHistoryTableProps {
  assessments: AssessmentHistoryItem[];
  isLoading?: boolean;
}

export function AssessmentHistoryTable({
  assessments,
  isLoading = false,
}: AssessmentHistoryTableProps) {
  // Calculate mastery gain
  const calculateGain = (before?: number | null, after?: number | null): number | null => {
    if (before == null || after == null) return null;
    return after - before;
  };

  // Get score badge variant
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 70) return "warning";
    return "destructive";
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No assessment history found.
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">Difficulty</TableHead>
            <TableHead className="text-right">Mastery</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment) => {
            const gain = calculateGain(
              assessment.mastery_before,
              assessment.mastery_after
            );
            
            return (
              <TableRow key={assessment.assessment_id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {assessment.completed_at
                    ? format(new Date(assessment.completed_at), "MMM d, p")
                    : "Unknown"}
                </TableCell>
                
                <TableCell>
                  <div className="text-xs font-medium truncate max-w-[180px]">
                    {assessment.topic || "Unknown"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {assessment.subject}
                  </div>
                </TableCell>
                
                <TableCell className="text-center">
                  <Badge>
                  {Number(assessment.score).toFixed(2)}%
                  </Badge>
                </TableCell>
                
                <TableCell className="text-center">
                  <span className="text-xs font-medium">
                    {assessment.difficulty ? (assessment.difficulty * 10).toFixed(1) : "N/A"}
                  </span>
                </TableCell>
                
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {assessment.mastery_after != null && (
                      <MasteryBadge mastery={assessment.mastery_after} size="sm" />
                    )}
                    {gain != null && gain > 0 && (
                      <span className="text-xs text-emerald-500">
                        +{(gain * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}