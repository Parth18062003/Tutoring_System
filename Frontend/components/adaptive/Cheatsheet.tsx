'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLearningSessionStore } from '@/lib/store';
import { fetchAdaptiveContent, submitInteractionFeedback } from '@/lib/adaptive-api';
import { StructuredContentResponse, ContentSection, FeedbackPayload } from '@/types/adaptive';
import LoadingSkeleton from '@/components/adaptive/LoadingSkeleton';
import { ErrorMessage } from '@/components/adaptive/ErrorMessage';
import { SectionRenderer } from '@/components/adaptive/SectionRenderer';
import { ActionControls } from '@/components/adaptive/ActionControls';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import {
  Printer, Download, BookOpen, BrainCircuit, Lightbulb, CircleCheck,
  List, Layout, BarChart4, ArrowLeft, Clock, Search, Bookmark, BookmarkCheck,
  Menu, ChevronDown, ArrowDownToLine, Eye, ChevronUp, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// Helper to get appropriate icon for section type
const getSectionIcon = (sectionType: string) => {
  switch (sectionType) {
    case 'cheatsheet_key_definitions':
    case 'cheatsheet_definitions':
      return <BookOpen className="w-5 h-5 text-blue-600" />;
    case 'cheatsheet_formulas':
      return <BrainCircuit className="w-5 h-5 text-purple-600" />;
    case 'cheatsheet_facts':
    case 'cheatsheet_important_facts':
      return <Lightbulb className="w-5 h-5 text-amber-500" />;
    case 'cheatsheet_steps':
    case 'cheatsheet_key_steps':
      return <List className="w-5 h-5 text-green-600" />;
    case 'cheatsheet_examples':
      return <Eye className="w-5 h-5 text-cyan-600" />;
    default:
      return <Layout className="w-5 h-5 text-indigo-500" />;
  }
};

// Helper to get background color based on section type
const getSectionCardStyle = (sectionType: string) => {
  switch (sectionType) {
    case 'cheatsheet_key_definitions':
    case 'cheatsheet_definitions':
      return 'bg-blue-50 border-blue-200';
    case 'cheatsheet_formulas':
      return 'bg-purple-50 border-purple-200';
    case 'cheatsheet_facts':
    case 'cheatsheet_important_facts':
      return 'bg-amber-50 border-amber-200';
    case 'cheatsheet_steps':
    case 'cheatsheet_key_steps':
      return 'bg-green-50 border-green-200';
    case 'cheatsheet_examples':
      return 'bg-cyan-50 border-cyan-200';
    default:
      return 'bg-indigo-50 border-indigo-200';
  }
};

// Cheatsheet component
export default function CheatsheetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cheatsheetContent, setCheatsheetContent] = useState<StructuredContentResponse | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  // Current date/time and user info
  const [currentDateTime] = useState<string>("2025-03-31 18:32:11");
  const [currentUser] = useState<string>("Parth18062003");
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [bookmarkedSections, setBookmarkedSections] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  const {
    currentInteractionId,
    currentSubject: subjectFromStore,
    currentTopic: topicFromStore,
    setInteraction,
  } = useLearningSessionStore();

  // Get initial subject/topic from URL or store
  const initialSubject = searchParams.get('subject') || subjectFromStore || 'Science';
  const initialTopic = searchParams.get('topic') || topicFromStore;

  // Toggle section bookmark status
  const toggleBookmark = (sectionId: string) => {
    setBookmarkedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
    
    if (!bookmarkedSections.includes(sectionId)) {
      toast.success("Section bookmarked", {
        description: "You can find all bookmarked sections in the sidebar",
      });
    }
  };

  // Toggle section collapse status
  const toggleCollapsed = (sectionId: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Track section visibility
  const handleSectionVisibility = (sectionId: string, isVisible: boolean) => {
    if (isVisible && !visibleSections[sectionId]) {
      setVisibleSections(prev => ({
        ...prev,
        [sectionId]: true
      }));
    }
  };

  // Calculate progress through the cheatsheet
  const calculateProgress = useCallback(() => {
    if (!cheatsheetContent?.sections || cheatsheetContent.sections.length === 0) return 0;
    
    const totalSections = cheatsheetContent.sections.length;
    const viewedSections = Object.values(visibleSections).filter(Boolean).length;
    
    return Math.round((viewedSections / totalSections) * 100);
  }, [cheatsheetContent, visibleSections]);

  // Load cheatsheet content
  const loadCheatsheet = useCallback(async (subject: string, topic?: string | null) => {
    setIsLoading(true);
    setError(null);
    setCheatsheetContent(null);
    setStartTime(Date.now());
    setVisibleSections({});
    setBookmarkedSections([]);
    setCollapsedSections([]);
    setActiveTab(null);
    setSearchQuery('');
  
    // Submit feedback for previous interaction if exists
    if (currentInteractionId) {
      try {
        await submitInteractionFeedback({
          interaction_id: currentInteractionId,
        });
      } catch (feedbackError: any) {
        console.warn("Failed to submit feedback for previous interaction:", feedbackError);
      }
    }
  
    // Fetch new cheatsheet content
    try {
      const { metadata, content } = await fetchAdaptiveContent({
        content_type: 'cheatsheet',
        subject: subject,
        topic: topic,
      });
  
      if (!content) {
        throw new Error("Received empty content from API.");
      }
  
      setCheatsheetContent(content);
      
      // Set first section as active tab by default
      if (content.sections && content.sections.length > 0) {
        const firstSection = content.sections[0];
        setActiveTab(firstSection.sectionType || `section-0`);
      }
      
      // Update store with new interaction details
      setInteraction(metadata.interactionId, metadata.subject, metadata.topic);
  
    } catch (err: any) {
      console.error("Failed to load cheatsheet:", err);
      setError(err.message || "An unexpected error occurred while loading the cheatsheet.");
      setCheatsheetContent(null);
      toast.error("Failed to load cheatsheet", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  // Remove currentInteractionId from the dependency array to prevent recreation on ID changes
  }, [setInteraction]);

  useEffect(() => {
    // Only load if not already loaded
    if (!hasInitiallyLoaded) {
      loadCheatsheet(initialSubject, initialTopic);
      setHasInitiallyLoaded(true);
    }
  }, [initialSubject, initialTopic, loadCheatsheet, hasInitiallyLoaded]);

  // Handle action requests
  const handleRequestNextContent = useCallback(async (contentType: string, topic?: string | null) => {
    const subjectToRequest = cheatsheetContent?.subject || initialSubject;
    const topicToRequest = topic || cheatsheetContent?.topic || initialTopic;
    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

    // Submit feedback for the cheatsheet interaction first
    if(currentInteractionId) {
      try {
        await submitInteractionFeedback({
          interaction_id: currentInteractionId,
          time_spent_seconds: timeSpentSeconds,
          completion_percentage: calculateProgress(),
        });
      } catch (err) {
        console.warn("Failed to submit feedback:", err);
      }
    }
    
    // Navigate to the requested content type
    if (contentType === 'quiz') {
      toast.info("Navigating to Quiz");
      router.push(`/learn/quiz?subject=${subjectToRequest}&topic=${encodeURIComponent(topicToRequest || '')}`);
    } else if (contentType === 'lesson') {
      toast.info("Navigating to Lesson");
      router.push(`/learn/lesson?subject=${subjectToRequest}&topic=${encodeURIComponent(topicToRequest || '')}`);
    } else {
      console.log(`Requesting unhandled content type: ${contentType}`);
    }
  }, [cheatsheetContent, initialSubject, initialTopic, startTime, currentInteractionId, calculateProgress, router]);

  // Handle feedback submission
  const handleSubmitFeedbackAndProceed = useCallback(async (payload: FeedbackPayload) => {
    if (!payload.interaction_id) {
      await handleRequestNextContent('quiz');
      return;
    }

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const finalPayload = { 
        ...payload, 
        time_spent_seconds: payload.time_spent_seconds ?? timeSpent,
        completion_percentage: calculateProgress(),
      };

      await submitInteractionFeedback(finalPayload);
      toast.success("Feedback submitted!");
    } catch (err: any) {
      console.error("Failed to submit feedback:", err);
      toast.error("Failed to submit feedback", { description: err.message });
    }
  }, [startTime, calculateProgress, handleRequestNextContent]);

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Download functionality
  const handleDownload = () => {
    if (!cheatsheetContent || !cheatsheetContent.sections || cheatsheetContent.sections.length === 0) {
      toast.warning("No content available to download.");
      return;
    }

    const title = `# ${cheatsheetContent.topic || 'Cheatsheet'}\n\n`;
    const metadata = `Subject: ${cheatsheetContent.subject || initialSubject}\nDate: ${currentDateTime}\nUser: ${currentUser}\n\n---\n\n`;
    
    const fullMarkdown = title + metadata + cheatsheetContent.sections
      .map(section => `## ${section.title || 'Section'}\n\n${section.contentMarkdown}`)
      .join('\n\n---\n\n');

    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${cheatsheetContent.topic?.replace(/[^a-z0-9]/gi, '_') || 'cheatsheet'}.md`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Cheatsheet downloaded as ${filename}`);
  };

  // Filter sections based on search query
  const getFilteredSections = useCallback(() => {
    if (!cheatsheetContent?.sections) return [];
    if (!searchQuery) return cheatsheetContent.sections;

    const lowerQuery = searchQuery.toLowerCase();
    return cheatsheetContent.sections.filter(section => 
      (section.title?.toLowerCase().includes(lowerQuery) || 
       section.contentMarkdown?.toLowerCase().includes(lowerQuery))
    );
  }, [cheatsheetContent, searchQuery]);

  // Get bookmarked sections
  const getBookmarkedSections = useCallback(() => {
    if (!cheatsheetContent?.sections) return [];
    return cheatsheetContent.sections.filter((_, index) => 
      bookmarkedSections.includes(`section-${index}`)
    );
  }, [cheatsheetContent, bookmarkedSections]);

  // Render header with metadata
  const renderHeader = () => {
    if (!cheatsheetContent) return null;

    const { topic, subject, instructionalPlan } = cheatsheetContent;
    const progress = calculateProgress();

    return (
      <div className="mb-6 print:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground print:hidden"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Badge variant="outline" className="text-sm">
                {subject || initialSubject}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{Math.floor((Date.now() - startTime) / 1000)}s</span>
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{topic || initialTopic} - Cheatsheet</h1>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Print</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print Cheatsheet</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <ArrowDownToLine className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Download</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download as Markdown</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-4">
                  <h3 className="mb-2 font-semibold">Sections</h3>
                  <ScrollArea className="h-[calc(100vh-220px)]">
                    <div className="space-y-1 pr-4">
                      {cheatsheetContent.sections.map((section, index) => (
                        <Button 
                          key={`nav-${index}`}
                          variant={`section-${index}` === activeTab ? "secondary" : "ghost"} 
                          className="w-full justify-start text-left"
                          onClick={() => {
                            setActiveTab(`section-${index}`);
                            document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {getSectionIcon(section.sectionType || '')}
                            <span className="truncate">{section.title || `Section ${index + 1}`}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {bookmarkedSections.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-2 font-semibold">Bookmarks</h3>
                      <div className="space-y-1">
                        {cheatsheetContent.sections.map((section, index) => 
                          bookmarkedSections.includes(`section-${index}`) ? (
                            <Button 
                              key={`bookmark-${index}`}
                              variant="ghost" 
                              className="w-full justify-start text-left"
                              onClick={() => document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' })}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                                <span className="truncate">{section.title || `Section ${index + 1}`}</span>
                              </div>
                            </Button>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 print:hidden">
            <Card className="bg-muted/40">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {instructionalPlan?.teachingStrategy && (
                    <div>
                      <p className="text-muted-foreground mb-1 flex items-center gap-1">
                        <BrainCircuit className="h-3.5 w-3.5" /> Strategy Used
                      </p>
                      <p className="font-medium">{instructionalPlan.teachingStrategy}</p>
                    </div>
                  )}
                  {instructionalPlan?.targetDifficulty && (
                    <div>
                      <p className="text-muted-foreground mb-1 flex items-center gap-1">
                        <BarChart4 className="h-3.5 w-3.5" /> Difficulty
                      </p>
                      <div className="flex items-center gap-1">
                        <p className="font-medium capitalize">{instructionalPlan.targetDifficulty}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round((instructionalPlan.effectiveDifficultyScore || 0.5) * 100)}%
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Difficulty based on your mastery level</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  )}
                  {instructionalPlan?.contentLength && (
                    <div>
                      <p className="text-muted-foreground mb-1">Content Length</p>
                      <p className="font-medium capitalize">{instructionalPlan.contentLength}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Progress
                    </p>
                    <div className="flex flex-col">
                      <Progress value={progress} className="h-2 mb-1" />
                      <span className="text-xs text-muted-foreground">{progress}% viewed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Render sidebar for navigation
  const renderSidebar = () => {
    if (!cheatsheetContent || !cheatsheetContent.sections || isLoading) return null;
    
    return (
      <aside className="hidden md:block w-96 shrink-0 pr-8 print:hidden">
        <div className="sticky top-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent className="px-2 py-0">
              <ScrollArea className="h-[50vh]">
                <div className="space-y-1 pr-4">
                  {cheatsheetContent.sections.map((section, index) => (
                    <Button 
                      key={`nav-${index}`}
                      variant={`section-${index}` === activeTab ? "secondary" : "ghost"} 
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setActiveTab(`section-${index}`);
                        document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getSectionIcon(section.sectionType || '')}
                        <span className="truncate">{section.title || `Section ${index + 1}`}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            
            {bookmarkedSections.length > 0 && (
              <>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
                </CardHeader>
                <CardContent className="px-2 py-0">
                  <div className="space-y-1">
                    {cheatsheetContent.sections.map((section, index) => 
                      bookmarkedSections.includes(`section-${index}`) ? (
                        <Button 
                          key={`bookmark-${index}`}
                          variant="ghost" 
                          className="w-full justify-start text-left"
                          onClick={() => document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                            <span className="truncate">{section.title || `Section ${index + 1}`}</span>
                          </div>
                        </Button>
                      ) : null
                    )}
                  </div>
                </CardContent>
              </>
            )}

            <CardFooter className="flex-col items-start pt-4 pb-6">
              <p className="text-xs text-muted-foreground mb-1">User: {currentUser}</p>
              <p className="text-xs text-muted-foreground">Date: {currentDateTime}</p>
            </CardFooter>
          </Card>
        </div>
      </aside>
    );
  };

  // Render main content
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton content='cheatsheet' />;
    }

    if (error) {
      return <ErrorMessage title="Failed to load Cheatsheet" message={error} />;
    }

    if (!cheatsheetContent || !cheatsheetContent.sections || cheatsheetContent.sections.length === 0) {
      return <ErrorMessage title="No Content" message="No cheatsheet content available for this topic yet." />;
    }

    // Get sections to display based on filters
    const sectionsToDisplay = searchQuery ? getFilteredSections() : cheatsheetContent.sections;

    // Display "no results" message if filtered sections are empty
    if (sectionsToDisplay.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No matching sections</h3>
              <p className="text-muted-foreground mb-4">
                No sections match your search for "{searchQuery}"
              </p>
              <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Display content 
    return (
      <div ref={contentRef} className="cheatsheet-content-area print:p-0">
        {/* Tabs for mobile view */}
        <div className="block md:hidden mb-4 print:hidden">
          <Tabs 
            defaultValue={activeTab || 'section-0'} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <ScrollArea  className="w-full">
                <ScrollBar orientation='horizontal' className="h-2"/>
              <TabsList className="w-max">
                {cheatsheetContent.sections.map((section, index) => (
                  <TabsTrigger 
                    key={`tab-${index}`} 
                    value={`section-${index}`}
                    className="flex items-center gap-1.5"
                  >
                    {getSectionIcon(section.sectionType || '')}
                    <span>{section.title || `Section ${index + 1}`}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
            
            {cheatsheetContent.sections.map((section, index) => (
              <TabsContent key={`content-${index}`} value={`section-${index}`}>
                <Card className={getSectionCardStyle(section.sectionType || '')}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getSectionIcon(section.sectionType || '')}
                        {section.title || `Section ${index + 1}`}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(`section-${index}`)}
                        aria-label={bookmarkedSections.includes(`section-${index}`) ? "Remove bookmark" : "Add bookmark"}
                      >
                        {bookmarkedSections.includes(`section-${index}`) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SectionRenderer
                      section={section}
                      enhancedRendering={false}
                      onVisibilityChange={(isVisible) => handleSectionVisibility(`section-${index}`, isVisible)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Desktop continuous view */}
        <div className="hidden md:block">
          <AnimatePresence>
            {sectionsToDisplay.map((section, index) => {
              const sectionId = `section-${index}`;
              const isCollapsed = collapsedSections.includes(sectionId);
              
              return (
                <motion.div
                  key={sectionId}
                  id={sectionId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 scroll-mt-4"
                >
                  <Card className={getSectionCardStyle(section.sectionType || '')}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          className="p-0 h-auto -ml-2 flex items-center gap-2"
                          onClick={() => toggleCollapsed(sectionId)}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                          <CardTitle className="flex items-center gap-2 text-xl">
                            {getSectionIcon(section.sectionType || '')}
                            {section.title || `Section ${index + 1}`}
                          </CardTitle>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(sectionId)}
                          aria-label={bookmarkedSections.includes(sectionId) ? "Remove bookmark" : "Add bookmark"}
                        >
                          {bookmarkedSections.includes(sectionId) ? (
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CardContent>
                            <SectionRenderer
                              section={section}
                              enhancedRendering={false}
                              onVisibilityChange={(isVisible) => handleSectionVisibility(sectionId, isVisible)}
                            />
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Print-specific version (simplified) */}
        <div className="hidden print:block space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">{cheatsheetContent.topic || 'Cheatsheet'}</h1>
            <p className="text-sm text-muted-foreground">
              Subject: {cheatsheetContent.subject || initialSubject} | User: {currentUser} | Date: {currentDateTime}
            </p>
          </div>
          
          {cheatsheetContent.sections.map((section, index) => (
            <div key={`print-${index}`} className="mb-6 page-break-inside-avoid">
              <div className="border-b pb-2 mb-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {getSectionIcon(section.sectionType || '')}
                  {section.title || `Section ${index + 1}`}
                </h2>
              </div>
              <SectionRenderer section={section} enhancedRendering={false} isPrintMode={true} />
            </div>
          ))}
          
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>Generated by Adaptive Learning System | {currentDateTime}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {renderHeader()}
      
      <div className="flex gap-8">
        {renderSidebar()}
        <div className="flex-1">
          {renderContent()}

          {/* Action Controls */}
          {!isLoading && !error && cheatsheetContent && (
            <div className="mt-8 print:hidden">
              <Separator className="mb-6" />

              <ActionControls
                interactionId={currentInteractionId}
                isLoading={isLoading}
                onSubmitFeedback={handleSubmitFeedbackAndProceed}
                onRequestNextContent={handleRequestNextContent}
                showNextLessonButton={true}
                showQuizButton={true}
                nextActionLabel="Review Lesson"
                nextActionContentType="lesson"
                completionData={{
                  time_spent_seconds: Math.floor((Date.now() - startTime) / 1000),
                  completion_percentage: calculateProgress()
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; font-size: 10pt; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .cheatsheet-content-area { box-shadow: none; border: none; padding: 0; }
          .print\\:p-0 { padding: 0 !important; }
          h1, h2, h3, h4, h5, h6 { break-after: avoid; }
          p, ul, ol, pre, blockquote { orphans: 3; widows: 3; }
          .page-break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}