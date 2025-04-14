// app/(dashboard)/library/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSavedContentList, deleteSavedContent } from '@/lib/saved-content';
import { SavedContentItem } from '@/types/api-types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function LibraryPage() {
  const router = useRouter();
  const [savedContent, setSavedContent] = useState<SavedContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSavedContent();
  }, [activeTab]);

  const loadSavedContent = async () => {
    setLoading(true);
    try {
      const contentType = activeTab !== 'all' ? activeTab : undefined;
      const contentList = await getSavedContentList(contentType);
      setSavedContent(contentList);
    } catch (error) {
      console.error('Failed to load saved content:', error);
      toast.error('Unable to load your saved content. Please try again.'
       );
    } finally {
      setLoading(false);
    }
  };

  const handleViewContent = (contentId: string, contentType: string) => {
    router.push(`/dashboard/library/${contentId}`);
  };

  const handleDeleteContent = async (contentId: string) => {
    setIsDeleting(contentId);
    try {
      await deleteSavedContent(contentId);
      setSavedContent(savedContent.filter(item => item.content_id !== contentId));
      toast.info('Content Deleted. The saved content has been removed from your library.');
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error(
 'Delete Failed. Unable to delete content. Please try again.'
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'lesson':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Learning Library</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="lesson">Lessons</TabsTrigger>
          <TabsTrigger value="assessment">Assessments</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-muted rounded w-20"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : savedContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedContent.map(item => (
            <Card key={item.content_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {getContentIcon(item.content_type)}
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {item.content_type}
                  </span>
                </div>
                <CardTitle className="text-lg mt-2 line-clamp-1">{item.title || item.topic}</CardTitle>
                <div className="text-sm text-muted-foreground">{item.subject}</div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <div>Topic: {item.topic}</div>
                  <div>Strategy: {item.metadata?.strategy || "Not specified"}</div>
                  <div>Saved on: {format(new Date(item.created_at), 'PP')}</div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-3 border-t">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleViewContent(item.content_id, item.content_type)}
                >
                  View
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  disabled={isDeleting === item.content_id}
                  onClick={() => handleDeleteContent(item.content_id)}
                >
                  {isDeleting === item.content_id ? 
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" /> : 
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  }
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-3">
          <div className="text-4xl">📚</div>
          <h3 className="text-lg font-medium">No saved content yet</h3>
          <p className="text-muted-foreground">
            Save lessons and assessments to access them anytime.
          </p>
          <Button 
            variant="default" 
            onClick={() => router.push('/learning')}
            className="mt-4"
          >
            Start Learning
          </Button>
        </div>
      )}
    </div>
  );
}