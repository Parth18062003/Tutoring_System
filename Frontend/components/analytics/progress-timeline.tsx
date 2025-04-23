import React from "react";
import { LearningPathItem } from "@/types/analytics-types";
import { format, parseISO, differenceInDays } from "date-fns";
import { MasteryBadge } from "./mastery-badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { MasteryTrends } from "./mastery-trends";
import { Book, FileCheck, Brain, Gamepad, Star } from "lucide-react";

interface ProgressTimelineProps {
  pathItems: LearningPathItem[];
  className?: string;
  groupByDay?: boolean;
}

export function ProgressTimeline({
  pathItems,
  className = "",
  groupByDay = true
}: ProgressTimelineProps) {
  if (!pathItems || pathItems.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No timeline data available.</p>;
  }
  
  // Group items by day if requested
  const groupedItems = React.useMemo(() => {
    if (!groupByDay) return pathItems.map(item => ({ date: null, items: [item] }));
    
    return pathItems.reduce((acc, item) => {
      const date = item.timestamp_utc ? format(parseISO(item.timestamp_utc), 'yyyy-MM-dd') : 'unknown';
      const existing = acc.find(group => group.date === date);
      
      if (existing) {
        existing.items.push(item);
      } else {
        acc.push({ date, items: [item] });
      }
      
      return acc;
    }, [] as { date: string | null, items: LearningPathItem[] }[]);
  }, [pathItems, groupByDay]);
  
  // Get strategy icon
  const getStrategyIcon = (strategy: string | null | undefined) => {
    if (!strategy) return <Star className="h-3 w-3" />;
    
    switch(strategy.toUpperCase()) {
      case 'ASSESSMENT': return <FileCheck className="h-3 w-3" />;
      case 'GAMIFICATION': return <Gamepad className="h-3 w-3" />;
      case 'ADAPTIVE_PATH': return <Brain className="h-3 w-3" />;
      default: return <Book className="h-3 w-3" />;
    }
  };
  
  // Format topic name
  const getTopicShortName = (topicFullName: string | null | undefined): string =>
    topicFullName?.split("-").slice(1).join("-").replace(/_/g, " ") || "Unknown Topic";
  
  // Track mastery changes by topic
  const masteryByTopic = React.useMemo(() => {
    const result: Record<string, number[]> = {};
    
    pathItems.forEach(item => {
      if (!item.topic) return;
      
      if (!result[item.topic]) {
        result[item.topic] = [];
      }
      
      if (item.mastery_at_request != null) {
        result[item.topic].push(item.mastery_at_request);
      }
      
      if (item.mastery_after_feedback != null) {
        result[item.topic].push(item.mastery_after_feedback);
      }
    });
    
    return result;
  }, [pathItems]);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {groupedItems.map((group, groupIndex) => (
        <div key={groupIndex} className="relative">
          {/* Date header for grouped view */}
          {groupByDay && group.date && (
            <div className="flex items-center mb-2">
              <div className="bg-muted h-px flex-grow mr-3"></div>
              <span className="text-xs font-medium">
                {format(parseISO(group.date), 'PP')}
              </span>
              <div className="bg-muted h-px flex-grow ml-3"></div>
            </div>
          )}
          
          {/* Timeline */}
          <div className="border-l-2 border-muted pl-4 ml-1.5 space-y-3">
            {group.items.map((item, itemIndex) => {
              const masteryData = item.topic ? masteryByTopic[item.topic] : undefined;
              const hasGain = item.mastery_after_feedback != null && 
                             item.mastery_at_request != null &&
                             item.mastery_after_feedback > item.mastery_at_request;
              
              return (
                <div key={item.interaction_id ?? `item-${groupIndex}-${itemIndex}`}
                  className={`relative ${hasGain ? 'pl-1 border-l-2 border-green-500 -ml-1.5' : ''}`}
                >
                  {/* Timeline node */}
                  <div className="absolute -left-6 mt-1 w-3 h-3 bg-background 
                               border-2 border-primary rounded-full"></div>
                  
                  <div className="flex justify-between items-start">
                    {/* Content */}
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h4 className="text-sm font-medium flex items-center gap-1.5">
                            {getStrategyIcon(item.strategy)}
                            <span className="truncate max-w-[200px]">
                              {getTopicShortName(item.topic)}
                            </span>
                          </h4>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.topic}</p>
                          <p>Strategy: {item.strategy || 'Unknown'}</p>
                          <p>Content: {item.content_type || 'Unknown'}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {item.timestamp_utc ? format(parseISO(item.timestamp_utc), 'p') : ''}
                        </span>
                        
                        {masteryData && masteryData.length >= 2 && (
                          <MasteryTrends 
                            data={masteryData} 
                            height={16} 
                            width={50}
                            className="inline-block"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Mastery badge */}
                    <div className="flex items-center gap-1">
                      {item.mastery_after_feedback != null && (
                        <MasteryBadge mastery={item.mastery_after_feedback} size="sm" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}