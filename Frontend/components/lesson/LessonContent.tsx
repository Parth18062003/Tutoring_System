"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

// Helper function to extract sections from markdown content
const extractSections = (content: string) => {
  const sections: Record<string, string> = {
    introduction: "",
    explanation: "",
    keyPoints: "",
    examples: "",
    practice: "",
    visual: ""
  };

  // Basic section extraction based on markdown headers
  let currentSection = "introduction";
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith("# ")) {
      // Main title, part of introduction
      sections.introduction += line + "\n";
    } else if (line.toLowerCase().includes("introduction") && (line.startsWith("## ") || line.startsWith("# "))) {
      currentSection = "introduction";
    } else if ((line.toLowerCase().includes("explan") || line.toLowerCase().includes("concept") || line.toLowerCase().includes("detail")) && (line.startsWith("## ") || line.startsWith("# "))) {
      currentSection = "explanation";
    } else if ((line.toLowerCase().includes("key point") || line.toLowerCase().includes("takeaway") || line.toLowerCase().includes("summary")) && (line.startsWith("## ") || line.startsWith("# "))) {
      currentSection = "keyPoints";
    } else if ((line.toLowerCase().includes("example") || line.toLowerCase().includes("illustration")) && (line.startsWith("## ") || line.startsWith("# "))) {
      currentSection = "examples";
    } else if ((line.toLowerCase().includes("practice") || line.toLowerCase().includes("question") || line.toLowerCase().includes("exercise")) && (line.startsWith("## ") || line.startsWith("# "))) {
      currentSection = "practice";
    } else if ((line.toLowerCase().includes("visual") || line.toLowerCase().includes("diagram") || line.toLowerCase().includes("figure")) && (line.startsWith("## ") || line.startsWith("# "))) {
      currentSection = "visual";
    }
    
    // Add line to current section
    sections[currentSection] += line + "\n";
  }

  // If no introduction is found, use the beginning of the content
  if (!sections.introduction.trim()) {
    const firstHeaderIndex = lines.findIndex(line => line.startsWith("## ") || line.startsWith("# "));
    if (firstHeaderIndex > 0) {
      sections.introduction = lines.slice(0, firstHeaderIndex).join('\n');
    } else {
      // Just use the first paragraph as introduction
      const firstParagraphEnd = Math.min(10, lines.length);
      sections.introduction = lines.slice(0, firstParagraphEnd).join('\n');
    }
  }
  
  return sections;
};

interface LessonContentProps {
  content: string;
  currentSection: string;
}

export default function LessonContent({ content, currentSection }: LessonContentProps) {
  const sections = extractSections(content);
  
  // Display the requested section or full content if section not found
  const displayContent = sections[currentSection] || content;

  // Component rendering markdown
  const MarkdownRenderer = ({ content }: { content: string }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-6 text-foreground border-b pb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground" {...props} />,
        p: ({ node, ...props }) => <p className="my-4 leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="my-4 list-disc pl-6" {...props} />,
        ol: ({ node, ...props }) => <ol className="my-4 list-decimal pl-6" {...props} />,
        li: ({ node, ...props }) => <li className="my-1" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic my-6" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-primary" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        a: ({ node, ...props }) => <a className="text-primary underline hover:text-primary/80" {...props} />,
        table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="min-w-full border-collapse" {...props} /></div>,
        th: ({ node, ...props }) => <th className="bg-muted px-4 py-2 border" {...props} />,
        td: ({ node, ...props }) => <td className="px-4 py-2 border" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="prose dark:prose-invert max-w-none relative"
    >
      <MarkdownRenderer content={displayContent} />
    </motion.div>
  );
}