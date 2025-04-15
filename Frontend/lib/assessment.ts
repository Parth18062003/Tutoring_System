// lib/api/assessment.ts
import { 
    AssessmentQuestion,
    AssessmentResponse,
    AssessmentHistory 
  } from '@/types/assessment-types';
  
  export interface GenerateAssessmentParams {
    topic: string;
    subject: string;
    question_count?: number;
    difficulty?: number;
    question_types?: string[];
    misconceptions?: string[];
  }
  
  export interface EvaluateAssessmentParams {
    assessment_id: string;
    responses: {
      question_id: string;
      response: string;
      time_spent_seconds?: number;
    }[];
  }
  
  export async function generateAssessment(
    params: GenerateAssessmentParams
  ): Promise<{
    assessment_id: string;
    topic: string;
    subject: string;
    questions: AssessmentQuestion[];
    difficulty: number;
  }> {
    const response = await fetch('/api/assessment/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to generate assessment');
    }
  
    return response.json();
  }
  
  export async function evaluateAssessment(
    params: EvaluateAssessmentParams
  ): Promise<AssessmentResponse> {
    const response = await fetch('/api/assessment/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to evaluate assessment');
    }
  
    return response.json();
  }
  
  export async function getAssessmentHistory(
    topic?: string,
    subject?: string,
    limit: number = 10
  ): Promise<AssessmentHistory[]> {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (subject) params.append('subject', subject);
    params.append('limit', limit.toString());
  
    const response = await fetch(`/api/assessment/history?${params.toString()}`);
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch assessment history');
    }
  
    return response.json();
  }