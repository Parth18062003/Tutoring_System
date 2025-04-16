"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AssessmentResults } from "./assessment-results";

interface AssessmentResultViewProps {
  assessmentId: string;
}

export default function AssessmentResultView({ assessmentId }: AssessmentResultViewProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssessment() {
      if (!assessmentId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch the saved assessment data directly without re-evaluating
        const response = await fetch(`/api/assessment/${assessmentId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch assessment");
        }
        
        const data = await response.json();
        setAssessment(data);
      } catch (err) {
        console.error("Error fetching assessment:", err);
        setError("Failed to load assessment details");
        toast.error("Could not load assessment results");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAssessment();
  }, [assessmentId]);

  // Handle back button click
  const handleBack = () => {
    router.push("/learning/assessment/history");
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessment History
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2 pt-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessment History
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-xl font-semibold mb-2">Assessment Not Found</div>
            <p className="text-muted-foreground mb-4">{error || "Assessment details could not be loaded"}</p>
            <Button onClick={handleBack}>Return to History</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format data for the AssessmentResults component
// Transform the responses array into a mapping object
const responses = assessment.responses 
  ? assessment.responses.reduce((acc: Record<string, string>, curr: any) => {
      acc[curr.question_id] = curr.response;
      return acc;
    }, {})
  : {};
  const questions = assessment.questions || [];
  const result = {
    subject: assessment.subject,
    topic: assessment.topic,
    overall_score: assessment.score || 0,
    mastery_before: assessment.mastery_before || 0,
    mastery_after: assessment.mastery_after || 0,
    evaluations: assessment.evaluations || {},
    strengths: assessment.strengths || [],
    common_misconceptions: assessment.common_misconceptions || [],
    recommendations: assessment.recommendations || [],
  };

  return (
    <AssessmentResults
      result={result}
      questions={questions}
      responses={responses}
      onBack={handleBack}
    />
  );
}