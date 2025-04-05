// src/lib/stream-utils.ts
import { InteractionMetadata, StructuredContentResponse } from '@/types/adaptive'; // Adjust path if needed

/**
 * Async generator to read chunks from a Response body stream.
 */
export async function* streamResponse(response: Response): AsyncGenerator<string, void, unknown> {
  if (!response.body) {
    throw new Error("Response body is null");
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
      while (true) {
          const { done, value } = await reader.read();
          if (done) {
              break;
          }
          yield value;
      }
  } finally {
      reader.releaseLock(); // Ensure the lock is released
  }
}

/**
 * Parses custom X- headers from a Headers object into InteractionMetadata.
 * Converts kebab-case header keys to camelCase object keys.
 */
export function parseInteractionMetadata(headers: Headers): InteractionMetadata {
    const metadata: Record<string, string> = {};
    const headerMapping: Record<string, keyof InteractionMetadata> = {
        'x-interaction-id': 'interactionId',
        'x-strategy': 'strategy',
        'x-topic': 'topic',
        'x-difficulty-choice': 'difficultyChoice',
        'x-scaffolding-choice': 'scaffoldingChoice',
        'x-feedback-choice': 'feedbackChoice',
        'x-length-choice': 'lengthChoice',
        'x-subject': 'subject',
        'x-content-type': 'contentType',
        'x-difficulty-level-desc': 'difficultyLevelDesc',
        'x-mastery-at-request': 'masteryAtRequest',
        'x-effective-difficulty-value': 'effectiveDifficultyValue',
        'x-prereq-satisfaction': 'prereqSatisfaction',
    };

    headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey in headerMapping) {
            try {
                metadata[headerMapping[lowerKey]] = decodeURIComponent(escape(value));
            } catch (e) {
                 console.warn(`Could not decode header ${key}:`, value, e);
                 metadata[headerMapping[lowerKey]] = value;
            }
        }
    });

    const defaultMetadata: InteractionMetadata = {
        interactionId: '', strategy: '', topic: '', difficultyChoice: '',
        scaffoldingChoice: '', feedbackChoice: '', lengthChoice: '', subject: '',
        contentType: '', difficultyLevelDesc: '', masteryAtRequest: '0',
        effectiveDifficultyValue: '0.5', prereqSatisfaction: '0.5',
    };

    return { ...defaultMetadata, ...metadata };
}

/**
 * Parses a complete string, potentially containing Markdown fences around JSON,
 * into a StructuredContentResponse object.
 *
 * @param rawJsonString The full string accumulated from the stream.
 * @returns The parsed StructuredContentResponse object or null if parsing fails.
 */
export function parseStructuredContent(rawJsonString: string): StructuredContentResponse | null {
    if (!rawJsonString?.trim()) {
        console.warn("Attempted to parse empty or whitespace-only content string.");
        return null;
    }

    let cleanedJsonString = rawJsonString.trim();

    // --- Robustly remove potential Markdown code fences ---
    // Find the first opening curly brace and the last closing curly brace
    const firstBraceIndex = cleanedJsonString.indexOf('{');
    const lastBraceIndex = cleanedJsonString.lastIndexOf('}');

    if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex < firstBraceIndex) {
        // If no valid braces found, likely not JSON or severely malformed
        console.error("Could not find valid JSON structure (missing '{' or '}') in the raw content:", rawJsonString);
        return null;
    }

    // Extract the content between the first '{' and the last '}' (inclusive)
    cleanedJsonString = cleanedJsonString.substring(firstBraceIndex, lastBraceIndex + 1);
    //-------------------------------------------------------

    try {
        const parsed = JSON.parse(cleanedJsonString);

        // Basic validation: check if it has the expected root properties
        if (parsed && typeof parsed.contentType === 'string' && Array.isArray(parsed.sections)) {
             return parsed as StructuredContentResponse;
        } else {
            console.error("Parsed JSON is missing expected root structure ('contentType' or 'sections'):", parsed);
            // Log details for debugging
            console.log("Original Raw String:", rawJsonString);
            console.log("Cleaned String Attempted:", cleanedJsonString);
            return null;
        }
    } catch (error) {
        console.error("Failed to parse structured content JSON:", error);
        // Log details for debugging
        console.log("Original Raw String:", rawJsonString);
        console.log("Cleaned String Attempted:", cleanedJsonString);
        return null;
    }
}
