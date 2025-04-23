import React from "react";
import { StudentAnalyticsSummaryData } from "@/types/analytics-types";

interface TimePatternVisualizerProps {
  timePatterns?: StudentAnalyticsSummaryData["time_patterns"];
  type: "day" | "hour";
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TimePatternVisualizer({
  timePatterns,
  type,
  showLabels = true,
  size = "md",
}: TimePatternVisualizerProps) {
  // Log the data for debugging
  React.useEffect(() => {
    console.log(`Time patterns (${type}):`, timePatterns);
  }, [timePatterns, type]);

  // Early return for missing data
  if (!timePatterns) {
    return (
      <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
        No activity pattern data
      </div>
    );
  }

  // Get the correct distribution array
  const distribution = type === "hour" 
    ? timePatterns.hour_distribution 
    : timePatterns.day_distribution;

  // If there's no distribution data
  if (!distribution || distribution.length === 0) {
    return (
      <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
        No {type === "hour" ? "hourly" : "daily"} activity data
      </div>
    );
  }

  // Get max value for normalization
  const maxValue = Math.max(...distribution.filter(v => typeof v === 'number'));

  // Prepare labels based on type
  const labels = type === "hour"
    ? Array.from({ length: 24 }, (_, i) => i.toString()) // 0-23 hours
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Make sure we have the right number of labels
  const expectedLength = type === "hour" ? 24 : 7;
  if (distribution.length !== expectedLength) {
    console.warn(`Expected ${expectedLength} elements in ${type} distribution, got ${distribution.length}`);
  }

  // Size classes for different visualization sizes
  const sizeClasses = {
    sm: "h-1.5 text-xs",
    md: "h-2 text-sm",
    lg: "h-3 text-base"
  };

  return (
    <div className="w-full">
      <div className="flex gap-1">
        {labels.map((label, index) => {
          // Get value from distribution array at index position
          const value = index < distribution.length 
            ? distribution[index] 
            : 0;
          
          // Calculate normalized height
          const heightPercentage = maxValue > 0 
            ? (value / maxValue) * 100 
            : 0;

          return (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div className="w-full h-16 flex items-end mb-1">
                <div
                  className={`w-full ${sizeClasses[size]} rounded-sm bg-primary`}
                  style={{
                    height: `${Math.max(heightPercentage, 4)}%`, // Min 4% for visibility
                    opacity: Math.max(0.2, heightPercentage / 100), // Min 0.2 opacity
                  }}
                />
              </div>
              
              {showLabels && (
                <div className={`text-center ${sizeClasses[size].split(" ")[1]} text-muted-foreground`}>
                  {type === "hour" ? (parseInt(label) % 3 === 0 ? label : "") : label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}