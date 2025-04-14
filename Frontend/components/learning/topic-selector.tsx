'use client';

import { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, AlertTriangle, Check, MoveRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SUBJECTS } from '@/lib/constants';
import { getStudentAnalytics } from '@/actions/learning-actions';

interface TopicSelectorProps {
  subjectId: string;
  onSelect: (topic: string) => void;
  onBack: () => void;
}

export function TopicSelector({ subjectId, onSelect, onBack }: TopicSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);

  useEffect(() => {
    const selectedSubject = SUBJECTS.find(s => s.id === subjectId);
    setSubject(selectedSubject);
    
    async function loadAnalytics() {
      setLoading(true);
      try {
        const analyticsData = await getStudentAnalytics();
        setAnalytics(analyticsData.data || {});
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadAnalytics();
  }, [subjectId]);

  if (!subject) {
    return <div>Subject not found</div>;
  }

  // Get topic mastery data from analytics
  const masteryData = analytics?.mastery_by_topic || {};
  const prerequisites = analytics?.knowledge_structure?.prerequisites || {};

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{subject.name} Topics</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          // Loading skeletons
          Array(5).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Actual topic cards
          subject.topics.map((topic: string) => {
            const topicKey = `${subject.id}-${topic.replace(/\s+/g, '_')}`;
            const mastery = (masteryData[topicKey] || 0) * 100;
            const hasPrerequisites = prerequisites[topicKey]?.length > 0;
            const allPrereqsSatisfied = hasPrerequisites 
              ? prerequisites[topicKey].every(
                  (prereq: string) => (masteryData[prereq] || 0) > 0.7
                )
              : true;
            
            const status = mastery > 70 
              ? "mastered" 
              : mastery > 0 
                ? "in-progress" 
                : "not-started";
                
            return (
              <motion.div 
                key={topic}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`overflow-hidden cursor-pointer ${!allPrereqsSatisfied ? 'opacity-70' : ''}`}
                  onClick={() => onSelect(topic)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{topic}</CardTitle>
                      {status === "mastered" && (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" /> Mastered
                        </Badge>
                      )}
                      {status === "in-progress" && (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                          In Progress
                        </Badge>
                      )}
                      {!allPrereqsSatisfied && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Prerequisites Needed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Mastery</span>
                        <span className="text-sm font-medium">{Math.round(mastery)}%</span>
                      </div>
                      <Progress value={mastery} className="h-2" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Start Learning <MoveRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}