import { ContentRequest, InteractionMetadata, SessionFeedback } from "@/components/tutor/types";

// API client for communicating with the adaptive content backend
export async function streamContent(
  request: ContentRequest,
  onChunk: (chunk: string) => void,
  onMetadata: (metadata: InteractionMetadata) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    // Fixed endpoint path to properly hit the streaming endpoint
    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}: ${response.statusText}`);
    }

    // Extract metadata from headers
    const metadata: Partial<InteractionMetadata> = {};
    response.headers.forEach((value, key) => {
      if (key.startsWith('x-')) {
        const metadataKey = key.substring(2).replace(/-([a-z])/g, g => g[1].toUpperCase());
        metadata[metadataKey as keyof InteractionMetadata] = value;
      }
    });

    onMetadata(metadata as InteractionMetadata);

    // Handle streamed response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body not readable');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (error) {
    console.error('Stream content error:', error);
    onError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

export async function submitFeedback(feedback: SessionFeedback): Promise<void> {
  try {
    const response = await fetch('/api/tutor/feedback/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('Submit feedback error:', error);
    throw error;
  }
}