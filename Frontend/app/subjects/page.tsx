'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SubjectIcon } from '@/components/tutor/SubjectIcon';

// Sample subjects and topics based on NCERT curriculum
const subjectTopics = [
  {
    id: 'science',
    name: 'Science',
    description: 'Explore the natural world and scientific principles',
    topics: [
      { id: 'food-where-from', name: 'Food: Where Does It Come From?' },
      { id: 'components-of-food', name: 'Components of Food' },
      { id: 'fibre-to-fabric', name: 'Fibre to Fabric' },
      { id: 'sorting-materials', name: 'Sorting Materials into Groups' },
      { id: 'separation-substances', name: 'Separation of Substances' },
      { id: 'changes-around-us', name: 'Changes Around Us' },
      { id: 'plants', name: 'Getting to Know Plants' },
      { id: 'body-movements', name: 'Body Movements' }
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Master mathematical concepts and problem-solving',
    topics: [
      { id: 'knowing-numbers', name: 'Knowing Our Numbers' },
      { id: 'whole-numbers', name: 'Whole Numbers' },
      { id: 'playing-with-numbers', name: 'Playing with Numbers' },
      { id: 'basic-geometry', name: 'Basic Geometrical Ideas' },
      { id: 'elementary-shapes', name: 'Understanding Elementary Shapes' },
      { id: 'integers', name: 'Integers' },
      { id: 'fractions', name: 'Fractions' },
      { id: 'decimals', name: 'Decimals' }
    ]
  },
  {
    id: 'social_science',
    name: 'Social Science',
    description: 'Understand society, history, geography, and civic life',
    topics: [
      { id: 'what-where-how-when', name: 'What, Where, How and When?' },
      { id: 'earliest-people', name: 'On the Trail of the Earliest People' },
      { id: 'gathering-to-growing', name: 'From Gathering to Growing Food' },
      { id: 'solar-system', name: 'The Earth in the Solar System' },
      { id: 'globe-latitudes-longitudes', name: 'Globe: Latitudes and Longitudes' },
      { id: 'understanding-diversity', name: 'Understanding Diversity' },
      { id: 'diversity-discrimination', name: 'Diversity and Discrimination' }
    ]
  }
];

export default function SubjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState(subjectTopics[0].id);

  const handleTopicSelect = (subjectId: string, topicId: string) => {
    // Store selection in localStorage instead of using URL params
    localStorage.setItem('selectedSubject', subjectId);
    localStorage.setItem('selectedTopic', topicId);
    
    // Navigate to the lesson page
    router.push('/lesson');
  };

  const filteredTopics = subjectTopics
    .find(subject => subject.id === activeSubject)?.topics
    .filter(topic => 
      searchQuery === '' || 
      topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="container max-w-6xl p-8 mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
            Choose Your Learning Path
          </h1>
          <p className="text-muted-foreground">
            Select a subject and topic to begin your personalized learning journey.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue={activeSubject} onValueChange={setActiveSubject} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              {subjectTopics.map(subject => (
                <TabsTrigger 
                  key={subject.id} 
                  value={subject.id}
                  className="flex items-center gap-2"
                >
                  <SubjectIcon subject={subject.name} size={16} />
                  {subject.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Display topics for each tab */}
          {subjectTopics.map(subject => (
            <TabsContent key={subject.id} value={subject.id} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map(topic => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => handleTopicSelect(subject.id, topic.id)}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">{topic.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <p className="text-muted-foreground text-sm">
                            Learn about {topic.name.toLowerCase()} through our adaptive AI tutor.
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button variant="ghost" className="p-0 h-auto font-normal text-primary flex items-center gap-1">
                            Start learning
                            <ArrowRight size={16} />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No topics found matching your search.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* User Info */}
        <div className="text-xs text-muted-foreground border-t pt-4 mt-8">
          <p>Logged in as: Parth18062003</p>
          <p>Current time: 2025-03-31 08:12:11 UTC</p>
        </div>
      </div>
    </div>
  );
}