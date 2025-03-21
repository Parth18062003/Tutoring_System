'use client';

import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubjectType, ClassType } from '@/types/lesson';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { useEffect, useRef, useState } from 'react';

interface AiTutorProps {
  classNum: ClassType;
  subject: SubjectType;
  topic: string | null;
}

export default function AiTutor({ classNum, subject, topic }: AiTutorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const systemMessage = `You are an expert NCERT tutor for Class ${classNum} ${subject}${topic ? ` specializing in "${topic}"` : ''}. 
    Provide helpful, accurate, and concise explanations suitable for the age group (${getAgeFromClass(classNum)}). 
    Use simple language and format your responses with markdown. If a student asks something outside the NCERT curriculum, gently guide them back to relevant topics.`;

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai-tutor',
    initialMessages: [
      {
        id: 'system',
        role: 'system',
        content: systemMessage,
      },
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm your NCERT AI Tutor for Class ${classNum} ${subject}${topic ? `, specializing in "${topic}"` : ''}. How can I help you today?`,
      },
    ],
    onError: (error) => {
      console.error("Chat error:", error);
      setError("Sorry, I couldn't process your request. Please try again.");
    },
  });

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Custom form submission to clear errors
  const customHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    handleSubmit(e);
  };

  // Handle conversation starter clicks
  const handleStarterClick = (question: string) => {
    handleInputChange({ target: { value: question } } as any);
  };

  return (
    <Card className="border shadow-md">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>NCERT AI Tutor</CardTitle>
            <CardDescription>Ask questions about {topic || subject}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? 'Minimize' : 'Expand'}
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
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {/* Display error message */}
                  {error && (
                    <div className="text-red-500 text-center mb-4">
                      {error}
                    </div>
                  )}

                  {/* Chat messages or conversation starters */}
                  {messages.filter((msg) => msg.role !== 'system').length > 1 ? (
                    messages
                      .filter((msg) => msg.role !== 'system')
                      .map((message) => (
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
                                  <Bot className="h-6 w-6" />
                                </Avatar>
                              )}
                              <div
                                className={`prose ${
                                  message.role === 'user'
                                    ? 'prose-invert max-w-none'
                                    : 'max-w-none prose-headings:text-foreground prose-p:text-foreground'
                                }`}
                              >
                                {message.role === 'user' ? (
                                  <p>{message.content}</p>
                                ) : (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                    components={{
                                      h1: ({ node, ...props }) => (
                                        <h1 className="text-xl font-bold mt-2 mb-3" {...props} />
                                      ),
                                      h2: ({ node, ...props }) => (
                                        <h2 className="text-lg font-bold mt-2 mb-2" {...props} />
                                      ),
                                      h3: ({ node, ...props }) => (
                                        <h3 className="text-base font-bold mt-2 mb-1" {...props} />
                                      ),
                                      ul: ({ node, ...props }) => (
                                        <ul className="list-disc ml-6 my-2" {...props} />
                                      ),
                                      ol: ({ node, ...props }) => (
                                        <ol className="list-decimal ml-6 my-2" {...props} />
                                      ),
                                      li: ({ node, ...props }) => (
                                        <li className="my-1" {...props} />
                                      ),
                                      p: ({ node, ...props }) => (
                                        <p className="mb-2" {...props} />
                                      ),
                                      strong: ({ node, ...props }) => (
                                        <strong className="font-bold" {...props} />
                                      ),
                                      em: ({ node, ...props }) => (
                                        <em className="italic" {...props} />
                                      ),
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
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">
                        Ask a question about {topic || subject}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleStarterClick(`Explain ${topic || subject}`)
                          }
                        >
                          Explain {topic || subject}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleStarterClick(`Give me an example of ${topic || subject}`)
                          }
                        >
                          Give me an example
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg p-4 bg-card border shadow-sm max-w-[80%]">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 mt-1">
                            <Bot className="h-6 w-6" />
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
              <form
                onSubmit={customHandleSubmit}
                className="flex w-full items-center space-x-2"
              >
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
  );
}

function getAgeFromClass(classNum: ClassType): string {
  const classNumber = parseInt(classNum);
  return `${classNumber + 5}-${classNumber + 6} years`;
}