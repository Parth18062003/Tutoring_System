'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubjectType, ClassType } from '@/types/lesson'

interface LessonContentProps {
  classNum: ClassType
  subject: SubjectType
  topic: string
}

export default function LessonContent({
  classNum,
  subject,
  topic
}: LessonContentProps) {
  const [content, setContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  useEffect(() => {
    setIsLoading(true)
    
    // Simulate API call to fetch lesson content
    setTimeout(() => {
      setContent(getMockLessonContent(classNum, subject, topic))
      setIsLoading(false)
    }, 1000)
  }, [classNum, subject, topic])
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="learn">
        <TabsList>
          <TabsTrigger value="learn">Learn</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="learn" className="pt-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-3">{content.title}</h3>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.explanation }}></div>
            
            {content.keyPoints && (
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-2">Key Points</h4>
                <ul className="list-disc pl-6 space-y-2">
                  {content.keyPoints.map((point: string, idx: number) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="practice" className="pt-4">
          <h3 className="text-xl font-semibold mb-3">Practice Questions</h3>
          <div className="space-y-4">
            {content.practiceQuestions?.map((q: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4">
                <p className="font-medium mb-2">Q{idx + 1}: {q.question}</p>
                {q.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {q.options.map((option: string, i: number) => (
                      <div key={i} className="flex items-center">
                        <input 
                          type="radio" 
                          name={`question-${idx}`} 
                          id={`q${idx}-opt${i}`} 
                          className="mr-2"
                        />
                        <label htmlFor={`q${idx}-opt${i}`}>{option}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="examples" className="pt-4">
          <h3 className="text-xl font-semibold mb-3">Examples</h3>
          <div className="space-y-4">
            {content.examples?.map((example: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4 bg-muted/20">
                <h4 className="font-medium mb-2">Example {idx + 1}:</h4>
                <p>{example.problem}</p>
                
                {example.solution && (
                  <div className="mt-4">
                    <h5 className="font-medium text-sm text-muted-foreground mb-1">Solution:</h5>
                    <div className="pl-4 border-l-2 border-primary/30">
                      <p>{example.solution}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="visuals" className="pt-4">
          <h3 className="text-xl font-semibold mb-3">Visual Learning</h3>
          {content.visualContent ? (
            <div className="space-y-4">
              {content.visualContent}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
              <p className="text-muted-foreground">Visual content for this topic is being developed.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock function to generate lesson content
function getMockLessonContent(classNum: ClassType, subject: SubjectType, topic: string) {
  if (subject === 'mathematics' && classNum === '6' && topic === 'Fractions') {
    return {
      title: "Understanding Fractions",
      explanation: `
        <p>A fraction represents a part of a whole or a collection. The whole may be a single object or a group of objects.</p>
        <p>When we divide a whole into equal parts, each part is a fraction of the whole.</p>
        <p>A fraction has two parts:</p>
        <ul>
          <li><strong>Numerator:</strong> The number on the top which represents how many equal parts are taken.</li>
          <li><strong>Denominator:</strong> The number on the bottom which represents the total number of equal parts the whole is divided into.</li>
        </ul>
        <p>For example, in the fraction 3/4 (three-fourths):</p>
        <ul>
          <li>The numerator is 3</li>
          <li>The denominator is 4</li>
        </ul>
        <p>This means we've taken 3 out of 4 equal parts of the whole.</p>
      `,
      keyPoints: [
        "Fractions represent parts of a whole",
        "The numerator tells how many equal parts are considered",
        "The denominator tells the total number of equal parts",
        "Proper fractions have numerator smaller than denominator (less than 1)",
        "Improper fractions have numerator greater than or equal to denominator (greater than or equal to 1)",
        "Mixed numbers combine a whole number with a fraction"
      ],
      practiceQuestions: [
        {
          question: "What fraction of the figure is shaded?",
          image: "/images/fraction-example.png",
          options: ["1/4", "2/4", "3/4", "4/4"]
        },
        {
          question: "Express 3/8 as an equivalent fraction with denominator 24.",
          options: ["9/24", "12/24", "6/24", "3/24"]
        }
      ],
      examples: [
        {
          problem: "Add the fractions: 1/4 + 2/4",
          solution: "Since the denominators are the same (4), we can add the numerators: 1 + 2 = 3. So 1/4 + 2/4 = 3/4"
        },
        {
          problem: "Convert the improper fraction 7/4 to a mixed number.",
          solution: "Divide 7 by 4: 7 ÷ 4 = 1 with a remainder of 3. So 7/4 = 1¾"
        }
      ]
    }
  }
  
  // Default content
  return {
    title: topic,
    explanation: `
      <p>This is the lesson content for ${topic} in Class ${classNum} ${subject}.</p>
      <p>The NCERT curriculum covers this topic thoroughly, helping students build a strong foundation.</p>
      <p>In this lesson, you'll learn the fundamental concepts, solve practice problems, and build your understanding step-by-step.</p>
    `,
    keyPoints: [
      "Key concept 1 for this topic",
      "Key concept 2 for this topic",
      "Key concept 3 for this topic"
    ],
    practiceQuestions: [
      {
        question: "Sample question 1 for this topic?",
        options: ["Option A", "Option B", "Option C", "Option D"]
      },
      {
        question: "Sample question 2 for this topic?",
        options: ["Option A", "Option B", "Option C", "Option D"]
      }
    ],
    examples: [
      {
        problem: "Example problem 1",
        solution: "Example solution 1"
      },
      {
        problem: "Example problem 2",
        solution: "Example solution 2"
      }
    ]
  }
}