import React from "react";
import { Badge } from "@/components/ui/badge";
import { MasteryCalculator } from "./MasteryCalculator";

interface MasteryBadgeProps {
  mastery: number | null | undefined;
  showPercentage?: boolean;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function MasteryBadge({ 
  mastery, 
  showPercentage = true, 
  showLabel = false,
  size = "default",
  className = ""
}: MasteryBadgeProps) {
  const masteryColor = MasteryCalculator.getMasteryColor(mastery);
  
  const sizeClasses = {
    sm: "text-xs py-0 px-1.5 h-5",
    default: "text-xs py-1 px-2.5",
    lg: "text-sm py-1 px-3"
  };
  
  const getMasteryLabel = (mastery: number | null | undefined) => {
    if (mastery == null || isNaN(Number(mastery))) return "Unknown";
    if (mastery >= 0.7) return "High";
    if (mastery >= 0.4) return "Medium";
    return "Low";
  };
  
  const formattedMastery = mastery != null && !isNaN(Number(mastery)) 
    ? `${Math.round(mastery * 100)}%` 
    : "N/A";
  
  const displayText = showLabel 
    ? `${getMasteryLabel(mastery)}${showPercentage ? ` (${formattedMastery})` : ''}` 
    : formattedMastery;

  return (
    <Badge 
      variant={masteryColor as any}
      className={`${sizeClasses[size]} ${className}`}
    >
      {displayText}
    </Badge>
  );
}