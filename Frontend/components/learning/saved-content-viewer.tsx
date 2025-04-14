"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Markdown } from "./markdown";
import {
  BookOpen,
  ListChecks,
  FileText,
  BookMarked,
  BarChart,
  Info,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ContentActions from "./content-action";

// Define content section interface
interface ContentSection {
  sectionType: string;
  title?: string;
  contentMarkdown: string;
  questionText?: string;
  answerDetail?: string;
}

// Define saved content metadata interface
interface ContentMetadata {
  difficulty?: string;
  strategy?: string;
  [key: string]: any; // For any additional metadata properties
}

// Define saved content interface
interface SavedContent {
  sections?: ContentSection[];
  content_type: string;
  subject: string;
  topic: string;
  metadata?: ContentMetadata;
  created_at?: string;
  [key: string]: any; // For any additional properties
}

// Define props interface for SavedContentViewer
interface SavedContentViewerProps {
  content: SavedContent;
}

// Define props interface for CheckInQuestion
interface CheckInQuestionProps {
  question: string;
  answerDetail: string;
}

export function SavedContentViewer({ content }: SavedContentViewerProps) {
  const [activeTab, setActiveTab] = useState("content");

  // Group sections by type
  const groupedSections = content.sections?.reduce<Record<string, ContentSection[]>>(
    (acc, section) => {
      let type = "content";

      if (section.sectionType.includes("content") || section.sectionType.includes("main")) {
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
    if (!content.sections) return "";

    return content.sections
      .map((section) => {
        let text = "";
        if (section.title) {
          text += `# ${section.title}\n\n`;
        }
        text += section.contentMarkdown;
        return text;
      })
      .join("\n\n---\n\n");
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "content":
      case "introduction":
        return <BookOpen className="h-4 w-4" />;
      case "core concept":
        return <BrainCircuit className="h-4 w-4" />;
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
    <div className="flex flex-col md:flex-row gap-4 max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:self-start">
        <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
          <h3 className="font-medium text-sm mb-2">Saved Content</h3>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Content Type</div>
            <Badge variant="outline" className="font-normal">
              {content.content_type}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Subject</div>
            <Badge variant="outline" className="font-normal">
              {content.subject}
            </Badge>
          </div>
          
          <Separator className="my-2" />
          
          <div className="text-sm font-medium mb-2">Content Sections</div>
          <ScrollArea className="h-[calc(100vh-15rem)] pr-3">
            <div className="space-y-1">
              {Object.entries(groupedSections)
                .filter(([_, sections]) => sections.length > 0)
                .map(([type, _]) => (
                  <div
                    key={type}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-xs rounded-md cursor-pointer hover:bg-accent",
                      activeTab === type && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setActiveTab(type)}
                  >
                    {getSectionIcon(type)}
                    <span className="capitalize">{type}</span>
                  </div>
                ))}
            </div>
          </ScrollArea>
          
          <Separator className="my-2" />
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between w-full">
              <span>Difficulty:</span>
              <Badge variant="outline" className="font-normal">
                {content.metadata?.difficulty || "Normal"}
              </Badge>
            </div>
            <div className="flex justify-between w-full">
              <span>Strategy:</span>
              <Badge variant="outline" className="font-normal">
                {(content.metadata?.strategy || "Explanation").replace("_", " ")}
              </Badge>
            </div>
            <div className="flex justify-between w-full">
              <span>Saved:</span>
              <span className="text-xs">
                {content.created_at 
                  ? new Date(content.created_at).toLocaleDateString() 
                  : "Unknown date"}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList>
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
            
            {content && (
              <ContentActions
                content={getCombinedContent()}
                filename={`${content.subject}-${content.topic}`}
              />
            )}
          </div>
          
          {Object.entries(groupedSections).map(([type, sections]) => (
            <TabsContent key={type} value={type} className="mt-0 outline-none">
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
                        <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                      )}
                      
                      {/* Regular markdown content */}
                      <Markdown>
                        {section.contentMarkdown}
                      </Markdown>
                      
                      {/* Special handling for check-in questions */}
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
        </Tabs>
      </div>
    </div>
  );
}

function CheckInQuestion({ question, answerDetail }: CheckInQuestionProps) {
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
        
        <Card 
          className="p-4 bg-card border rounded-md"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Answer:</h4>
              <div className="font-medium">{correctAnswer}</div>
            </div>
            
            {showAnswer && guidingQuestion && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Guidance:</h4>
                <div className="text-muted-foreground italic">{guidingQuestion}</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}