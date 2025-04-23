import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentAnalyticsSummaryData } from "@/types/analytics-types";
import { LearningPathItem } from "@/types/analytics-types";

interface StackedBarChartTimeDistributionProps {
  timePatterns?: StudentAnalyticsSummaryData["time_patterns"];
  pathItems?: LearningPathItem[];
  className?: string;
  type?: "hour" | "day";
}

export function StackedBarChartTimeDistribution({
  timePatterns,
  pathItems,
  className = "",
  type = "hour",
}: StackedBarChartTimeDistributionProps) {
  const chartData = React.useMemo(() => {
    if (!timePatterns) return [];

    const distribution = type === "hour" 
      ? timePatterns.hour_distribution 
      : timePatterns.day_distribution;
    
    if (!distribution) return [];

    // Group path items by strategy and time
    const strategiesByTime: Record<number, Record<string, number>> = {};
    
    // Initialize with all hours/days
    const length = type === "hour" ? 24 : 7;
    for (let i = 0; i < length; i++) {
      strategiesByTime[i] = {};
    }
    
    // Fill with path data if available
    if (pathItems) {
      pathItems.forEach(item => {
        if (!item.timestamp_utc || !item.strategy) return;
        
        const date = new Date(item.timestamp_utc);
        const timeIndex = type === "hour" 
          ? date.getHours() 
          : (date.getDay() + 6) % 7; // Convert to Monday=0 index
        
        const strategy = item.strategy;
        
        if (!strategiesByTime[timeIndex]) {
          strategiesByTime[timeIndex] = {};
        }
        
        if (!strategiesByTime[timeIndex][strategy]) {
          strategiesByTime[timeIndex][strategy] = 0;
        }
        
        strategiesByTime[timeIndex][strategy]++;
      });
    }
    
    // Create final data array with proper labels
    return Array.from({ length }, (_, i) => {
      let label;
      
      if (type === "hour") {
        // Format hours as "8 AM", "2 PM", etc.
        const hour = i;
        if (hour === 0) label = "12 AM";
        else if (hour === 12) label = "12 PM";
        else if (hour < 12) label = `${hour} AM`;
        else label = `${hour - 12} PM`;
      } else {
        // Format days
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        label = days[i];
      }
      
      return {
        name: label,
        total: distribution[i] || 0,
        ...strategiesByTime[i]
      };
    });
  }, [timePatterns, pathItems, type]);

  const strategies = React.useMemo(() => {
    const uniqueStrategies = new Set<string>();
    
    if (pathItems) {
      pathItems.forEach(item => {
        if (item.strategy) {
          uniqueStrategies.add(item.strategy);
        }
      });
    }
    
    return Array.from(uniqueStrategies);
  }, [pathItems]);

  const isEmpty = chartData.every(item => item.total === 0);

  // Map strategies to colors
  const strategyColors: Record<string, string> = {
    GAMIFICATION: "var(--chart-1)",
    ASSESSMENT: "var(--chart-2)", 
    ADAPTIVE_PATH: "var(--chart-3)",
  };

  const getDefaultColor = (index: number) => `var(--chart-${(index % 9) + 1})`;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">
          {type === "hour" ? "Hourly Activity" : "Daily Activity"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No activity data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                
                {/* Render bars for each strategy */}
                {strategies.map((strategy, index) => (
                  <Bar
                    key={strategy}
                    dataKey={strategy}
                    stackId="a"
                    fill={strategyColors[strategy] || getDefaultColor(index)}
                    name={strategy.replace("_", " ")}
                  />
                ))}
                
                {/* If no path items with strategy data, show total */}
                {strategies.length === 0 && (
                  <Bar
                    dataKey="total"
                    fill="var(--chart-1)"
                    name="Total Activities"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}