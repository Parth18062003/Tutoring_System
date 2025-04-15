"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentDisplay } from "@/components/assessment/assessment-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AssessmentPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState("5");
  const [isStarted, setIsStarted] = useState(false);

  const handleBack = () => {
    if (isStarted) {
      setIsStarted(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleStart = () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsStarted(true);
  };

  const handleComplete = (result: any) => {
    // Could navigate to results page or handle in some other way
    console.log("Assessment completed", result);
  };

  return (
    <div className="container py-8">
      {!isStarted ? (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Start an Assessment</CardTitle>
            <CardDescription>
              Test your knowledge with personalized questions and receive
              instant feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Mathematics, Science, etc."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="Fractions, Photosynthesis, etc."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-count">Number of Questions</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger id="question-count">
                  <SelectValue placeholder="Select question count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Questions</SelectItem>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleStart}>Start Assessment</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AssessmentDisplay
          subject={subject}
          topic={topic}
          questionCount={parseInt(questionCount, 10)}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
