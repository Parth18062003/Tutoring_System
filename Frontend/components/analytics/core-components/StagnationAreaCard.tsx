import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MasteryBadge } from "../mastery-badge";
import { AlertTriangle } from "lucide-react";
import { StudentAnalyticsSummaryData } from "@/types/analytics-types";

interface StagnationAreaCardProps {
  stagnationAreas?: StudentAnalyticsSummaryData["stagnation_areas"];
  className?: string;
}

export function StagnationAreaCard({
  stagnationAreas,
  className = "",
}: StagnationAreaCardProps) {
  const hasStagnationAreas = stagnationAreas && stagnationAreas.length > 0;

  // Format topic name to be more readable
  const getTopicShortName = (topicFullName: string | null | undefined): string =>
    topicFullName?.split("-").slice(1).join("-").replace(/_/g, " ") || "Unknown Topic";

  // Get color class based on severity
  const getSeverityColor = (severity: number | null | undefined): string => {
    if (severity == null || isNaN(Number(severity))) return "bg-gray-400";
    if (severity >= 2) return "bg-red-500";
    if (severity >= 1.5) return "bg-amber-500";
    if (severity >= 1) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Areas Needing Focus</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent>
        {!hasStagnationAreas ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No stagnation areas detected
          </div>
        ) : (
          <div className="space-y-4">
            {stagnationAreas.map((area, index) => (
              <div key={`area-${index}-${area.topic}`} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium truncate max-w-[70%]">
                    {getTopicShortName(area.topic)}
                  </div>
                  <MasteryBadge mastery={area.mastery} size="sm" />
                </div>

                <div className="flex items-center gap-2">
                  <Progress
                    value={area.mastery ? area.mastery * 100 : 0}
                    className="h-2"
                  />
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {area.attempts} {area.attempts === 1 ? "try" : "tries"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <div
                      className={`h-2 w-2 rounded-full ${getSeverityColor(area.severity)}`}
                    />
                    <span>
                      Severity: {area.severity ? area.severity.toFixed(1) : "N/A"}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    Target: 70%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}