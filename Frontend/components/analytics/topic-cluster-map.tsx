import React from "react";
import { StudentAnalyticsSummaryData } from "@/types/analytics-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { MasteryBadge } from "./mastery-badge";

interface TopicClusterMapProps {
  knowledgeStructure?: StudentAnalyticsSummaryData["knowledge_structure"];
  masteryByTopic?: Record<string, number>;
  className?: string;
}

export function TopicClusterMap({
  knowledgeStructure,
  masteryByTopic,
  className = "",
}: TopicClusterMapProps) {
  if (
    !knowledgeStructure?.identified_clusters ||
    knowledgeStructure.identified_clusters.length === 0
  ) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Topic Relationships</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground text-center py-8">
          No topic clusters identified yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Topic Relationships</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {knowledgeStructure.identified_clusters.map((cluster, index) => (
            <div key={index} className="border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">Cluster {index + 1}</h4>
              <div className="flex flex-wrap gap-2">
                {cluster.topics.map((topic: string) => {
                  const topicShortName = topic
                    .split("-")
                    .slice(1)
                    .join("-")
                    .replace(/_/g, " ");
                  const mastery = masteryByTopic?.[topic];

                  return (
                    <Tooltip key={topic}>
                      <TooltipTrigger asChild>
                        <div className="border rounded px-2 py-1 text-xs flex items-center gap-2 bg-background">
                          <span className="truncate max-w-[100px]">
                            {topicShortName}
                          </span>
                          {mastery !== undefined && (
                            <MasteryBadge mastery={mastery} size="sm" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{topic}</p>
                        {mastery !== undefined && (
                          <p>Mastery: {(mastery * 100).toFixed(1)}%</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
