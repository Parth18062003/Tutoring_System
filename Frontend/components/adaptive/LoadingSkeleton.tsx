"use client"

import { Skeleton } from '@/components/ui/skeleton'; 
import { Card, CardContent } from '@/components/ui/card'; 

type ContentType = 'lesson' | 'quiz' | 'flashcard' | 'cheatsheet';


const LessonSkeleton = () => (
  <div className="space-y-6 p-4">
    <Skeleton className="h-8 w-3/4 rounded-md bg-zinc-200" />
    <div className="space-y-3">
      <Skeleton className="h-4 w-full rounded-md bg-zinc-200" />
      <Skeleton className="h-4 w-full rounded-md bg-zinc-200" />
      <Skeleton className="h-4 w-5/6 rounded-md bg-zinc-200" />
    </div>
    <Skeleton className="h-48 w-full rounded-lg bg-zinc-200" />
    <div className="space-y-3">
      <Skeleton className="h-4 w-full rounded-md bg-zinc-200" />
      <Skeleton className="h-4 w-5/6 rounded-md bg-zinc-200" />
    </div>
  </div>
);

const QuizSkeleton = () => (
  <div className="space-y-6 p-4">
    <Skeleton className="h-6 w-1/2 rounded-md bg-zinc-200" />
    <div className="space-y-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Skeleton className="h-5 w-5 rounded-full bg-zinc-200" />
          <Skeleton className="h-4 w-3/4 rounded-md bg-zinc-200" />
        </div>
      ))}
    </div>
     <Skeleton className="h-10 w-24 rounded-md bg-zinc-200" />
  </div>
);

const FlashcardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {[...Array(3)].map((_, index) => (
         <Card key={index} className="bg-white dark:bg-zinc-800 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center aspect-video">
                 <Skeleton className="h-6 w-3/4 mb-4 rounded-md bg-zinc-200" />
                 <Skeleton className="h-4 w-full rounded-md bg-zinc-200" />
                 <Skeleton className="h-4 w-5/6 mt-2 rounded-md bg-zinc-200" />
            </CardContent>
         </Card>
      ))}
  </div>
);

const CheatsheetSkeleton = () => (
  <div className="space-y-6 p-4">
     <Skeleton className="h-8 w-1/3 rounded-md bg-zinc-200 mb-6" />
     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {[...Array(6)].map((_, index) => (
            <div key={index} className="space-y-2 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                <Skeleton className="h-5 w-1/2 rounded-md bg-zinc-200" />
                <Skeleton className="h-4 w-full rounded-md bg-zinc-200" />
            </div>
        ))}
     </div>
  </div>
);

interface LoadingSkeletonProps {
  content: ContentType;
}

export default function LoadingSkeleton({ content }: LoadingSkeletonProps) {
  // You can use the content prop to conditionally render different skeletons
  const renderSkeleton = () => {
    switch (content) {
      case 'lesson':
        return <LessonSkeleton />;
      case 'quiz':
        return <QuizSkeleton />;
      case 'flashcard':
        return <FlashcardSkeleton />;
      case 'cheatsheet':
        return <CheatsheetSkeleton />;
      default:
        return <LessonSkeleton />; // Default to lesson if an invalid content type is passed
    }
  };

  return (
    <div className="animate-pulse">
      {renderSkeleton()}
    </div>
  );
}
