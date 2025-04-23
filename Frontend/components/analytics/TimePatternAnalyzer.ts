import { StudentAnalyticsSummaryData } from "@/types/analytics-types";

/**
 * Utility for analyzing time-based learning patterns
 */
export class TimePatternAnalyzer {
  /**
   * Get the peak learning hours (top 25% of activity)
   */
  static getPeakHours(timePatterns?: StudentAnalyticsSummaryData["time_patterns"]): number[] {
    if (!timePatterns?.hour_distribution) return [];
    
    const hourDist = [...timePatterns.hour_distribution];
    const sortedHours = hourDist
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);
    
    // Get top 25% of hours with activity
    const activeHours = sortedHours.filter(h => h.count > 0);
    const peakCount = Math.max(1, Math.ceil(activeHours.length * 0.25));
    
    return activeHours
      .slice(0, peakCount)
      .map(h => h.hour)
      .sort((a, b) => a - b);
  }
  
  /**
   * Get the optimal days for learning based on past performance
   */
  static getOptimalDays(timePatterns?: StudentAnalyticsSummaryData["time_patterns"]): number[] {
    if (!timePatterns?.day_distribution) return [];
    
    const dayDist = [...timePatterns.day_distribution];
    const sortedDays = dayDist
      .map((count, day) => ({ day, count }))
      .sort((a, b) => b.count - a.count);
    
    // Get days with above-average activity
    const totalActivity = dayDist.reduce((sum, count) => sum + count, 0);
    const avgActivity = totalActivity / 7;
    
    return sortedDays
      .filter(d => d.count > avgActivity)
      .map(d => d.day);
  }
  
  /**
   * Format a time of day from hour number
   */
  static formatHour(hour: number | null | undefined): string {
    if (hour == null || isNaN(Number(hour))) return "N/A";
    
    const h = Number(hour);
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    if (h < 12) return `${h} AM`;
    return `${h - 12} PM`;
  }
  
  /**
   * Get the day name from day index
   */
  static getDayName(dayIndex: number | null | undefined): string {
    if (dayIndex == null || isNaN(Number(dayIndex))) return "N/A";
    
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[Number(dayIndex) % 7] || "N/A";
  }
  
  /**
   * Format a duration in seconds to a human-readable string
   */
  static formatDuration(seconds: number | null | undefined): string {
    if (seconds == null || isNaN(Number(seconds))) return "N/A";
    
    const s = Number(seconds);
    if (s < 60) return `${Math.round(s)}s`;
    if (s < 3600) return `${Math.round(s / 60)}m`;
    return `${(s / 3600).toFixed(1)}h`;
  }
}