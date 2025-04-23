"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AssessmentDisplay } from "@/components/assessment/assessment-display";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, BookOpen } from "lucide-react";
import ReturnButtons from "../return-buttons";

export default function Assessment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get subject and topic from URL parameters
  const subjectFromUrl = searchParams.get("subject") || "";
  const topicFromUrl = searchParams.get("topic") || "";
  
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
    if (!subjectFromUrl) {
      toast.error("Subject is missing from URL parameters");
      return;
    }

    if (!topicFromUrl) {
      toast.error("Topic is missing from URL parameters");
      return;
    }

    setIsStarted(true);
  };

  const handleComplete = (result: any) => {
    console.log("Assessment completed", result);
  };

  // Redirect if subject or topic are missing
  useEffect(() => {
    if (!subjectFromUrl || !topicFromUrl) {
      toast.error("Missing subject or topic parameters");
      // Optional: redirect to a selection page after a delay
      setTimeout(() => router.push("/learning"), 2000);
    }
  }, [subjectFromUrl, topicFromUrl, router]);

  return (
    <div className="container py-8">
      <ReturnButtons />
      {!isStarted ? (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">Assessment</CardTitle>
            </div>
            <CardDescription>
              Test your knowledge on {topicFromUrl} in {subjectFromUrl} with personalized questions and receive instant feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-md p-4 mb-6">
              <h3 className="font-medium mb-2">About this assessment</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subject:</span>
                  <span className="font-medium">{subjectFromUrl}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Topic:</span>
                  <span className="font-medium">{topicFromUrl}</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Questions</label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger>
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
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleStart} disabled={!subjectFromUrl || !topicFromUrl}>
              Start Assessment
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <AssessmentDisplay
          subject={subjectFromUrl}
          topic={topicFromUrl}
          questionCount={parseInt(questionCount, 10)}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}