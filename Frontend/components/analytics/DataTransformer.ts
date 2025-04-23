import { StudentAnalyticsSummaryData, LearningPathItem, AssessmentHistoryItem } from "@/types/analytics-types";

/**
 * Transforms raw analytics data into chart-friendly formats
 */
export class DataTransformer {
  /**
   * Transforms learning trajectory data for area charts
   */
  static transformLearningTrajectory(summaryData?: StudentAnalyticsSummaryData | null) {
    if (!summaryData?.learning_trajectory?.by_topic) return [];
    
    return Object.entries(summaryData.learning_trajectory.by_topic).map(([topic, data]) => {
      // Calculate points along the trajectory
      const points = [];
      const dayCount = data.days_of_learning || 1;
      const initialMastery = data.initial_mastery || 0;
      const currentMastery = data.current_mastery || initialMastery;
      const ratePerDay = data.rate || (currentMastery - initialMastery) / dayCount;
      
      // Generate points for a smooth curve
      for (let i = 0; i <= Math.ceil(dayCount); i += 0.5) {
        const projectedMastery = Math.min(
          initialMastery + (ratePerDay * i),
          1.0 // Mastery is capped at 100%
        );
        
        points.push({
          day: i,
          mastery: projectedMastery,
          topic: topic.split('-').slice(1).join('-').replace(/_/g, ' ')
        });
      }
      
      return points;
    }).flat();
  }
  
  /**
   * Extracts hourly activity patterns for visualization
   */
  static transformTimePatterns(summaryData?: StudentAnalyticsSummaryData | null) {
    const hourDistribution = summaryData?.time_patterns?.hour_distribution || [];
    const dayDistribution = summaryData?.time_patterns?.day_distribution || [];
    
    const hourData = hourDistribution.map((count, hour) => ({
      hour,
      count,
      formattedHour: `${hour}:00`
    }));
    
    const dayData = dayDistribution.map((count, index) => ({
      day: index,
      count,
      dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]
    }));
    
    return {
      hourData,
      dayData,
      maxHourCount: Math.max(...hourDistribution),
      maxDayCount: Math.max(...dayDistribution)
    };
  }
  
  /**
   * Converts strategy effectiveness data for bubble chart visualization
   */
  static transformStrategyEffectiveness(summaryData?: StudentAnalyticsSummaryData | null) {
    if (!summaryData?.strategy_effectiveness?.per_strategy_details) return [];
    
    return Object.entries(summaryData.strategy_effectiveness.per_strategy_details).map(([strategy, data]) => ({
      name: strategy,
      displayName: strategy.replace('_', ' '),
      usageCount: data.usage_count || 0,
      masteryGain: data.avg_mastery_gain || 0,
      helpfulRating: data.avg_helpful_rating || 0,
      engagementRating: data.avg_engagement_rating || 0,
      completionRate: data.avg_completion_percentage || 0,
      // Calculate a size value for bubble charts based on usage count
      size: Math.max(10, Math.min(50, (data.usage_count || 0) * 5))
    }));
  }
  
  /**
   * Formats assessment history for trend analysis
   */
  static transformAssessmentHistory(assessmentData?: AssessmentHistoryItem[]) {
    if (!assessmentData) return [];
    
    return assessmentData.map(item => ({
      date: item.completed_at ? new Date(item.completed_at) : new Date(),
      topic: item.topic,
      score: item.score || 0,
      difficulty: item.difficulty || 0,
      masteryGain: (item.mastery_after || 0) - (item.mastery_before || 0),
      masteryAfter: item.mastery_after || 0
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}