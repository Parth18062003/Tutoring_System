// hooks/use-assessment.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

// The key pattern to fix duplicate requests
interface AssessmentState {
  assessmentId: string | null;
  questions: any[];
  currentQuestionIndex: number;
  responses: Record<string, string>;
  evaluationResult: any | null;
  loading: boolean;
  evaluating: boolean;
  error: string | null;
  completionPercentage: number;
  totalQuestions: number;
}

export function useAssessment() {
  const [state, setState] = useState<AssessmentState>({
    assessmentId: null,
    questions: [],
    currentQuestionIndex: 0,
    responses: {},
    evaluationResult: null,
    loading: false,
    evaluating: false,
    error: null,
    completionPercentage: 0,
    totalQuestions: 0,
  });

  // Refs to prevent duplicate requests
  const activeRequestRef = useRef<boolean>(false);
  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up when the component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      activeRequestRef.current = false;
    };
  }, []);

  const fetchAssessment = useCallback(async (options: any) => {
    // Critical check: Don't allow multiple active requests
    if (activeRequestRef.current) {
      console.log("Assessment request already in progress, ignoring duplicate request");
      return;
    }

    // Increment request ID to track the current request
    const currentRequestId = ++requestIdRef.current;
    
    // Mark request as active immediately
    activeRequestRef.current = true;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    // Create abort controller for the request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      console.log(`Starting assessment request #${currentRequestId}: ${options.topic}`);
      
      const response = await fetch("/api/assessment/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
        signal: abortControllerRef.current.signal,
      });

      // Stop processing if this is a stale request
      if (requestIdRef.current !== currentRequestId) {
        console.log(`Abandoning stale assessment request #${currentRequestId}`);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const data = await response.json();

      // Verify this is still the current request
      if (requestIdRef.current !== currentRequestId) {
        console.log(`Abandoning stale assessment response #${currentRequestId}`);
        return;
      }

      setState(prev => ({
        ...prev,
        assessmentId: data.assessment_id,
        questions: data.questions || [],
        totalQuestions: data.questions?.length || 0,
        currentQuestionIndex: 0,
        loading: false,
        error: null
      }));
      
      return data;
    } catch (error: any) {
      // Only handle error if this is still the current request
      if (requestIdRef.current === currentRequestId) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load assessment";
        console.error(`Assessment error in request #${currentRequestId}:`, error);
        
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        
        if (error.name !== "AbortError") {
          toast.error("Failed to load assessment");
        }
      }
      return null;
    } finally {
      // Only reset active flag if this is the current request
      if (requestIdRef.current === currentRequestId) {
        activeRequestRef.current = false;
      }
    }
  }, []);

  const submitResponse = useCallback((questionId: string, response: string) => {
    setState(prev => ({
      ...prev,
      responses: { ...prev.responses, [questionId]: response }
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => {
      if (prev.currentQuestionIndex < prev.questions.length - 1) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          completionPercentage: ((prev.currentQuestionIndex + 2) / prev.totalQuestions) * 100
        };
      }
      return prev;
    });
  }, []);

  const previousQuestion = useCallback(() => {
    setState(prev => {
      if (prev.currentQuestionIndex > 0) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex - 1,
          completionPercentage: ((prev.currentQuestionIndex) / prev.totalQuestions) * 100
        };
      }
      return prev;
    });
  }, []);

  const submitAssessment = useCallback(async () => {
    // Don't submit if already evaluating
    if (state.evaluating) {
      return null;
    }

    setState(prev => ({ ...prev, evaluating: true, error: null }));

    try {
      const responseData = Object.entries(state.responses).map(([question_id, response]) => ({
        question_id,
        response
      }));

      const response = await fetch("/api/assessment/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessment_id: state.assessmentId,
          responses: responseData
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const result = await response.json();
      setState(prev => ({ ...prev, evaluationResult: result, evaluating: false }));
      return result;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "Failed to evaluate assessment";
      setState(prev => ({ ...prev, evaluating: false, error: errorMessage }));
      toast.error("Failed to evaluate assessment");
      return null;
    }
  }, [state.assessmentId, state.responses, state.evaluating]);

  // Remaining functions stay mostly the same
  const getResponse = useCallback((questionId: string) => {
    return state.responses[questionId] || "";
  }, [state.responses]);

  const setQuestionIndex = useCallback((index: number) => {
    setState(prev => {
      if (index >= 0 && index < prev.questions.length) {
        return {
          ...prev,
          currentQuestionIndex: index,
          completionPercentage: ((index + 1) / prev.totalQuestions) * 100
        };
      }
      return prev;
    });
  }, []);

  // Computed properties
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const hasNextQuestion = state.currentQuestionIndex < state.questions.length - 1;
  const hasPreviousQuestion = state.currentQuestionIndex > 0;
  const isComplete = state.totalQuestions > 0 && 
                    Object.keys(state.responses).length === state.totalQuestions;

  return {
    ...state,
    currentQuestion,
    fetchAssessment,
    submitResponse,
    nextQuestion,
    previousQuestion,
    submitAssessment,
    hasNextQuestion,
    hasPreviousQuestion,
    isComplete,
    getResponse,
    setQuestionIndex
  };
}