'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TopicSelection from '@/components/lessons/TopicSelection'
import LessonContent from '@/components/lessons/LessonContent'
import AiTutor from '@/components/lessons/AiTutor'
import { SubjectType, ClassType } from '@/types/lesson'

export default function LessonsPage() {
  const [selectedClass, setSelectedClass] = useState<ClassType>('6')
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('mathematics')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  
  const classes: ClassType[] = ['6', '7', '8', '9', '10', '11', '12']
  const subjects: SubjectType[] = ['mathematics', 'science', 'socialScience', 'english', 'hindi']
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        NCERT Interactive Lessons
      </motion.h1>
      
      <div className="mb-8">
        <Tabs defaultValue={selectedClass} onValueChange={(value) => setSelectedClass(value as ClassType)}>
          <TabsList className="grid grid-cols-7 mb-4">
            {classes.map((classNum) => (
              <TabsTrigger key={classNum} value={classNum}>
                Class {classNum}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <Tabs defaultValue={selectedSubject} onValueChange={(value) => setSelectedSubject(value as SubjectType)}>
          <TabsList className="grid grid-cols-5 mb-8">
            {subjects.map((subject) => (
              <TabsTrigger key={subject} value={subject}>
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <TopicSelection 
              classNum={selectedClass}
              subject={selectedSubject}
              selectedTopic={selectedTopic}
              onSelectTopic={setSelectedTopic}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          {selectedTopic ? (
            <>
              <CardHeader>
                <CardTitle>{selectedTopic}</CardTitle>
              </CardHeader>
              <CardContent>
                <LessonContent 
                  classNum={selectedClass}
                  subject={selectedSubject}
                  topic={selectedTopic}
                />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="mr-2">Previous Topic</Button>
                <Button>Next Topic</Button>
              </CardFooter>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Select a topic to start learning</p>
            </CardContent>
          )}
        </Card>
      </div>
      
      <div className="mt-8">
        <AiTutor 
          classNum={selectedClass}
          subject={selectedSubject}
          topic={selectedTopic}
        />
      </div>
    </div>
  )
}