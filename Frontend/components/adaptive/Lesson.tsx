"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLearningSessionStore } from "@/lib/store";
import {
  fetchAdaptiveContent,
  submitInteractionFeedback,
} from "@/lib/adaptive-api";
import { StructuredContentResponse, ContentSection } from "@/types/adaptive";
import LoadingSkeleton from "@/components/adaptive/LoadingSkeleton";
import { ErrorMessage } from "@/components/adaptive/ErrorMessage";
import { SectionRenderer } from "@/components/adaptive/SectionRenderer";
import { ActionControls } from "@/components/adaptive/ActionControls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Printer,
  Download,
  BookOpen,
  BrainCircuit,
  Lightbulb,
  CircleCheck,
  ChevronRight,
  ChevronLeft,
  Clock,
  ArrowLeft,
  ExternalLink,
  Check,
  List,
  Layout,
  BarChart4,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Helper function to extract headings for table of contents
const extractTableOfContents = (sections: ContentSection[]) => {
  const toc: {
    id: string;
    title: string;
    level: number;
    sectionIndex: number;
  }[] = [];

  sections.forEach((section, sectionIndex) => {
    if (!section.contentMarkdown) return;

    // Add section title as a top-level item
    const sectionId = `section-${sectionIndex}`;
    toc.push({
      id: sectionId,
      title: section.title || `Section ${sectionIndex + 1}`,
      level: 1,
      sectionIndex,
    });

    // Extract markdown headings (## and ###)
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    let match;

    while ((match = headingRegex.exec(section.contentMarkdown)) !== null) {
      const level = match[1].length; // Number of # characters
      const title = match[2].trim();
      const id = `${sectionId}-${title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")}`;

      toc.push({
        id,
        title,
        level: level, // Will be 2 or 3
        sectionIndex,
      });
    }
  });

  return toc;
};

// Helper to get appropriate icon for section type
const getSectionIcon = (sectionType: string) => {
  switch (sectionType) {
    case "lesson_introduction":
      return <BookOpen className="w-4 h-4" />;
    case "lesson_core_concept":
      return <BrainCircuit className="w-4 h-4" />;
    case "lesson_example":
      return <Lightbulb className="w-4 h-4" />;
    case "lesson_check_in":
      return <CircleCheck className="w-4 h-4" />;
    case "lesson_summary":
      return <List className="w-4 h-4" />;
    default:
      return <Layout className="w-4 h-4" />;
  }
};

export default function LessonPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonContent, setLessonContent] =
    useState<StructuredContentResponse | null>(null);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"sections" | "continuous">(
    "sections"
  );
  const [showToc, setShowToc] = useState<boolean>(true);
  const [tableOfContents, setTableOfContents] = useState<
    { id: string; title: string; level: number; sectionIndex: number }[]
  >([]);
  const [readingTime, setReadingTime] = useState<string>("");
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [startTime, setStartTime] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const { currentInteractionId, currentSubject, currentTopic, setInteraction } =
    useLearningSessionStore();

  // Calculate reading time based on content length
  useEffect(() => {
    if (lessonContent?.sections) {
      const totalWords = lessonContent.sections.reduce((count, section) => {
        return count + (section.contentMarkdown?.split(/\s+/).length || 0);
      }, 0);

      const minutes = Math.ceil(totalWords / 200); // Assuming 200 words per minute
      setReadingTime(`${minutes} min${minutes !== 1 ? "s" : ""}`);
    }
  }, [lessonContent]);

  // Extract table of contents when content changes
  useEffect(() => {
    if (lessonContent?.sections) {
      const toc = extractTableOfContents(lessonContent.sections);
      setTableOfContents(toc);
    }
  }, [lessonContent]);

  useEffect(() => {
    if (currentSubject && !hasInitiallyLoaded) {
      loadLesson(currentSubject, null);
      // Set start time when lesson loads
      setStartTime(Date.now());
      // Set flag to prevent multiple loads
      setHasInitiallyLoaded(true);
    } else if (!currentSubject) {
      setError("No subject selected to load lesson.");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInitiallyLoaded])
  // Load a lesson
  const loadLesson = useCallback(
    async (subject: string, topic?: string | null) => {
      setIsLoading(true);
      setError(null);
      setCompletedSections(new Set());

      // Submit feedback for previous interaction if exists
      if (currentInteractionId) {
        try {
          await submitInteractionFeedback({
            interaction_id: currentInteractionId,
            completion_percentage: 100,
          });
        } catch (feedbackError: any) {
          console.warn(
            "Failed to submit feedback for previous interaction:",
            feedbackError
          );
          toast.error("Could not submit previous feedback", {
            description: feedbackError.message,
          });
        }
      }

      // Fetch new lesson content
      try {
        const { metadata, content } = await fetchAdaptiveContent({
          content_type: "lesson",
          subject: subject,
          topic: topic,
        });

        if (!content || content.contentType !== "lesson") {
          throw new Error(
            "Received invalid content type or empty content from API."
          );
        }

        setLessonContent(content);
        setActiveSection(0); // Reset to first section
        setInteraction(
          metadata.interactionId,
          metadata.subject,
          metadata.topic
        );
      } catch (err: any) {
        console.error("Failed to load lesson:", err);
        setError(
          err.message ||
            "An unexpected error occurred while loading the lesson."
        );
        setLessonContent(null);
        toast.error("Failed to load lesson", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    },
    [setInteraction]
  );

  // Initial load
  useEffect(() => {
    if (currentSubject) {
      loadLesson(currentSubject, null);
    } else {
      setError("No subject selected to load lesson.");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark section as completed
  const markSectionCompleted = useCallback((sectionIndex: number) => {
    setCompletedSections((prev) => {
      const updated = new Set(prev);
      updated.add(sectionIndex);
      return updated;
    });
  }, []);

  // Navigate to next/previous section
  const navigateSection = useCallback(
    (direction: "next" | "prev") => {
      if (!lessonContent?.sections) return;

      // Mark current section as completed when moving to next
      if (direction === "next") {
        markSectionCompleted(activeSection);
      }

      const newIndex =
        direction === "next"
          ? Math.min(activeSection + 1, lessonContent.sections.length - 1)
          : Math.max(activeSection - 1, 0);

      setActiveSection(newIndex);

      // Scroll to section if in continuous mode
      if (
        viewMode === "continuous" &&
        sectionRefs.current[`section-${newIndex}`]
      ) {
        sectionRefs.current[`section-${newIndex}`]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    },
    [activeSection, lessonContent, markSectionCompleted, viewMode]
  );

  // Navigate via ToC
  const navigateToSection = useCallback(
    (sectionIndex: number) => {
      setActiveSection(sectionIndex);

      // Scroll to section if in continuous mode
      if (
        viewMode === "continuous" &&
        sectionRefs.current[`section-${sectionIndex}`]
      ) {
        sectionRefs.current[`section-${sectionIndex}`]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    },
    [viewMode]
  );

  // Handle action requests
  const handleRequestNextContent = useCallback(
    async (contentType: string, topic?: string | null) => {
      const subjectToRequest =
        lessonContent?.subject || currentSubject || "Science";
      const topicToRequest = topic || lessonContent?.topic;

      if (contentType === "lesson") {
        await loadLesson(subjectToRequest, topicToRequest);
      } else if (contentType === "quiz") {
        console.log(
          `Requesting Quiz for Subject: ${subjectToRequest}, Topic: ${topicToRequest}`
        );
        toast.info("Navigating to Quiz (implementation needed)");
      } else {
        console.log(`Requesting unhandled content type: ${contentType}`);
      }
    },
    [loadLesson, lessonContent, currentSubject]
  );

  // Handle feedback submission
  const handleSubmitFeedbackAndProceed = useCallback(
    async (payload: any) => {
      if (!payload.interaction_id) {
        await handleRequestNextContent("lesson");
        return;
      }

      try {
        await submitInteractionFeedback(payload);
        toast.success("Feedback submitted!");
        await handleRequestNextContent("lesson");
      } catch (err: any) {
        console.error("Failed to submit feedback via ActionControls:", err);
        toast.error("Failed to submit feedback", { description: err.message });
      }
    },
    [handleRequestNextContent]
  );

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Download functionality
  const handleDownload = () => {
    if (
      !lessonContent ||
      !lessonContent.sections ||
      lessonContent.sections.length === 0
    ) {
      toast.warning("No content available to download.");
      return;
    }

    const fullMarkdown = lessonContent.sections
      .map(
        (section) =>
          `## ${section.title || "Section"}\n\n${section.contentMarkdown}`
      )
      .join("\n\n---\n\n");

    const blob = new Blob([fullMarkdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = `${lessonContent.topic?.replace(/[^a-z0-9]/gi, "_") || "lesson"}.md`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Lesson downloaded as ${filename}`);
  };

  // Calculate progress percentage
  const progressPercentage = lessonContent?.sections
    ? Math.round((completedSections.size / lessonContent.sections.length) * 100)
    : 0;

  // Render header with metadata
  const renderHeader = () => {
    if (!lessonContent) return null;

    const { topic, subject, instructionalPlan } = lessonContent;

    return (
      <div className="mb-6 print:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground print:hidden"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Badge variant="outline" className="text-sm">
                {subject || "Subject"}
              </Badge>
              <div className="flex items-center text-muted-foreground text-sm">
                <Clock className="inline h-3.5 w-3.5 mr-1" /> {readingTime}
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {topic || "Lesson"}
            </h1>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </div>

        {instructionalPlan && (
          <Card className="bg-muted/40 print:hidden">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center gap-1">
                    <BrainCircuit className="h-3.5 w-3.5" /> Strategy
                  </p>
                  <p className="font-medium">
                    {instructionalPlan.teachingStrategy}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center gap-1">
                    <BarChart4 className="h-3.5 w-3.5" /> Difficulty
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="font-medium capitalize">
                      {instructionalPlan.targetDifficulty}
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(
                              instructionalPlan.effectiveDifficultyScore * 100
                            )}
                            %
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Difficulty score based on your mastery level</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Content Length</p>
                  <p className="font-medium capitalize">
                    {instructionalPlan.contentLength}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Scaffolding</p>
                  <p className="font-medium">
                    {instructionalPlan.scaffoldingLevel}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Feedback Style</p>
                  <p className="font-medium">
                    {instructionalPlan.feedbackStyle}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render main content layout
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton content="lesson" />;
    }

    if (error) {
      return <ErrorMessage title="Failed to load Lesson" message={error} />;
    }

    if (
      !lessonContent ||
      !lessonContent.sections ||
      lessonContent.sections.length === 0
    ) {
      return (
        <ErrorMessage message="No lesson content available for this topic yet." />
      );
    }

    // Progress bar
    const progressBar = (
      <div className="mb-4 print:hidden">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="text-sm font-medium">{progressPercentage}%</p>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    );

    // View mode toggle
    const viewModeToggle = (
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "sections" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("sections")}
          >
            <Layout className="h-4 w-4 mr-1" /> Sections
          </Button>
          <Button
            variant={viewMode === "continuous" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("continuous")}
          >
            <List className="h-4 w-4 mr-1" /> Continuous
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowToc(!showToc)}
          className="md:hidden"
        >
          {showToc ? "Hide ToC" : "Show ToC"}
        </Button>
      </div>
    );

    return (
      <div ref={contentRef} className="lesson-content-area print:p-0">
        {/* Progress and view mode controls */}
        {progressBar}
        {viewModeToggle}

        {/* Main content layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Table of Contents Sidebar */}
          {showToc && (
            <Card className="md:w-64 shrink-0 print:hidden">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-base">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-1">
                    {lessonContent.sections.map((section, index) => (
                      <div key={`toc-section-${index}`} className="mb-1">
                        <button
                          onClick={() => navigateToSection(index)}
                          className={`w-full flex items-center justify-between px-2 py-1 text-left text-sm rounded ${
                            activeSection === index && viewMode === "sections"
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center">
                            {getSectionIcon(section.sectionType || "")}
                            <span className="ml-2 truncate">
                              {section.title || `Section ${index + 1}`}
                            </span>
                          </div>

                          {completedSections.has(index) && (
                            <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                          )}
                        </button>

                        {/* Sub-items from markdown headings for this section */}
                        {tableOfContents
                          .filter(
                            (item) =>
                              item.sectionIndex === index && item.level > 1
                          )
                          .map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                navigateToSection(item.sectionIndex);

                                // Additionally, scroll to this specific heading if possible
                                if (viewMode === "continuous") {
                                  setTimeout(() => {
                                    document
                                      .getElementById(item.id)
                                      ?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                  }, 50);
                                }
                              }}
                              className={`w-full text-left text-xs px-2 py-1 pl-${item.level * 3} 
                                hover:bg-muted rounded truncate flex items-center`}
                              style={{ paddingLeft: `${item.level * 12}px` }}
                            >
                              <ChevronRight className="h-3 w-3 shrink-0 mr-1 text-muted-foreground" />
                              <span className="truncate">{item.title}</span>
                            </button>
                          ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {viewMode === "sections" ? (
              // Section view - show one section at a time with navigation
              <div>
                {lessonContent.sections.map((section, index) => (
                  <div
                    key={`section-${index}`}
                    className={`transition-opacity ${activeSection === index ? "block" : "hidden"}`}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          {getSectionIcon(section.sectionType || "")}
                          <CardTitle>
                            {section.title || `Section ${index + 1}`}
                          </CardTitle>
                        </div>
                        {section.sectionType === "lesson_introduction" && (
                          <CardDescription>
                            This is an introduction to{" "}
                            {lessonContent.topic || "the lesson"}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <SectionRenderer
                          section={section}
                          enhancedRendering={true}
                          containerRef={contentRef}
                        />
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => navigateSection("prev")}
                          disabled={index === 0}
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                        </Button>

                        <Button
                          onClick={() => navigateSection("next")}
                          disabled={index === lessonContent.sections.length - 1}
                        >
                          Next <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>

                    {/* If it's the last section, show a completion message */}
                    {index === lessonContent.sections.length - 1 &&
                      activeSection === index && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md text-center"
                        >
                          <h3 className="text-lg font-medium text-green-800 mb-2">
                            Lesson Completed!
                          </h3>
                          <p className="text-green-700 mb-4">
                            Great job! You've completed this lesson on{" "}
                            {lessonContent.topic}.
                          </p>
                        </motion.div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              // Continuous view - show all sections at once for scrolling
              <Card>
                <CardContent className="p-6">
                  {lessonContent.sections.map((section, index) => (
                    <div
                      key={`continuous-${index}`}
                      ref={(el) => {
                        sectionRefs.current[`section-${index}`] = el;
                      }}
                      className="mb-8"
                    >
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                        {getSectionIcon(section.sectionType || "")}
                        <h2 className="text-xl font-semibold">
                          {section.title || `Section ${index + 1}`}
                        </h2>
                        {completedSections.has(index) && (
                          <Badge
                            variant="outline"
                            className="ml-auto text-green-600 bg-green-50 border-green-200"
                          >
                            <Check className="mr-1 h-3.5 w-3.5" /> Read
                          </Badge>
                        )}
                      </div>
                      <SectionRenderer
                        section={section}
                        enhancedRendering={true}
                        containerRef={contentRef}
                        onVisibilityChange={(isVisible) => {
                          if (isVisible && !completedSections.has(index)) {
                            markSectionCompleted(index);
                          }
                        }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Print-specific version */}
        <div className="hidden print:block space-y-6">
          <p className="text-sm text-muted-foreground mb-2">
            User: Parth18062003 | Date: 2025-03-31 16:01:15
          </p>

          {lessonContent.sections.map((section, index) => (
            <div
              key={`print-${index}`}
              className="mb-6 page-break-inside-avoid"
            >
              <h2 className="text-xl font-semibold mb-3 pb-2 border-b flex items-center gap-2">
                {getSectionIcon(section.sectionType || "")}
                {section.title || `Section ${index + 1}`}
              </h2>
              <SectionRenderer
                section={section}
                enhancedRendering={true}
                isPrintMode={true}
              />
            </div>
          ))}

          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>Generated by Brain Wave</p>
            <p>This content was personalized based on your learning profile.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {renderHeader()}
      {renderContent()}

      {/* Action Controls */}
      {!isLoading && !error && lessonContent && viewMode === "sections" && (
        <div className="mt-8 print:hidden">
          <Separator className="mb-6" />

          <ActionControls
            interactionId={currentInteractionId}
            isLoading={isLoading}
            onSubmitFeedback={handleSubmitFeedbackAndProceed}
            onRequestNextContent={handleRequestNextContent}
            showNextLessonButton={true}
            showQuizButton={true}
            nextActionLabel="Next Lesson"
            nextActionContentType="lesson"
            completionData={{
              completion_percentage: progressPercentage,
              time_spent_seconds: Math.floor((Date.now() - startTime) / 1000),
            }}
          />
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-size: 10pt;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .lesson-content-area {
            box-shadow: none;
            border: none;
            padding: 0;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            break-after: avoid;
          }
          p,
          ul,
          ol,
          pre,
          blockquote {
            orphans: 3;
            widows: 3;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
          .page-break-after {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
