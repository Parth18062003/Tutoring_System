import React from "react";
import { format, parseISO } from "date-fns";
import { Book, FileCheck, Brain, Gamepad, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MasteryBadge } from "../mastery-badge";
import { LearningPathItem } from "@/types/analytics-types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LearningPathTableProps {
  pathItems: LearningPathItem[];
  isLoading?: boolean;
}

export function LearningPathTable({
  pathItems,
  isLoading = false,
}: LearningPathTableProps) {
  // Get strategy icon
  const getStrategyIcon = (strategy: string | null | undefined) => {
    if (!strategy) return <Star className="h-3 w-3" />;
    
    switch(strategy.toUpperCase()) {
      case 'ASSESSMENT': return <FileCheck className="h-3 w-3" />;
      case 'GAMIFICATION': return <Gamepad className="h-3 w-3" />;
      case 'ADAPTIVE_PATH': return <Brain className="h-3 w-3" />;
      default: return <Book className="h-3 w-3" />;
    }
  };
  
  // Format topic name
  const getTopicShortName = (topicFullName: string | null | undefined): string =>
    topicFullName?.split("-").slice(1).join("-").replace(/_/g, " ") || "Unknown";

  // Calculate mastery gain
  const calculateGain = (before?: number | null, after?: number | null): number | null => {
    if (before == null || after == null) return null;
    return after - before;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (!pathItems || pathItems.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No learning path history found.
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
            <TableHead>Strategy</TableHead>
            <TableHead className="text-right">Mastery</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pathItems.map((item) => {
            const gain = calculateGain(
              item.mastery_at_request,
              item.mastery_after_feedback
            );
            
            return (
              <TableRow key={item.interaction_id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {item.timestamp_utc
                    ? format(parseISO(item.timestamp_utc), "MMM d, p")
                    : "Unknown"}
                </TableCell>
                
                <TableCell>
                  <div className="text-xs font-medium truncate max-w-[200px]">
                    {getTopicShortName(item.topic)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5">
                        {getStrategyIcon(item.strategy)}
                        <span className="text-xs truncate">
                          {item.content_type || "Lesson"}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="text-xs">
                      <p>Strategy: {item.strategy || 'Unknown'}</p>
                      <p>Type: {item.content_type || 'Unknown'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                
                <TableCell className="text-right flex items-center justify-end gap-2">
                  {item.mastery_after_feedback != null && (
                    <>
                      <MasteryBadge mastery={item.mastery_after_feedback} size="sm" />
                      {gain != null && gain > 0 && (
                        <span className="text-xs text-emerald-500">
                          +{(gain * 100).toFixed(1)}%
                        </span>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}