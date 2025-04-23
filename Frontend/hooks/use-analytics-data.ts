// hooks/use-analytics-data.ts
import { useState, useEffect, useCallback } from 'react';
import {
  getSystemMetrics,
  getTopicMetrics
} from '@/lib/analytics-api'; // Adjust path
import {
  SystemMetrics,
  StudentAnalyticsData,
  TopicMetrics
} from '@/types/analytics-types'; // Adjust path

type AnalyticsType = 'system' | 'student' | 'topic';

interface UseAnalyticsDataProps<T extends AnalyticsType> {
  type: T;
  studentId?: T extends 'student' ? string : never; // studentId required only if type is 'student'
}

interface UseAnalyticsDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnalyticsData<T extends AnalyticsType>(
  props: UseAnalyticsDataProps<T>
): UseAnalyticsDataReturn<
  T extends 'system' ? SystemMetrics :
  T extends 'student' ? StudentAnalyticsData :
  T extends 'topic' ? TopicMetrics :
  never // Should not happen
> {
  const { type, studentId } = props;
  type DataType =
    T extends 'system' ? SystemMetrics :
    T extends 'student' ? StudentAnalyticsData :
    T extends 'topic' ? TopicMetrics :
    never;

  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerFetch, setTriggerFetch] = useState<number>(0); // State to trigger refetch

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null); // Clear previous data on fetch

    try {
      let result: DataType;
      if (type === 'system') {
        result = await getSystemMetrics() as DataType;
      } else if (type === 'student') {
        if (!studentId) {
          throw new Error('studentId is required for student analytics');
        }
      } else if (type === 'topic') {
        result = await getTopicMetrics() as DataType;
      } else {
        throw new Error(`Invalid analytics type: ${type}`);
      }
    } catch (err) {
      console.error(`Error fetching ${type} analytics:`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [type, studentId, triggerFetch]); // Include triggerFetch in dependencies

  useEffect(() => {
    // Initial fetch and subsequent fetches triggered by refetch
    fetchData();
  }, [fetchData]); // Dependency array includes fetchData callback

  const refetch = useCallback(() => {
    setTriggerFetch(prev => prev + 1); // Increment trigger state to refetch
  }, []);

  return { data, loading, error, refetch };
}