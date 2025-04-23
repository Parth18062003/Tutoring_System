import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentAnalyticsSummaryData } from "@/types/analytics-types";

interface AreaChartLearningTrajectoryProps {
  data?: StudentAnalyticsSummaryData["learning_trajectory"];
  className?: string;
  showHeader?: boolean;
}

export function AreaChartLearningTrajectory({
  data,
  className = "",
  showHeader = true,
}: AreaChartLearningTrajectoryProps) {
  // Add debug logging to see what data we have
  React.useEffect(() => {
    console.log("Learning trajectory data:", data);
  }, [data]);

  const chartData = React.useMemo(() => {
    if (!data?.by_topic || Object.keys(data.by_topic).length === 0) {
      console.log("No trajectory data found");
      return [];
    }

    // Get array of days from 0 to max days
    const maxDays = Math.max(
      ...Object.values(data.by_topic).map(d => d.days_of_learning || 0)
    );
    const days = Array.from({ length: Math.ceil(maxDays) + 1 }, (_, i) => i);

    // Create data points for each day
    return days.map(day => {
      const point: Record<string, any> = { day };
      
      // Calculate mastery for each topic on this day
      if(data.by_topic) {
        Object.entries(data.by_topic).forEach(([topic, topicData]) => {
          const shortName = topic.split("-").slice(1).join(" ");
          const initialMastery = topicData.initial_mastery || 0;
          const rate = topicData.rate || 0;
      
          // Calculate projected mastery at this day
          const projectedMastery = Math.min(
            1.0,
            initialMastery + rate * day
          );
          
          point[shortName] = projectedMastery;
        });
      }
      
      return point;
    });
  }, [data]);

  // Create colors for each topic (using chart-1, chart-2, etc.)
  const topicColors = React.useMemo(() => {
    if (!data?.by_topic) return {};
    
    return Object.keys(data.by_topic).reduce((acc, topic, index) => {
      const shortName = topic.split("-").slice(1).join(" ");
      const colorIndex = (index % 9) + 1; // Use up to 9 colors
      acc[shortName] = `var(--chart-${colorIndex})`;
      return acc;
    }, {} as Record<string, string>);
  }, [data]);

  // Create a better fallback when no data is available
  if (!data?.by_topic || Object.keys(data.by_topic).length === 0 || chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Learning Trajectory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-muted-foreground mb-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
              />
            </svg>
            <p className="text-sm text-muted-foreground">
              No learning trajectory data available yet
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Continue your learning journey to generate trajectory insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderContent = () => (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
          <XAxis 
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `Day ${value}`}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
            domain={[0, 1]}
            tickCount={6}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${(value * 100).toFixed(1)}%`, 
              `Topic: ${name}`
            ]}
            labelFormatter={(value) => `Day ${value}`}
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          {Object.keys(topicColors).map((topic) => (
            <Area
              key={topic}
              type="monotone"
              dataKey={topic}
              name={topic}
              stroke={topicColors[topic]}
              fill={topicColors[topic]}
              fillOpacity={0.2}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (!showHeader) {
    return renderContent();
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Learning Trajectory</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}