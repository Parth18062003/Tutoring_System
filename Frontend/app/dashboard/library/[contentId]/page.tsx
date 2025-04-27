'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSavedContent } from '@/lib/saved-content';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SavedContentViewer } from '@/components/learning/saved-content-viewer';
import { SavedFlashcardViewer } from '@/components/learning/saved-flashcard-viewer';
import ReturnButtons from '@/components/return-buttons';
import { SavedCheatsheetViewer } from '@/components/learning/saved-cheatsheet-viewer';
import { SavedScenarioViewer } from '@/components/learning/saved-scenario-viewer';

export default function SavedContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const contentId = typeof params.contentId === 'string' ? params.contentId : Array.isArray(params.contentId) ? params.contentId[0] : null;

  useEffect(() => {
    if (!contentId) return;
    
    const loadSavedContent = async () => {
      setLoading(true);
      try {
        const savedContent = await getSavedContent(contentId);
        setContent(savedContent);
      } catch (error) {
        console.error('Failed to load content details:', error);
        toast.error('Unable to load the saved content. It may have been deleted.');
      } finally {
        setLoading(false);
      }
    };

    loadSavedContent();
  }, [contentId]);

  const handleBack = () => {
    router.push('/dashboard/library');
  };

  if (loading) {
    return (
      <div className="container py-6 space-y-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
          <div className="text-4xl">😕</div>
          <h2 className="text-2xl font-semibold">Content Not Found</h2>
          <p className="text-muted-foreground">
            The saved content you're looking for couldn't be found or has been deleted.
          </p>
          <Button onClick={handleBack}>Return to Library</Button>
        </div>
      </div>
    );
  }

  // Determine which content viewer to display based on content type
  const renderContentViewer = () => {
    // Check if the content is a flashcard type
    if (content.contentType === "flashcards") {
      return <SavedFlashcardViewer content={content} />;
    }
    
    if (content.contentType === "cheatsheet") {
      return <SavedCheatsheetViewer content={content} />;
    }

    if (content.contentType === "interactive-scenario") {
      return <SavedScenarioViewer content={content} />;
    }
    // Check if content has flashcard sections
    const hasFlashcardSections = content.sections?.some(
      (section: any) => section.sectionType === "flashcard"
    );
    
    const hasCheatsheetSections = content.sections?.some(
      (section: any) => section.sectionType?.startsWith("cheatsheet_") ||
        section.sectionType === "key_concepts" ||
        section.sectionType === "formulas_rules"
    );

    const hasScenarioSections = content.sections?.some(
      (section: any) => section.sectionType === "interactive-scenario"
    );

    if (hasFlashcardSections) {
      return <SavedFlashcardViewer content={content} />;
    }
    
    if (hasCheatsheetSections) {
      return <SavedCheatsheetViewer content={content} />;
    }
    
    if (hasScenarioSections) {
      return <SavedScenarioViewer content={content} />;
    }
    // Default to regular content viewer for lessons, practice, etc.
    return <SavedContentViewer content={content} />;
  };

  return (
    <div className="container p-6">
      <div className="flex items-center gap-4 mb-6">
        <ReturnButtons />
        <div>
          <h1 className="text-2xl font-bold">{content.title || content.topic}</h1>
          <p className="text-sm text-muted-foreground">
            {content.subject} • 
            {content.contentType === "flashcards" ? " Flashcards" : " Lesson"}
          </p>
        </div>
      </div>

      {renderContentViewer()}
    </div>
  );
}