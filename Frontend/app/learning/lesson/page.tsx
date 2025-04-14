// app/learning/lesson/page.tsx
'use client';

import { ContentDisplay } from '@/components/learning/content-display';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const LessonPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [params, setParams] = useState<{
    subject: string | null;
    topic: string | null;
  }>({
    subject: null,
    topic: null,
  });

  useEffect(() => {
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');

    // Set parameters from URL
    setParams({
      subject,
      topic
    });

    // If required parameters are missing, redirect back to selection page
    if (!subject || !topic) {
      router.push('/learning');
    }
  }, [searchParams, router]);

  const handleBack = () => {
    router.push('/learning');
  };

  // Show loading state while params are being retrieved
  if (!params.subject || !params.topic) {
    return (
      <div className="container max-w-5xl py-6 space-y-8">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl p-6 mx-auto">
      <ContentDisplay
        subjectId={params.subject}
        topic={params.topic}
        contentType="lesson"
        onBack={handleBack}
      />
    </div>
  );
};

export default LessonPage;