"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";
import ContentActions from "./content-action";
import {
  Info,
  Lightbulb,
  Calculator,
  FileQuestion,
  Hash,
  ChevronRight,
  PrinterIcon,
} from "lucide-react";

// Define section types for the cheatsheet
const CHEATSHEET_SECTIONS = [
  { type: "cheatsheet_introduction", title: "Overview", icon: Info },
  { type: "key_concepts", title: "Key Concepts", icon: Lightbulb },
  { type: "formulas_rules", title: "Formulas & Rules", icon: Calculator },
  { type: "examples_applications", title: "Examples", icon: FileQuestion },
  { type: "quick_reference", title: "Quick Reference", icon: Hash },
];

interface CheatsheetSection {
    sectionType: string;
    title?: string;
    contentMarkdown: string;
    [key: string]: any;
  }
  
  interface CheatsheetContent {
    sections?: CheatsheetSection[];
    topic?: string;
    subject?: string;
    contentType?: string;
    created_at?: string;
    metadata?: {
      difficulty?: string;
      strategy?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }
  
  interface SavedCheatsheetViewerProps {
    content: CheatsheetContent;
  }

export function SavedCheatsheetViewer({ content }: SavedCheatsheetViewerProps) {
  // Find which sections are available in the content
  const availableSectionTypes = (content.sections || [])
    .map(section => section.sectionType)
    .filter(type => CHEATSHEET_SECTIONS.some(s => s.type === type));
  
  // Set default active tab to the first available section
  const defaultActiveTab = availableSectionTypes[0] || "cheatsheet_introduction";
  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab);
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Group sections by type
  const groupedSections = (content.sections || []).reduce<Record<string, any[]>>(
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
  );

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

  // Combine markdown content for export/print
  const getCombinedContent = () => {
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

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      // Reset after printing
      setTimeout(() => setIsPrintMode(false), 500);
    }, 100);
  };

  // Empty state check
  if (!content.sections || content.sections.length === 0) {
    return (
      <Card className="p-6">
        <CardContent className="text-center py-8">
          <p>This cheatsheet contains no content.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(
      "flex flex-col md:flex-row gap-4",
      isPrintMode && "print-mode" // Add custom styling for print mode
    )}>
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:self-start print:hidden">
        <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
          <h3 className="font-medium text-sm mb-2">Cheatsheet</h3>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Topic</div>
            <Badge variant="outline" className="font-normal">
              {content.topic || "Unknown Topic"}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Subject</div>
            <Badge variant="outline" className="font-normal">
              {content.subject || "Unknown Subject"}
            </Badge>
          </div>
          
          <Separator className="my-2" />
          
          {/* Navigation items */}
          <div className="space-y-1">
            <div className="text-sm font-medium mb-2">Sections</div>
            <ScrollArea className="h-[250px]">
              <div className="space-y-1">
                {CHEATSHEET_SECTIONS.map((section) => {
                  const hasContent = groupedSections[section.type]?.length > 0;
                  if (!hasContent) return null;
                  
                  return (
                    <Button
                      key={section.type}
                      variant={activeTab === section.type ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left text-xs",
                      )}
                      onClick={() => setActiveTab(section.type)}
                    >
                      <div className="flex items-center gap-2">
                        {getSectionIcon(section.type)}
                        <span>{section.title}</span>
                      </div>
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
                  {content.metadata.strategy.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {!isPrintMode ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Header tabs and actions */}
            <div className="flex items-center justify-between mb-4 print:hidden">
              <TabsList className="h-9">
                {CHEATSHEET_SECTIONS.map((section) => {
                  const hasContent = groupedSections[section.type]?.length > 0;
                  if (!hasContent) return null;
                  
                  return (
                    <TabsTrigger 
                      key={section.type} 
                      value={section.type}
                      aria-label={`View ${section.title} section`}
                    >
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-1"
                  aria-label="Print cheatsheet"
                >
                  <PrinterIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <ContentActions
                  content={getCombinedContent()}
                  filename={`${content.subject || "subject"}-${content.topic || "topic"}-cheatsheet`}
                />
              </div>
            </div>

            {/* Content tabs */}
            {CHEATSHEET_SECTIONS.map((sectionDef) => {
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
                              <Markdown>
                                {section.contentMarkdown || "No content available."}
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
          </Tabs>
        ) : (
          // Print mode - show all content in one view
          <div className="space-y-8 print-content">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">{content.topic || "Cheatsheet"}</h1>
              <p className="text-muted-foreground">{content.subject || ""}</p>
            </div>
            
            {CHEATSHEET_SECTIONS.map((sectionDef) => {
              const sections = groupedSections[sectionDef.type] || [];
              if (sections.length === 0) return null;
              
              return (
                <div key={`print-${sectionDef.type}`} className="mb-8 page-break-inside-avoid">
                  <h2 className="text-xl font-bold mb-4 border-b pb-2">{sectionDef.title}</h2>
                  <div className="space-y-4">
                    {sections.map((section, index) => (
                      <div key={`print-${sectionDef.type}-${index}`}>
                        {section.title && section.title !== sectionDef.title && (
                          <h3 className="text-lg font-medium mb-2">{section.title}</h3>
                        )}
                        <div className={cn(
                          sectionDef.type === "formulas_rules" && "font-mono text-sm",
                          sectionDef.type === "quick_reference" && "space-y-2"
                        )}>
                          <Markdown>{section.contentMarkdown || ""}</Markdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            <div className="text-xs text-center text-muted-foreground mt-8 pt-4 border-t">
              Generated via Adaptive Learning System
            </div>
          </div>
        )}
      </div>
    </div>
  );
}