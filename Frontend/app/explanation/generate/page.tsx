'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LessonGenerator from '@/components/lessons/LessonGenerator'
import AiTutor from '@/components/lessons/AiTutor'
import { SubjectType, ClassType } from '@/lib/lesson-data'

export default function LessonGeneratorPage() {
  const [classNum, setClassNum] = useState<ClassType>('9')
  const [subject, setSubject] = useState<SubjectType>('science')
  const [topic, setTopic] = useState<string>('')
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">NCERT Lesson Generator</h1>
        <p className="text-muted-foreground mb-8">Create comprehensive lessons on any NCERT topic</p>
        
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generator">Lesson Generator</TabsTrigger>
            <TabsTrigger value="ai-tutor">AI Tutor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="space-y-6">
            <LessonGenerator
              initialClassNum={classNum}
              initialSubject={subject}
              initialTopic={topic}
            />
          </TabsContent>
          
          <TabsContent value="ai-tutor">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Interactive AI Tutor</h2>
              <p className="mb-6">
                Have questions about the lesson? Ask our AI tutor for help and explanations.
              </p>
              <AiTutor 
                classNum={classNum}
                subject={subject}
                topic={topic}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}