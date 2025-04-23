import React from "react";

interface MasteryTrendsProps {
  data: Array<number>;
  height?: number;
  width?: number;
  strokeWidth?: number;
  className?: string;
  showEndpoints?: boolean;
}

/**
 * A mini sparkline visualization for mastery trends
 */
export function MasteryTrends({
  data,
  height = 20,
  width = 80,
  strokeWidth = 1.5,
  className = "",
  showEndpoints = true
}: MasteryTrendsProps) {
  if (!data || data.length < 2) return null;
  
  // Define viewBox and dimensions
  const viewBoxHeight = 100;
  const viewBoxWidth = 400;
  const padding = 5; // Percent of viewBoxHeight
  
  // Calculate min/max for y-scale
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = Math.max(0.1, maxVal - minVal); // Ensure some range
  
  // Calculate points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * viewBoxWidth;
    const y = viewBoxHeight - padding - 
      ((value - minVal) / range) * (viewBoxHeight - (2 * padding));
    return [x, y];
  });
  
  // Create path
  const pathData = points.map((point, i) => {
    return i === 0 ? `M ${point[0]},${point[1]}` : `L ${point[0]},${point[1]}`;
  }).join(" ");
  
  // Determine color based on trend
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const trend = lastValue > firstValue ? "increasing" : 
               lastValue < firstValue ? "decreasing" : "stable";
  
  const trendColor = trend === "increasing" 
    ? "var(--chart-success)" 
    : trend === "decreasing" 
      ? "var(--chart-destructive)" 
      : "var(--chart-muted)";
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
      className={className}
      preserveAspectRatio="none"
    >
      {/* Path for the sparkline */}
      <path
        d={pathData}
        fill="none"
        stroke={trendColor}
        strokeWidth={strokeWidth * 5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Optional endpoints */}
      {showEndpoints && (
        <>
          <circle 
            cx={points[0][0]} 
            cy={points[0][1]} 
            r={3 * strokeWidth} 
            fill={trendColor}
          />
          <circle 
            cx={points[points.length-1][0]} 
            cy={points[points.length-1][1]} 
            r={3 * strokeWidth} 
            fill={trendColor}
          />
        </>
      )}
    </svg>
  );
}