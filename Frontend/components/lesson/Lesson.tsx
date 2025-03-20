"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LessonHeader from "./LessonHeader";
import LessonContent from "./LessonContent";
import LessonNavigation from "./LessonNavigation";
import LessonProgress from "./LessonProgress";
import LessonActions from "./LessonActions";
import SubjectTopicSelector from "./SubjectTopicSelector";
import { Loader2 } from "lucide-react";

export default function Lesson() {
  // State for selection and lesson content
  const [classNum, setClassNum] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [hasSelection, setHasSelection] = useState(false);

  const [lessonContent, setLessonContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSection, setCurrentSection] = useState(0);

  // Define the sections from the lesson content
  const sections = [
    "introduction",
    "explanation",
    "keyPoints",
    "examples",
    "practice",
  ];

  // Handle selection complete
  const handleSelectionComplete = (
    selectedClass: string,
    selectedSubject: string,
    selectedTopic: string
  ) => {
    setClassNum(selectedClass);
    setSubject(selectedSubject);
    setTopic(selectedTopic);
    setHasSelection(true);
  };

  // Reset selection and go back to selection screen
  const handleResetSelection = () => {
    setHasSelection(false);
  };

  useEffect(() => {
    const fetchLesson = async () => {
      if (!hasSelection || !classNum || !subject || !topic) {
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/generate-lesson", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classNum,
            subject,
            topic,
            sections: [
              "explanation",
              "keyPoints",
              "examples",
              "practice",
              "visual",
            ],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch lesson");
        }

        const data = await response.json();
        setLessonContent(data.response);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    if (hasSelection) {
      fetchLesson();
    }
  }, [classNum, subject, topic, hasSelection]);

  // If no selection is made yet, show selector
  if (!hasSelection) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Intelligent Tutoring System
          </h1>
          <SubjectTopicSelector onSelectionComplete={handleSelectionComplete} />
        </div>
      </div>
    );
  }

  // Show loading spinner while fetching lesson
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Preparing your lesson...</p>
        </div>
      </div>
    );
  }

  // Show error if one occurs
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 bg-destructive/10 rounded-lg">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={handleResetSelection}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <LessonHeader
          className={`Class ${classNum}`}
          subject={subject}
          topic={topic}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-lg shadow-md p-6"
              >
                <LessonContent
                  content={lessonContent}
                  currentSection={sections[currentSection]}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="md:col-span-1 space-y-6">
            <LessonProgress
              sections={sections}
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
            />
            <LessonActions topic={topic} />
          </div>
        </div>

        <LessonNavigation
          currentSection={currentSection}
          totalSections={sections.length}
          onPrevious={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
          onNext={() =>
            setCurrentSection((prev) => Math.min(sections.length - 1, prev + 1))
          }
        />
      </div>
    </motion.div>
  );
}
