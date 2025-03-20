"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SubjectTopicSelector from "../lesson/SubjectTopicSelector";
import { Loader2 } from "lucide-react";
import QuizHeader from "./QuizHeader";
import QuizResults from "./QuizResults";
import QuizContent from "./QuizContent";

export default function Quiz() {
  // State for selection and quiz content
  const [classNum, setClassNum] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [hasSelection, setHasSelection] = useState(false);

  const [quizContent, setQuizContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<{ total: number; correct: number }>({
    total: 0,
    correct: 0,
  });

  // Difficulty and question count options
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );

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

  // Reset quiz
  const handleResetQuiz = () => {
    setHasSelection(false);
    setQuizContent("");
    setQuizStarted(false);
    setQuizCompleted(false);
    setUserAnswers({});
    setScore({ total: 0, correct: 0 });
  };

  // Start quiz after configuration
  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classNum,
          subject,
          topic,
          questionCount,
          difficulty,
          questionTypes: ["mcq", "shortAnswer"],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to fetch quiz: ${response.status} ${errorData}`
        );
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error("Invalid response format from API");
      }

      setQuizContent(data.response);
      setQuizStarted(true);
      setLoading(false);
    } catch (err: any) {
      console.error("Quiz fetch error:", err);
      setError(err.message || "An error occurred while fetching the quiz");
      setLoading(false);
    }
  };

  // Handle answer submission for a question
  const handleAnswerSubmit = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Complete quiz and check answers
  const handleQuizComplete = (results: { total: number; correct: number }) => {
    setScore(results);
    setQuizCompleted(true);
  };

  // If no selection is made yet, show selector
  if (!hasSelection) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Intelligent Tutoring System - Quiz
          </h1>
          <SubjectTopicSelector onSelectionComplete={handleSelectionComplete} />
        </div>
      </div>
    );
  }

  // Show loading spinner while fetching quiz
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Preparing your Quiz...</p>
        </div>
      </div>
    );
  }

  // Show error if one occurs
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 bg-destructive/10 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={handleStartQuiz}
            >
              Retry
            </button>
            <button
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
              onClick={handleResetQuiz}
            >
              Choose Different Topic
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz configuration screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-8">
            Quiz Configuration
          </h1>

          <div className="bg-card rounded-lg shadow-md p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Quiz Details</h2>
              <p>
                Class: <span className="font-medium">{classNum}</span>
              </p>
              <p>
                Subject: <span className="font-medium">{subject}</span>
              </p>
              <p>
                Topic: <span className="font-medium">{topic}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium">Number of Questions</label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                >
                  <option value="3">3 Questions</option>
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Difficulty Level</label>
                <div className="flex gap-4">
                  {["easy", "medium", "hard"].map((level) => (
                    <button
                      key={level}
                      className={`px-4 py-2 rounded-md ${difficulty === level ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                      onClick={() =>
                        setDifficulty(level as "easy" | "medium" | "hard")
                      }
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
                onClick={handleResetQuiz}
              >
                Back
              </button>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                onClick={handleStartQuiz}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show results after quiz completion
  if (quizCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
      >
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <QuizHeader
            className={`Class ${classNum}`}
            subject={subject}
            topic={topic}
            isCompleted={true}
          />

          <QuizResults
            score={score}
            quizContent={quizContent}
            userAnswers={userAnswers}
            onTryAgain={handleStartQuiz}
            onNewQuiz={handleResetQuiz}
          />
        </div>
      </motion.div>
    );
  }

  // Show the quiz
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <QuizHeader
          className={`Class ${classNum}`}
          subject={subject}
          topic={topic}
          isCompleted={false}
        />

        <div className="mt-6">
          <QuizContent
            quizContent={quizContent}
            onAnswerSubmit={handleAnswerSubmit}
            userAnswers={userAnswers}
            onQuizComplete={handleQuizComplete}
          />
        </div>
      </div>
    </motion.div>
  );
}
