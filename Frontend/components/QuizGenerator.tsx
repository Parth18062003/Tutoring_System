'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  Loader2, 
  CheckCircle2, 
  HelpCircle, 
  FileQuestion, 
  AlignJustify,
  CheckCheck, 
  BarChart3,
  Download,
  RefreshCcw
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { SubjectType, ClassType, topicsBySubjectAndClass } from '@/lib/lesson-data'

interface QuizGeneratorProps {
  initialClassNum?: ClassType
  initialSubject?: SubjectType
  initialTopic?: string
}

type QuestionType = 'mcq' | 'shortAnswer' | 'truefalse'
type Difficulty = 'easy' | 'medium' | 'hard'

export default function QuizGenerator({
  initialClassNum = '9',
  initialSubject = 'science',
  initialTopic
}: QuizGeneratorProps) {
  const [classNum, setClassNum] = useState<ClassType>(initialClassNum)
  const [subject, setSubject] = useState<SubjectType>(initialSubject)
  const [topic, setTopic] = useState<string>(initialTopic || '')
  const [activeTab, setActiveTab] = useState<string>('generator')
  const [questionCount, setQuestionCount] = useState<number>(5)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['mcq', 'shortAnswer'])
  
  // States for quiz data
  const [quizContent, setQuizContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [quizGenerated, setQuizGenerated] = useState<boolean>(false)
  const [showAnswers, setShowAnswers] = useState<boolean>(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Get available topics based on subject and class
  const topics = topicsBySubjectAndClass(subject, classNum)

  // Auto-scroll when content is loaded
  useEffect(() => {
    if (quizGenerated && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [quizGenerated])

  // Toggle question type selection
  const toggleQuestionType = (type: QuestionType) => {
    setQuestionTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (!topic) return
    
    setIsLoading(true)
    setError(null)
    setQuizGenerated(false)
    setShowAnswers(false)
    
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classNum,
          subject,
          topic,
          questionCount,
          difficulty,
          questionTypes
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz')
      }
      
      // When response is received, switch to quiz tab
      setActiveTab('quiz')
      
      // Update the quiz content with the response
      setQuizContent(data.response || '')
      setQuizGenerated(true)
    } catch (error: any) {
      console.error("Error generating quiz:", error)
      setError(error.message || 'An error occurred while generating the quiz')
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

  // Format difficulty label
  const getDifficultyLabel = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'Easy'
      case 'medium': return 'Medium'
      case 'hard': return 'Hard'
      default: return 'Medium'
    }
  }

  // Format difficulty color
  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
  }

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
                  <FileQuestion className="h-5 w-5" />
                </div>
              </motion.div>
              <div>
                <CardTitle className="text-xl tracking-tight">NCERT Quiz Generator</CardTitle>
                <CardDescription>Create customized quizzes for assessment</CardDescription>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Number of Questions</label>
                    <Badge variant="outline">{questionCount}</Badge>
                  </div>
                  <Slider
                    defaultValue={[5]}
                    min={3}
                    max={15}
                    step={1}
                    value={[questionCount]}
                    onValueChange={(value) => setQuestionCount(value[0])}
                    className="py-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <RadioGroup 
                    defaultValue="medium" 
                    value={difficulty}
                    onValueChange={(value: Difficulty) => setDifficulty(value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" />
                      <Label htmlFor="easy" className="cursor-pointer">Easy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hard" id="hard" />
                      <Label htmlFor="hard" className="cursor-pointer">Hard</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Question Types</label>
                  <Badge variant="outline" className="text-xs font-normal">
                    {questionTypes.length} selected
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-2 p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
                    <Checkbox 
                      id="mcq" 
                      checked={questionTypes.includes('mcq')}
                      onCheckedChange={() => toggleQuestionType('mcq')}
                      disabled={questionTypes.length === 1 && questionTypes.includes('mcq')}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <label 
                      htmlFor="mcq" 
                      className="flex items-center gap-2 text-sm font-medium cursor-pointer w-full"
                    >
                      <HelpCircle className="h-4 w-4 text-purple-500" />
                      Multiple Choice Questions
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
                    <Checkbox 
                      id="shortAnswer" 
                      checked={questionTypes.includes('shortAnswer')}
                      onCheckedChange={() => toggleQuestionType('shortAnswer')}
                      disabled={questionTypes.length === 1 && questionTypes.includes('shortAnswer')}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <label 
                      htmlFor="shortAnswer" 
                      className="flex items-center gap-2 text-sm font-medium cursor-pointer w-full"
                    >
                      <AlignJustify className="h-4 w-4 text-blue-500" />
                      Short Answer Questions
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
                    <Checkbox 
                      id="truefalse" 
                      checked={questionTypes.includes('truefalse')}
                      onCheckedChange={() => toggleQuestionType('truefalse')}
                      disabled={questionTypes.length === 1 && questionTypes.includes('truefalse')}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <label 
                      htmlFor="truefalse" 
                      className="flex items-center gap-2 text-sm font-medium cursor-pointer w-full"
                    >
                      <CheckCheck className="h-4 w-4 text-green-500" />
                      True/False Questions
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleGenerateQuiz}
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
                      Generating Quiz...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      Generate Quiz
                    </motion.div>
                  )}
                </AnimatePresence>

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
          </CardContent>
          <CardFooter className="pt-2">
            <div className="w-full text-center text-xs text-muted-foreground">
              {topic && (
                <div className="flex items-center justify-center gap-1">
                  <span>Generating quiz for</span>
                  <Badge variant="secondary" className="font-normal">
                    {getSubjectIcon()} Class {classNum} • {topic}
                  </Badge>
                  <span>•</span>
                  <Badge className={`font-normal text-xs ${getDifficultyColor(difficulty)}`}>
                    {getDifficultyLabel(difficulty)}
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
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="quiz" className="relative">
              <span>Quiz Questions</span>
              {quizGenerated && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 h-2 w-2 translate-x-1 -translate-y-1 rounded-full bg-green-500"
                />
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator">
            <Card className="border shadow-sm bg-card">
              <CardHeader>
                <CardTitle>Quiz Settings</CardTitle>
                <CardDescription>Configure quiz parameters before generating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <BarChart3 className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium text-lg">{getDifficultyLabel(difficulty)}</h3>
                    <p className="text-sm text-muted-foreground">Difficulty Level</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <FileQuestion className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium text-lg">{questionCount}</h3>
                    <p className="text-sm text-muted-foreground">Questions</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <HelpCircle className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium text-lg">{questionTypes.length}</h3>
                    <p className="text-sm text-muted-foreground">Question Types</p>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Quiz Information</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>This quiz will contain {questionCount} questions on {topic || 'the selected topic'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Questions will be generated based on NCERT curriculum for Class {classNum}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Answer key will be provided at the end of the quiz</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quiz">
            <AnimatePresence mode="wait">
              {quizContent ? (
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
                          <div>
                            <CardTitle className="text-xl tracking-tight">{topic} Quiz</CardTitle>
                            <CardDescription>
                              Class {classNum} • {questionCount} Questions • {getDifficultyLabel(difficulty)} Difficulty
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowAnswers(!showAnswers)}
                            className="md:self-end"
                          >
                            {showAnswers ? 'Hide Answers' : 'Show Answers'}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleGenerateQuiz}
                            disabled={isLoading}
                            className="md:self-end"
                          >
                            <RefreshCcw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Regenerate
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="md:self-end"
                            onClick={() => {
                              // Mock print/download functionality
                              alert('Download functionality would go here')
                            }}
                          >
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Download
                          </Button>
                        </div>
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
                                {/* Hide or show the answer key based on showAnswers state */}
                                {showAnswers 
                                  ? quizContent 
                                  : quizContent.split(/^#+\s*Answer\s*Key/mi)[0]}
                              </ReactMarkdown>
                              
                              {!showAnswers && (
                                <div className="mt-12 p-4 border border-dashed rounded-lg text-center">
                                  <p className="text-muted-foreground">
                                    Click "Show Answers" to view the answer key
                                  </p>
                                </div>
                              )}
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
      <h3 className="text-xl font-semibold mb-2">Generating your quiz...</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Creating {questionCount} {getDifficultyLabel(difficulty).toLowerCase()} difficulty questions on <span className="font-medium">{topic}</span> for Class {classNum} students
      </p>
    </motion.div>
  ) : (
    <div className="text-center">
      <div className="rounded-full bg-primary/10 p-6 inline-block mb-6">
        <FileQuestion className="h-12 w-12 text-primary/80" />
      </div>
      <h3 className="text-lg font-medium mb-2">Ready to generate a quiz</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Select your settings in the Generator tab and click "Generate Quiz" to create assessment questions
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
        </Tabs>
      </div>
    </div>
  )
}           