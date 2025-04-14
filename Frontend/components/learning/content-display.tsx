"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  ListChecks,
  FileText,
  BookMarked,
  BarChart,
  Info,
  CheckIcon,
  BookmarkIcon,
} from "lucide-react";
import { Markdown } from "./markdown";
import { useLearningContent } from "@/hooks/use-learning-content";
import { useFeedback } from "@/hooks/use-feedback";
import { ContentSection } from "@/types/api-types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SlideIn } from "./animations";
import ContentActions from "./content-action";
import { saveContent } from "@/lib/saved-content";
import { toast } from "sonner";

// In ContentDisplay.tsx, update the interface:
interface ContentDisplayProps {
  subjectId: string;
  topic: string;
  contentType: string;
  onBack: () => void;
  // Add these new props for saved content viewing
  initialContent?: any; // The saved content
  initialMetadata?: any; // Saved metadata
  readOnly?: boolean; // Whether to disable editing/feedback
  disableFeedback?: boolean; // Whether to disable feedback UI
}

export function ContentDisplay({
  subjectId,
  topic,
  contentType,
  onBack,
}: ContentDisplayProps) {
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

  const [activeTab, setActiveTab] = useState("content");
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [tableOfContents, setTableOfContents] = useState<
    { id: string; text: string; level: number }[]
  >([]);
  const [visibleSections, setVisibleSections] = useState<
    Record<string, boolean>
  >({});
  const [readingProgress, setReadingProgress] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [lessonCompleted, setLessonCompleted] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());
  const [pageFocus, setPageFocus] = useState<boolean>(true);
  const [activeTime, setActiveTime] = useState<number>(0);
  const lastActiveRef = useRef<number>(Date.now());
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [userHasSubmittedFeedback, setUserHasSubmittedFeedback] =
    useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const groupedSections = currentContent?.sections?.reduce<
    Record<string, ContentSection[]>
  >(
    (acc, section) => {
      let type = "content";

      if (
        section.sectionType.includes("content") ||
        section.sectionType.includes("main")
      ) {
        type = "content";
      } else if (section.sectionType.includes("introduction")) {
        type = "introduction";
      } else if (section.sectionType.includes("concept")) {
        type = "core concept";
      } else if (section.sectionType.includes("example")) {
        type = "examples";
      } else if (
        section.sectionType.includes("check_in") ||
        section.sectionType.includes("practice") ||
        section.sectionType.includes("exercise")
      ) {
        type = "practice";
      } else if (
        section.sectionType.includes("summary") ||
        section.sectionType.includes("review")
      ) {
        type = "summary";
      } else if (section.sectionType.includes("assessment")) {
        type = "assessment";
      }

      if (!acc[type]) acc[type] = [];
      acc[type].push(section);
      return acc;
    },
    {
      content: [],
      introduction: [],
      "core concept": [],
      examples: [],
      practice: [],
      summary: [],
      assessment: [],
    }
  ) || { content: [] };

  const getCombinedContent = () => {
    if (!currentContent?.sections) return "";

    // Combine all markdown content from the sections
    return currentContent.sections
      .map((section) => {
        let content = "";
        if (section.title) {
          content += `# ${section.title}\n\n`;
        }
        content += section.contentMarkdown;
        return content;
      })
      .join("\n\n---\n\n");
  };

  useEffect(() => {
    if (!currentContent?.sections) return;

    const headings: { id: string; text: string; level: number }[] = [];
    currentContent.sections.forEach((section) => {
      const headingRegex = /^(#{1,3})\s+(.+)$/gm;
      let match;

      while ((match = headingRegex.exec(section.contentMarkdown)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = `heading-${text.toLowerCase().replace(/\s+/g, "-")}`;

        headings.push({ id, text, level });
      }
    });

    setTableOfContents(headings);
  }, [currentContent?.sections]);

  useEffect(() => {
    if (!currentContent?.sections || !tableOfContents.length) return;

    const visibleCount = Object.values(visibleSections).filter(Boolean).length;
    const totalSections = tableOfContents.length || 1;

    const newProgress = Math.min(100, (visibleCount / totalSections) * 100);
    setReadingProgress(newProgress);
    updateCompletionPercentage(newProgress);

    // Always show feedback after certain scroll percentage
    if (newProgress >= 60 && completeResponse) {
      console.log("Showing feedback based on progress threshold");
      setShowFeedback(true);
    }
  }, [
    visibleSections,
    currentContent?.sections,
    tableOfContents.length,
    completeResponse,
    updateCompletionPercentage,
  ]);

  const handleSectionVisibility = useCallback(
    (isVisible: boolean, sectionId: string) => {
      // Only update state when a section becomes visible
      if (isVisible) {

        setVisibleSections((prev) => {
          const updated = { ...prev, [sectionId]: true };

          // Calculate and log progress whenever visibility changes
          const visibleCount = Object.keys(updated).length;
          const totalSections = tableOfContents.length || 1;
          const progress = Math.min(100, (visibleCount / totalSections) * 100);
          return updated;
        });

        // Also update active heading for navigation
        setActiveHeadingId(sectionId);
      }
    },
    [tableOfContents.length]
  );

  const fetchParamsRef = useRef({
    content_type: contentType,
    subject: subjectId,
    topic: topic,
  });

  useEffect(() => {
    if (!hasInitiallyLoaded) {
      fetchContent({
        content_type: contentType,
        subject: subjectId,
        topic: topic,
      });
      setHasInitiallyLoaded(true);
    }
  }, [fetchContent, contentType, subjectId, topic, hasInitiallyLoaded]);

  const scrollToHeading = (headingId: string) => {
    if (!contentRef.current) return;

    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveHeadingId(headingId);
    }
  };

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

  const handleSaveContent = async () => {
    if (isSaved || isSaving || !currentContent) return;

    setIsSaving(true);

    try {
      // Prepare content data for saving
      const contentToSave = {
        interaction_id: metadata?.interaction_id,
        contentType,
        subject: subjectId,
        topic,
        title: topic,
        sections: currentContent.sections,
        instructionalPlan: currentContent.instructionalPlan,
        metadata: metadata,
      };

      await saveContent(contentToSave);
      setIsSaved(true);

      toast.success(
        "Content Saved. You can access this content in your saved library"
      );
    } catch (error) {
      console.error("Error saving content:", error);
      toast("Save Failed. Could not save content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeedback = useCallback(
    async (rating: number, markAsCompleted: boolean = false) => {
      if (!metadata?.interaction_id || success || submitting) {
        return;
      }

      try {
        setUserHasSubmittedFeedback(true);

        // If marking as completed, set progress to 100%
        const finalProgress = markAsCompleted ? 100 : readingProgress;

        if (markAsCompleted) {
          setLessonCompleted(true);
          setReadingProgress(100);
          updateCompletionPercentage(100);
        }

        // Calculate accurate time spent
        const timeSpentSeconds = Math.round(activeTime);

        // Always include both rating and completion percentage when submitting feedback
        await submitFeedback({
          interaction_id: metadata.interaction_id,
          helpful_rating: rating,
          engagement_rating: rating,
          time_spent_seconds: timeSpentSeconds,
          completion_percentage: finalProgress, // Use updated progress if marked complete
        });

        // Log for debugging
        console.log(
          `Feedback submitted: rating=${rating}, progress=${finalProgress}%, completed=${markAsCompleted}`
        );
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    },
    [
      metadata?.interaction_id,
      activeTime,
      readingProgress,
      success,
      submitting,
      submitFeedback,
      updateCompletionPercentage,
    ]
  );

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

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "content":
        return <BookOpen className="h-4 w-4" />;
      case "examples":
        return <FileText className="h-4 w-4" />;
      case "practice":
        return <ListChecks className="h-4 w-4" />;
      case "summary":
        return <BookMarked className="h-4 w-4" />;
      case "assessment":
        return <BarChart className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
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

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Time spent</span>
            <span>
              {Math.floor(interactionTime / 60)}:
              {(interactionTime % 60).toString().padStart(2, "0")}
            </span>
          </div>

          <Separator />

          <div className="block md:hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 h-auto">
                <TabsTrigger value="content" className="py-1 text-xs">
                  Content
                </TabsTrigger>
                <TabsTrigger value="toc" className="py-1 text-xs">
                  Outline
                </TabsTrigger>
                {Object.keys(groupedSections).length > 1 && (
                  <TabsTrigger value="sections" className="py-1 text-xs">
                    Sections
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>

          <div
            className={cn(
              "space-y-1 overflow-hidden",
              activeTab !== "toc" && "hidden md:block"
            )}
          >
            <div className="text-sm font-medium mb-2">Table of Contents</div>

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            ) : tableOfContents.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-15rem)] pr-3">
                <div className="space-y-1">
                  {tableOfContents.map((heading) => (
                    <Button
                      key={heading.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left font-normal pl-2",
                        heading.level === 2 && "pl-4",
                        heading.level === 3 && "pl-6",
                        activeHeadingId === heading.id &&
                          "bg-accent text-accent-foreground font-medium"
                      )}
                      onClick={() => scrollToHeading(heading.id)}
                    >
                      <div className="flex items-center">
                        {activeHeadingId === heading.id && (
                          <ChevronRight className="h-3 w-3 mr-1 shrink-0" />
                        )}
                        <span className="truncate text-xs">{heading.text}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-xs text-muted-foreground">
                No content outline available.
              </p>
            )}
          </div>

          <div
            className={cn(
              "space-y-1",
              activeTab !== "sections" && "hidden md:block"
            )}
          >
            <div className="text-sm font-medium mb-2">Content Sections</div>
            <div className="space-y-1">
              {Object.entries(groupedSections)
                .filter(([_, sections]) => sections.length > 0)
                .map(([type, _]) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left text-xs",
                      activeTab === type && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setActiveTab(type)}
                  >
                    <div className="flex items-center gap-2">
                      {getSectionIcon(type)}
                      <span className="capitalize">{type}</span>
                    </div>
                  </Button>
                ))}
            </div>
          </div>

          <div className="hidden md:block">
            <Separator className="my-2" />
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1">
                <BadgeInfo
                  label="Difficulty"
                  value={metadata?.difficulty_choice || "Normal"}
                />
              </div>
              <div className="flex items-center gap-1">
                <BadgeInfo
                  label="Strategy"
                  value={metadata?.strategy.replace("_", " ") || "Explanation"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0" ref={contentRef}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
          defaultValue="content"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList className="h-9">
              {Object.entries(groupedSections)
                .filter(([_, sections]) => sections.length > 0)
                .map(([type, _]) => (
                  <TabsTrigger key={type} value={type} className="capitalize">
                    <div className="flex items-center gap-2">
                      {getSectionIcon(type)}
                      <span className="hidden sm:inline">{type}</span>
                    </div>
                  </TabsTrigger>
                ))}
            </TabsList>

            <div className="flex items-center gap-2">
              {currentContent && (
                <ContentActions
                  content={getCombinedContent()}
                  filename={`${subjectId}-${topic}`}
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

          {!loading &&
            !error &&
            currentContent &&
            Object.entries(groupedSections).map(([type, sections]) => (
              <TabsContent
                key={type}
                value={type}
                className="mt-0 outline-none"
              >
                <div className="space-y-8">
                  {sections.map((section, index) => (
                    <motion.div
                      key={`${type}-${section.sectionType}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-lg border shadow-sm overflow-hidden"
                    >
                      <div className="p-6">
                        {section.title && (
                          <h2 className="text-xl font-bold mb-4">
                            {section.title}
                          </h2>
                        )}

                        {/* Render regular markdown content */}
                        <Markdown
                          onVisibilityChange={(isVisible, sectionId) => {
                            if (sectionId) {
                              handleSectionVisibility(isVisible, sectionId);
                            }
                          }}
                        >
                          {section.contentMarkdown}
                        </Markdown>

                        {/* Add Check-In Question component if applicable */}
                        {section.sectionType &&
                          section.sectionType.includes("check_in") &&
                          section.questionText && (
                            <CheckInQuestion
                              question={section.questionText}
                              answerDetail={section.answerDetail || ""}
                            />
                          )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            ))}

          {(completeResponse || readingProgress > 50) && !loading && (
            <SlideIn direction="bottom">
              <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-card shadow-lg border-primary">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">How was this lesson?</h3>
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
                                  : rating <= 3
                                    ? "outline"
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
        </Tabs>
      </div>
    </div>
  );
}

const BadgeInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between w-full">
    <span>{label}:</span>
    <Badge variant="outline" className="font-normal">
      {value}
    </Badge>
  </div>
);

const CheckInQuestion = ({
  question,
  answerDetail,
}: {
  question: string;
  answerDetail: string;
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  // Split answer detail into correct answer and guiding question
  const answerLines = answerDetail.split("\n");
  const correctAnswer = answerLines[0].replace("Correct Answer: ", "").trim();
  const guidingQuestion = answerLines.slice(1).join("\n");

  return (
    <div className="mt-6 space-y-4">
      <div className="p-4 border rounded-md bg-muted/30">
        <h3 className="text-lg font-medium mb-2">Question</h3>
        <p className="mb-4">{question}</p>

        {!showAnswer ? (
          <Button
            onClick={() => setShowAnswer(true)}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Reveal Answer
          </Button>
        ) : (
          <div className="space-y-3 p-4 bg-card border rounded-md animate-in fade-in slide-in-from-top-2">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Answer:
              </h4>
              <div className="font-medium">{correctAnswer}</div>
            </div>

            {guidingQuestion && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Guidance:
                </h4>
                <div className="text-muted-foreground italic">
                  {guidingQuestion}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
