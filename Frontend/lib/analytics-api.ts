import {
    SystemMetrics,
    StudentAnalyticsSummaryData, // Use the summary type
    TopicMetrics,
    PaginatedResponse,
    LearningPathItem,
    AssessmentHistoryItem,
    HeatmapData,
  } from '@/types/analytics-types'; // Adjust path as needed
  
  const API_BASE = '/api/metrics'; // Base path for our proxy routes
  
  /**
   * Fetches system-wide metrics.
   */
  export async function getSystemMetrics(): Promise<SystemMetrics> {
    const response = await fetch(`${API_BASE}/system`);
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch system metrics' }));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
    // Assuming backend returns the correct SystemMetrics structure
    return await response.json();
  }
  
  /**
   * Fetches detailed SUMMARY analytics for a specific student.
   */
  export async function getStudentAnalyticsSummary(studentId: string): Promise<StudentAnalyticsSummaryData> {
    const response = await fetch(`${API_BASE}/student/${studentId}`);
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed to fetch analytics for student ${studentId}` }));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
     // Assuming backend returns the correct StudentAnalyticsSummaryData structure
    return await response.json();
  }
  
  /**
   * Fetches metrics aggregated by topic.
   */
  export async function getTopicMetrics(): Promise<TopicMetrics> {
    const response = await fetch(`${API_BASE}/topics`);
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch topic metrics' }));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
     // Assuming backend returns the correct TopicMetrics structure
    return await response.json();
  }
  
  
  /**
   * Fetches paginated learning path history for a student.
   */
  export async function getStudentLearningPath(
    studentId: string,
    page: number = 1,
    limit: number = 20 // Default limit
  ): Promise<PaginatedResponse<LearningPathItem>> {
    const response = await fetch(`${API_BASE}/student/${studentId}/path?page=${page}&limit=${limit}`);
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed to fetch learning path for student ${studentId}` }));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
     // Assuming backend returns the correct PaginatedResponse<LearningPathItem> structure
    return await response.json();
  }
  
  /**
   * Fetches paginated assessment history for a student.
   */
  export async function getStudentAssessmentHistory(
     studentId: string,
     page: number = 1,
     limit: number = 10 // Default limit
  ): Promise<PaginatedResponse<AssessmentHistoryItem>> {
     const response = await fetch(`${API_BASE}/student/${studentId}/assessments?page=${page}&limit=${limit}`);
  
     if (!response.ok) {
       const errorData = await response.json().catch(() => ({ message: `Failed to fetch assessment history for student ${studentId}` }));
       throw new Error(errorData.message || `HTTP error ${response.status}`);
     }
      // Assuming backend returns the correct PaginatedResponse<AssessmentHistoryItem> structure
     return await response.json();
  }
  
  /**
   * Fetches mastery heatmap data for a student.
   */
  export async function getStudentMasteryHeatmap(studentId: string): Promise<HeatmapData> {
     const response = await fetch(`${API_BASE}/student/${studentId}/heatmap`);
  
     if (!response.ok) {
       const errorData = await response.json().catch(() => ({ message: `Failed to fetch heatmap for student ${studentId}` }));
       throw new Error(errorData.message || `HTTP error ${response.status}`);
     }
      // Assuming backend returns the correct HeatmapData structure
     return await response.json();
  }