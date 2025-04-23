import React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentAnalyticsSummaryData } from "@/types/analytics-types";

interface MultiLineChartProps {
  data?: StudentAnalyticsSummaryData["learning_velocity"];
  className?: string;
  title?: string;
  showHeader?: boolean;
}

export function MultiLineChart({
  data,
  className = "",
  title = "Learning Velocities",
  showHeader = true,
}: MultiLineChartProps) {
  const chartData = React.useMemo(() => {
    if (!data?.by_topic) return [];

    // Create a common x-axis with interaction points
    const maxInteractions = 10; // We'll show projected points

    return Array.from({ length: maxInteractions }, (_, i) => {
      const point: Record<string, any> = { interaction: i + 1 };
      
      // Add velocity projections for each topic
      if (data.by_topic)
      Object.entries(data.by_topic).forEach(([topic, velocity]) => {
        if (velocity == null) return; // skip null or undefined
        const shortName = topic.split("-").slice(1).join(" ");
        point[shortName] = velocity * (i + 1);
      });      
      
      return point;
    });
  }, [data]);

  // Create colors for each topic
  const topicColors = React.useMemo(() => {
    if (!data?.by_topic) return {};
    
    return Object.keys(data.by_topic).reduce((acc, topic, index) => {
      const shortName = topic.split("-").slice(1).join(" ");
      const colorIndex = (index % 9) + 1;
      acc[shortName] = `var(--chart-${colorIndex})`;
      return acc;
    }, {} as Record<string, string>);
  }, [data]);

  const renderContent = () => (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
          <XAxis 
            dataKey="interaction"
            tickLine={false}
            axisLine={false}
            label={{ value: "Interactions", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{ value: "Mastery Gain", angle: -90, position: "insideLeft" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(3)}`, "Mastery Gain"]}
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          {Object.keys(topicColors).map((topic) => (
            <Line
              key={topic}
              type="monotone"
              dataKey={topic}
              name={topic}
              stroke={topicColors[topic]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 1 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  if (!showHeader) {
    return renderContent();
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}