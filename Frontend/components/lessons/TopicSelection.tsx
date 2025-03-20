'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { LucideBookOpen } from 'lucide-react'
import { SubjectType, ClassType } from '@/types/lesson'

interface TopicSelectionProps {
  classNum: ClassType
  subject: SubjectType
  selectedTopic: string | null
  onSelectTopic: (topic: string) => void
}

export default function TopicSelection({ 
  classNum,
  subject,
  selectedTopic,
  onSelectTopic
}: TopicSelectionProps) {
  const [topics, setTopics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      // This is mock data - in production, fetch from your API
      const mockTopics = getMockTopics(classNum, subject)
      setTopics(mockTopics)
      setIsLoading(false)
    }, 800)
  }, [classNum, subject])
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }
  
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-2">
        {topics.map((topic, index) => (
          <motion.div
            key={topic}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Button
              variant={selectedTopic === topic ? "default" : "outline"}
              className="w-full justify-start text-left"
              onClick={() => onSelectTopic(topic)}
            >
              <LucideBookOpen className="mr-2 h-4 w-4" />
              {topic}
            </Button>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  )
}

// Mock function to generate topics based on class and subject
function getMockTopics(classNum: ClassType, subject: SubjectType): string[] {
  if (subject === 'mathematics') {
    if (classNum === '6') {
      return [
        'Knowing Our Numbers',
        'Whole Numbers',
        'Playing with Numbers',
        'Basic Geometrical Ideas',
        'Understanding Elementary Shapes',
        'Integers',
        'Fractions',
        'Decimals',
        'Data Handling',
        'Mensuration',
        'Algebra',
        'Ratio and Proportion',
        'Symmetry',
        'Practical Geometry'
      ]
    }
    // Add more class-specific topics here
  } else if (subject === 'science') {
    if (classNum === '6') {
      return [
        'Food: Where Does It Come From?',
        'Components of Food',
        'Fibre to Fabric',
        'Sorting Materials into Groups',
        'Separation of Substances',
        'Changes Around Us',
        'Getting to Know Plants',
        'Body Movements',
        'The Living Organisms and Their Surroundings',
        'Motion and Measurement of Distances',
        'Light, Shadows and Reflections',
        'Electricity and Circuits',
        'Fun with Magnets',
        'Water',
        'Air Around Us',
        'Garbage In, Garbage Out'
      ]
    }
    // Add more topics for other classes
  }
  
  // Default topics if specific ones aren't found
  return [
    'Topic 1',
    'Topic 2',
    'Topic 3',
    'Topic 4',
    'Topic 5',
  ]
}