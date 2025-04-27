'use client';

import React, { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { InView } from 'react-intersection-observer';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface MarkdownProps {
  children: string;
  className?: string;
  onVisibilityChange?: (isVisible: boolean, elementId: string) => void;
}

export function Markdown({ children, className, onVisibilityChange }: MarkdownProps) {
  // Helper function to generate stable heading IDs
  const generateHeadingId = useCallback((text: string): string => {
    // Convert React children to string and create an ID
    if (typeof text !== 'string') {
      return 'heading';
    }
    return `heading-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
  }, []);

  // Create a safe wrapper for the visibility change callback
  const handleVisibilityChange = useCallback((inView: boolean, text: string) => {
    if (!onVisibilityChange) return;
    
    const headingId = generateHeadingId(text);
    // Ensure we call with params in correct order (isVisible, sectionId)
    onVisibilityChange(inView, headingId);
    
    if (inView) {
      console.log(`Section visible: ${headingId}`);
    }
  }, [onVisibilityChange, generateHeadingId]);
  
  return (
    <div className={cn('prose prose-headings:scroll-m-20 prose-headings:mb-2 dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, children, ...props }) => {
            const headingText = Array.isArray(children) 
              ? children.join('') 
              : String(children || '');
            const headingId = generateHeadingId(headingText);
            
            return (
              <InView
                threshold={0.5}
                triggerOnce={false}
                onChange={(inView) => handleVisibilityChange(inView, headingText)}
              >
                <h1 id={headingId} className="text-3xl font-bold tracking-tight mt-8" {...props}>
                  {children}
                </h1>
              </InView>
            );
          },
          h2: ({ node, children, ...props }) => {
            const headingText = Array.isArray(children) 
              ? children.join('') 
              : String(children || '');
            const headingId = generateHeadingId(headingText);
            
            return (
              <InView
                threshold={0.5}
                triggerOnce={false}
                onChange={(inView) => handleVisibilityChange(inView, headingText)}
              >
                <h2 id={headingId} className="text-2xl font-bold tracking-tight mt-6" {...props}>
                  {children}
                </h2>
              </InView>
            );
          },
          h3: ({ node, children, ...props }) => {
            const headingText = Array.isArray(children) 
              ? children.join('') 
              : String(children || '');
            const headingId = generateHeadingId(headingText);
            
            return (
              <InView
                threshold={0.5}
                triggerOnce={false}
                onChange={(inView) => handleVisibilityChange(inView, headingText)}
              >
                <h3 id={headingId} className="text-xl font-bold tracking-tight mt-4" {...props}>
                  {children}
                </h3>
              </InView>
            );
          },
          // Track sections by adding InView to paragraphs too
          p: ({ node, children, ...props }) => {
            // Only track substantial paragraphs (with at least 50 characters)
            const paragraphText = Array.isArray(children) 
              ? children.join('') 
              : String(children || '');
              
            const shouldTrack = paragraphText.length > 50;
            const contentId = shouldTrack 
              ? `paragraph-${paragraphText.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`
              : '';
              
            return shouldTrack ? (
              <InView
                threshold={0.7}
                triggerOnce={true} // Once is enough for paragraphs
                onChange={(inView) => onVisibilityChange?.(inView, contentId)}
              >
                <p className="leading-7 [&:not(:first-child)]:mt-4" {...props}>
                  {children}
                </p>
              </InView>
            ) : (
              <p className="leading-7 [&:not(:first-child)]:mt-4" {...props}>
                {children}
              </p>
            );
          },
          // Rest of your component definitions
          ul: ({ node, ...props }) => (
            <ul className="my-4 ml-6 list-disc" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-4 ml-6 list-decimal" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="mt-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="mt-4 border-l-4 border-primary pl-4 italic" {...props} />
          ),
          img: ({ node, src, alt, ...props }) => (
            <div className="my-4 overflow-hidden rounded-md border bg-muted">
              {src && (
                <Image
                  src={src}
                  alt={alt || ""}
                  width={800}
                  height={500}
                  className="h-auto w-full object-cover"
                />
              )}
            </div>
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match && match[1] ? match[1] : '';
            
            return !inline && language ? (
              <SyntaxHighlighter
                style={nightOwl}
                language={language}
                PreTag="div"
                className="rounded-md my-4"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
          table: ({ node, ...props }) => (
            <div className="my-4 w-full overflow-y-auto">
              <table className="w-full" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-primary bg-secondary h-4 rounded-full hover:underline text-sm p-1" target='_blank' {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}