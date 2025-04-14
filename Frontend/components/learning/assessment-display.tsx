'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Markdown } from './markdown';
import { useLearningContent } from '@/hooks/use-learning-content';
import { useFeedback } from '@/hooks/use-feedback';
import { motion } from 'motion/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AssessmentDisplayProps {
  subjectId: string;
  topic: string;
  onBack: () => void;
}

export function AssessmentDisplay({
  subjectId,
  topic,
  onBack,
}: AssessmentDisplayProps) {
  const {
    fetchContent,
    currentContent,
    loading,
    error,
    streamProgress,
  } = useLearningContent();

  const {
    submitFeedback,
    submitting,
  } = useFeedback();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Fetch assessment content
  useEffect(() => {
    fetchContent({
      content_type: 'assessment',
      subject: subjectId,
      topic: topic,
    });
  }, [fetchContent, subjectId, topic]);

  // Process questions from content response
  useEffect(() => {
    if (currentContent?.sections) {
      const extractedQuestions = currentContent.sections
        .filter(section => 
          section.sectionType.includes('question') || 
          section.sectionType.includes('exercise')
        )
        .map((section, idx) => ({
          id: idx,
          question: section.title,
          content: section.contentMarkdown,
          type: detectQuestionType(section.contentMarkdown),
          options: extractOptions(section.contentMarkdown),
          correctAnswer: extractCorrectAnswer(section.contentMarkdown),
          explanation: extractExplanation(section.contentMarkdown),
        }));
      
      setQuestions(extractedQuestions);
    }
  }, [currentContent]);

  // Handle answer changes
  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestionIdx]: value
    });
  };

  // Submit current answer and move to next question
  const submitAnswer = () => {
    const currentQuestion = questions[currentQuestionIdx];
    const userAnswer = answers[currentQuestionIdx];
    
    if (!userAnswer) return;
    
    const isCorrect = checkAnswer(userAnswer, currentQuestion.correctAnswer);
    
    setResults({
      ...results,
      [currentQuestionIdx]: isCorrect
    });
    
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Calculate score
      const totalAnswered = Object.keys(results).length + 1; // +1 for current answer
      const correctAnswers = Object.values(results).filter(Boolean).length + (isCorrect ? 1 : 0);
      const finalScore = Math.round((correctAnswers / totalAnswered) * 100);
      
      setScore(finalScore);
      setShowResults(true);
      
      // Submit feedback with assessment score
      submitFeedback({
        assessment_score: finalScore,
      });
    }
  };

  // Restart assessment
  const handleRestart = () => {
    setAnswers({});
    setResults({});
    setCurrentQuestionIdx(0);
    setScore(null);
    setShowResults(false);
  };

  // Current question
  const currentQuestion = questions[currentQuestionIdx];
  const hasAnswer = !!answers[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / questions.length) * 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{topic}</h1>
            <p className="text-muted-foreground">
              {subjectId} - Assessment
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-3/4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Progress value={streamProgress} className="w-full h-2" />
          </CardFooter>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => fetchContent({
              content_type: 'assessment',
              subject: subjectId,
              topic: topic,
            })}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Results summary */}
      {showResults && score !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className={cn(
            score >= 80 ? "border-green-500" : 
            score >= 50 ? "border-yellow-500" : 
            "border-red-500"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center">
                {score >= 80 && <CheckCircle className="mr-2 h-6 w-6 text-green-500" />}
                {score < 80 && score >= 50 && <AlertCircle className="mr-2 h-6 w-6 text-yellow-500" />}
                {score < 50 && <XCircle className="mr-2 h-6 w-6 text-red-500" />}
                Assessment Results
              </CardTitle>
              <CardDescription>
                You scored {score}% ({Object.values(results).filter(Boolean).length} correct out of {questions.length})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    {results[idx] ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-sm">Your answer: {answers[idx]}</p>
                      <p className="text-sm font-medium">Correct answer: {question.correctAnswer}</p>
                      {!results[idx] && question.explanation && (
                        <p className="text-sm text-muted-foreground mt-2">{question.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button onClick={handleRestart} className="w-full">Retry Assessment</Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Current question */}
      {!loading && !error && !showResults && currentQuestion && (
        <motion.div
          key={`question-${currentQuestionIdx}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{currentQuestion.question}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Markdown>{currentQuestion.content}</Markdown>
                
                {/* Multiple choice question */}
                {currentQuestion.type === 'multiple_choice' && (
                  <RadioGroup 
                    value={answers[currentQuestionIdx]}
                    onValueChange={handleAnswerChange}
                    className="space-y-2"
                  >
                    {currentQuestion.options.map((option: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${idx}`} />
                        <Label htmlFor={`option-${idx}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {/* Short answer question */}
                {currentQuestion.type === 'short_answer' && (
                  <Input
                    value={answers[currentQuestionIdx] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here..."
                  />
                )}
                
                {/* Long answer question */}
                {currentQuestion.type === 'long_answer' && (
                  <Textarea
                    value={answers[currentQuestionIdx] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={5}
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="ghost"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              >
                Previous
              </Button>
              <Button
                disabled={!hasAnswer}
                onClick={submitAnswer}
              >
                {currentQuestionIdx < questions.length - 1 ? 'Next' : 'Submit'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// Helper functions
function detectQuestionType(content: string): 'multiple_choice' | 'short_answer' | 'long_answer' {
  if (content.includes('- [ ]') || content.includes('* [ ]') || content.includes('A)') || content.includes('a)')) {
    return 'multiple_choice';
  }
  if (content.length > 300) {
    return 'long_answer';
  }
  return 'short_answer';
}

function extractOptions(content: string): string[] {
  const options: string[] = [];
  
  // Try to find markdown style options: - [ ] Option
  const markdownOptionRegex = /[-*] \[[x ]\] (.*?)($|\n)/g;
  let match = markdownOptionRegex.exec(content);
  
  while (match) {
    options.push(match[1].trim());
    match = markdownOptionRegex.exec(content);
  }
  
  // If no markdown options, try letter options: A) Option
  if (options.length === 0) {
    const letterOptionRegex = /([A-D])[.)] (.*?)($|\n)/g;
    match = letterOptionRegex.exec(content);
    
    while (match) {
      options.push(match[2].trim());
      match = letterOptionRegex.exec(content);
    }
  }
  
  return options;
}

function extractCorrectAnswer(content: string): string {
  // Look for explicit correct answer statement
  const answerRegex = /correct answer:?\s*(.*?)($|\n)/i;
  const match = answerRegex.exec(content);
  
  if (match) {
    return match[1].trim();
  }
  
  // Look for checked option in markdown
  const checkedOptionRegex = /[-*] \[x\] (.*?)($|\n)/i;
  const checkedMatch = checkedOptionRegex.exec(content);
  
  if (checkedMatch) {
    return checkedMatch[1].trim();
  }
  
  return ""; // No correct answer found
}

function extractExplanation(content: string): string {
  const explanationRegex = /explanation:?\s*(.*?)($|\n)/i;
  const match = explanationRegex.exec(content);
  
  if (match) {
    return match[1].trim();
  }
  
  return ""; // No explanation found
}

function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalized1 = userAnswer.toLowerCase().trim();
  const normalized2 = correctAnswer.toLowerCase().trim();
  
  // Exact match
  if (normalized1 === normalized2) {
    return true;
  }
  
  // Allow for some flexibility with spacing and punctuation
  const simplify = (text: string) => text.replace(/[.,;:!?()'"]/g, '').replace(/\s+/g, ' ').trim();
  return simplify(normalized1) === simplify(normalized2);
}