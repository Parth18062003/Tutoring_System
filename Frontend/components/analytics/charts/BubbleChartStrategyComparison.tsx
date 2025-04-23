import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentAnalyticsSummaryData } from "@/types/analytics-types";

interface BubbleChartStrategyComparisonProps {
  strategyData?: StudentAnalyticsSummaryData["strategy_effectiveness"];
  className?: string;
}

export function BubbleChartStrategyComparison({
  strategyData,
  className = "",
}: BubbleChartStrategyComparisonProps) {
  const chartData = React.useMemo(() => {
    if (!strategyData?.per_strategy_details) return [];

    return Object.entries(strategyData.per_strategy_details).map(
      ([strategy, data]) => ({
        name: strategy.replace("_", " "),
        masteryGain: data.avg_mastery_gain || 0,
        helpfulRating: data.avg_helpful_rating || 0,
        engagementRating: data.avg_engagement_rating || 0,
        usageCount: data.usage_count || 0,
        completionRate: data.avg_completion_percentage || 0,
      })
    );
  }, [strategyData]);

  const isEmpty = chartData.length === 0;

  // Calculate domain for bubble size scale
  const maxCount = React.useMemo(() => {
    if (isEmpty) return 10;
    return Math.max(...chartData.map((item) => item.usageCount)) || 10;
  }, [chartData, isEmpty]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Strategy Effectiveness</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No strategy data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.4}
                />
                <XAxis
                  type="number"
                  dataKey="masteryGain"
                  name="Mastery Gain"
                  domain={[0, "dataMax + 0.05"]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  label={{
                    value: "Avg Mastery Gain",
                    position: "insideBottom",
                    offset: -5,
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="helpfulRating"
                  name="Helpful Rating"
                  domain={[0, 5]}
                  label={{
                    value: "Helpful Rating",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <ZAxis
                  type="number"
                  dataKey="usageCount"
                  range={[20, 100]}
                  name="Usage Count"
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value: any, name: any) => {
                    if (name === "masteryGain") {
                      return [`${(value * 100).toFixed(1)}%`, "Mastery Gain"];
                    }
                    if (
                      name === "helpfulRating" ||
                      name === "engagementRating"
                    ) {
                      return [
                        `${value.toFixed(1)}/5`,
                        name.replace(/([A-Z])/g, " $1").trim(),
                      ];
                    }
                    if (name === "completionRate") {
                      return [`${value.toFixed(1)}%`, "Completion Rate"];
                    }
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                  labelFormatter={(index) => chartData[index]?.name || ""}
                  wrapperStyle={{ zIndex: 100 }}
                />
                <Legend />
                <Scatter
                  name="Strategies"
                  data={chartData}
                  fill="var(--chart-1)"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`var(--chart-${(index % 9) + 1})`}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
