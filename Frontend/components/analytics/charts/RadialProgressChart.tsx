import React from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentAnalyticsSummaryData } from "@/types/analytics-types";

interface RadialProgressChartProps {
  stagnationData?: StudentAnalyticsSummaryData["stagnation_areas"];
  className?: string;
}

export function RadialProgressChart({
  stagnationData,
  className = "",
}: RadialProgressChartProps) {
  const chartData = React.useMemo(() => {
    if (!stagnationData) return [];

    return stagnationData.map((area, index) => {
      const shortName = area.topic?.split("-").slice(1).join(" ") || "Unknown";
      return {
        name: shortName,
        mastery: area.mastery || 0,
        attempts: area.attempts || 0,
        severity: area.severity || 0,
        fill: `var(--chart-${(index % 9) + 1})`,
      };
    });
  }, [stagnationData]);

  const isEmpty = chartData.length === 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Topics Needing Focus</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No focus areas identified
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="10%"
                outerRadius="80%"
                barSize={10}
                data={chartData}
                startAngle={180}
                endAngle={-180}
              >
                <RadialBar
                  background={{ fill: "var(--muted)" }}
                  dataKey="mastery"
                  label={{
                    position: "insideStart",
                    fill: "var(--foreground)",
                    formatter: (value: number) => `${Math.round(value * 100)}%`,
                  }}
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: 12, right: 0 }}
                  formatter={(value) => value}
                />
                <Tooltip
                  formatter={(value: number, name, props) => {
                    if (name === "mastery") {
                      return [`${(value * 100).toFixed(1)}%`, "Mastery"];
                    }
                    // Additional properties if needed
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                  payload={[
                    { name: "mastery", value: 0 },
                    { name: "attempts", value: 0 },
                    { name: "severity", value: 0 },
                  ]}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}