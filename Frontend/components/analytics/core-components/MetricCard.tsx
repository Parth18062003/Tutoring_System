import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number | ReactNode;
  description?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  loading?: boolean;
  tooltip?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  loading = false,
  tooltip,
  className = "",
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend || trend === "neutral") return null;
    
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-emerald-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };
  
  const getTrendColor = () => {
    if (!trend || trend === "neutral") return "text-muted-foreground";
    return trend === "up" ? "text-emerald-500" : "text-red-500";
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="max-w-xs text-xs">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {icon}
            </div>
          )}
        </div>
        
        <div className="mt-2">
          {loading ? (
            <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
          ) : (
            <div className="flex items-end">
              <h3 className="text-2xl font-bold tracking-tight">
                {value}
              </h3>
              {(trendValue || trend) && (
                <div className={`ml-2 flex items-center text-xs ${getTrendColor()}`}>
                  {getTrendIcon()}
                  {trendValue && <span className="ml-1">{trendValue}</span>}
                </div>
              )}
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}