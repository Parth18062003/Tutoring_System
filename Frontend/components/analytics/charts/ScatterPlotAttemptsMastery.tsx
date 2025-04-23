import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentAnalyticsSummaryData } from "@/types/analytics-types";

interface ScatterPlotAttemptsMasteryProps {
  stagnationData?: StudentAnalyticsSummaryData["stagnation_areas"];
  masteryByTopic?: Record<string, number>;
  className?: string;
}

export function ScatterPlotAttemptsMastery({
  stagnationData,
  masteryByTopic,
  className = "",
}: ScatterPlotAttemptsMasteryProps) {
  const chartData = React.useMemo(() => {
    if (!stagnationData) return [];

    return stagnationData.map((area) => {
      const shortName = area.topic?.split("-").slice(1).join(" ") || "Unknown";
      return {
        name: shortName,
        fullTopic: area.topic,
        attempts: area.attempts,
        mastery: area.mastery,
        severity: area.severity,
      };
    });
  }, [stagnationData]);

  const isEmpty = chartData.length === 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Attempts vs. Mastery</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis
                  type="number"
                  dataKey="attempts"
                  name="Attempts"
                  unit=" tries"
                  label={{ value: "Attempts", position: "insideBottom", offset: -5 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="mastery"
                  name="Mastery"
                  domain={[0, 1]}
                  tickFormatter={(value) => `${Math.round(value * 100)}%`}
                  label={{ value: "Mastery", angle: -90, position: "insideLeft" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number, name) => {
                    if (name === "mastery") {
                      return [`${(value * 100).toFixed(1)}%`, "Mastery"];
                    }
                    if (name === "attempts") {
                      return [value, "Attempts"];
                    }
                    if (name === "severity") {
                      return [value.toFixed(2), "Severity"];
                    }
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                  cursor={{ strokeDasharray: "3 3" }}
                  labelFormatter={(value) => chartData[value]?.name || ""}
                />
                <ReferenceLine
                  y={0.4}
                  stroke="var(--chart-warning)"
                  strokeDasharray="3 3"
                  label={{
                    value: "Medium (40%)",
                    position: "insideTopRight",
                    fill: "var(--chart-warning)",
                  }}
                />
                <ReferenceLine
                  y={0.7}
                  stroke="var(--chart-success)"
                  strokeDasharray="3 3"
                  label={{
                    value: "High (70%)",
                    position: "insideTopRight",
                    fill: "var(--chart-success)",
                  }}
                />
                <Scatter
                  name="Topics"
                  data={chartData}
                  fill="var(--chart-1)"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const size = Math.max(
                      20,
                      Math.min(40, (payload.severity || 1) * 10)
                    );
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={size / 3}
                        fill="var(--chart-1)"
                        fillOpacity={0.6}
                        stroke="var(--chart-1)"
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}