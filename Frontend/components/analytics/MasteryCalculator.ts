/**
 * Utility for calculating mastery metrics and color scales
 */
export class MasteryCalculator {
    /**
     * Returns a color based on mastery level
     */
    static getMasteryColor(mastery: number | null | undefined): string {
      if (mastery == null || isNaN(Number(mastery))) return "gray";
      
      if (mastery >= 0.7) return "success";
      if (mastery >= 0.4) return "warning";
      return "destructive";
    }
    
    /**
     * Returns a CSS class based on mastery level
     */
    static getMasteryColorClass(mastery: number | null | undefined): string {
      if (mastery == null || isNaN(Number(mastery))) 
        return "bg-gray-300 dark:bg-gray-600";
      
      if (mastery >= 0.7) return "bg-green-500";
      if (mastery >= 0.4) return "bg-yellow-500";
      return "bg-red-500";
    }
    
    /**
     * Returns a gradient color for charts based on mastery
     */
    static getMasteryGradient(mastery: number | null | undefined): string {
      if (mastery == null || isNaN(Number(mastery))) 
        return "url(#masteryGradientGray)";
      
      if (mastery >= 0.7) return "url(#masteryGradientGreen)";
      if (mastery >= 0.4) return "url(#masteryGradientYellow)";
      return "url(#masteryGradientRed)";
    }
    
    /**
     * Calculate projected mastery based on current trajectory
     */
    static calculateProjectedMastery(
      currentMastery: number,
      rate: number,
      days: number
    ): number {
      const projected = currentMastery + (rate * days);
      // Cap mastery at 100%
      return Math.min(1.0, Math.max(0, projected));
    }
    
    /**
     * Calculate days needed to reach target mastery
     */
    static calculateDaysToTarget(
      currentMastery: number,
      rate: number,
      targetMastery: number = 0.7
    ): number | null {
      if (!rate || rate <= 0) return null;
      
      const daysNeeded = (targetMastery - currentMastery) / rate;
      return daysNeeded > 0 ? daysNeeded : 0;
    }
  }