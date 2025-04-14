'use client';

import { CONTENT_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChevronLeft, BookOpen, FileQuestion, CheckSquare, FileText, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface ContentTypeSelectorProps {
  subjectId: string;
  topic: string;
  onSelect: (contentType: string) => void;
  onBack: () => void;
}

export function ContentTypeSelector({ 
  subjectId, topic, onSelect, onBack 
}: ContentTypeSelectorProps) {
  
  const contentTypeIcons = {
    lesson: <BookOpen className="h-6 w-6" />,
    exercise: <FileQuestion className="h-6 w-6" />,
    assessment: <CheckSquare className="h-6 w-6" />,
    summary: <FileText className="h-6 w-6" />,
    exploration: <Search className="h-6 w-6" />
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Choose Content Type</h2>
            <p className="text-muted-foreground">
              Topic: {topic} ({subjectId})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONTENT_TYPES.map(contentType => (
          <motion.div
            key={contentType.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Card 
              className="cursor-pointer h-full flex flex-col hover:shadow-md transition-shadow"
              onClick={() => onSelect(contentType.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2 p-2 bg-primary/10 rounded-md text-primary">
                    {contentTypeIcons[contentType.id as keyof typeof contentTypeIcons] || 
                      <BookOpen className="h-6 w-6" />}
                  </span>
                  {contentType.name}
                </CardTitle>
                <CardDescription>{contentType.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {getContentTypeDescription(contentType.id, topic)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function getContentTypeDescription(contentType: string, topic: string): string {
  switch(contentType) {
    case 'lesson':
      return `Learn about ${topic} with detailed explanations and examples`;
    case 'exercise':
      return `Practice your understanding of ${topic} with guided exercises`;
    case 'assessment':
      return `Test your knowledge of ${topic} with interactive questions`;
    case 'summary':
      return `Get a concise overview of the key points in ${topic}`;
    case 'exploration':
      return `Dive deeper into advanced concepts related to ${topic}`;
    default:
      return `Study ${topic} content`;
  }
}