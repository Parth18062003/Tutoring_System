"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import ContentActions from "./content-action";
import { Markdown } from "./markdown";
import {
  BookOpen,
  Info,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  ListTree,
  Brain,
  MapPin,
  Target,
  Compass,
  Check,
  ArrowLeft,
  ArrowRight,
  LightbulbIcon,
  PanelRight,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

// Define scenario section type
interface ScenarioSection {
  sectionType: string;
  title: string;
  contentMarkdown: string;
  questions?: string[];
  concepts?: string[];
}

interface SavedScenarioContent {
  content_id: string;
  user_id: string;
  content_type: string;
  created_at: any;
  favorite: boolean;
  last_viewed_at: any;
  metadata: {
    strategy?: string;
    difficulty?: string;
    scaffolding?: string;
    feedback_style?: string;
    mastery_at_save?: number;
    [key: string]: any;
  };
  notes: string;
  sections: ScenarioSection[];
  subject: string;
  title: string;
  topic: string;
  [key: string]: any;
}

interface SavedScenarioViewerProps {
  content: SavedScenarioContent;
  onBack?: () => void;
}

// Define section types for the scenario
const SCENARIO_SECTIONS = [
  { type: "scenario_introduction", title: "The Scenario", icon: Briefcase },
  { type: "scenario_context", title: "Context", icon: MapPin },
  { type: "challenge_points", title: "Challenges", icon: Target },
  { type: "guided_exploration", title: "Exploration", icon: Compass },
  { type: "reflection_questions", title: "Reflection Questions", icon: Brain },
];

export function SavedScenarioViewer({ content, onBack }: SavedScenarioViewerProps) {
  // State for scenario
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"scenario" | "all" | "info">("scenario");
  const [showReflectionAnswers, setShowReflectionAnswers] = useState<boolean[]>([]);
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [readingProgress, setReadingProgress] = useState(0);
  const [expandedConcepts, setExpandedConcepts] = useState<boolean>(false);

  // Process scenario sections when component loads
  const sections = content?.sections || [];

  // Group sections by type
  const groupedSections = sections.reduce<Record<string, ScenarioSection[]>>((acc, section) => {
    const matchedSection = SCENARIO_SECTIONS.find(s => section.sectionType === s.type);
    
    if (matchedSection) {
      const key = matchedSection.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(section);
    } else {
      if (!acc["other"]) acc["other"] = [];
      acc["other"].push(section);
    }
    
    return acc;
  }, {});

  // Extract reflection questions
  const reflectionQuestions = sections.find(
    section => section.sectionType === "reflection_questions"
  )?.questions || [];

  const reflectionConcepts = sections.find(
    section => section.sectionType === "reflection_questions"
  )?.concepts || [];

  // Initialize reflection state when questions are loaded
  useEffect(() => {
    if (reflectionQuestions.length > 0) {
      setShowReflectionAnswers(new Array(reflectionQuestions.length).fill(false));
    }
  }, [reflectionQuestions]);

  // Navigation functions
  const goToStep = (step: number) => {
    if (step >= 0 && step <= SCENARIO_SECTIONS.length) {
      setCurrentStep(step);
    }
  };

  // Update reflection responses
  const handleReflectionChange = (index: number, value: string) => {
    setReflectionAnswers(prev => ({
      ...prev,
      [index]: value
    }));
    
    if (value.length > 10) {
      setCompletedSteps(prev => new Set([...prev, index]));
    }
    updateProgress();
  };

  // Toggle reflection answers visibility
  const toggleAnswerVisibility = (index: number) => {
    const newVisibility = [...showReflectionAnswers];
    newVisibility[index] = !newVisibility[index];
    setShowReflectionAnswers(newVisibility);
  };

  // Calculate progress
  const updateProgress = () => {
    const sectionsCompleted = completedSteps.size;
    const responsesCompleted = Object.values(reflectionAnswers).filter(r => r.length > 10).length;
    
    // Weight: 70% for sections viewed, 30% for reflection questions answered
    const sectionProgress = (sectionsCompleted / SCENARIO_SECTIONS.length) * 70;
    const responseProgress = reflectionQuestions.length > 0 ? 
      (responsesCompleted / reflectionQuestions.length) * 30 : 0;
    
    setReadingProgress(Math.min(100, sectionProgress + responseProgress));
  };

  // Update progress when completed steps or answers change
  useEffect(() => {
    updateProgress();
  }, [completedSteps, reflectionAnswers]);

  // Format time display
  const formatDate = (dateString?: any): string => {
    if (!dateString) return "Unknown date";
    const date = dateString.$date ? new Date(dateString.$date) : new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Generate combined content for export
  const getCombinedContent = () => {
    if (!sections.length) return "";

    return sections.map(section => {
      let content = `# ${section.title || section.sectionType}\n\n${section.contentMarkdown}`;
      
      if (section.sectionType === "reflection_questions" && section.questions?.length) {
        content += "\n\n## Reflection Questions\n";
        section.questions.forEach((q, i) => {
          content += `\n${i+1}. ${q}`;
        });
        
        if (section.concepts?.length) {
          content += "\n\n## Key Concepts\n";
          section.concepts.forEach(c => {
            content += `\n- ${c}`;
          });
        }
      }
      
      return content;
    }).join("\n\n---\n\n");
  };

  // Get icon for section
  const getSectionIcon = (type: string) => {
    const sectionDef = SCENARIO_SECTIONS.find(s => s.type === type);
    if (sectionDef) {
      const IconComponent = sectionDef.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Briefcase className="h-4 w-4" />;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:self-start">
        <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h3 className="font-medium text-sm truncate flex-1">{content.topic}</h3>
          </div>

          {/* Progress indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>
          
          <Separator />
          
          {/* Navigation items */}
          <div className="space-y-1">
            <div className="text-sm font-medium mb-2">Scenario Steps</div>
            <div className="space-y-1">
              {SCENARIO_SECTIONS.map((section, index) => {
                const hasContent = groupedSections[section.type]?.length > 0;
                if (!hasContent) return null;

                const isCompleted = completedSteps.has(index);
                const isActive = currentStep === index;

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
          
          <Separator className="my-2" />
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between w-full">
              <span>Saved:</span>
              <span className="text-xs">
                {formatDate(content.created_at)}
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
                  {content.metadata.strategy.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
            {content.metadata?.scaffolding && (
              <div className="flex justify-between w-full">
                <span>Scaffolding:</span>
                <Badge variant="outline" className="font-normal">
                  {content.metadata.scaffolding}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* View options */}
        <div className="flex justify-between mb-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab as any}
            className="w-full"
          >
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
                <TabsTrigger value="info">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span className="hidden sm:inline">Info</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          <ContentActions
            content={getCombinedContent()}
            filename={`${content.subject}-${content.topic}-scenario`}
          />
        </div>

        {/* No content message */}
        {sections.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p>No scenario content available.</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          {/* Interactive Scenario Tab - Step-by-Step */}
          <TabsContent value="scenario" className="mt-0 outline-none">
            {sections.length > 0 && (
              <>
                {/* Display current step */}
                {SCENARIO_SECTIONS.map((sectionDef, index) => {
                  // Only render the current step
                  if (index !== currentStep) return null;

                  const sections = groupedSections[sectionDef.type] || [];
                  if (sections.length === 0) return null;

                  return (
                    <div
                      key={sectionDef.type}
                      id={sectionDef.type}
                      className="space-y-6"
                    >
                      <Card className="border shadow-sm mb-4">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <span className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <span>{sectionDef.title}</span>
                            </CardTitle>
                            <Badge variant="outline">
                              Step {index + 1} of {SCENARIO_SECTIONS.filter(section => 
                                groupedSections[section.type]?.length > 0).length}
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
                                sectionDef.type === "reflection_questions" &&
                                  "space-y-8"
                              )}
                            >
                              <Markdown>
                                {section.contentMarkdown}
                              </Markdown>

                              {/* Special handling for reflection questions */}
                              {sectionDef.type === "reflection_questions" && reflectionQuestions.length > 0 && (
                                <div className="space-y-8 mt-6">
                                  {reflectionQuestions.map((question, qIndex) => (
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
                                          value={reflectionAnswers[qIndex] || ''}
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
                                            <p className="font-medium mb-2">
                                              Thinking Points:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1">
                                              {reflectionConcepts
                                                .slice(0, 3)
                                                .map((concept, cIndex) => (
                                                  <li
                                                    key={`hint-${qIndex}-${cIndex}`}
                                                  >
                                                    {concept}
                                                  </li>
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
                                        <Button
                                          variant="ghost"
                                          className="w-full flex justify-between p-0 h-auto"
                                        >
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
                                          {reflectionConcepts.map((concept, index) => (
                                            <li
                                              key={`concept-${index}`}
                                              className="flex items-start gap-2"
                                            >
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
                            <ChevronLeft className="h-4 w-4" />
                            <span>Previous</span>
                          </Button>
                          
                          <Button
                            variant="default"
                            onClick={() => {
                              // Mark current step as completed when moving forward
                              setCompletedSteps(prev => new Set([...prev, currentStep]));
                              goToStep(currentStep + 1);
                            }}
                            disabled={currentStep === SCENARIO_SECTIONS.filter(section => 
                              groupedSections[section.type]?.length > 0).length - 1}
                            className="flex items-center gap-1"
                          >
                            <span>Continue</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  );
                })}

                {/* Completion card (shown when all steps are completed) */}
                {currentStep === SCENARIO_SECTIONS.filter(section => 
                  groupedSections[section.type]?.length > 0).length && (
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
                        This scenario has helped you understand {content.topic} through practical application. 
                        You've explored the challenges, worked through solutions, and reflected on key concepts.
                      </p>

                      {Object.keys(reflectionAnswers).length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Your Reflections:</h4>
                          {Object.entries(reflectionAnswers).map(([index, response]) =>
                            response.trim().length > 0 ? (
                              <div
                                key={`summary-${index}`}
                                className="text-sm border-l-2 border-primary pl-3 py-1"
                              >
                                <p className="font-medium text-xs text-muted-foreground mb-1">
                                  Question {Number(index) + 1}:
                                </p>
                                <p>{response}</p>
                              </div>
                            ) : null
                          )}
                        </div>
                      )}

                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Key Concepts Covered:</h4>
                        <div className="flex flex-wrap gap-2">
                          {reflectionConcepts.map((concept, index) => (
                            <Badge
                              key={`concept-badge-${index}`}
                              variant="outline" 
                              className="bg-primary/10"
                            >
                              {concept.split(" ").slice(0, 3).join(" ")}
                              {concept.split(" ").length > 3 && "..."}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-4">
                      <Button
                        variant="outline"
                        onClick={() => goToStep(SCENARIO_SECTIONS.filter(section => 
                          groupedSections[section.type]?.length > 0).length - 1)}
                        className="flex items-center gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Reflections</span>
                      </Button>

                      {onBack && (
                        <Button
                          variant="default"
                          onClick={onBack}
                          className="flex items-center gap-1"
                        >
                          <span>Exit Scenario</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Full View Tab - All content at once */}
          <TabsContent value="all" className="mt-0 outline-none">
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
                            {sectionDef.type === "reflection_questions" &&
                              reflectionQuestions.length > 0 && (
                                <div className="space-y-4 mt-6">
                                  <h4 className="font-medium">Reflection Questions:</h4>
                                  <ol className="list-decimal list-inside space-y-2">
                                    {reflectionQuestions.map((question, qIndex) => (
                                      <li key={`all-question-${qIndex}`}>
                                        {question}
                                      </li>
                                    ))}
                                  </ol>

                                  <Separator className="my-4" />

                                  <h4 className="font-medium">Key Concepts:</h4>
                                  <ul className="list-disc list-inside space-y-1">
                                    {reflectionConcepts.map((concept, index) => (
                                      <li key={`all-concept-${index}`}>
                                        {concept}
                                      </li>
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

          {/* Info Tab - Metadata and additional info */}
          <TabsContent value="info" className="mt-0 outline-none">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Scenario Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-medium mb-2">Basic Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Topic:</span>
                        <span className="font-medium">{content.topic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subject:</span>
                        <span className="font-medium">{content.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date Saved:</span>
                        <span className="font-medium">{formatDate(content.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Learning Design</h4>
                    <div className="space-y-2">
                      {content.metadata?.strategy && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Strategy:</span>
                          <span className="font-medium">{content.metadata.strategy.replace(/_/g, " ")}</span>
                        </div>
                      )}
                      {content.metadata?.difficulty && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className="font-medium">{content.metadata.difficulty}</span>
                        </div>
                      )}
                      {content.metadata?.scaffolding && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scaffolding:</span>
                          <span className="font-medium">{content.metadata.scaffolding}</span>
                        </div>
                      )}
                      {content.metadata?.mastery_at_save !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mastery Level:</span>
                          <span className="font-medium">{Math.round(content.metadata.mastery_at_save * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Scenario Content Overview</h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="space-y-2">
                      {SCENARIO_SECTIONS.map((section) => {
                        const sectionExists = groupedSections[section.type]?.length > 0;
                        return (
                          <div key={section.type} className="flex items-center">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                              {sectionExists ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-muted" />
                              )}
                            </div>
                            <span className={sectionExists ? "" : "text-muted-foreground"}>
                              {section.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {reflectionConcepts.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Key Learning Concepts</h4>
                    <div className="flex flex-wrap gap-2">
                      {reflectionConcepts.map((concept, index) => (
                        <Badge key={index} variant="outline" className="bg-primary/10">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}