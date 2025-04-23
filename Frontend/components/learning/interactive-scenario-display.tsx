"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";
import { toast } from "sonner";
import { useLearningContent } from "@/hooks/use-learning-content";
import { useFeedback } from "@/hooks/use-feedback";
import { SlideIn } from "./animations";

import {
  ArrowLeft,
  PanelRight,
  Check,
  ArrowRight,
  LightbulbIcon,
  FileQuestion,
  BookText,
  MapPin,
  Target,
  Compass,
  ThumbsUp,
  ThumbsDown,
  Brain,
  ChevronDown,
  Eye,
  EyeOff,
  Briefcase,
  ListTree
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

// Define interfaces
interface InteractiveScenarioProps {
  subjectId: string;
  topic: string;
  contentType: string;
  onBack: () => void;
  initialContent?: any;
  initialMetadata?: any;
  readOnly?: boolean;
}

// Define section types for the scenario
const SCENARIO_SECTIONS = [
  { type: "scenario_introduction", title: "The Scenario", icon: Briefcase },
  { type: "scenario_context", title: "Context", icon: MapPin },
  { type: "challenge_points", title: "Challenges", icon: Target },
  { type: "guided_exploration", title: "Exploration", icon: Compass },
  { type: "reflection_questions", title: "Reflection Questions", icon: Brain },
];

export function InteractiveScenario({
  subjectId,
  topic,
  contentType,
  onBack,
  initialContent,
  initialMetadata,
  readOnly = false,
}: InteractiveScenarioProps) {
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
  const [activeTab, setActiveTab] = useState<string>("scenario");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showReflectionAnswers, setShowReflectionAnswers] = useState<boolean[]>([]);
  const [reflectionResponses, setReflectionResponses] = useState<string[]>([]);
  const [expandedConcepts, setExpandedConcepts] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [readingProgress, setReadingProgress] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [userHasSubmittedFeedback, setUserHasSubmittedFeedback] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<string>("");

  // Time tracking variables
  const [startTime] = useState<number>(Date.now());
  const [pageFocus, setPageFocus] = useState<boolean>(true);
  const [activeTime, setActiveTime] = useState<number>(0);
  const lastActiveRef = useRef<number>(Date.now());

  // Extract reflection questions from content
  const reflectionQuestions = currentContent?.sections?.find(
    (section: any) => section.sectionType === "reflection_questions"
  )?.questions || [];

  const reflectionConcepts = currentContent?.sections?.find(
    (section: any) => section.sectionType === "reflection_questions"
  )?.concepts || [];

  // Initialize reflection state when questions are loaded
  useEffect(() => {
    if (reflectionQuestions.length > 0) {
      setShowReflectionAnswers(new Array(reflectionQuestions.length).fill(false));
      setReflectionResponses(new Array(reflectionQuestions.length).fill(""));
    }
  }, [reflectionQuestions.length]);

  // Group sections by type
  const groupedSections = currentContent?.sections?.reduce<Record<string, any[]>>(
    (acc, section) => {
      // Find the matching section from our defined list
      const matchedSection = SCENARIO_SECTIONS.find(s => 
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

  // Calculate progress based on viewed sections and completed reflection questions
  useEffect(() => {
    if (!currentContent?.sections) return;

    const visibleCount = Object.keys(visibleSections).length;
    const totalSections = currentContent.sections.length || 1;
    
    // Additional progress from responding to reflection questions
    const answerProgress = reflectionResponses.filter(response => response.length > 0).length / 
                          (reflectionQuestions.length || 1);
    
    // Weight: 70% for sections viewed, 30% for reflection questions answered
    const sectionsProgress = Math.min(100, (visibleCount / totalSections) * 100) * 0.7;
    const reflectionsProgress = answerProgress * 30;
    
    const newProgress = Math.min(100, sectionsProgress + reflectionsProgress);
    setReadingProgress(newProgress);
    updateCompletionPercentage(newProgress);

    if (newProgress >= 70 && completeResponse) {
      setShowFeedback(true);
    }
  }, [
    visibleSections, 
    currentContent?.sections, 
    reflectionResponses, 
    reflectionQuestions.length,
    completeResponse, 
    updateCompletionPercentage
  ]);

  // Initial content loading
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      if (initialContent) {
        // Use provided content if available
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
        setActiveTime((prev) => prev + (Date.now() - lastActiveRef.current) / 1000);
        clearInterval(activeTimeInterval);
      }
    };

    const handleActivity = () => {
      if (pageFocus) {
        lastActiveRef.current = Date.now();
      }
    };

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
  }, [pageFocus]);

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

        toast.success("Thank you for your feedback!");
      } catch (error) {
        console.error("Error submitting feedback:", error);
        toast.error("Failed to submit feedback. Please try again.");
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

  // Update reflection responses
  const handleReflectionChange = (index: number, value: string) => {
    const newResponses = [...reflectionResponses];
    newResponses[index] = value;
    setReflectionResponses(newResponses);
    
    // Mark as completed step if there's substantial input
    if (value.length > 10) {
      setCompletedSteps(prev => new Set([...prev, index]));
    }
  };

  // Toggle reflection answers visibility
  const toggleAnswerVisibility = (index: number) => {
    const newVisibility = [...showReflectionAnswers];
    newVisibility[index] = !newVisibility[index];
    setShowReflectionAnswers(newVisibility);
  };

  // Update currently viewed step
  const goToStep = (step: number) => {
    if (step >= 0 && step <= SCENARIO_SECTIONS.length) {
      setCurrentStep(step);
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get icon for section
  const getSectionIcon = (type: string) => {
    const sectionDef = SCENARIO_SECTIONS.find(s => s.type === type);
    if (sectionDef) {
      const IconComponent = sectionDef.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <BookText className="h-4 w-4" />;
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
              aria-label="Go back"
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
            <span>{formatTime(interactionTime)}</span>
          </div>

          <Separator />

          {/* Navigation items */}
          <div className="space-y-1">
            <div className="text-sm font-medium mb-2">Scenario Steps</div>
            <div className="space-y-1">
              {SCENARIO_SECTIONS.map((section, index) => {
                const hasContent = groupedSections[section.type]?.length > 0;
                if (!hasContent && !loading) return null;
                
                const isCompleted = completedSteps.has(index);
                const isActive = activeSection === section.type || currentStep === index;
                
                return (
                  <Button
                    key={section.type}
                    variant={isActive ? "default" : isCompleted ? "ghost" : "outline"}
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left text-xs",
                      isCompleted && !isActive && "text-muted-foreground"
                    )}
                    onClick={() => {
                      setCurrentStep(index);
                      
                      // Find the corresponding section element and scroll to it
                      const sectionElement = document.getElementById(section.type);
                      if (sectionElement) {
                        sectionElement.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        getSectionIcon(section.type)
                      )}
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
                  {metadata?.strategy?.replace(/_/g, " ") || "Standard"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* View options */}
        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full mb-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="scenario">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Interactive Scenario</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="all">
                <div className="flex items-center gap-2">
                  <PanelRight className="h-4 w-4" />
                  <span className="hidden sm:inline">Full View</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

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
                  <span>Loading scenario...</span>
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
                Error Loading Scenario
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

        {/* Interactive Scenario View (Step-by-Step) */}
        <Tabs>
        {!loading && !error && currentContent && (
          <TabsContent value="scenario" className="mt-0">
            {/* Display current step */}
            {SCENARIO_SECTIONS.map((sectionDef, index) => {
              // Only render the current step
              if (index !== currentStep) return null;
              
              const sections = groupedSections[sectionDef.type] || [];
              if (sections.length === 0) return null;

              return (
                <div key={sectionDef.type} id={sectionDef.type} className="space-y-6">
                  <Card className="border shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span>{sectionDef.title}</span>
                        </CardTitle>
                        <Badge variant="outline">
                          Step {index + 1} of {SCENARIO_SECTIONS.length}
                        </Badge>
                      </div>
                      <CardDescription>
                        {index === 0 && "Begin your interactive scenario journey"}
                        {index === 1 && "Understand the background and context"}
                        {index === 2 && "Identify the key challenges"}
                        {index === 3 && "Explore potential solutions"}
                        {index === 4 && "Reflect on your learning"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {sections.map((section, sectionIndex) => (
                        <div 
                          key={`${sectionDef.type}-${sectionIndex}`} 
                          className={cn(
                            sectionDef.type === "reflection_questions" && "space-y-8"
                          )}
                        >
                          <Markdown
                            onVisibilityChange={(isVisible, sectionId) => {
                              if (sectionId) {
                                handleSectionVisibility(isVisible, sectionDef.type);
                              }
                            }}
                          >
                            {section.contentMarkdown}
                          </Markdown>
                          
                          {/* Special handling for reflection questions */}
                          {sectionDef.type === "reflection_questions" && reflectionQuestions.length > 0 && (
                            <div className="space-y-8 mt-6">
                              {reflectionQuestions.map((question: string, qIndex: number) => (
                                <Card key={`question-${qIndex}`} className="border bg-muted/20">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium">
                                      Question {qIndex + 1}:
                                    </CardTitle>
                                    <CardDescription className="text-base font-normal text-foreground">
                                      {question}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <Textarea 
                                      placeholder="Type your response here..."
                                      className="min-h-[100px] mb-2"
                                      value={reflectionResponses[qIndex] || ''}
                                      onChange={(e) => handleReflectionChange(qIndex, e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => toggleAnswerVisibility(qIndex)}
                                        className="flex items-center gap-1"
                                      >
                                        {showReflectionAnswers[qIndex] ? (
                                          <>
                                            <EyeOff className="h-3 w-3" />
                                            <span>Hide Hints</span>
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="h-3 w-3" />
                                            <span>Show Hints</span>
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                    
                                    {showReflectionAnswers[qIndex] && (
                                      <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                                        <p className="font-medium mb-2">Thinking Points:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                          {reflectionConcepts.slice(0, 3).map((concept: string, cIndex: number) => (
                                            <li key={`hint-${qIndex}-${cIndex}`}>{concept}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                          
                          {/* Key concepts for reflection section */}
                          {sectionDef.type === "reflection_questions" && reflectionConcepts.length > 0 && (
                            <Collapsible className="mt-8">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="w-full flex justify-between p-0 h-auto">
                                      <CardTitle className="text-base font-medium flex items-center gap-2">
                                        <ListTree className="h-4 w-4" />
                                        Key Concepts Applied
                                      </CardTitle>
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </CollapsibleTrigger>
                                </CardHeader>
                                <CollapsibleContent>
                                  <CardContent>
                                    <ul className="space-y-2">
                                      {reflectionConcepts.map((concept: string, index: number) => (
                                        <li key={`concept-${index}`} className="flex items-start gap-2">
                                          <LightbulbIcon className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
                                          <span>{concept}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </CollapsibleContent>
                              </Card>
                            </Collapsible>
                          )}
                        </div>
                      ))}
                    </CardContent>
                    
                    <CardFooter className="flex justify-between border-t p-4">
                      <Button
                        variant="outline"
                        onClick={() => goToStep(currentStep - 1)}
                        disabled={currentStep === 0}
                        className="flex items-center gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </Button>
                      
                      <Button
                        variant="default"
                        onClick={() => {
                          // Mark current step as completed when moving forward
                          setCompletedSteps(prev => new Set([...prev, currentStep]));
                          goToStep(currentStep + 1);
                        }}
                        disabled={currentStep === SCENARIO_SECTIONS.length - 1}
                        className="flex items-center gap-1"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              );
            })}
            
            {/* Completion card (shown when all steps are completed) */}
            {currentStep === SCENARIO_SECTIONS.length && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Scenario Completed!</span>
                  </CardTitle>
                  <CardDescription>
                    You've successfully worked through all steps of this interactive scenario.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    This scenario has helped you understand {topic} through practical application.
                    You've explored the challenges, worked through solutions, and reflected on key concepts.
                  </p>
                  
                  {reflectionResponses.some(r => r.trim().length > 0) && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Your Reflections:</h4>
                      {reflectionResponses.map((response, index) => (
                        response.trim().length > 0 ? (
                          <div key={`summary-${index}`} className="text-sm border-l-2 border-primary pl-3 py-1">
                            <p className="font-medium text-xs text-muted-foreground mb-1">
                              Question {index + 1}:
                            </p>
                            <p>{response}</p>
                          </div>
                        ) : null
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Key Concepts Covered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {reflectionConcepts.map((concept: string, index: number) => (
                        <Badge key={`concept-badge-${index}`} variant="outline" className="bg-primary/10">
                          {concept.split(' ').slice(0, 3).join(' ')}
                          {concept.split(' ').length > 3 && '...'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <Button
                    variant="outline"
                    onClick={() => goToStep(SCENARIO_SECTIONS.length - 1)}
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Reflections</span>
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={onBack}
                    className="flex items-center gap-1"
                  >
                    <span>Exit Scenario</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Full View Tab */}
        {!loading && !error && currentContent && (
          <TabsContent value="all" className="mt-0">
            <div className="space-y-8">
              {SCENARIO_SECTIONS.map((sectionDef) => {
                const sections = groupedSections[sectionDef.type] || [];
                if (sections.length === 0) return null;

                return (
                  <div key={sectionDef.type} id={`all-${sectionDef.type}`}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {getSectionIcon(sectionDef.type)}
                          <span>{sectionDef.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {sections.map((section, sectionIndex) => (
                          <div key={`all-${sectionDef.type}-${sectionIndex}`}>
                            <Markdown>{section.contentMarkdown}</Markdown>
                            
                            {/* Special handling for reflection questions in full view */}
                            {sectionDef.type === "reflection_questions" && reflectionQuestions.length > 0 && (
                              <div className="space-y-4 mt-6">
                                <h4 className="font-medium">Reflection Questions:</h4>
                                <ol className="list-decimal list-inside space-y-2">
                                  {reflectionQuestions.map((question: string, qIndex: number) => (
                                    <li key={`all-question-${qIndex}`}>{question}</li>
                                  ))}
                                </ol>
                                
                                <Separator className="my-4" />
                                
                                <h4 className="font-medium">Key Concepts:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {reflectionConcepts.map((concept: string, index: number) => (
                                    <li key={`all-concept-${index}`}>{concept}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        )}
</Tabs>
        {/* Feedback UI */}
        {(completeResponse || readingProgress > 50) && !loading && (
          <SlideIn direction="bottom">
            <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-card shadow-lg border-primary">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Was this scenario helpful?</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(readingProgress)}%
                      </span>
                      <Progress value={readingProgress} className="w-12 h-1.5" />
                    </div>
                  </div>

                  {success ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      <span>Thanks for your feedback!</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={submitting}
                          onClick={() => handleFeedback(5, false)}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <ThumbsUp className="h-5 w-5 text-green-500" />
                          <span className="text-xs">Helpful</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={submitting}
                          onClick={() => handleFeedback(3, false)}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <span className="text-xl">😐</span>
                          <span className="text-xs">Neutral</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={submitting}
                          onClick={() => handleFeedback(1, false)}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <ThumbsDown className="h-5 w-5 text-red-500" />
                          <span className="text-xs">Not helpful</span>
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