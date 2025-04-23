"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ContentActions from "./content-action";
import { Markdown } from "./markdown";
import {
  BookOpen,
  Info,
  Timer,
  ThumbsDown,
  ThumbsUp,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  Shuffle,
} from "lucide-react";

// Define interfaces
interface SavedFlashcard {
  title: string;
  contentMarkdown: string;
  frontSide: string;
  backSide: string;
  difficulty: "easy" | "medium" | "challenging";
  hint?: string;
  sectionType: string;
}

interface SavedFlashcardContent {
  sections?: any[];
  content_type: string;
  subject: string;
  topic: string;
  title?: string;
  metadata?: {
    difficulty?: string;
    strategy?: string;
    [key: string]: any;
  };
  created_at?: string;
  [key: string]: any;
}

interface SavedFlashcardViewerProps {
  content: SavedFlashcardContent;
}

export function SavedFlashcardViewer({ content }: SavedFlashcardViewerProps) {
  // State for flashcards
  const [flashcards, setFlashcards] = useState<SavedFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [activeTab, setActiveTab] = useState<"study" | "review" | "stats">("study");
  const [studyMode, setStudyMode] = useState<"all" | "difficult" | "easy">("all");
  const [reviewStatus, setReviewStatus] = useState<Record<number, "correct" | "incorrect" | null>>({});

  // Process flashcards from content when component loads
  useEffect(() => {
    if (content.sections) {
      const cards = content.sections
        .filter(section => section.sectionType === "flashcard")
        .map(section => {
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
    }
  }, [content]);

  // Navigation functions
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFlipped(false);
      setShowHint(false);
    }
  };

  const handleFlip = () => {
    setFlipped(prev => !prev);
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
    setReviewStatus(prev => ({
      ...prev,
      [currentIndex]: status
    }));
    
    // Auto advance to next card
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  };

  // Filter cards based on difficulty
  const filteredFlashcards = flashcards.filter(card => {
    if (studyMode === "all") return true;
    if (studyMode === "difficult") return card.difficulty === "challenging" || card.difficulty === "medium";
    if (studyMode === "easy") return card.difficulty === "easy";
    return true;
  });

  // Calculate statistics
  const correctCount = Object.values(reviewStatus).filter(val => val === "correct").length;
  const incorrectCount = Object.values(reviewStatus).filter(val => val === "incorrect").length;
  const reviewedCount = Object.keys(reviewStatus).length;
  const accuracy = reviewedCount > 0 ? (correctCount / reviewedCount) * 100 : 0;
  const progress = flashcards.length > 0 ? (reviewedCount / flashcards.length) * 100 : 0;

  // Get current card
  const currentCard = filteredFlashcards[currentIndex];

  // Generate combined content for export
  const getCombinedContent = () => {
    if (!flashcards.length) return "";

    return flashcards
      .map((card, index) => {
        return `# ${card.title || `Card ${index + 1}`}\n\n**Front:**\n${card.frontSide}\n\n**Back:**\n${card.backSide}${card.hint ? `\n\n**Hint:** ${card.hint}` : ''}`;
      })
      .join("\n\n---\n\n");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:self-start">
        <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
          <h3 className="font-medium text-sm mb-2">Saved Flashcards</h3>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Topic</div>
            <Badge variant="outline" className="font-normal">
              {content.topic}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Subject</div>
            <Badge variant="outline" className="font-normal">
              {content.subject}
            </Badge>
          </div>
          
          <Separator className="my-2" />
          
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

          {/* Progress indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Card navigator */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground mb-1">Cards</div>
            <ScrollArea className="h-[200px]">
              <div className="grid grid-cols-4 gap-1">
                {flashcards.map((_, idx) => {
                  const status = reviewStatus[idx];
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
          
          <Separator className="my-2" />
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between w-full">
              <span>Saved:</span>
              <span className="text-xs">
                {content.created_at 
                  ? new Date(content.created_at).toLocaleDateString() 
                  : "Unknown date"}
              </span>
            </div>
            {content.metadata?.difficulty && (
              <div className="flex justify-between w-full">
                <span>Difficulty:</span>
                <Badge variant="outline" className="font-normal">
                  {content.metadata.difficulty}
                </Badge>
              </div>
            )}
            {content.metadata?.strategy && (
              <div className="flex justify-between w-full">
                <span>Strategy:</span>
                <Badge variant="outline" className="font-normal">
                  {content.metadata.strategy.replace("_", " ")}
                </Badge>
              </div>
            )}
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
                disabled={flashcards.length === 0}
                title="Shuffle cards"
              >
                <Shuffle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Shuffle</span>
              </Button>
              <ContentActions
                content={getCombinedContent()}
                filename={`${content.subject}-${content.topic}-flashcards`}
              />
            </div>
          </div>

          {/* No cards message */}
          {flashcards.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No flashcards available for this content.</p>
              </CardContent>
            </Card>
          )}

          {/* Study Tab - Flashcard UI */}
          <TabsContent value="study" className="mt-0 outline-none">
            {flashcards.length > 0 && (
              <>
                <div className="flex justify-between mb-2">
                  <Badge variant="outline">
                    Card {currentIndex + 1} of {filteredFlashcards.length}
                  </Badge>
                  {currentCard && (
                    <Badge
                      variant="outline"
                      className={cn(
                        currentCard.difficulty === "easy" &&
                          "bg-green-50 text-green-700 border-green-200",
                        currentCard.difficulty === "medium" &&
                          "bg-yellow-50 text-yellow-700 border-yellow-200",
                        currentCard.difficulty === "challenging" &&
                          "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {currentCard.difficulty}
                    </Badge>
                  )}
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
                        <ChevronLeft className="h-4 w-4 mr-2" />
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
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    <div className="flex gap-2 flex-1 mt-3 sm:mt-0">
                      <Button
                        onClick={() => handleMarkCard("incorrect")}
                        className="flex-1"
                        variant={reviewStatus[currentIndex] === "incorrect" ? "default" : "outline"}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Didn't Know
                      </Button>
                      <Button
                        onClick={() => handleMarkCard("correct")}
                        className="flex-1"
                        variant={reviewStatus[currentIndex] === "correct" ? "default" : "outline"}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Knew It
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </TabsContent>

          {/* Review Tab - List of all cards */}
          <TabsContent value="review" className="mt-0 outline-none">
            <div className="space-y-4">
              {flashcards.map((card, index) => (
                <Card
                  key={index}
                  className={cn(
                    "overflow-hidden transition-all",
                    reviewStatus[index] === "correct" && "border-green-500",
                    reviewStatus[index] === "incorrect" && "border-red-500"
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
                      {reviewedCount}
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
                        (card, idx) => reviewStatus[flashcards.indexOf(card)] !== undefined
                      ).length;
                      const correct = difficultyCards.filter(
                        (card, idx) => reviewStatus[flashcards.indexOf(card)] === "correct"
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
                  <h4 className="font-medium mb-2">Card Counts</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/20 p-3 rounded-md">
                      <div className="text-xl font-bold text-green-500">
                        {correctCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Correct
                      </div>
                    </div>
                    <div className="bg-muted/20 p-3 rounded-md">
                      <div className="text-xl font-bold text-red-500">
                        {incorrectCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Incorrect
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}