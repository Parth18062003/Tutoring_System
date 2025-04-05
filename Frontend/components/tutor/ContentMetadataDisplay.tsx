import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Brain, Lightbulb, BarChart3 } from 'lucide-react';
import { ContentMetadata } from '@/types/tutor';

interface ContentMetadataDisplayProps {
  metadata: ContentMetadata;
  showDetailed?: boolean;
}

export function ContentMetadataDisplay({ 
  metadata, 
  showDetailed = false 
}: ContentMetadataDisplayProps) {
  const masteryPercent = Math.round(metadata.mastery_at_request * 100);
  const difficultyPercent = Math.round(metadata.effective_difficulty_value * 100);
  const prereqPercent = Math.round(metadata.prereq_satisfaction * 100);
  
  const getStrategyColor = (strategy: string) => {
    const strategyColorMap: Record<string, string> = {
      'EXPLANATION': 'bg-blue-500',
      'DEMONSTRATION': 'bg-purple-500',
      'PRACTICE': 'bg-green-500',
      'ASSESSMENT': 'bg-amber-500',
      'INTERACTIVE': 'bg-pink-500',
      'STORYTELLING': 'bg-indigo-500',
      'GAMIFICATION': 'bg-red-500',
      'SPACED_REVIEW': 'bg-emerald-500',
      'EXPLORATION': 'bg-orange-500'
    };
    
    return strategyColorMap[strategy] || 'bg-gray-500';
  };
  
  return (
    <Card className="w-full bg-gray-50/50 border-gray-200">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${getStrategyColor(metadata.strategy)} text-white`}>
                {metadata.strategy.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-gray-600 border-gray-300">
                {metadata.length_choice}
              </Badge>
            </div>
            <Badge variant="outline" className="border-gray-300 text-gray-600">
              {metadata.difficulty_level_desc}
            </Badge>
          </div>
          
          {showDetailed && (
            <>
              <Separator className="my-2" />
              
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-sm text-gray-500 gap-1">
                    <Brain size={14} />
                    <span>Mastery</span>
                  </div>
                  <Progress value={masteryPercent} className="h-2" />
                  <span className="text-xs text-right">{masteryPercent}%</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-sm text-gray-500 gap-1">
                    <BarChart3 size={14} />
                    <span>Difficulty</span>
                  </div>
                  <Progress value={difficultyPercent} className="h-2" />
                  <span className="text-xs text-right">{difficultyPercent}%</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-sm text-gray-500 gap-1">
                    <Lightbulb size={14} />
                    <span>Prerequisites</span>
                  </div>
                  <Progress value={prereqPercent} className="h-2" />
                  <span className="text-xs text-right">{prereqPercent}%</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}