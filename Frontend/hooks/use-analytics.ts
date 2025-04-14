// lib/hooks/use-analytics.ts
'use client';

import { useState, useEffect } from 'react';
import { getStudentAnalytics } from '@/actions/learning-actions';
import { StudentAnalytics } from '@/types/api-types';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalytics() {
    setLoading(true);
    setError(null);

    try {
      const result = await getStudentAnalytics();
      
      if (result.status === 'error') {
        setError(result.error || 'Failed to fetch analytics');
        return null;
      }
      
      setAnalytics(result.data);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  };
}