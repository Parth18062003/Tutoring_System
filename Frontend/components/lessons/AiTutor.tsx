'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SubjectType, ClassType } from '@/types/lesson'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface AiTutorProps {
  classNum: ClassType
  subject: SubjectType
  topic: string | null
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default function AiTutor({
  classNum,
  subject,
  topic
}: AiTutorProps) {
  const [isOpen, setIsOpen] = useState(true) // Set to true to open by default
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const systemMessage = `You are an expert NCERT tutor for Class ${classNum} ${subject}${topic ? ` specializing in "${topic}"` : ''}. 
    Provide helpful, accurate, and concise explanations suitable for the age group (${getAgeFromClass(classNum)}). 
    Use simple language and format your responses with markdown for better readability. If a student asks something outside the NCERT curriculum, gently guide them back to relevant topics.`;
  
  useEffect(() => {
    // Initialize with system message
    setMessages([{
      id: 'system',
      role: 'system',
      content: systemMessage
    }])
  }, [systemMessage])
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from AI tutor');
      }

      // Add assistant response
      const assistantMessage: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: data.response || "No content received"
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      
      // Add an error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="border shadow-md">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>NCERT AI Tutor</CardTitle>
            <CardDescription>Ask questions about {topic || subject}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}>
            {isOpen ? "Minimize" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent>
              <ScrollArea className="h-[400px] pr-4"> {/* Increased height for better readability */}
                <div className="space-y-4">
                  {messages.filter(msg => msg.role !== 'system').length > 0 ? (
                    messages.filter(msg => msg.role !== 'system').map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        } mb-4`}
                      >
                        <div
                          className={`rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground max-w-[80%]'
                              : 'bg-card border shadow-sm max-w-[90%]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {message.role !== 'user' && (
                              <Avatar className="h-8 w-8 mt-1">
                                <div className="bg-blue-600 text-white flex items-center justify-center w-full h-full rounded-full font-medium text-sm">AI</div>
                              </Avatar>
                            )}
                            
                            <div className={`prose ${message.role === 'user' ? 'prose-invert max-w-none' : 'max-w-none prose-headings:text-foreground prose-p:text-foreground'}`}>
                              {message.role === 'user' ? (
                                <p>{message.content}</p>
                              ) : (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                  components={{
                                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-2 mb-3" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-2 mb-2" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-base font-bold mt-2 mb-1" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc ml-6 my-2" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal ml-6 my-2" {...props} />,
                                    li: ({node, ...props}) => <li className="my-1" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                    em: ({node, ...props}) => <em className="italic" {...props} />,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center text-muted-foreground">
                        <p>Ask a question about {topic || subject}</p>
                        <p className="text-sm mt-1">Examples: "What is photosynthesis?" or "How do I solve quadratic equations?"</p>
                      </div>
                    </div>
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg p-4 bg-card border shadow-sm max-w-[80%]">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 mt-1">
                            <div className="bg-blue-600 text-white flex items-center justify-center w-full h-full rounded-full font-medium text-sm">AI</div>
                          </Avatar>
                          <div className="flex items-center gap-2 py-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Generating response...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="border-t pt-4">
              <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Ask a question about this topic..."
                  value={input}
                  onChange={handleInputChange}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Ask</span>
                  )}
                </Button>
              </form>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

function getAgeFromClass(classNum: ClassType): string {
  const classNumber = parseInt(classNum)
  return `${classNumber + 5}-${classNumber + 6} years`
}