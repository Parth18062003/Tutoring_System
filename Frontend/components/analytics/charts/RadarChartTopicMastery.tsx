import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentAnalyticsSummaryData } from "@/types/analytics-types";

interface RadarChartTopicMasteryProps {
  masteryData?: StudentAnalyticsSummaryData["mastery_summary"];
  className?: string;
}

export function RadarChartTopicMastery({
  masteryData,
  className = "",
}: RadarChartTopicMasteryProps) {
  const chartData = React.useMemo(() => {
    if (!masteryData?.by_topic) return [];

    return Object.entries(masteryData.by_topic).map(([topic, mastery]) => {
      const shortName = topic.split("-").slice(1).join(" ");
      return {
        topic: shortName,
        mastery: mastery,
        fullScore: 1.0, // Target mastery
      };
    });
  }, [masteryData]);

  const isEmpty = chartData.length === 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Topic Mastery</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No mastery data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="topic"
                  tick={{ fill: "var(--foreground)", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 1]}
                  tickFormatter={(value) => `${Math.round(value * 100)}%`}
                />
                <Radar
                  name="Current Mastery"
                  dataKey="mastery"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Target"
                  dataKey="fullScore"
                  stroke="var(--chart-2)"
                  fill="var(--chart-2)"
                  fillOpacity={0.15}
                />
                <Tooltip
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Mastery"]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}