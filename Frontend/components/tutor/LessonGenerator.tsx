'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContentRequest, ContentType, InteractionMetadata } from './types';
import { getSubjects, SubjectData } from '@/lib/subjects';
import { streamContent } from '@/lib/rl-client';
import { LessonMetadata } from './LessonMetadata';
import { LessonDisplay } from './LessonDisplay';
import { BookOpen, Loader2, BookText, Library, ListChecks } from 'lucide-react';

export function LessonGenerator() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [topics, setTopics] = useState<string[]>([]);
  const [contentType, setContentType] = useState<ContentType>('lesson');
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [metadata, setMetadata] = useState<InteractionMetadata | null>(null);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    setSubjects(getSubjects());
  }, []);
  
  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find(s => s.id === selectedSubject);
      if (subject) {
        setTopics(subject.topics.map(t => t.name));
      } else {
        setTopics([]);
      }
    } else {
      setTopics([]);
    }
  }, [selectedSubject, subjects]);

  useEffect(() => {
    if (content && contentRef.current) {
      // Smooth scroll to content when it's generated
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content]);

  const handleGenerate = async () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    setIsGenerating(true);
    setContent('');
    setError('');
    setMetadata(null);
    startTimeRef.current = Date.now();

    const request: ContentRequest = {
      content_type: contentType,
      subject: selectedSubject,
      topic: selectedTopic || undefined,
    };

    try {
      await streamContent(
        request,
        (chunk) => {
          setContent(prev => prev + chunk);
        },
        (meta) => {
          setMetadata(meta);
        },
        (err) => {
          setError(err);
        }
      );
    } catch (err) {
      setError('An error occurred while generating content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Content type options with icons
  const contentTypeOptions = [
    { value: 'lesson', label: 'Lesson', icon: <BookOpen size={18} />, available: true },
    { value: 'quiz', label: 'Quiz', icon: <ListChecks size={18} />, available: false },
    { value: 'cheatsheet', label: 'Cheatsheet', icon: <BookText size={18} />, available: false }
  ];

  return (
    <div className="flex flex-col space-y-8 max-w-4xl mx-auto">
      <Card className="border-2 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950">
          <div className="flex items-center gap-3">
            <Library className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">AI Learning Content Generator</CardTitle>
          </div>
          <CardDescription>
            Select a subject and topic to generate personalized learning materials
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="content-type" className="text-base font-medium mb-2 block">Content Type</Label>
              <RadioGroup
                defaultValue="lesson"
                onValueChange={(value) => setContentType(value as ContentType)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2"
              >
                {contentTypeOptions.map((option) => (
                  <div 
                    key={option.value}
                    className={`flex items-center space-x-2 p-3 rounded-md border-2 transition-all
                      ${contentType === option.value ? 'border-primary bg-primary/5' : 'border-muted'}
                      ${!option.available ? 'opacity-60' : 'hover:border-primary/50 cursor-pointer'}`}
                  >
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.value} 
                      disabled={!option.available}
                    />
                    <Label 
                      htmlFor={option.value} 
                      className={`flex items-center gap-2 cursor-pointer ${!option.available && 'text-muted-foreground'}`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                      {!option.available && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Soon</span>}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
                <Select 
                  onValueChange={setSelectedSubject}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="subject" className="h-12">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-base font-medium">Topic (Optional)</Label>
                <Select 
                  onValueChange={setSelectedTopic}
                  disabled={isGenerating || topics.length === 0}
                >
                  <SelectTrigger id="topic" className="h-12">
                    <SelectValue placeholder="Select a topic or let AI choose" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !selectedSubject}
              className="w-full h-12 text-base font-medium mt-4 transition-all"
              size="lg"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Personalized Content...
                </span>
              ) : (
                'Generate Content'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGenerating && !content && (
        <Card className="border shadow-sm p-1">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-32 w-full rounded-md" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(content || error) && (
        <div ref={contentRef} className="scroll-mt-4 transition-all animate-fadeIn">
          {metadata && <LessonMetadata metadata={metadata} />}
          
          <LessonDisplay
            content={content} 
            error={error} 
            isLoading={isGenerating}
            interactionId={metadata?.interaction_id} 
          />
        </div>
      )}
    </div>
  );
}