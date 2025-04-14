// lib/actions/learning-actions.ts
'use server'

import { getUserId } from '@/lib/actions';
import { 
  ContentRequest, 
  SessionFeedback, 
  ApiResponse 
} from '@/types/api-types';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

/**
 * Server action to submit feedback without exposing API secret
 */
export async function submitFeedback(
  feedback: SessionFeedback
): Promise<ApiResponse<{ status: string; message: string }>> {
  try {
    const { success, userId, error } = await getUserId();
    
    if (!success || !userId) {
      redirect('/auth/signin');
    }
    
    const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authenticated-User-Id': userId,
        'X-Internal-Api-Secret': process.env.INTERNAL_API_SECRET || '',
      },
      body: JSON.stringify(feedback),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        status: 'error', 
        error: `API error: ${errorText || response.statusText}`
      };
    }
    
    const data = await response.json();
    return { data, status: 'success' };
  }  catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to submit feedback';
    return {
      status: 'error',
      error: errMsg,
    };
  }
}

/**
 * Server action to get student analytics
 */
export async function getStudentAnalytics(): Promise<ApiResponse<any>> {
  try {
    const { success, userId, error } = await getUserId();
    
    if (!success || !userId) {
      redirect('/auth/signin');
    }
    
    const response = await fetch(`${API_BASE_URL}/analytics/student/${userId}`, {
      headers: {
        'X-Authenticated-User-Id': userId,
        'X-Internal-Api-Secret': process.env.INTERNAL_API_SECRET || '',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        status: 'error', 
        error: `API error: ${errorText || response.statusText}`
      };
    }
    
    const data = await response.json();
    return { data, status: 'success' };
  }  catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to fetch analytics';
    return {
      status: 'error',
      error: errMsg,
    };
  }
}