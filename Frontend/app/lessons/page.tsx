"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  BookmarkCheck, 
  Download, 
  Printer, 
  Search,
  CheckCircle,
  XCircle,
  HelpCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Sample lesson data - in a real app, this would come from an API or database
const lessonData = {
  id: "intro-to-photosynthesis",
  title: "Introduction to Photosynthesis",
  estimatedTime: 25,
  learningObjectives: [
    "Explain the basic chemical process of photosynthesis",
    "Identify the key structures in a plant cell involved in photosynthesis",
    "Describe how light energy is converted to chemical energy"
  ],
  prerequisites: ["Basic understanding of plant biology", "Familiarity with cell structures"],
  sections: [
    {
      id: "what-is-photosynthesis",
      title: "What is Photosynthesis?",
      content: `
        <p>Photosynthesis is the process used by plants, algae, and certain bacteria to convert light energy, usually from the sun, into chemical energy in the form of glucose (or sugar).</p>
        
        <p>This process is vital for life on Earth as it provides the oxygen we breathe and the food we eat. The basic chemical equation for photosynthesis is:</p>
        
        <div class="my-4 p-4 bg-muted rounded-md text-center font-medium">
          6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂
        </div>
        
        <p>In simpler terms, plants take in carbon dioxide, water, and sunlight to produce glucose and oxygen.</p>
      `
    },
    {
      id: "plant-structures",
      title: "Plant Structures Involved",
      content: `
        <p>Several specialized structures within plant cells are essential for photosynthesis:</p>
        
        <ul class="list-disc pl-6 space-y-2 my-4">
          <li><strong>Chloroplasts</strong>: The primary site of photosynthesis in plants</li>
          <li><strong>Thylakoids</strong>: Membrane structures inside chloroplasts where light-dependent reactions occur</li>
          <li><strong>Stroma</strong>: Fluid-filled area inside chloroplasts where light-independent reactions take place</li>
          <li><strong>Chlorophyll</strong>: Green pigment that absorbs light energy</li>
        </ul>
        
        <p>The image below shows a detailed view of a chloroplast:</p>
      `
    },
    {
      id: "light-dependent-reactions",
      title: "Light-Dependent Reactions",
      content: `
        <p>The first stage of photosynthesis involves capturing light energy and converting it to chemical energy:</p>
        
        <ol class="list-decimal pl-6 space-y-2 my-4">
          <li>Light is absorbed by chlorophyll in the thylakoid membrane</li>
          <li>Energized electrons move through the electron transport chain</li>
          <li>ATP (adenosine triphosphate) is produced</li>
          <li>Water molecules are split, releasing oxygen as a byproduct</li>
          <li>NADPH is formed, which carries energy to the next stage</li>
        </ol>
        
        <p>This video explains the light-dependent reactions in detail:</p>
      `
    },
    {
      id: "calvin-cycle",
      title: "The Calvin Cycle",
      content: `
        <p>The Calvin Cycle (or light-independent reactions) is the second stage of photosynthesis:</p>
        
        <ol class="list-decimal pl-6 space-y-2 my-4">
          <li>Carbon dioxide enters the cycle</li>
          <li>ATP and NADPH from the light-dependent reactions provide energy</li>
          <li>Carbon dioxide is converted into glucose through a series of chemical reactions</li>
          <li>The cycle regenerates the initial compounds to continue the process</li>
        </ol>
        
        <p>The diagram below illustrates the Calvin Cycle:</p>
      `
    },
    {
      id: "real-world-applications",
      title: "Real-World Applications",
      content: `
        <p>Understanding photosynthesis has numerous practical applications:</p>
        
        <ul class="list-disc pl-6 space-y-2 my-4">
          <li><strong>Agriculture</strong>: Optimizing crop yields by understanding factors that affect photosynthesis</li>
          <li><strong>Renewable Energy</strong>: Developing artificial photosynthesis for sustainable energy production</li>
          <li><strong>Climate Science</strong>: Understanding carbon sequestration and the role of plants in climate regulation</li>
          <li><strong>Biotechnology</strong>: Engineering plants with enhanced photosynthetic capabilities</li>
        </ul>
        
        <p>For example, scientists are working on creating more efficient crops by improving photosynthetic pathways, which could help address global food security challenges.</p>
      `
    }
  ],
  checkpoints: [
    {
      id: "checkpoint-1",
      position: 1,
      question: "What is the primary function of photosynthesis?",
      type: "multiple-choice",
      options: [
        "To release carbon dioxide into the atmosphere",
        "To convert light energy into chemical energy",
        "To break down glucose for energy",
        "To absorb oxygen from the air"
      ],
      correctAnswer: 1,
      explanation: "Photosynthesis converts light energy (usually from the sun) into chemical energy in the form of glucose, which plants use for growth and energy storage."
    },
    {
      id: "checkpoint-2",
      position: 2,
      question: "Which structure in plant cells is the primary site of photosynthesis?",
      type: "multiple-choice",
      options: [
        "Mitochondria",
        "Nucleus",
        "Chloroplast",
        "Ribosome"
      ],
      correctAnswer: 2,
      explanation: "Chloroplasts are specialized organelles that contain chlorophyll and are the primary sites where photosynthesis occurs in plant cells."
    },
    {
      id: "checkpoint-3",
      position: 3,
      question: "The Calvin Cycle requires inputs from the light-dependent reactions to function.",
      type: "true-false",
      correctAnswer: true,
      explanation: "True. The Calvin Cycle uses ATP and NADPH produced during the light-dependent reactions to convert carbon dioxide into glucose."
    },
    {
      id: "checkpoint-4",
      position: 4,
      question: "Briefly explain one real-world application of understanding photosynthesis.",
      type: "short-answer",
      sampleAnswer: "Understanding photosynthesis helps in developing more efficient crops with enhanced photosynthetic capabilities, which can increase food production to address global food security challenges.",
      explanation: "There are many applications, including agricultural improvements, artificial photosynthesis for renewable energy, and understanding carbon sequestration for climate science."
    }
  ],
  interactiveElements: [
    {
      id: "drag-drop-chloroplast",
      type: "drag-drop",
      title: "Identify Chloroplast Structures",
      description: "Drag the labels to the correct structures in the chloroplast diagram.",
      items: [
        { id: "thylakoid", label: "Thylakoid" },
        { id: "stroma", label: "Stroma" },
        { id: "outer-membrane", label: "Outer Membrane" },
        { id: "inner-membrane", label: "Inner Membrane" },
        { id: "granum", label: "Granum" }
      ]
    },
    {
      id: "hotspot-leaf",
      type: "hotspot",
      title: "Explore a Leaf Cross-Section",
      description: "Click on different parts of the leaf to learn about their role in photosynthesis.",
      hotspots: [
        { id: "upper-epidermis", label: "Upper Epidermis", content: "Protective layer that allows light to pass through" },
        { id: "palisade-mesophyll", label: "Palisade Mesophyll", content: "Contains many chloroplasts for maximum photosynthesis" },
        { id: "spongy-mesophyll", label: "Spongy Mesophyll", content: "Allows gas exchange and contains some chloroplasts" },
        { id: "lower-epidermis", label: "Lower Epidermis", content: "Contains stomata for gas exchange" },
        { id: "stomata", label: "Stomata", content: "Pores that allow carbon dioxide in and oxygen out" }
      ]
    }
  ],
  keyTerms: [
    {
      term: "Photosynthesis",
      definition: "The process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water."
    },
    {
      term: "Chlorophyll",
      definition: "A green pigment found in chloroplasts that absorbs light energy used in photosynthesis."
    },
    {
      term: "ATP",
      definition: "Adenosine triphosphate, a molecule that stores and transfers energy within cells."
    },
    {
      term: "Calvin Cycle",
      definition: "The light-independent reactions of photosynthesis where carbon dioxide is converted into glucose."
    },
    {
      term: "Thylakoid",
      definition: "Membrane structures inside chloroplasts where the light-dependent reactions of photosynthesis take place."
    }
  ],
  relatedLessons: [
    { id: "cellular-respiration", title: "Cellular Respiration: How Cells Use Glucose" },
    { id: "plant-anatomy", title: "Plant Anatomy and Physiology" },
    { id: "light-spectrum", title: "The Light Spectrum and Photosynthesis" }
  ]
};

export default function LessonPage() {
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Handle section navigation
  const navigateToSection = (index: number) => {
    if (index >= 0 && index < lessonData.sections.length) {
      setCurrentSection(index);
      // Update progress based on current section
      setProgress(Math.round(((index + 1) / lessonData.sections.length) * 100));
      
      // Scroll to top of content
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  };

  // Handle bookmark toggle
  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    toast({
      title: bookmarked ? "Bookmark removed" : "Lesson bookmarked",
      description: bookmarked 
        ? "This lesson has been removed from your bookmarks." 
        : "You can access this lesson later from your bookmarks.",
      duration: 3000,
    });
  };

  // Handle checkpoint answer submission
  const handleCheckpointAnswer = (checkpointId: string, answer: any) => {
    setCheckpointAnswers({
      ...checkpointAnswers,
      [checkpointId]: answer
    });
  };

  // Check if answer is correct
  const isAnswerCorrect = (checkpoint: any) => {
    const userAnswer = checkpointAnswers[checkpoint.id];
    
    if (!userAnswer) return null;
    
    if (checkpoint.type === "multiple-choice") {
      return userAnswer === checkpoint.correctAnswer;
    } else if (checkpoint.type === "true-false") {
      return userAnswer === checkpoint.correctAnswer;
    }
    
    // For short answer, we'll just acknowledge submission
    return true;
  };

  // Show feedback for a checkpoint
  const toggleFeedback = (checkpointId: string) => {
    setShowFeedback({
      ...showFeedback,
      [checkpointId]: !showFeedback[checkpointId]
    });
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle download functionality
  const handleDownload = () => {
    toast({
      title: "Downloading lesson",
      description: "Your lesson is being prepared for download.",
      duration: 3000,
    });
    // In a real app, this would trigger a PDF generation or similar
  };

  // Get checkpoint for current section
  const getCurrentCheckpoint = () => {
    return lessonData.checkpoints.find(cp => cp.position === currentSection + 1);
  };

  // Render checkpoint question
  const renderCheckpoint = (checkpoint: any) => {
    if (!checkpoint) return null;

    return (
      <Card className="my-6 border-primary/20">
        <CardHeader className="bg-primary/5 pb-2">
          <CardTitle className="text-lg flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-primary" />
            Knowledge Check
          </CardTitle>
          <CardDescription>
            Test your understanding of this section
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4 font-medium">{checkpoint.question}</div>
          
          {checkpoint.type === "multiple-choice" && (
            <RadioGroup 
              value={checkpointAnswers[checkpoint.id]?.toString()} 
              onValueChange={(value) => handleCheckpointAnswer(checkpoint.id, parseInt(value))}
              className="space-y-2"
            >
              {checkpoint.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {checkpoint.type === "true-false" && (
            <RadioGroup 
              value={checkpointAnswers[checkpoint.id]?.toString()} 
              onValueChange={(value) => handleCheckpointAnswer(checkpoint.id, value === "true")}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false">False</Label>
              </div>
            </RadioGroup>
          )}
          
          {checkpoint.type === "short-answer" && (
            <div className="space-y-4">
              <textarea 
                className="w-full min-h-[100px] p-3 border rounded-md"
                placeholder="Type your answer here..."
                value={checkpointAnswers[checkpoint.id] || ""}
                onChange={(e) => handleCheckpointAnswer(checkpoint.id, e.target.value)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => toggleFeedback(checkpoint.id)}
            disabled={!checkpointAnswers[checkpoint.id]}
          >
            Check Answer
          </Button>
          
          {showFeedback[checkpoint.id] && (
            <div className="flex items-center">
              {isAnswerCorrect(checkpoint) !== null && (
                isAnswerCorrect(checkpoint) ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )
              )}
              <span className={isAnswerCorrect(checkpoint) ? "text-green-500" : "text-red-500"}>
                {checkpoint.type === "short-answer" ? "Answer submitted" : (isAnswerCorrect(checkpoint) ? "Correct!" : "Try again")}
              </span>
            </div>
          )}
        </CardFooter>
        
        {showFeedback[checkpoint.id] && (
          <div className="px-6 pb-6">
            <Accordion type="single" collapsible>
              <AccordionItem value="explanation">
                <AccordionTrigger>
                  <span className="text-primary">Explanation</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 bg-muted rounded-md">
                    {checkpoint.explanation}
                    {checkpoint.type === "short-answer" && (
                      <div className="mt-4">
                        <p className="font-medium">Sample answer:</p>
                        <p className="italic">{checkpoint.sampleAnswer}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </Card>
    );
  };

  // Render interactive elements
  const renderInteractiveElement = (element: any) => {
    if (element.type === "drag-drop") {
      return (
        <Card className="my-6 border-primary/20">
          <CardHeader className="bg-primary/5 pb-2">
            <CardTitle className="text-lg">{element.title}</CardTitle>
            <CardDescription>{element.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative w-full aspect-video bg-muted rounded-md flex items-center justify-center">
              <Image 
                src="https://images.unsplash.com/photo-1594904351111-a072f80b1a71?q=80&w=800&auto=format&fit=crop" 
                alt="Chloroplast diagram"
                width={600}
                height={400}
                className="rounded-md"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white bg-black/50 p-2 rounded">Interactive diagram would appear here</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {element.items.map((item: any) => (
                <Badge key={item.id} variant="outline" className="py-2 px-3 cursor-move">
                  {item.label}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Reset</Button>
          </CardFooter>
        </Card>
      );
    } else if (element.type === "hotspot") {
      return (
        <Card className="my-6 border-primary/20">
          <CardHeader className="bg-primary/5 pb-2">
            <CardTitle className="text-lg">{element.title}</CardTitle>
            <CardDescription>{element.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative w-full aspect-video bg-muted rounded-md flex items-center justify-center">
              <Image 
                src="https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?q=80&w=800&auto=format&fit=crop" 
                alt="Leaf cross-section"
                width={600}
                height={400}
                className="rounded-md"
              />
              <div className="absolute inset-0">
                {element.hotspots.map((hotspot: any, index: number) => (
                  <div 
                    key={hotspot.id}
                    className="absolute w-8 h-8 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/40 transition-colors"
                    style={{ 
                      top: `${20 + (index * 15)}%`, 
                      left: `${20 + (index * 15)}%` 
                    }}
                  >
                    <span className="text-primary font-bold">{index + 1}</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="absolute inset-0 rounded-full"></div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{hotspot.label}</DialogTitle>
                          <DialogDescription>
                            {hotspot.content}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen px-8">
      {/* Header with navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="ml-2 text-sm font-medium">Back to Dashboard</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleBookmark}
                className={bookmarked ? "text-primary" : ""}
              >
                {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePrint}>
                <Printer className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
            <Progress value={progress} className="w-24 h-2" />
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
        </div>
        {showSearch && (
          <div className="border-t py-2 px-4">
            <div className="container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10"
                  placeholder="Search within this lesson..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="container py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar with lesson info and navigation */}
        <aside className="md:col-span-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{lessonData.title}</h1>
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">{lessonData.estimatedTime} minutes</span>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium mb-2">Learning Objectives</h2>
            <ul className="space-y-2">
              {lessonData.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-1 text-primary" />
                  <span className="text-sm">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {lessonData.prerequisites.length > 0 && (
            <div>
              <h2 className="text-sm font-medium mb-2">Prerequisites</h2>
              <ul className="space-y-2">
                {lessonData.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="flex items-start">
                    <BookOpen className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <span className="text-sm">{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="hidden md:block">
            <h2 className="text-sm font-medium mb-2">Lesson Sections</h2>
            <nav className="space-y-1">
              {lessonData.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => navigateToSection(index)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    currentSection === index 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                >
                  {index + 1}. {section.title}
                </button>
              ))}
            </nav>
          </div>

          <div className="hidden md:block">
            <h2 className="text-sm font-medium mb-2">Key Terms</h2>
            <div className="space-y-3">
              {lessonData.keyTerms.map((term) => (
                <div key={term.term} className="text-sm">
                  <span className="font-medium">{term.term}</span>: {term.definition}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="md:col-span-3" ref={contentRef}>
          <div className="space-y-8">
            <div className="md:hidden">
              <Tabs defaultValue={currentSection.toString()} onValueChange={(value) => navigateToSection(parseInt(value))}>
                <TabsList className="w-full justify-start overflow-x-auto">
                  {lessonData.sections.map((section, index) => (
                    <TabsTrigger key={section.id} value={index.toString()}>
                      {index + 1}. {section.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">{lessonData.sections[currentSection].title}</h2>
              
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: lessonData.sections[currentSection].content }}
              />

              {/* Images for each section */}
              {currentSection === 1 && (
                <div className="my-6">
                  <Image 
                    src="https://images.unsplash.com/photo-1594904351111-a072f80b1a71?q=80&w=800&auto=format&fit=crop" 
                    alt="Chloroplast structure"
                    width={800}
                    height={500}
                    className="rounded-md"
                  />
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Figure 1: Structure of a chloroplast showing thylakoids and stroma
                  </p>
                </div>
              )}

              {currentSection === 2 && (
                <div className="my-6">
                  <div className="aspect-video relative">
                    <iframe 
                      className="absolute inset-0 w-full h-full rounded-md"
                      src="https://www.youtube.com/embed/sQK3Yr4Sc_k" 
                      title="Light-Dependent Reactions of Photosynthesis"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Video: The Light-Dependent Reactions of Photosynthesis
                  </p>
                </div>
              )}

              {currentSection === 3 && (
                <div className="my-6">
                  <Image 
                    src="https://images.unsplash.com/photo-1635002065541-0c7822e7a9fa?q=80&w=800&auto=format&fit=crop" 
                    alt="Calvin Cycle diagram"
                    width={800}
                    height={500}
                    className="rounded-md"
                  />
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Figure 2: The Calvin Cycle (Light-Independent Reactions)
                  </p>
                </div>
              )}

              {/* Interactive elements */}
              {currentSection === 1 && renderInteractiveElement(lessonData.interactiveElements[0])}
              {currentSection === 3 && renderInteractiveElement(lessonData.interactiveElements[1])}

              {/* Key terms sidebar for specific sections */}
              {(currentSection === 0 || currentSection === 2) && (
                <div className="bg-muted/30 border-l-4 border-primary p-4 my-6 rounded-r-md">
                  <h3 className="font-medium flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    Key Concept
                  </h3>
                  <p className="mt-2 text-sm">
                    {currentSection === 0 
                      ? "Photosynthesis is the foundation of nearly all food chains on Earth. Without this process, most life forms would not exist as we know them today."
                      : "The light-dependent reactions and Calvin Cycle work together in a continuous cycle. The products of the light-dependent reactions (ATP and NADPH) are used in the Calvin Cycle, which then regenerates the molecules needed for the light-dependent reactions to continue."
                    }
                  </p>
                </div>
              )}

              {/* Checkpoint questions */}
              {getCurrentCheckpoint() && renderCheckpoint(getCurrentCheckpoint())}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigateToSection(currentSection - 1)}
                disabled={currentSection === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <Button
                onClick={() => navigateToSection(currentSection + 1)}
                disabled={currentSection === lessonData.sections.length - 1}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Related lessons */}
          <div className="mt-12 pt-6 border-t">
            <h2 className="text-xl font-bold mb-4">Related Lessons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lessonData.relatedLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{lesson.title}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}