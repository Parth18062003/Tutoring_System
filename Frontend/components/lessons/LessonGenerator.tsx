'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Loader2, RefreshCw, BookOpen, Lightbulb, ListChecks, Beaker, Layers, Key } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { SubjectType, ClassType, topicsBySubjectAndClass } from '@/lib/lesson-data'

interface LessonGeneratorProps {
  initialClassNum?: ClassType
  initialSubject?: SubjectType
  initialTopic?: string
}

export default function LessonGenerator({
  initialClassNum = '9',
  initialSubject = 'science',
  initialTopic
}: LessonGeneratorProps) {
  const [classNum, setClassNum] = useState<ClassType>(initialClassNum)
  const [subject, setSubject] = useState<SubjectType>(initialSubject)
  const [topic, setTopic] = useState<string>(initialTopic || '')
  const [activeTab, setActiveTab] = useState<string>('lesson')
  const [lessonSections, setLessonSections] = useState<string[]>([
    'explanation', 'keyPoints', 'examples', 'practice'
  ])
  
  // States for non-streaming approach
  const [lessonContent, setLessonContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [generationComplete, setGenerationComplete] = useState<boolean>(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Get available topics based on subject and class
  const topics = topicsBySubjectAndClass(subject, classNum)

  // Auto-scroll when content is loaded
  useEffect(() => {
    if (generationComplete && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [generationComplete])

  // Section selection handler
  const toggleSection = (section: string) => {
    setLessonSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  // Generate lesson
  const handleGenerateLesson = async () => {
    if (!topic) return
    
    setIsLoading(true)
    setError(null)
    setGenerationComplete(false)
    
    try {
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classNum,
          subject,
          topic,
          sections: lessonSections
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate lesson')
      }
      
      // When response is received, switch to lesson tab
      setActiveTab('lesson')
      
      // Update the lesson content with the response
      setLessonContent(data.response || '')
      setGenerationComplete(true)
    } catch (error: any) {
      console.error("Error generating lesson:", error)
      setError(error.message || 'An error occurred while generating the lesson')
    } finally {
      setIsLoading(false)
    }
  }

  // Get icon for subject
  const getSubjectIcon = () => {
    switch (subject) {
      case 'mathematics': return '🧮'
      case 'science': return '🧪'
      case 'socialScience': return '🌍'
      case 'english': return '📚'
      case 'hindi': return '📝'
      default: return '📘'
    }
  }

  // Section component with icons
  const SectionOption = ({ id, label, icon }: { id: string; label: string; icon: React.ReactNode }) => (
    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox 
        id={id} 
        checked={lessonSections.includes(id)}
        onCheckedChange={() => toggleSection(id)}
        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      <label 
        htmlFor={id} 
        className="flex items-center gap-2 text-sm font-medium cursor-pointer w-full"
      >
        {icon}
        {label}
      </label>
    </div>
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border shadow-sm bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
              </motion.div>
              <div>
                <CardTitle className="text-xl tracking-tight">NCERT Lesson Generator</CardTitle>
                <CardDescription>Create customized lessons for your students</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={classNum} onValueChange={(value: ClassType) => setClassNum(value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {['6', '7', '8', '9', '10', '11', '12'].map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        Class {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={subject} onValueChange={(value: SubjectType) => setSubject(value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="socialScience">Social Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <Select 
                  value={topic} 
                  onValueChange={setTopic} 
                  disabled={topics.length === 0}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {topics.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No topics available for this selection
                  </p>
                )}
              </div>
            </div>
            
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Lesson Components</label>
                <Badge variant="outline" className="text-xs font-normal">
                  {lessonSections.length} selected
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-muted/30 rounded-lg">
                <SectionOption 
                  id="explanation" 
                  label="Explanation" 
                  icon={<Beaker className="h-4 w-4 text-blue-500" />}
                />
                <SectionOption 
                  id="keyPoints" 
                  label="Key Points" 
                  icon={<Key className="h-4 w-4 text-amber-500" />}
                />
                <SectionOption 
                  id="examples" 
                  label="Examples" 
                  icon={<Lightbulb className="h-4 w-4 text-green-500" />}
                />
                <SectionOption 
                  id="practice" 
                  label="Practice" 
                  icon={<ListChecks className="h-4 w-4 text-purple-500" />}
                />
                <SectionOption 
                  id="visual" 
                  label="Visuals" 
                  icon={<Layers className="h-4 w-4 text-red-500" />}
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        onClick={handleGenerateLesson}
                        disabled={!topic || isLoading}
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary px-8 relative overflow-hidden"
                      >
                        <AnimatePresence mode="wait">
                          {isLoading ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                              Generating...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="default"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              Generate Lesson
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Add a subtle loading bar at the bottom of the button */}
                        {isLoading && (
                          <motion.div 
                            className="absolute bottom-0 left-0 h-1 bg-white/30"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 10, ease: "linear" }}
                          />
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    {topic ? 'Generate a lesson on ' + topic : 'Select a topic first'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <div className="w-full text-center text-xs text-muted-foreground">
              {topic && (
                <div className="flex items-center justify-center gap-1">
                  <span>Generating content for</span>
                  <Badge variant="secondary" className="font-normal">
                    {getSubjectIcon()} Class {classNum} • {topic}
                  </Badge>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      <div ref={contentRef}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lesson" className="relative">
              <span>Lesson Content</span>
              {generationComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 h-2 w-2 translate-x-1 -translate-y-1 rounded-full bg-green-500"
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="about">About This Topic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lesson">
            <AnimatePresence mode="wait">
              {lessonContent ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border shadow-sm bg-card">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                            {getSubjectIcon()}
                          </div>
                          <CardTitle className="text-xl tracking-tight">{topic}</CardTitle>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleGenerateLesson}
                          disabled={isLoading}
                          className="md:self-end"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                          Regenerate
                        </Button>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-0">
                      <div className="px-6 pt-4 pb-6">
                        <ScrollArea className="h-[600px] pr-4">
                          {error ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 border border-destructive/20 bg-destructive/10 text-destructive rounded-md"
                            >
                              <p className="font-medium">Error</p>
                              <p className="text-sm">{error}</p>
                            </motion.div>
                          ) : (
                            <div className="prose dark:prose-invert prose-headings:scroll-mt-6 max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                components={{
                                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground tracking-tight" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-4 text-foreground tracking-tight border-b pb-1" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />,
                                  ul: ({node, ...props}) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />,
                                  ol: ({node, ...props}) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />,
                                  li: ({node, ...props}) => <li className="my-1" {...props} />,
                                  p: ({node, ...props}) => <p className="leading-7 [&:not(:first-child)]:mt-4" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                                  em: ({node, ...props}) => <em className="italic" {...props} />,
                                }}
                              >
                                {lessonContent}
                              </ReactMarkdown>
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border shadow-sm bg-card">
                    <CardContent className="p-0">
                      <div className="flex flex-col items-center justify-center h-[400px] p-6">
                        {isLoading ? (
                          <motion.div 
                            className="text-center"
                            animate={{ scale: [0.98, 1.02, 0.98] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <div className="relative">
                              <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-primary/80" />
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute inset-0 rounded-full bg-primary/10 blur-xl"
                              />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Generating your lesson...</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Creating a comprehensive NCERT-aligned lesson on <span className="font-medium">{topic}</span> for Class {classNum} students
                            </p>
                          </motion.div>
                        ) : (
                          <div className="text-center">
                            <div className="rounded-full bg-primary/10 p-6 inline-block mb-6">
                              <BookOpen className="h-12 w-12 text-primary/80" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Ready to generate a lesson</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Select a topic and components, then click "Generate Lesson" to create educational content
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="about">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border shadow-sm bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="tracking-tight">{topic || 'Select a Topic'}</CardTitle>
                    {topic && <Badge variant="outline" className="font-normal">NCERT Curriculum</Badge>}
                  </div>
                  {topic && (
                    <CardDescription>
                      Class {classNum} • {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {topic ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <p className="text-muted-foreground">
                        This topic is part of the NCERT curriculum for Class {classNum} {subject}. 
                        Understanding this concept helps students build a strong foundation in the subject.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="border rounded-lg p-4 bg-card/50"
                        >
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Learning Objectives
                          </h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            <li>Understand the fundamental concepts of {topic}</li>
                            <li>Apply the knowledge to solve related problems</li>
                            <li>Connect this topic with other relevant areas of {subject}</li>
                          </ul>
                        </motion.div>
                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="border rounded-lg p-4 bg-card/50"
                        >
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <ListChecks className="h-4 w-4 text-green-500" />
                            Prerequisites
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Before studying this topic, students should be familiar with basic {subject} 
                            concepts taught in earlier classes.
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <div className="rounded-full bg-muted/50 p-6 inline-block mb-4">
                        <BookOpen className="h-10 w-10 text-muted-foreground/60" />
                      </div>
                      <p className="text-muted-foreground">
                        Select a topic to see information about it
                      </p>
                    </div>
                  )}
                </CardContent>
                {topic && (
                  <CardFooter className="border-t pt-4 flex justify-center">
                    <Button
                      onClick={() => setActiveTab('lesson')}
                      variant="outline"
                      className="w-full max-w-sm"
                    >
                      Go to Lesson Content
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}