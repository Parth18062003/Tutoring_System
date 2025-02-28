"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Sample assessment data - in a real app, this would come from an API or database
const assessmentData = {
  id: "biology-101-midterm",
  title: "Biology 101: Midterm Assessment",
  description: "This assessment covers cellular biology, photosynthesis, and basic genetics.",
  timeLimit: 30, // in minutes
  passingScore: 70,
  questions: [
    {
      id: "q1",
      type: "multiple-choice",
      text: "Which of the following is NOT a function of the cell membrane?",
      image: "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?q=80&w=800&auto=format&fit=crop",
      options: [
        "Regulating what enters and exits the cell",
        "Providing structural support to the cell",
        "Producing energy through cellular respiration",
        "Facilitating cell-to-cell communication"
      ],
      correctAnswer: 2,
      explanation: "The cell membrane regulates transport, provides structure, and facilitates communication between cells. Cellular respiration occurs in the mitochondria, not the cell membrane.",
      hints: [
        "Think about the primary locations where energy production occurs in the cell.",
        "The cell membrane is primarily involved in boundary and transport functions.",
        "Cellular respiration is associated with a different organelle."
      ],
      points: 10
    },
    {
      id: "q2",
      type: "multiple-select",
      text: "Select all organelles that are involved in protein synthesis and processing.",
      options: [
        "Ribosomes",
        "Mitochondria",
        "Endoplasmic Reticulum",
        "Golgi Apparatus",
        "Lysosomes"
      ],
      correctAnswer: [0, 2, 3],
      explanation: "Ribosomes synthesize proteins, the endoplasmic reticulum helps fold them, and the Golgi apparatus packages and modifies proteins. Mitochondria produce energy, and lysosomes break down waste.",
      hints: [
        "Consider which organelles are directly involved in creating or modifying proteins.",
        "Some organelles are involved in energy production or waste management instead.",
        "The protein synthesis pathway involves multiple steps from creation to final processing."
      ],
      points: 15
    },
    {
      id: "q3",
      type: "short-answer",
      text: "Briefly explain the light-dependent reactions of photosynthesis and where they occur in the chloroplast.",
      characterLimit: 300,
      sampleAnswer: "Light-dependent reactions occur in the thylakoid membrane of chloroplasts. They capture light energy and convert it to chemical energy in the form of ATP and NADPH. Water is split, releasing oxygen as a byproduct. The energy carriers (ATP and NADPH) are then used in the Calvin cycle.",
      keywords: ["thylakoid", "ATP", "NADPH", "light", "oxygen", "water"],
      hints: [
        "Think about the specific membrane structure within chloroplasts where these reactions take place.",
        "Consider what energy carriers are produced during this process.",
        "Remember what molecule is split, resulting in oxygen release."
      ],
      points: 20
    },
    {
      id: "q4",
      type: "drag-drop",
      text: "Match each organelle with its primary function.",
      items: [
        { id: "item1", text: "Mitochondria" },
        { id: "item2", text: "Lysosome" },
        { id: "item3", text: "Nucleus" },
        { id: "item4", text: "Chloroplast" }
      ],
      zones: [
        { id: "zone1", text: "Energy production through cellular respiration" },
        { id: "zone2", text: "Breakdown of waste materials and cellular digestion" },
        { id: "zone3", text: "Storage of genetic material and regulation of cell activities" },
        { id: "zone4", text: "Photosynthesis and glucose production" }
      ],
      correctMatches: {
        "item1": "zone1",
        "item2": "zone2",
        "item3": "zone3",
        "item4": "zone4"
      },
      explanation: "Mitochondria are responsible for cellular respiration, lysosomes for waste breakdown, the nucleus for genetic storage and regulation, and chloroplasts for photosynthesis.",
      hints: [
        "Consider the primary role each organelle plays in cell function.",
        "Think about which organelles are found in plant cells but not animal cells, and why.",
        "Match based on the main biochemical processes associated with each structure."
      ],
      points: 20
    },
    {
      id: "q5",
      type: "true-false",
      text: "Mendel's Law of Independent Assortment states that alleles for different traits are inherited independently of one another.",
      correctAnswer: true,
      explanation: "Mendel's Law of Independent Assortment does indeed state that alleles for different traits are inherited independently of one another during gamete formation, leading to genetic diversity.",
      hints: [
        "Think about how Mendel's pea plant experiments demonstrated the inheritance of multiple traits.",
        "Consider whether alleles for different traits influence each other during inheritance.",
        "This law explains why offspring can have combinations of traits not seen in either parent."
      ],
      points: 10
    }
  ],
  relatedResources: [
    {
      title: "Cell Structure and Function",
      type: "Lesson",
      link: "/lessons/cell-structure"
    },
    {
      title: "Photosynthesis Deep Dive",
      type: "Video",
      link: "https://example.com/photosynthesis-video"
    },
    {
      title: "Genetics Practice Problems",
      type: "Practice",
      link: "/practice/genetics"
    }
  ]
};

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [hintsUsed, setHintsUsed] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(assessmentData.timeLimit * 60); // in seconds
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [dragItems, setDragItems] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const dragItemRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Timer effect
  useEffect(() => {
    if (isAssessmentComplete) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAssessmentComplete]);

  // Handle time up
  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: "Your assessment has been automatically submitted.",
      variant: "destructive",
    });
    handleSubmitAssessment();
  };

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Calculate progress
  const calculateProgress = () => {
    const answeredQuestions = Object.keys(answers).length;
    return Math.round((answeredQuestions / assessmentData.questions.length) * 100);
  };

  // Calculate score
  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    assessmentData.questions.forEach((question) => {
      totalPoints += question.points;
      
      if (isAnswerCorrect(question)) {
        earnedPoints += question.points;
      }
    });

    return {
      points: earnedPoints,
      total: totalPoints,
      percentage: Math.round((earnedPoints / totalPoints) * 100)
    };
  };

  // Check if answer is correct
  const isAnswerCorrect = (question: any) => {
    const userAnswer = answers[question.id];
    
    if (!userAnswer) return false;
    
    if (question.type === "multiple-choice") {
      return userAnswer === question.correctAnswer;
    } else if (question.type === "multiple-select") {
      if (!Array.isArray(userAnswer) || userAnswer.length !== question.correctAnswer.length) {
        return false;
      }
      return question.correctAnswer.every((answer: number) => userAnswer.includes(answer));
    } else if (question.type === "true-false") {
      return userAnswer === question.correctAnswer;
    } else if (question.type === "drag-drop") {
      // Check if all items are correctly matched
      for (const [itemId, correctZoneId] of Object.entries(question.correctMatches)) {
        if (dragItems[itemId] !== correctZoneId) {
          return false;
        }
      }
      return true;
    } else if (question.type === "short-answer") {
      // For short answer, we'll check if the answer contains at least half of the keywords
      const userAnswerLower = userAnswer.toLowerCase();
      const keywordsFound = question.keywords.filter((keyword: string) => 
        userAnswerLower.includes(keyword.toLowerCase())
      );
      return keywordsFound.length >= Math.ceil(question.keywords.length / 2);
    }
    
    return false;
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  // Handle multiple select change
  const handleMultipleSelectChange = (questionId: string, optionIndex: number) => {
    const currentAnswers = answers[questionId] || [];
    
    if (currentAnswers.includes(optionIndex)) {
      handleAnswerChange(
        questionId, 
        currentAnswers.filter((index: number) => index !== optionIndex)
      );
    } else {
      handleAnswerChange(
        questionId,
        [...currentAnswers, optionIndex]
      );
    }
  };

  // Handle drag start
  const handleDragStart = (itemId: string, e: React.DragEvent) => {
    setIsDragging(itemId);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', itemId);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (zoneId: string, e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    
    // Update the dragItems state
    setDragItems({
      ...dragItems,
      [itemId]: zoneId
    });
    
    // Update the answers state for the current question
    interface Question {
        id: string;
        text: string;
        points: number;
        hints: string[];
        // other properties
      }
      
      interface AssessmentData {
        title: string;
        description: string;
        questions: Question[];
        passingScore: number;
        timeLimit: number;
        relatedResources: { type: string; title: string; link: string }[];
      }
      
      // Assuming this is how your state or data looks
      const currentQuestionIndex: number = 0; // Example, make sure this value is set correctly
      const currentQuestion = assessmentData.questions[currentQuestionIndex]; // Get the current question based on the index
      
      // Now handle your logic for the answer change
      handleAnswerChange(currentQuestion.id, {
        ...dragItems,
        [itemId]: zoneId,
      });
      
      setIsDragging(null);
  };  

  // Handle hint request
  const handleHintRequest = (questionId: string) => {
    const currentHintIndex = hintsUsed[questionId] || 0;
    const question = assessmentData.questions.find(q => q.id === questionId);
    
    if (question && currentHintIndex < question.hints.length) {
      setHintsUsed({
        ...hintsUsed,
        [questionId]: currentHintIndex + 1
      });
      
      toast({
        title: `Hint ${currentHintIndex + 1}/${question.hints.length}`,
        description: question.hints[currentHintIndex],
        duration: 5000,
      });
    } else {
      toast({
        title: "No more hints available",
        description: "You've used all available hints for this question.",
        duration: 3000,
      });
    }
  };

  // Handle navigation
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < assessmentData.questions.length) {
      setCurrentQuestion(index);
      setShowFeedback(false);
    }
  };

  // Handle submit answer
  const handleSubmitAnswer = () => {
    setShowFeedback(true);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestion < assessmentData.questions.length - 1) {
      navigateToQuestion(currentQuestion + 1);
    } else {
      setShowSubmitDialog(true);
    }
  };

  // Handle submit assessment
  const handleSubmitAssessment = () => {
    setIsAssessmentComplete(true);
    setShowSubmitDialog(false);
    
    // In a real app, you would send the answers to the server here
    toast({
      title: "Assessment submitted",
      description: "Your answers have been recorded.",
      duration: 3000,
    });
  };

  // Handle restart assessment
  const handleRestartAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowFeedback(false);
    setHintsUsed({});
    setTimeRemaining(assessmentData.timeLimit * 60);
    setIsAssessmentComplete(false);
    setDragItems({});
  };

  // Get current question
  const getCurrentQuestion = () => {
    return assessmentData.questions[currentQuestion];
  };

  // Render question
  const renderQuestion = (question: any) => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            {question.image && (
              <div className="mb-4">
                <Image 
                  src={question.image} 
                  alt="Question illustration"
                  width={800}
                  height={400}
                  className="rounded-lg object-cover w-full max-h-[300px]"
                />
              </div>
            )}
            <RadioGroup 
              value={answers[question.id]?.toString()} 
              onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
              className="space-y-3"
            >
              {question.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-md border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      
      case "multiple-select":
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">Select all that apply</div>
            {question.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-md border hover:bg-muted/50 transition-colors">
                <Checkbox 
                  id={`option-${index}`} 
                  checked={(answers[question.id] || []).includes(index)}
                  onCheckedChange={() => handleMultipleSelectChange(question.id, index)}
                />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
        );
      
      case "short-answer":
        return (
          <div className="space-y-4">
            <Textarea 
              placeholder="Type your answer here..."
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={question.characterLimit}
            />
            <div className="text-sm text-muted-foreground text-right">
              {(answers[question.id]?.length || 0)}/{question.characterLimit} characters
            </div>
          </div>
        );
      
      case "true-false":
        return (
          <div className="space-y-4">
            <RadioGroup 
              value={answers[question.id]?.toString()} 
              onValueChange={(value) => handleAnswerChange(question.id, value === "true")}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          </div>
        );
      
      case "drag-drop":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Items</h3>
                <div className="space-y-2">
                  {question.items.map((item: any) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(item.id, e)}
                      className={`p-3 rounded-md border bg-card ${
                        isDragging === item.id ? 'opacity-50' : 'opacity-100'
                      } ${
                        dragItems[item.id] ? 'border-primary' : ''
                      } cursor-move hover:bg-muted/50 transition-colors`}
                      ref={isDragging === item.id ? dragItemRef : null}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Drop Zones</h3>
                <div className="space-y-2">
                  {question.zones.map((zone: any) => {
                    // Find which item is in this zone
                    const itemInZone = Object.entries(dragItems).find(([_, zoneId]) => zoneId === zone.id);
                    const itemId = itemInZone ? itemInZone[0] : null;
                    const item = itemId ? question.items.find((i: any) => i.id === itemId) : null;
                    
                    return (
                      <div
                        key={zone.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(zone.id, e)}
                        className={`p-3 rounded-md border min-h-[60px] ${
                          itemInZone ? 'bg-muted/50 border-primary' : 'border-dashed'
                        }`}
                      >
                        <div className="text-sm text-muted-foreground mb-1">{zone.text}</div>
                        {item && (
                          <div className="p-2 bg-card rounded border">
                            {item.text}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Unsupported question type</div>;
    }
  };

  // Render feedback
  const renderFeedback = (question: any) => {
    const isCorrect = isAnswerCorrect(question);
    
    return (
      <div className={`mt-6 p-4 rounded-md ${
        isCorrect ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900' : 
        'bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900'
      }`}>
        <div className="flex items-start">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          )}
          <div>
            <p className={`font-medium ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
            <p className="mt-1 text-sm">
              {question.explanation}
            </p>
            
            {!isCorrect && question.type === "short-answer" && (
              <div className="mt-3 p-3 bg-background rounded border">
                <p className="text-sm font-medium">Sample Answer:</p>
                <p className="text-sm mt-1">{question.sampleAnswer}</p>
              </div>
            )}
            
            {!isCorrect && (
              <div className="mt-3">
                <Link 
                  href={assessmentData.relatedResources[0].link} 
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Review related lesson
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render results
  const renderResults = () => {
    const score = calculateScore();
    const isPassing = score.percentage >= assessmentData.passingScore;
    
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Assessment Complete</h2>
          <p className="text-muted-foreground">
            You've completed the {assessmentData.title}
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center border-8 ${
            isPassing ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className="text-center">
              <div className="text-3xl font-bold">{score.percentage}%</div>
              <div className="text-sm text-muted-foreground">
                {score.points}/{score.total} points
              </div>
            </div>
            </div>
        </div>
        
        <div className={`p-4 rounded-md ${
          isPassing ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900' : 
          'bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900'
        }`}>
          <div className="flex items-start">
            {isPassing ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            )}
            <div>
              <p className={`font-medium ${isPassing ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {isPassing ? 'Congratulations! You passed the assessment.' : 'You did not meet the passing score.'}
              </p>
              <p className="mt-1 text-sm">
                {isPassing 
                  ? 'Youve demonstrated a good understanding of the material covered in this assessment.' 
                  : `The passing score is ${assessmentData.passingScore}%. We recommend reviewing the material and trying again.`
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Question Summary</h3>
          <div className="space-y-2">
            {assessmentData.questions.map((question, index) => {
              const isCorrect = isAnswerCorrect(question);
              
              return (
                <div 
                  key={question.id}
                  className={`p-3 rounded-md border flex justify-between items-center ${
                    isCorrect ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20' : 
                    answers[question.id] ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20' : 
                    'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm truncate max-w-[300px]">{question.text}</span>
                  </div>
                  <div>
                    {answers[question.id] ? (
                      isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )
                    ) : (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">Not answered</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assessmentData.relatedResources.map((resource) => (
              <Card key={resource.title} className="hover:bg-muted/50 transition-colors">
                <CardHeader className="p-4">
                  <Badge variant="outline" className="mb-2 w-fit">{resource.type}</Badge>
                  <CardTitle className="text-base">{resource.title}</CardTitle>
                </CardHeader>
                <CardFooter className="p-4 pt-0">
                  <Link href={resource.link} className="text-primary hover:underline flex items-center text-sm">
                    View Resource
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleRestartAssessment}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart Assessment
          </Button>
          <Button onClick={() => router.push("/")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen px-8">
      {/* Header with navigation and timer */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="ml-2 text-sm font-medium">Back to Dashboard</span>
          </Link>
          
          {!isAssessmentComplete && (
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${
                timeRemaining < 300 ? 'text-red-500' : ''
              }`}>
                <Clock className="h-5 w-5" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSubmitDialog(true)}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Finish
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Submit your assessment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </header>

      <div className="container py-8">
        {!isAssessmentComplete ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar with question navigation */}
            <aside className="md:col-span-1 space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">{assessmentData.title}</h1>
                <p className="text-muted-foreground">{assessmentData.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Your Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Object.keys(answers).length}/{assessmentData.questions.length} Questions
                  </span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
              
              <div className="hidden md:block">
                <h2 className="text-sm font-medium mb-3">Questions</h2>
                <div className="grid grid-cols-5 gap-2">
                  {assessmentData.questions.map((question, index) => {
                    const isAnswered = !!answers[question.id];
                    const isCurrentQuestion = currentQuestion === index;
                    
                    return (
                      <Button
                        key={question.id}
                        variant={isCurrentQuestion ? "default" : "outline"}
                        size="sm"
                        className={`h-10 w-10 p-0 ${
                          isAnswered && !isCurrentQuestion ? 'bg-muted' : ''
                        }`}
                        onClick={() => navigateToQuestion(index)}
                      >
                        {isAnswered && !isCurrentQuestion ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              <div className="hidden md:block space-y-2">
                <h2 className="text-sm font-medium mb-2">Assessment Details</h2>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Limit:</span>
                    <span>{assessmentData.timeLimit} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passing Score:</span>
                    <span>{assessmentData.passingScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Questions:</span>
                    <span>{assessmentData.questions.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:block">
                <h2 className="text-sm font-medium mb-2">Need Help?</h2>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </aside>

            {/* Main content area */}
            <main className="md:col-span-3 space-y-8">
              <div className="md:hidden">
                <Tabs defaultValue={currentQuestion.toString()} onValueChange={(value) => navigateToQuestion(parseInt(value))}>
                  <TabsList className="w-full justify-start overflow-x-auto">
                    {assessmentData.questions.map((_, index) => (
                      <TabsTrigger key={index} value={index.toString()}>
                        Question {index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Question {currentQuestion + 1}/{assessmentData.questions.length}</Badge>
                    <Badge variant="outline">{getCurrentQuestion().points} points</Badge>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleHintRequest(getCurrentQuestion().id)}
                    disabled={(hintsUsed[getCurrentQuestion().id] || 0) >= getCurrentQuestion().hints.length}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Hint ({(hintsUsed[getCurrentQuestion().id] || 0)}/{getCurrentQuestion().hints.length})
                  </Button>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{getCurrentQuestion().text}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderQuestion(getCurrentQuestion())}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => navigateToQuestion(currentQuestion - 1)}
                      disabled={currentQuestion === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    {!showFeedback ? (
                      <Button 
                        onClick={handleSubmitAnswer}
                        disabled={!answers[getCurrentQuestion().id]}
                      >
                        Check Answer
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion}>
                        {currentQuestion < assessmentData.questions.length - 1 ? (
                          <>
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          'Finish Assessment'
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
                
                {showFeedback && renderFeedback(getCurrentQuestion())}
              </div>
            </main>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {renderResults()}
          </div>
        )}
      </div>
      
      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {Object.keys(answers).length} out of {assessmentData.questions.length} questions.
              {Object.keys(answers).length < assessmentData.questions.length && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  Warning: You have {assessmentData.questions.length - Object.keys(answers).length} unanswered questions.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitAssessment}>Submit Assessment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}