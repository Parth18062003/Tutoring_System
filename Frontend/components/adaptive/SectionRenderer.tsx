import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ContentSection } from "@/types/adaptive";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  HelpCircle,
  Lightbulb,
  BookOpen,
  Book,
  Code,
  List,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionRendererProps {
    section: ContentSection;
    enhancedRendering?: boolean;
    containerRef?: React.RefObject<HTMLElement | HTMLDivElement | null>;
    isPrintMode?: boolean;
    onVisibilityChange?: (isVisible: boolean) => void;
  }

export function SectionRenderer({
  section,
  enhancedRendering = false,
  containerRef,
  isPrintMode = false,
  onVisibilityChange,
}: SectionRendererProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (!sectionRef.current || !onVisibilityChange) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio > 0.7) {
          onVisibilityChange(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.7,
        rootMargin: "0px 0px -100px 0px", 
      }
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, [onVisibilityChange]);

  const getSectionIcon = () => {
    const iconClassName = "h-5 w-5";

    switch (section.sectionType) {
      case "lesson_introduction":
        return <BookOpen className={cn(iconClassName, "text-blue-500")} />;
      case "lesson_core_concept":
        return <BrainCircuit className={cn(iconClassName, "text-indigo-600")} />;
      case "lesson_example":
        return <Lightbulb className={cn(iconClassName, "text-green-600")} />;
      case "lesson_check_in":
        return <HelpCircle className={cn(iconClassName, "text-amber-500")} />;
      case "lesson_summary":
        return <List className={cn(iconClassName, "text-purple-600")} />;
      default:
        return <BookOpen className={cn(iconClassName, "text-primary")} />;
    }
  };

  const renderSectionContent = () => {
    if (!section) return null;

    switch (section.sectionType) {
      case "lesson_check_in":
        return renderCheckInSection();
      case "lesson_example":
        return renderExampleSection();
      case "lesson_summary":
        return renderSummarySection();
      case "lesson_introduction":
      case "lesson_core_concept":
      default:
        return renderMarkdownContent();
    }
  };

  const renderMarkdownContent = () => {
    return (
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ node, ...props }) => (
              <h1
                className="text-2xl font-bold tracking-tight text-gray-900 mt-4 mb-2"
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="text-xl font-semibold tracking-tight text-gray-900 mt-4 mb-2"
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className="text-lg font-semibold tracking-tight text-gray-900 mt-3 mb-1"
                {...props}
              />
            ),
            p: ({ node, ...props }) => (
              <p className="leading-7 mb-4 text-gray-700" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a className="text-blue-600 hover:underline" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-6 my-4 space-y-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-gray-700" {...props} />
            ),
            blockquote: ({ node, ...props }) => {
              const content = props.children?.toString() || "";
              const isNote =
                content.startsWith("Note:") || content.startsWith("Important:");
              const isWarning =
                content.startsWith("Warning:") ||
                content.startsWith("Caution:");

              let className =
                "border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700";

              if (isNote) {
                className =
                  "border-l-4 border-blue-400 bg-blue-50 p-4 rounded-r my-4";
              } else if (isWarning) {
                className =
                  "border-l-4 border-amber-400 bg-amber-50 p-4 rounded-r my-4";
              }

              return <blockquote className={className} {...props} />;
            },
            code: ({ node, ...props }) => (
              <code
                className="bg-gray-100 p-2 rounded block font-mono text-sm overflow-x-auto"
                {...props}
              />
            ),
            pre: ({ node, ...props }) => (
              <pre
                className="bg-gray-100 p-4 rounded my-4 overflow-x-auto"
                {...props}
              />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table
                  className="min-w-full border-collapse border border-gray-300"
                  {...props}
                />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th
                className="border border-gray-300 bg-gray-100 px-4 py-2 text-left"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td className="border border-gray-300 px-4 py-2" {...props} />
            ),
            img: ({ node, ...props }) => (
              <img
                className="max-w-full h-auto rounded my-4"
                {...props}
                alt={props.alt || "Image"}
              />
            ),
          }}
        >
          {section.contentMarkdown || ""}
        </ReactMarkdown>
      </div>
    );
  };

  const renderExampleSection = () => {
    return (
      <div className="space-y-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">{renderMarkdownContent()}</CardContent>
        </Card>
      </div>
    );
  };

  const renderSummarySection = () => {
    return (
      <div className="space-y-4">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">{renderMarkdownContent()}</CardContent>
        </Card>
      </div>
    );
  };

const renderCheckInSection = () => {
    const isStructuredQuestion = section.questionText || section.answerDetail;
    const hasCheckUnderstanding = section.contentMarkdown?.includes("Check Your Understanding") || 
                                 section.contentMarkdown?.includes("## Check") ||
                                 section.title?.includes("Check");
    
    const cleanText = (text: string) => {
      return text
        .replace(/Answer Detail:\s*Correct/gi, '')
        .replace(/Guiding\s*$/gi, '')
        .trim();
    };
    
    if (!isStructuredQuestion && hasCheckUnderstanding) {
      const content = section.contentMarkdown || "";
      const questions = content.split(/Question:|Reflection Prompt:/)
        .filter((part, index) => index > 0) 
        .map(part => part.trim());
      
      return (
        <div className="space-y-6">
          {content.split(/Question:|Reflection Prompt:/)[0].trim() && (
            <div className="mb-4 prose prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content.split(/Question:|Reflection Prompt:/)[0].trim()}
              </ReactMarkdown>
            </div>
          )}
          
          {questions.map((question, index) => {
            const hasAnswer = question.includes("Answer:") || question.includes("Suggested response:");
            
            let questionText = question;
            let answerText = null;
            
            if (hasAnswer) {
              const answerKeywords = ["Answer:", "Suggested response:"];
              let firstIndex = question.length;
              let foundKeyword = "";
              
              for (const keyword of answerKeywords) {
                const idx = question.indexOf(keyword);
                if (idx >= 0 && idx < firstIndex) {
                  firstIndex = idx;
                  foundKeyword = keyword;
                }
              }
              
              questionText = question.substring(0, firstIndex).trim();
              answerText = question.substring(firstIndex + foundKeyword.length).trim();
              
              answerText = cleanText(answerText);
            }
            
            return (
              <div key={index} className="space-y-3">
                {/* Question card */}
                <Card className="bg-amber-50/50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <div className="mt-1 shrink-0">
                        <HelpCircle className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="w-full">
                        <p className="font-medium mb-2">Question {index + 1}:</p>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {questionText.trim()}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {answerText && (
                  <div className={cn(isPrintMode ? "block" : showAnswer ? "block" : "hidden")}>
                    <Card className="border-l-4 border-green-500">
                      <CardContent className="p-4">
                        <div className="flex gap-2">
                          <div className="mt-1 shrink-0">
                            <Lightbulb className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="w-full">
                            <p className="font-medium mb-2">Answer:</p>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                              {answerText}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {!isPrintMode && answerText && !showAnswer && (
                  <Button variant="outline" onClick={() => setShowAnswer(true)} className="mt-2">
                    Show Answer
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    
    const cleanedAnswerDetail = section.answerDetail ? cleanText(section.answerDetail) : "";
    
    return (
      <div className="space-y-4">
        {section.contentMarkdown &&
          section.contentMarkdown.trim() !== section.questionText && (
            <div className="mb-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {section.contentMarkdown}
              </ReactMarkdown>
            </div>
          )}
  
        {/* Question Card */}
        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="mt-1 shrink-0">
                <HelpCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium mb-2">Question:</p>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {section.questionText || ""}
                </ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>
  
        {/* Answer Detail Card - conditionally shown with cleaned text */}
        {cleanedAnswerDetail && (
          <div className={cn(isPrintMode ? "block" : showAnswer ? "block" : "hidden")}>
            <Card className="border-l-4 border-green-500 mt-2">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <div className="mt-1 shrink-0">
                    <Lightbulb className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium mb-2">Answer:</p>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {cleanedAnswerDetail}
                    </ReactMarkdown>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
  
        {/* Show Answer Button - only in interactive mode */}
        {!isPrintMode && cleanedAnswerDetail && !showAnswer && (
          <Button variant="outline" onClick={() => setShowAnswer(true)} className="mt-2">
            Show Answer
          </Button>
        )}
      </div>
    );
  };

  return (
    <div ref={sectionRef} className="section-container break-inside-avoid">
      {enhancedRendering && (
        <div className="flex items-center gap-2 mb-4">
          {getSectionIcon()}
          <h2 className="text-xl font-semibold">{section.title}</h2>
        </div>
      )}
      {renderSectionContent()}
    </div>
  );
}
