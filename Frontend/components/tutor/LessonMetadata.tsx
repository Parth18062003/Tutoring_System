import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Info, Brain, TrendingUp, GraduationCap } from 'lucide-react';
import { InteractionMetadata } from './types';

interface LessonMetadataProps {
  metadata: InteractionMetadata;
}

export function LessonMetadata({ metadata }: LessonMetadataProps) {
  const formatStrategy = (strategy: string) => {
    return strategy.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const mastery = Math.round(metadata.mastery_at_request * 100);

  const getDifficultyColor = () => {
    if (metadata.difficulty_choice === 'EASIER') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (metadata.difficulty_choice === 'HARDER') return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };
  
  const getStrategyIcon = (strategy: string) => {
    // Map strategies to emoji icons for visual representation
    const strategyIcons: Record<string, string> = {
      'EXPLANATION': '📝',
      'DEMONSTRATION': '🔍',
      'PRACTICE': '🏋️',
      'EXPLORATION': '🔎',
      'ASSESSMENT': '📊',
      'INTERACTIVE': '👋',
      'STORYTELLING': '📚',
      'GAMIFICATION': '🎮',
      'SPACED_REVIEW': '🔄',
    };
    
    return strategyIcons[strategy] || '📚';
  };

  // Calculate the mastery progress bar width
  const getMasteryColor = () => {
    if (mastery < 30) return 'bg-red-500';
    if (mastery < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Brain size={18} className="text-primary" />
              Learning Approach
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="flex items-center gap-1 text-sm px-3 py-1">
                      {getStrategyIcon(metadata.strategy)}
                      <span className="ml-1">{formatStrategy(metadata.strategy)}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      This content uses a {formatStrategy(metadata.strategy).toLowerCase()} teaching approach
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={`${getDifficultyColor()} px-3 py-1`}>
                      <TrendingUp size={14} className="mr-1" />
                      {metadata.difficulty_level_desc}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Difficulty adjusted based on your current mastery level
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <GraduationCap size={18} className="text-primary" />
              Your Subject Mastery
            </h3>
            
            <div className="w-full sm:w-48">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getMasteryColor()} transition-all duration-500 ease-out`} 
                  style={{ width: `${mastery}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-muted-foreground">Beginner</span>
                <span className="font-medium">{mastery}%</span>
                <span className="text-muted-foreground">Expert</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mt-4 pt-3 border-t">
          <Info size={14} className="mr-2 text-blue-500" />
          <span>
            This content has been personalized based on your learning profile and past interactions
          </span>
        </div>
      </CardContent>
    </Card>
  );
}