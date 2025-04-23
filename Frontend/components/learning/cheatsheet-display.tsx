"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";
import ContentActions from "./content-action";
import { saveContent } from "@/lib/saved-content";
import { useLearningContent } from "@/hooks/use-learning-content";
import { useFeedback } from "@/hooks/use-feedback";
import { SlideIn } from "./animations";
import {
  ArrowLeft,
  BookOpen,
  BookMarked,
  Check,
  CheckIcon,
  BookmarkIcon,
  FileText,
  ListChecks,
  Info,
  ChevronRight,
  Lightbulb,
  Calculator,
  FileQuestion,
  Hash,
} from "lucide-react";

// Define interfaces
interface CheatsheetDisplayProps {
  subjectId: string;
  topic: string;
  contentType: string;
  onBack: () => void;
  initialContent?: any;
  initialMetadata?: any;
  readOnly?: boolean;
  disableFeedback?: boolean;
}

// Define section types for the cheatsheet
const CHEATSHEET_SECTIONS = [
  { type: "cheatsheet_introduction", title: "Overview", icon: Info },
  { type: "key_concepts", title: "Key Concepts", icon: Lightbulb },
  { type: "formulas_rules", title: "Formulas & Rules", icon: Calculator },
  { type: "examples_applications", title: "Examples", icon: FileQuestion },
  { type: "quick_reference", title: "Quick Reference", icon: Hash },
];

export function CheatsheetDisplay({
  subjectId,
  topic,
  contentType,
  onBack,
  initialContent,
  initialMetadata,
  readOnly = false,
  disableFeedback = false,
}: CheatsheetDisplayProps) {
  const {
    fetchContent,
    currentContent,
    metadata,
    loading,
    error,
    streamProgress,
    completeResponse,
    interactionTime,
    completionPercentage,
    updateCompletionPercentage,
  } = useLearningContent();

  const {
    submitFeedback,
    submitting,
    success,
    error: feedbackError,
  } = useFeedback();

  // UI state
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeSection, setActiveSection] = useState<string>("cheatsheet_introduction");
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [readingProgress, setReadingProgress] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [userHasSubmittedFeedback, setUserHasSubmittedFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Time tracking variables
  const [startTime] = useState<number>(Date.now());
  const [pageFocus, setPageFocus] = useState<boolean>(true);
  const [activeTime, setActiveTime] = useState<number>(0);
  const lastActiveRef = useRef<number>(Date.now());

  // Process sections from content
  const groupedSections = currentContent?.sections?.reduce<Record<string, any[]>>(
    (acc, section) => {
      // Find the matching section from our defined list
      const matchedSection = CHEATSHEET_SECTIONS.find(s => 
        section.sectionType === s.type
      );
      
      if (matchedSection) {
        const key = matchedSection.type;
        if (!acc[key]) acc[key] = [];
        acc[key].push(section);
      } else {
        // Fallback for unexpected section types
        if (!acc["other"]) acc["other"] = [];
        acc["other"].push(section);
      }
      
      return acc;
    },
    {}
  ) || {};

  // Combine markdown content for export/print
  const getCombinedContent = () => {
    if (!currentContent?.sections) return "";

    return CHEATSHEET_SECTIONS.map(sectionDef => {
      const sections = groupedSections[sectionDef.type] || [];
      if (sections.length === 0) return "";
      
      let content = `# ${sectionDef.title}\n\n`;
      sections.forEach(section => {
        content += section.contentMarkdown + "\n\n";
      });
      
      return content;
    }).filter(Boolean).join("\n---\n\n");
  };

  // Handle section visibility for progress tracking
  const handleSectionVisibility = useCallback(
    (isVisible: boolean, sectionId: string) => {
      if (isVisible) {
        setVisibleSections((prev) => {
          const updated = { ...prev, [sectionId]: true };
          return updated;
        });
        
        setActiveSection(sectionId);
      }
    },
    []
  );

  // Calculate progress based on viewed sections
  useEffect(() => {
    if (!currentContent?.sections) return;

    const visibleCount = Object.keys(visibleSections).length;
    const totalSections = currentContent.sections.length || 1;
    
    const newProgress = Math.min(100, (visibleCount / totalSections) * 100);
    setReadingProgress(newProgress);
    updateCompletionPercentage(newProgress);

    if (newProgress >= 60 && completeResponse) {
      setShowFeedback(true);
    }
  }, [visibleSections, currentContent?.sections, completeResponse, updateCompletionPercentage]);

  // Initial content loading
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      if (initialContent) {
        // Use provided content if available (for saved content)
      } else {
        fetchContent({
          content_type: contentType,
          subject: subjectId,
          topic: topic,
        });
      }
      setHasInitiallyLoaded(true);
    }
  }, [fetchContent, contentType, subjectId, topic, hasInitiallyLoaded, initialContent]);

  // Time tracking
  useEffect(() => {
    let activeTimeInterval: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      setPageFocus(isVisible);

      if (isVisible) {
        lastActiveRef.current = Date.now();
        activeTimeInterval = setInterval(() => {
          setActiveTime((prev) => prev + 1);
        }, 1000);
      } else {
        setActiveTime(
          (prev) => prev + (Date.now() - lastActiveRef.current) / 1000
        );
        clearInterval(activeTimeInterval);
      }
    };

    const handleActivity = () => {
      if (pageFocus) {
        lastActiveRef.current = Date.now();
      }
    };

    handleVisibilityChange();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("click", handleActivity);

    return () => {
      clearInterval(activeTimeInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      document.removeEventListener("click", handleActivity);
    };
  }, []);

  // Feedback submission
  const handleFeedback = useCallback(
    async (rating: number, markAsCompleted: boolean = false) => {
      if (!metadata?.interaction_id || success || submitting) {
        return;
      }

      try {
        setUserHasSubmittedFeedback(true);
        
        const finalProgress = markAsCompleted ? 100 : readingProgress;

        if (markAsCompleted) {
          updateCompletionPercentage(100);
        }

        const timeSpentSeconds = Math.round(activeTime);

        await submitFeedback({
          interaction_id: metadata.interaction_id,
          helpful_rating: rating,
          engagement_rating: rating,
          time_spent_seconds: timeSpentSeconds,
          completion_percentage: finalProgress,
        });
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    },
    [metadata?.interaction_id, activeTime, readingProgress, success, submitting, submitFeedback, updateCompletionPercentage]
  );

  // Auto-submit feedback on unmount if needed
  useEffect(() => {
    return () => {
      const currentInteractionId = metadata?.interaction_id;

      if (
        completeResponse &&
        currentInteractionId &&
        !userHasSubmittedFeedback &&
        !success &&
        !submitting &&
        readingProgress > 25 &&
        activeTime >= 30
      ) {
        submitFeedback({
          interaction_id: currentInteractionId,
          time_spent_seconds: Math.round(activeTime),
          completion_percentage: readingProgress,
        });
      }
    };
  }, [
    metadata?.interaction_id,
    completeResponse,
    activeTime,
    readingProgress,
    success,
    submitting,
    submitFeedback,
    userHasSubmittedFeedback,
  ]);

  // Save content functionality
  const handleSaveContent = async () => {
    if (isSaved || isSaving || !currentContent) return;

    setIsSaving(true);

    try {
      const contentToSave = {
        interaction_id: metadata?.interaction_id,
        contentType,
        subject: subjectId,
        topic,
        title: `${topic} Cheatsheet`,
        sections: currentContent.sections,
        instructionalPlan: currentContent.instructionalPlan,
        metadata: metadata,
      };

      await saveContent(contentToSave);
      setIsSaved(true);

      toast.success(
        "Cheatsheet Saved. You can access this content in your saved library"
      );
    } catch (error) {
      console.error("Error saving content:", error);
      toast("Save Failed. Could not save content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Get icon for section
  const getSectionIcon = (type: string) => {
    const sectionDef = CHEATSHEET_SECTIONS.find(s => s.type === type);
    if (sectionDef) {
      const IconComponent = sectionDef.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Info className="h-4 w-4" />;
  };

  // Get formatted title for section
  const getSectionTitle = (type: string) => {
    const sectionDef = CHEATSHEET_SECTIONS.find(s => s.type === type);
    return sectionDef ? sectionDef.title : type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:self-start">
        <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium text-sm truncate flex-1">{topic}</h3>
          </div>

          {/* Progress indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>

          {/* Time spent */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Time spent</span>
            <span>
              {Math.floor(interactionTime / 60)}:
              {(interactionTime % 60).toString().padStart(2, "0")}
            </span>
          </div>

          <Separator />

          {/* Navigation items */}
          <div className="space-y-1">
            <div className="text-sm font-medium mb-2">Sections</div>
            <div className="space-y-1">
              {CHEATSHEET_SECTIONS.map((section) => {
                const hasContent = groupedSections[section.type]?.length > 0;
                if (!hasContent && !loading) return null;
                
                return (
                  <Button
                    key={section.type}
                    variant={activeTab === section.type ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left text-xs",
                    )}
                    onClick={() => {
                      setActiveTab(section.type);
                      setActiveSection(section.type);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {getSectionIcon(section.type)}
                      <span>{section.title}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Metadata */}
          <div className="hidden md:block">
            <Separator className="my-2" />
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>Difficulty:</span>
                <Badge variant="outline" className="font-normal">
                  {metadata?.difficulty_choice || "Normal"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Strategy:</span>
                <Badge variant="outline" className="font-normal">
                  {metadata?.strategy?.replace("_", " ") || "Standard"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Header tabs and actions */}
          <div className="flex items-center justify-between mb-4">
            <TabsList className="h-9">
              {CHEATSHEET_SECTIONS.map((section) => {
                const hasContent = groupedSections[section.type]?.length > 0;
                if (!hasContent && !loading) return null;
                
                return (
                  <TabsTrigger key={section.type} value={section.type}>
                    <div className="flex items-center gap-2">
                      {getSectionIcon(section.type)}
                      <span className="hidden sm:inline">{section.title}</span>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {currentContent && (
                <ContentActions
                  content={getCombinedContent()}
                  filename={`${subjectId}-${topic}-cheatsheet`}
                />
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveContent}
                disabled={isSaving || !completeResponse}
                title="Save for later"
                className="h-8 w-8"
              >
                {isSaved ? (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <BookmarkIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-1/2" />

                <div className="w-full space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Loading content...</span>
                    <span>{Math.round(streamProgress)}%</span>
                  </div>
                  <Progress value={streamProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {error && !loading && (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <div className="text-destructive font-bold mb-2">
                  Error Loading Content
                </div>
                <p className="mb-4">{error}</p>
                <Button
                  onClick={() =>
                    fetchContent({
                      content_type: contentType,
                      subject: subjectId,
                      topic: topic,
                    })
                  }
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Content tabs */}
          {!loading &&
            !error &&
            currentContent &&
            CHEATSHEET_SECTIONS.map((sectionDef) => {
              const sections = groupedSections[sectionDef.type] || [];
              if (sections.length === 0) return null;
              
              return (
                <TabsContent
                  key={sectionDef.type}
                  value={sectionDef.type}
                  className="mt-0 outline-none"
                >
                  <div className="space-y-8">
                    {sections.map((section, index) => (
                      <motion.div
                        key={`${sectionDef.type}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-lg border shadow-sm overflow-hidden"
                      >
                        <Card>
                          <CardHeader className="pb-0">
                            {section.title && (
                              <CardTitle>{section.title}</CardTitle>
                            )}
                          </CardHeader>
                          <CardContent>
                            {/* Apply special styling for each section type */}
                            <div className={cn(
                              sectionDef.type === "formulas_rules" && "font-mono text-sm",
                              sectionDef.type === "quick_reference" && "space-y-2"
                            )}>
                              <Markdown
                                onVisibilityChange={(isVisible, sectionId) => {
                                  if (sectionId) {
                                    handleSectionVisibility(isVisible, sectionId);
                                  }
                                }}
                              >
                                {section.contentMarkdown}
                              </Markdown>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              );
            })}

          {/* All-in-one view for printing */}
          <TabsContent
            value="print"
            className="mt-0 outline-none print:block hidden"
          >
            <div className="space-y-8">
              {CHEATSHEET_SECTIONS.map((sectionDef) => {
                const sections = groupedSections[sectionDef.type] || [];
                if (sections.length === 0) return null;
                
                return (
                  <div key={`print-${sectionDef.type}`} className="page-break-inside-avoid">
                    <h2 className="text-xl font-bold mb-4">{sectionDef.title}</h2>
                    <div className="space-y-4">
                      {sections.map((section, index) => (
                        <div key={`print-${sectionDef.type}-${index}`}>
                          {section.title && section.title !== sectionDef.title && (
                            <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                          )}
                          <div className={cn(
                            sectionDef.type === "formulas_rules" && "font-mono text-sm",
                            sectionDef.type === "quick_reference" && "space-y-2"
                          )}>
                            <Markdown>{section.contentMarkdown}</Markdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Feedback UI */}
        {(completeResponse || readingProgress > 50) && !loading && !disableFeedback && (
          <SlideIn direction="bottom">
            <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-card shadow-lg border-primary">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">How helpful was this cheatsheet?</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(readingProgress)}%
                      </span>
                      <Progress
                        value={readingProgress}
                        className="w-12 h-1.5"
                      />
                    </div>
                  </div>

                  {success ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      <span>Thanks for your feedback!</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant={
                              selectedRating === rating
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            disabled={submitting}
                            onClick={() => setSelectedRating(rating)}
                            className="flex-1 min-w-0"
                          >
                            {rating === 1 && "😕"}
                            {rating === 2 && "🙁"}
                            {rating === 3 && "😐"}
                            {rating === 4 && "🙂"}
                            {rating === 5 && "😀"}
                          </Button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          disabled={submitting || selectedRating === null}
                          onClick={() =>
                            selectedRating !== null &&
                            handleFeedback(selectedRating, false)
                          }
                          className="flex-1"
                        >
                          Submit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={submitting || selectedRating === null}
                          onClick={() =>
                            selectedRating !== null &&
                            handleFeedback(selectedRating, true)
                          }
                          className="flex-1"
                        >
                          Complete & Submit
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFeedback(false)}
                        className="w-full"
                      >
                        Not now
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}
      </div>
    </div>
  );
}