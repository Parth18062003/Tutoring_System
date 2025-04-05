"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizData } from "@/types/quiz";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface QuizFormProps {
  onQuizGenerated: (quiz: QuizData) => void;
}

export default function QuizForm({ onQuizGenerated }: QuizFormProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [questionTypes, setQuestionTypes] = useState({
    "multiple-choice": true,
    "true-false": true,
    "short-answer": true,
    "matching": false,
    "fill-in-blank": false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      setError("Please enter a topic");
      return;
    }

    const selectedTypes = Object.entries(questionTypes)
      .filter(([_, selected]) => selected)
      .map(([type]) => type);
    
    if (selectedTypes.length === 0) {
      setError("Please select at least one question type");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          difficulty,
          questionCount: parseInt(questionCount),
          questionTypes: selectedTypes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      onQuizGenerated(data.quiz);
    } catch (err) {
      setError("Failed to generate quiz. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    setQuestionTypes(prev => ({
      ...prev,
      [type]: checked
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Generate Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Photosynthesis, Fractions, Solar System"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={difficulty}
              onValueChange={setDifficulty}
              disabled={loading}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionCount">Number of Questions</Label>
            <Select
              value={questionCount}
              onValueChange={setQuestionCount}
              disabled={loading}
            >
              <SelectTrigger id="questionCount">
                <SelectValue placeholder="Select number of questions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Question Types</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="multiple-choice"
                  checked={questionTypes["multiple-choice"]}
                  onCheckedChange={(checked) => handleQuestionTypeChange("multiple-choice", Boolean(checked))}
                />
                <Label htmlFor="multiple-choice">Multiple Choice</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="true-false"
                  checked={questionTypes["true-false"]}
                  onCheckedChange={(checked) => handleQuestionTypeChange("true-false", Boolean(checked))}
                />
                <Label htmlFor="true-false">True/False</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="short-answer"
                  checked={questionTypes["short-answer"]}
                  onCheckedChange={(checked) => handleQuestionTypeChange("short-answer", Boolean(checked))}
                />
                <Label htmlFor="short-answer">Short Answer</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="matching"
                  checked={questionTypes["matching"]}
                  onCheckedChange={(checked) => handleQuestionTypeChange("matching", Boolean(checked))}
                />
                <Label htmlFor="matching">Matching</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fill-in-blank"
                  checked={questionTypes["fill-in-blank"]}
                  onCheckedChange={(checked) => handleQuestionTypeChange("fill-in-blank", Boolean(checked))}
                />
                <Label htmlFor="fill-in-blank">Fill-in-Blank</Label>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}