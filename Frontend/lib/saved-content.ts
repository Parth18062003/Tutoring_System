// lib/api/saved-content.ts
import { SavedContentItem, SavedContentDetail } from '@/types/api-types';

export async function saveContent(contentData: any): Promise<{ content_id: string }> {
  const response = await fetch('/api/learning/save-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contentData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to save content');
  }

  return response.json();
}

export async function getSavedContentList(
  contentType?: string,
  subject?: string
): Promise<SavedContentItem[]> {
  let url = '/api/learning/saved-content';
  const params = new URLSearchParams();
  
  if (contentType) params.append('content_type', contentType);
  if (subject) params.append('subject', subject);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch saved content');
  }
  
  return response.json();
}

export async function getSavedContent(contentId: string): Promise<SavedContentDetail> {
  const response = await fetch(`/api/learning/saved-content/${contentId}`);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch content details');
  }
  
  return response.json();
}

export async function deleteSavedContent(contentId: string): Promise<void> {
  const response = await fetch(`/api/learning/saved-content/${contentId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to delete saved content');
  }
}