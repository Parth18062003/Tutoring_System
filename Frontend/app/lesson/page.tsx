'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Printer, Download, ArrowLeft, AlertCircle, ThumbsUp, BookOpen, Clock } from 'lucide-react';
import { ContentMetadata, ContentType } from '@/types/tutor';
import { fetchStreamingContent } from '@/lib/content-api';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { SubjectIcon } from '@/components/tutor/SubjectIcon';
import { ContentMetadataDisplay } from '@/components/tutor/ContentMetadataDisplay';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { FeedbackDialog } from '@/components/tutor/FeedbackDialog';

// Function to extract headings from markdown content
const extractTableOfContents = (markdownContent: string) => {
  // Match all headings (## and ###)
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string; }[] = [];
  
  let match;
  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const level = match[1].length; // Number of # characters
    const text = match[2].trim();
    // Create an ID from the heading text for scrolling
    const id = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    
    headings.push({ level, text, id });
  }
  
  return headings;
};

export default function LessonPage() {
  const router = useRouter();

  // Current date and time - fixed for this example
  const currentDateTime = "2025-03-31 08:21:06";
  const currentUser = "Parth18062003";

  // Get selected subject and topic from localStorage instead of URL params
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicName, setTopicName] = useState<string>('Loading...');
  const [subjectName, setSubjectName] = useState<string>('Science');

  // Content states
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<ContentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [tableOfContents, setTableOfContents] = useState<{ level: number; text: string; id: string; }[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  
  const startTimeRef = useRef<number>(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Calculate reading time (rough estimate)
  const calculateReadingTime = () => {
    if (!content) return '< 1 min';
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200); // Assuming 200 words per minute reading speed
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };
  
  // Load the selected subject and topic IDs from localStorage
  useEffect(() => {
    const storedSubject = localStorage.getItem('selectedSubject');
    const storedTopic = localStorage.getItem('selectedTopic');
    
    if (storedSubject && storedTopic) {
      setSelectedSubject(storedSubject);
      setSelectedTopic(storedTopic);
      
      // Find the full names from our topic data
      const subjectTopics = [
        {
          id: 'science',
          name: 'Science',
          topics: [
            { id: 'food-where-from', name: 'Food: Where Does It Come From?' },
            { id: 'components-of-food', name: 'Components of Food' },
            { id: 'fibre-to-fabric', name: 'Fibre to Fabric' },
            { id: 'sorting-materials', name: 'Sorting Materials into Groups' },
            { id: 'separation-substances', name: 'Separation of Substances' }
          ]
        },
        {
          id: 'mathematics',
          name: 'Mathematics',
          topics: [
            { id: 'knowing-numbers', name: 'Knowing Our Numbers' },
            { id: 'whole-numbers', name: 'Whole Numbers' },
            { id: 'playing-with-numbers', name: 'Playing with Numbers' }
          ]
        },
        {
          id: 'social_science',
          name: 'Social Science',
          topics: [
            { id: 'what-where-how-when', name: 'What, Where, How and When?' },
            { id: 'earliest-people', name: 'On the Trail of the Earliest People' }
          ]
        }
      ];
      
      const subject = subjectTopics.find(s => s.id === storedSubject);
      if (subject) {
        setSubjectName(subject.name);
        const topic = subject.topics.find(t => t.id === storedTopic);
        if (topic) {
          setTopicName(topic.name);
        }
      }
    } else {
      // If no subject/topic found, redirect back to selection page
      router.push('/subjects');
    }
  }, [router]);

  // Function to stream lesson content
  useEffect(() => {
    if (selectedSubject && selectedTopic) {
      streamLesson();
    }
  }, [selectedSubject, selectedTopic]);
  
  // Update ToC when content changes
  useEffect(() => {
    if (content) {
      const headings = extractTableOfContents(content);
      setTableOfContents(headings);
    }
  }, [content]);
  
  // Set up intersection observer to highlight active heading
  useEffect(() => {
    if (!contentRef.current || tableOfContents.length === 0) return;
    
    // Wait for the markdown to render and add IDs to headings
    setTimeout(() => {
      // Add IDs to actual headings in the DOM
      tableOfContents.forEach(heading => {
        const headingElements = contentRef.current?.querySelectorAll(`h${heading.level}`);
        headingElements?.forEach(el => {
          if (el.textContent === heading.text) {
            el.id = heading.id;
          }
        });
      });
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveHeadingId(entry.target.id);
            }
          });
        },
        { rootMargin: '-100px 0px -66% 0px' }
      );
      
      // Observe all headings
      tableOfContents.forEach(heading => {
        const element = document.getElementById(heading.id);
        if (element) observer.observe(element);
      });
      
      return () => observer.disconnect();
    }, 1000); // Wait for markdown rendering
  }, [tableOfContents, contentRef.current]);
  
  const streamLesson = async () => {
    if (!selectedSubject || !selectedTopic) return;
    
    setIsLoading(true);
    setError(null);
    setContent('');
    startTimeRef.current = Date.now();

    try {
      await fetchStreamingContent(
        {
          content_type: 'lesson' as ContentType,
          subject: subjectName,
          topic: topicName,
          config: {
            temperature: 0.7,
          }
        },
        // Handle content chunks as they arrive
        (chunk) => {
          setContent((prev) => prev + chunk);
        },
        // Handle metadata
        (receivedMetadata) => {
          setMetadata(receivedMetadata);
        },
        // Handle errors
        (errorMsg) => {
          setError(errorMsg);
          toast.error("Failed to load lesson content", {
            description: errorMsg.slice(0, 100) + (errorMsg.length > 100 ? '...' : '')
          });
        }
      );
    } catch (err) {
      setError('An unexpected error occurred while loading the lesson.');
      console.error('Lesson streaming error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle printing the lesson
  const handlePrint = () => {
    if (!contentRef.current) return;
    
    const originalTitle = document.title;
    document.title = `Lesson: ${topicName}`;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Could not open print window. Check your popup blocker settings.");
      return;
    }
    
    // Add styles and content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>${document.title}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.6;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; }
            h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
            p { margin-bottom: 1rem; }
            ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
            img { max-width: 100%; height: auto; }
            blockquote { 
              border-left: 4px solid #e2e8f0; 
              padding-left: 1rem; 
              font-style: italic;
              margin: 1rem 0;
            }
            code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 3px; }
            pre { background: #f1f5f9; padding: 1rem; overflow-x: auto; border-radius: 3px; }
            table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            th, td { border: 1px solid #e2e8f0; padding: 0.5rem; }
            th { background: #f8fafc; }
            .header { 
              border-bottom: 1px solid #e2e8f0; 
              padding-bottom: 1rem; 
              margin-bottom: 2rem;
              display: flex;
              justify-content: space-between;
            }
            .footer {
              border-top: 1px solid #e2e8f0;
              margin-top: 2rem;
              padding-top: 1rem;
              font-size: 0.875rem;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${topicName}</h1>
              <p>${subjectName} Lesson</p>
            </div>
            <div>
              <p>Date: ${currentDateTime}</p>
            </div>
          </div>
          <div class="content">
            ${contentRef.current.innerHTML}
          </div>
          <div class="footer">
            <p>Generated by Brain Wave</p>
            <p>Student: ${currentUser}</p>
          </div>
        </body>
      </html>
    `);
    
    // Delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      // Close window after print dialog closes (some browsers)
      printWindow.onafterprint = () => {
        printWindow.close();
        document.title = originalTitle;
      };
    }, 500);
  };

  // Handle downloading as PDF
  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    try {
      toast.info("Preparing your PDF...");
      
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Add title and metadata
      pdf.setFontSize(20);
      pdf.text(topicName, 15, 15);
      pdf.setFontSize(12);
      pdf.text(`${subjectName} Lesson`, 15, 25);
      pdf.setFontSize(10);
      pdf.text(`Date: ${currentDateTime}`, 15, 32);
      pdf.text(`Student: ${currentUser}`, 15, 37);
      
      // Calculate dimensions
      const imgWidth = pdf.internal.pageSize.getWidth() - 30; // margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image
      pdf.addImage(imgData, 'PNG', 15, 45, imgWidth, imgHeight);
      
      // Save PDF
      pdf.save(`${subjectName}-${topicName}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate PDF", {
        description: "Please try again later or use the print option instead."
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header with back button and actions */}
      <header className="border-b bg-white z-10">
        <div className="container py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => router.push('/subjects')}
          >
            <ArrowLeft size={16} />
            Back to Topics
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handlePrint}
              disabled={isLoading || !content}
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleDownload}
              disabled={isLoading || !content}
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content with sidebar */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col md:flex-row">
          {/* Table of Contents Sidebar */}
          <aside className="w-full md:w-64 lg:w-72 border-r shrink-0 bg-gray-50/50 hidden md:block overflow-hidden">
            <div className="p-4 border-b bg-white">
              <h2 className="font-semibold">Table of Contents</h2>
            </div>
            <ScrollArea className="h-full p-4">
              {isLoading ? (
                // Loading skeleton for ToC
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              ) : tableOfContents.length > 0 ? (
                <nav className="space-y-2">
                  {tableOfContents.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`block text-sm transition-colors py-1 px-2 rounded ${
                        activeHeadingId === heading.id 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-gray-100'
                      } ${
                        heading.level === 3 ? 'pl-6' : 'pl-2'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              ) : content && !isLoading ? (
                <p className="text-muted-foreground text-sm">No headings found in this lesson.</p>
              ) : null}
            </ScrollArea>
          </aside>
          
          {/* Main content area */}
          <main className="flex-1 overflow-auto">
            <div className="container max-w-4xl py-8">
              <div className="space-y-6">
                {/* Subject and Topic */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <SubjectIcon subject={subjectName} className="text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">{subjectName}</p>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {topicName}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{calculateReadingTime()} read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>NCERT Grade 6</span>
                    </div>
                    <span>{currentDateTime}</span>
                  </div>
                </div>
                
                {/* Metadata Card (if available) */}
                {metadata && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ContentMetadataDisplay metadata={metadata} showDetailed />
                  </motion.div>
                )}
                
                {/* Content Section */}
                <div>
                  {isLoading && !content ? (
                    // Loading State
                    <Card className="bg-white">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <Skeleton className="h-8 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                        </div>
                      </CardContent>
                    </Card>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error}
                        <Button variant="outline" size="sm" className="ml-4" onClick={streamLesson}>
                          Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="bg-white border-gray-200">
                        <CardContent className="p-6">
                          <div ref={contentRef} className="prose prose-lg max-w-none dark:prose-invert">
                            <MarkdownRenderer content={content} />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
                
                {/* Feedback Button */}
                {!isLoading && content && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex justify-center pt-4"
                  >
                    <Button 
                      onClick={() => setShowFeedback(true)}
                      size="lg" 
                      className="gap-2"
                    >
                      <ThumbsUp size={16} />
                      How was this lesson?
                    </Button>
                  </motion.div>
                )}
                
                {/* Feedback Dialog */}
                {metadata && (
                  <FeedbackDialog
                    interactionId={metadata.interaction_id}
                    open={showFeedback}
                    onOpenChange={setShowFeedback}
                    contentType="lesson"
                    onFeedbackSubmitted={() => {
                      toast.success("Thank you for your feedback!", {
                        description: "Your input helps our AI tutor personalize content for you."
                      });
                    }}
                  />
                )}
                
                {/* User Info */}
                <div className="text-xs text-muted-foreground pt-4 mt-8 border-t">
                  <p>Session: {currentUser}</p>
                  <p>Current time: {currentDateTime}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}