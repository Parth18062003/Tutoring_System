'use client';

import { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'motion/react';
import { SUBJECTS } from '@/lib/constants';
import { getStudentAnalytics } from '@/actions/learning-actions';

export function SubjectSelector({ onSelect }: { onSelect: (subjectId: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Select a Subject</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading skeletons
          Array(5).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : (
          // Actual subject cards
          SUBJECTS.map((subject) => {
            const masteryData = analytics?.mastery_by_topic || {};
            const subjectTopics = subject.topics || [];
            
            // Calculate average mastery for this subject
            let totalMastery = 0;
            let masteredTopics = 0;
            
            subjectTopics.forEach(topic => {
              const topicKey = `${subject.id}-${topic.replace(/\s+/g, '_')}`;
              if (masteryData[topicKey]) {
                totalMastery += masteryData[topicKey];
                masteredTopics++;
              }
            });
            
            const avgMastery = masteredTopics > 0 
              ? (totalMastery / masteredTopics) * 100 
              : 0;
              
            return (
              <motion.div 
                key={subject.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="overflow-hidden cursor-pointer h-full" onClick={() => onSelect(subject.id)}>
                  <CardHeader className="pb-2">
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription>{subject.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {subjectTopics.length} topics
                      </span>
                      <Badge variant={avgMastery > 70 ? "default" : "outline"}>
                        {avgMastery > 0 ? `${Math.round(avgMastery)}% mastery` : 'Not started'}
                      </Badge>
                    </div>
                    <Progress value={avgMastery} className="h-2" />
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Browse Topics
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