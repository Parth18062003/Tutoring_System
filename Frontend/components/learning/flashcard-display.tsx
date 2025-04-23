"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkIcon,
  Check,
  CheckIcon,
  Shuffle,
  RotateCw,
  Info,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Timer,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLearningContent } from "@/hooks/use-learning-content";
import { useFeedback } from "@/hooks/use-feedback";
import ContentActions from "./content-action";
import { saveContent } from "@/lib/saved-content";
import { SlideIn } from "./animations";
import { Markdown } from "./markdown";

interface FlashcardDisplayProps {
  subjectId: string;
  topic: string;
  contentType: string;
  onBack: () => void;
  initialContent?: any;
  initialMetadata?: any;
  readOnly?: boolean;
  disableFeedback?: boolean;
}

interface Flashcard {
  title: string;
  contentMarkdown: string;
  frontSide: string;
  backSide: string;
  difficulty: "easy" | "medium" | "challenging";
  hint?: string;
  sectionType: string;
}

export function FlashcardDisplay({
  subjectId,
  topic,
  contentType,
  onBack,
  initialContent,
  initialMetadata,
  readOnly = false,
  disableFeedback = false,
}: FlashcardDisplayProps) {
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

  // Flashcard-specific state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<"all" | "difficult" | "easy">(
    "all"
  );
  const [reviewedCards, setReviewedCards] = useState<
    Record<number, "correct" | "incorrect" | null>
  >({});
  const [showHint, setShowHint] = useState(false);
  const [activeTab, setActiveTab] = useState<"study" | "review" | "stats">(
    "study"
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Time tracking
  const [startTime] = useState<number>(Date.now());
  const [pageFocus, setPageFocus] = useState<boolean>(true);
  const [activeTime, setActiveTime] = useState<number>(0);
  const lastActiveRef = useRef<number>(Date.now());

  // Track user's progress
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [userHasSubmittedFeedback, setUserHasSubmittedFeedback] =
    useState(false);
  const [completedSession, setCompletedSession] = useState(false);

  // Process flashcards from content
  useEffect(() => {
    if (currentContent?.sections) {
      const cards = currentContent.sections
        .filter((section) => section.sectionType === "flashcard")
        .map((section) => {
          // Validate the difficulty value against allowed options
          const rawDifficulty = section.difficulty || "medium";
          const validatedDifficulty: "easy" | "medium" | "challenging" =
            rawDifficulty === "easy" || rawDifficulty === "challenging"
              ? rawDifficulty
              : "medium";

          return {
            title: section.title || "",
            contentMarkdown: section.contentMarkdown || "",
            frontSide: section.frontSide || "",
            backSide: section.backSide || "",
            difficulty: validatedDifficulty,
            hint: section.hint || "",
            sectionType: section.sectionType,
          };
        });

      setFlashcards(cards);
      // Reset state when new cards are loaded
      setCurrentIndex(0);
      setFlipped(false);
      setShowHint(false);
      setReviewedCards({});
    }
  }, [currentContent]);

  // Calculate progress
  useEffect(() => {
    if (flashcards.length > 0) {
      const reviewedCount = Object.values(reviewedCards).filter(Boolean).length;
      const progress = Math.min(100, (reviewedCount / flashcards.length) * 100);
      updateCompletionPercentage(progress);

      // Only show feedback when ALL cards have been reviewed
      if (
        reviewedCount === flashcards.length &&
        completeResponse &&
        flashcards.length > 0
      ) {
        setShowFeedback(true);
      }
    }
  }, [
    reviewedCards,
    flashcards.length,
    completeResponse,
    updateCompletionPercentage,
  ]);

  // Handle time tracking
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
  }, [pageFocus]);

  // Initial data load
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
  }, [
    fetchContent,
    contentType,
    subjectId,
    topic,
    hasInitiallyLoaded,
    initialContent,
  ]);

  // Feedback submission
  const handleFeedback = useCallback(
    async (rating: number, markAsCompleted: boolean = false) => {
      if (!metadata?.interaction_id || success || submitting) {
        return;
      }

      try {
        setUserHasSubmittedFeedback(true);

        const reviewedCount =
          Object.values(reviewedCards).filter(Boolean).length;
        const finalProgress =
          markAsCompleted || reviewedCount === flashcards.length
            ? 100
            : (reviewedCount / flashcards.length) * 100;

        if (markAsCompleted) {
          setCompletedSession(true);
          updateCompletionPercentage(100);
        }

        const timeSpentSeconds = Math.round(activeTime);

        const correctAnswers = Object.values(reviewedCards).filter(
          (val) => val === "correct"
        ).length;
        const incorrectAnswers = Object.values(reviewedCards).filter(
          (val) => val === "incorrect"
        ).length;
        const accuracy =
          flashcards.length > 0
            ? (correctAnswers / flashcards.length) * 100
            : 0;

        // Include detailed card statistics in feedback
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
    [
      metadata?.interaction_id,
      activeTime,
      flashcards.length,
      reviewedCards,
      success,
      submitting,
      submitFeedback,
      updateCompletionPercentage,
    ]
  );
  // Auto-save feedback on unmount if needed
  useEffect(() => {
    return () => {
      const currentInteractionId = metadata?.interaction_id;

      if (
        completeResponse &&
        currentInteractionId &&
        !userHasSubmittedFeedback &&
        !success &&
        !submitting &&
        flashcards.length > 0 &&
        activeTime >= 30
      ) {
        const reviewedCount =
          Object.values(reviewedCards).filter(Boolean).length;
        const progress = (reviewedCount / flashcards.length) * 100;

        submitFeedback({
          interaction_id: currentInteractionId,
          time_spent_seconds: Math.round(activeTime),
          completion_percentage: progress,
        });
      }
    };
  }, [
    metadata?.interaction_id,
    completeResponse,
    activeTime,
    flashcards.length,
    reviewedCards,
    success,
    submitting,
    submitFeedback,
    userHasSubmittedFeedback,
  ]);

  // Navigation functions
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setFlipped(false);
      setShowHint(false);
    }
  };

  const handleFlip = () => {
    setFlipped((prev) => !prev);
  };

  const handleShuffle = () => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...flashcards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
    setShowHint(false);
  };

  const handleMarkCard = (status: "correct" | "incorrect") => {
    // Update the card's status
    setReviewedCards((prev) => ({
      ...prev,
      [currentIndex]: status,
    }));

    // Check if this was the last unmarked card
    const newReviewedCount = Object.keys({
      ...reviewedCards,
      [currentIndex]: status,
    }).length;

    // If we've just marked the last card, show a toast notification
    if (newReviewedCount === flashcards.length) {
      toast.success("All cards reviewed! Please rate your experience");
    }

    // Auto advance to next card if not on the last card
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  };

  const handleSaveContent = async () => {
    if (isSaved || isSaving || !currentContent) return;

    setIsSaving(true);

    try {
      const contentToSave = {
        interaction_id: metadata?.interaction_id,
        contentType,
        subject: subjectId,
        topic,
        title: `${topic} Flashcards`,
        sections: currentContent.sections,
        instructionalPlan: currentContent.instructionalPlan,
        metadata: metadata,
      };

      await saveContent(contentToSave);
      setIsSaved(true);

      toast.success(
        "Flashcards Saved. You can access them in your saved library"
      );
    } catch (error) {
      console.error("Error saving flashcards:", error);
      toast("Save Failed. Could not save flashcards. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter cards based on difficulty
  const filteredFlashcards = flashcards.filter((card) => {
    if (studyMode === "all") return true;
    if (studyMode === "difficult")
      return card.difficulty === "challenging" || card.difficulty === "medium";
    if (studyMode === "easy") return card.difficulty === "easy";
    return true;
  });

  // Calculate statistics
  const correctCount = Object.values(reviewedCards).filter(
    (val) => val === "correct"
  ).length;
  const incorrectCount = Object.values(reviewedCards).filter(
    (val) => val === "incorrect"
  ).length;
  const accuracy =
    flashcards.length > 0
      ? (correctCount / Object.keys(reviewedCards).length) * 100
      : 0;
  const progress =
    flashcards.length > 0
      ? (Object.keys(reviewedCards).length / flashcards.length) * 100
      : 0;

  // Get current card
  const currentCard = filteredFlashcards[currentIndex];

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
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Time spent */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Time spent</span>
            <span>
              {Math.floor(interactionTime / 60)}:
              {(interactionTime % 60).toString().padStart(2, "0")}
            </span>
          </div>

          {/* Study mode selection */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Study Mode</label>
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant={studyMode === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStudyMode("all")}
                className="text-xs h-8"
              >
                All
              </Button>
              <Button
                variant={studyMode === "difficult" ? "default" : "outline"}
                size="sm"
                onClick={() => setStudyMode("difficult")}
                className="text-xs h-8"
              >
                Difficult
              </Button>
              <Button
                variant={studyMode === "easy" ? "default" : "outline"}
                size="sm"
                onClick={() => setStudyMode("easy")}
                className="text-xs h-8"
              >
                Easy
              </Button>
            </div>
          </div>

          {/* Card navigator */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground mb-1">Cards</div>
            <ScrollArea className="h-[200px]">
              <div className="grid grid-cols-4 gap-1">
                {flashcards.map((_, idx) => {
                  const status = reviewedCards[idx];
                  return (
                    <Button
                      key={idx}
                      variant={currentIndex === idx ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        status === "correct" && "border-green-500",
                        status === "incorrect" && "border-red-500"
                      )}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setFlipped(false);
                        setShowHint(false);
                      }}
                    >
                      {idx + 1}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Stats summary */}
          <div className="space-y-1 pt-2">
            <div className="text-xs text-muted-foreground">Statistics</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="text-xl font-bold text-green-500">
                  {correctCount}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="text-xl font-bold text-red-500">
                  {incorrectCount}
                </div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center col-span-2">
                <div className="text-xl font-bold">
                  {isNaN(accuracy) ? 0 : Math.round(accuracy)}%
                </div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab as any}
          className="w-full"
        >
          {/* Header tabs and actions */}
          <div className="flex items-center justify-between mb-4">
            <TabsList className="h-9">
              <TabsTrigger value="study">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Study</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="review">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Review</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="stats">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span className="hidden sm:inline">Stats</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffle}
                disabled={loading || flashcards.length === 0}
                title="Shuffle cards"
              >
                <Shuffle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Shuffle</span>
              </Button>
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
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-1/2" />

                <div className="w-full space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Loading flashcards...</span>
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
                  Error Loading Flashcards
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

          {/* Study Tab - Flashcard UI */}
          <TabsContent value="study" className="mt-0 outline-none">
            {!loading && !error && flashcards.length > 0 ? (
              <>
                <div className="flex justify-between mb-2">
                  <Badge variant="outline">
                    Card {currentIndex + 1} of {filteredFlashcards.length}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      currentCard?.difficulty === "easy" &&
                        "bg-green-50 text-green-700 border-green-200",
                      currentCard?.difficulty === "medium" &&
                        "bg-yellow-50 text-yellow-700 border-yellow-200",
                      currentCard?.difficulty === "challenging" &&
                        "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {currentCard?.difficulty}
                  </Badge>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Flashcard component */}
                  <div
                    className="perspective-1000 relative cursor-pointer mb-3"
                    onClick={handleFlip}
                    style={{ perspective: "1000px", height: "300px" }}
                  >
                    <motion.div
                      className="w-full h-full relative"
                      animate={{ rotateY: flipped ? 180 : 0 }}
                      transition={{ duration: 0.6 }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Front of card */}
                      <Card
                        className={cn(
                          "absolute w-full h-full backface-hidden p-6 flex flex-col",
                          flipped && "invisible"
                        )}
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <CardContent className="flex-grow flex flex-col justify-center items-center text-center p-0">
                          {currentCard?.title && (
                            <h3 className="text-lg font-semibold mb-3">
                              {currentCard.title}
                            </h3>
                          )}
                          <div className="text-xl">
                            <Markdown>{currentCard?.frontSide || ""}</Markdown>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2 pb-0 justify-center">
                          <span className="text-xs text-muted-foreground">
                            Click to flip
                          </span>
                        </CardFooter>
                      </Card>

                      {/* Back of card */}
                      <Card
                        className={cn(
                          "absolute w-full h-full backface-hidden p-6 flex flex-col",
                          !flipped && "invisible"
                        )}
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <CardContent className="flex-grow flex flex-col justify-center items-center text-center p-0">
                          <div className="overflow-auto max-h-full">
                            <Markdown>{currentCard?.backSide || ""}</Markdown>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2 pb-0 justify-center">
                          <span className="text-xs text-muted-foreground">
                            Click to flip back
                          </span>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Hint section */}
                  {currentCard?.hint && (
                    <div className="mb-4">
                      {showHint ? (
                        <div className="bg-muted/30 p-3 rounded-md text-sm">
                          <span className="font-semibold">Hint:</span>{" "}
                          {currentCard.hint}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(true);
                          }}
                        >
                          Show Hint
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Navigation and evaluation buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <div className="flex gap-2 flex-1">
                      <Button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="flex-1"
                        variant="outline"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={
                          currentIndex === filteredFlashcards.length - 1
                        }
                        className="flex-1"
                      >
                        Next
                      </Button>
                    </div>

                    <div className="flex gap-2 flex-1 mt-3 sm:mt-0">
                      <Button
                        onClick={() => handleMarkCard("incorrect")}
                        className="flex-1"
                        variant="outline"
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Didn't Know
                      </Button>
                      <Button
                        onClick={() => handleMarkCard("correct")}
                        className="flex-1"
                        variant="outline"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Knew It
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              !loading &&
              !error && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>No flashcards available for this topic.</p>
                  </CardContent>
                </Card>
              )
            )}
          </TabsContent>

          {!loading &&
            !error &&
            flashcards.length > 0 &&
            currentIndex === filteredFlashcards.length - 1 && (
              <Card className="mt-4 border-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 mr-2 text-green-500" />
                      <span className="font-medium">
                        {Object.keys(reviewedCards).length === flashcards.length
                          ? "All cards reviewed! Rate your experience above."
                          : `${Object.keys(reviewedCards).length} of ${flashcards.length} cards reviewed`}
                      </span>
                    </div>

                    {Object.keys(reviewedCards).length ===
                      flashcards.length && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Complete
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          {/* Review Tab - List of all cards */}
          <TabsContent value="review" className="mt-0 outline-none">
            <div className="space-y-4">
              {!loading &&
                flashcards.map((card, index) => (
                  <Card
                    key={index}
                    className={cn(
                      "overflow-hidden transition-all",
                      reviewedCards[index] === "correct" && "border-green-500",
                      reviewedCards[index] === "incorrect" && "border-red-500"
                    )}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold">
                          {card.title || `Card ${index + 1}`}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            card.difficulty === "easy" &&
                              "bg-green-50 text-green-700 border-green-200",
                            card.difficulty === "medium" &&
                              "bg-yellow-50 text-yellow-700 border-yellow-200",
                            card.difficulty === "challenging" &&
                              "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {card.difficulty}
                        </Badge>
                      </div>

                      <div className="mb-4 p-4 bg-muted/30 rounded-md">
                        <div className="font-medium text-sm text-muted-foreground mb-1">
                          Front:
                        </div>
                        <Markdown>{card.frontSide}</Markdown>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-md">
                        <div className="font-medium text-sm text-muted-foreground mb-1">
                          Back:
                        </div>
                        <Markdown>{card.backSide}</Markdown>
                      </div>

                      {card.hint && (
                        <div className="mt-3 p-3 bg-muted/20 rounded-md text-sm">
                          <span className="font-semibold">Hint:</span>{" "}
                          {card.hint}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Stats Tab - Detailed statistics */}
          <TabsContent value="stats" className="mt-0 outline-none">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Study Statistics</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {flashcards.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Cards
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {Object.keys(reviewedCards).length}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{flashcards.length}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cards Reviewed
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {isNaN(accuracy) ? 0 : Math.round(accuracy)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Accuracy
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-2">
                    Performance by Difficulty
                  </h4>
                  <div className="space-y-2">
                    {["easy", "medium", "challenging"].map((difficulty) => {
                      const difficultyCards = flashcards.filter(
                        (card) => card.difficulty === difficulty
                      );
                      const reviewed = difficultyCards.filter(
                        (_, idx) => reviewedCards[idx] !== undefined
                      ).length;
                      const correct = difficultyCards.filter(
                        (_, idx) => reviewedCards[idx] === "correct"
                      ).length;
                      const diffAccuracy =
                        reviewed > 0 ? (correct / reviewed) * 100 : 0;

                      return (
                        <div key={difficulty} className="flex items-center">
                          <div className="w-24 capitalize">{difficulty}</div>
                          <div className="flex-1">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  difficulty === "easy" && "bg-green-500",
                                  difficulty === "medium" && "bg-yellow-500",
                                  difficulty === "challenging" && "bg-red-500"
                                )}
                                style={{ width: `${diffAccuracy}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-16 text-right text-sm">
                            {isNaN(diffAccuracy) ? 0 : Math.round(diffAccuracy)}
                            %
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Time Metrics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/20 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Total Time
                      </div>
                      <div className="text-xl">
                        {Math.floor(interactionTime / 60)}m{" "}
                        {interactionTime % 60}s
                      </div>
                    </div>
                    <div className="bg-muted/20 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Avg. Time per Card
                      </div>
                      <div className="text-xl">
                        {Object.keys(reviewedCards).length > 0
                          ? Math.round(
                              interactionTime /
                                Object.keys(reviewedCards).length
                            )
                          : 0}
                        s
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feedback UI */}
        {(completeResponse || progress > 50) &&
          !loading &&
          !disableFeedback && (
            <SlideIn direction="bottom">
              <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-card shadow-lg border-primary">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        How were these flashcards?
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {Math.round(progress)}%
                        </span>
                        <Progress value={progress} className="w-12 h-1.5" />
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
