import { Readability } from "@mozilla/readability";
import jsdom, { JSDOM } from "jsdom";
import { google } from "@ai-sdk/google";
import { Message, streamText } from "ai";
import { NextResponse } from "next/server";
import { saveMessages } from "@/lib/chat-history";

interface Source {
  url: string;
  title: string;
}
interface ProcessedResult extends Source {
  fullContent: string;
}

/*     const togetherai = createTogetherAI({
        apiKey: process.env.TOGETHER_API_KEY ?? '',
      }); */

export const maxDuration = 45; 

export async function POST(request: Request) {
  console.log("[getAnswer] Received request.");
  if (!process.env.TOGETHER_API_KEY) {
    console.error(
      "[getAnswer] TOGETHER_API_KEY is missing in the execution environment."
    );
    return NextResponse.json(
      { error: "Server configuration error: Missing API Key." },
      { status: 500 }
    );
  }

  let question: string;
  let sources: Source[];
  let messages: Message[] = [];
  let id: string | undefined;
  let file: File | undefined;
  try {
    const body = await request.json();
    question = body.question;
    sources = body.sources;
    id = body.id; 
    messages = body.messages || []; 
    if (!question) {
      throw new Error("'question' (string) required.");
    }
  } catch (error: any) {
    console.error("[getAnswer] Error parsing request body:", error);
    return NextResponse.json(
      { error: `Invalid request: ${error.message}` },
      { status: 400 }
    );
  }

  let finalResults: ProcessedResult[] = [];
  if (sources.length > 0) {
    try {
      const fetchPromises = sources.map(
        async (source: Source, index: number): Promise<ProcessedResult> => {
          try {
            const response = await fetchWithTimeout(source.url);
            if (!response.ok) {
              console.warn(
                `[getAnswer] Failed fetch for ${source.url}. Status: ${response.status}`
              );
              return {
                ...source,
                fullContent: `Could not load content (Status: ${response.status})`,
              };
            }

            const html = await response.text();
            if (!html || html.length === 0) {
              console.warn(`[getAnswer] Empty HTML content for ${source.url}`);
              return {
                ...source,
                fullContent: "Fetched, but HTML content was empty.",
              };
            }

            const virtualConsole = new jsdom.VirtualConsole();
            const dom = new JSDOM(html, { virtualConsole });
            const doc = dom.window.document;
            const parsed = new Readability(doc).parse();

            if (!parsed || !parsed.textContent) {
              console.warn(
                `[getAnswer] Readability parsing failed or returned no textContent for ${source.url}`
              );
              return {
                ...source,
                fullContent: "Nothing found in readable content.",
              };
            }

            const parsedContent = cleanedText(parsed.textContent);

            return {
              ...source,
              fullContent:
                parsedContent.length > 0
                  ? parsedContent
                  : "Content found, but appears empty after parsing.",
            };
          } catch (e: any) {
            console.error(
              `[getAnswer] Error processing source ${source.title} (${source.url}):`,
              e.name,
              e.message
            );
            return {
              ...source,
              fullContent: `Not available (Error: ${e.message || "Unknown error"})`,
            };
          }
        }
      );
      finalResults = await Promise.all(fetchPromises);
    } catch (error: any) {
      console.error(
        "[getAnswer] Error during Promise.all for source fetching:",
        error
      );
      return NextResponse.json(
        { error: `Failed to process sources: ${error.message}` },
        { status: 500 }
      );
    }
  } else {
    console.log("[getAnswer] No sources provided in the request.");
  }

  const usableSources = finalResults.filter(
    (r) =>
      r.fullContent &&
      !r.fullContent.startsWith("Could not load") &&
      !r.fullContent.startsWith("Not available") &&
      r.fullContent !== "Nothing found in readable content." &&
      r.fullContent !== "Fetched, but HTML content was empty." &&
      r.fullContent !== "Content found, but appears empty after parsing."
  );

  let systemPrompt: string;
  let isFallback = false;

  if (usableSources.length === 0) {
    console.log(
      "[getAnswer] No usable sources found. Using non-RAG fallback prompt."
    );
    isFallback = true;
    systemPrompt = `You are a helpful AI assistant. Answer the user's question directly, clearly, and concisely based on your general knowledge. Do not mention context or citations as none were provided.`;
  } else {
    console.log(
      `[getAnswer] Using ${usableSources.length}/${sources.length} sources for RAG response.`
    );
    systemPrompt = `
    You are an expert AI assistant that answers user questions based ONLY on the provided context.
    Given a user question and related contexts, write a clean, concise, and accurate answer using ONLY the information from the contexts.
    You will be given contexts starting with a reference number like [[citation:x]]. Use these citations in your answer when referencing their information, like "This is mentioned in the text [citation:1](link)".
    Cite sources appropriately as you use them. Use multiple citations if information comes from multiple sources [citation:1](link)[citation:2](link).
    Your answer must be correct, accurate, and written in an unbiased and professional tone.
    Do not include information not present in the contexts.
    Do not repeat information.
    If the contexts do not provide sufficient information to answer the question, clearly state "Based on the provided context, information is missing on [specific topic]". Do not invent answers.
    
    Contexts:
    <contexts>
    ${usableSources
      .map(
        (result, index) =>
          `[[citation:${index + 1}]] ${result.url}\n${result.fullContent}`
      )
      .join("\n\n")}
    </contexts>
    
    Answer the following user question based *only* on the provided contexts. Remember to cite relevant sources using [citation:x](link).
    `;
  }

  try {
    const logPrefix = isFallback ? "[getAnswer FALLBACK]" : "[getAnswer RAG]";
    console.log(`${logPrefix} Calling Vercel AI SDK streamText...`);

    const result = await streamText({
      //model: togetherai("meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"),
      model: google("gemini-2.5-pro-exp-03-25"),
      system: systemPrompt, 
      messages: [
        ...messages,
        {
          role: "user",
          content: question,
        },
      ],
      
      async onFinish({ response }) {
        if (id) {
          try {
            if (response.messages && response.messages.length > 0) {
              const lastMessage =
                response.messages[response.messages.length - 1];

              let messageContent = "";
              if (typeof lastMessage.content === "string") {
                messageContent = lastMessage.content;
              } else if (Array.isArray(lastMessage.content)) {
                messageContent = lastMessage.content
                  .filter((part) => part.type === "text")
                  .map((part) => (part as any).text)
                  .join("");
              }

              const assistantMessage = {
                id: `msg-${Date.now()}`,
                role: "assistant" as const,
                content: messageContent,
                createdAt: new Date(),
              };

              await saveMessages({
                conversationId: id,
                messages: [...messages, assistantMessage],
              });
            }
          } catch (error) {
            console.error("Error saving conversation:", error);
          }
        }
      },
      onError: ({ error }) => {
        console.error(`${logPrefix} streamText onError`, error);
      },
    });

    console.log(`${logPrefix} streamText call successful, returning response.`);
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error(
      `[getAnswer] Error setting up or starting streamText (Fallback=${isFallback}):`,
      error
    );
    return NextResponse.json(
      { error: `AI stream failed: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

const cleanedText = (text: string): string => {
  let newText = text
    .trim()
    .replace(/(\n){4,}/g, "\n\n\n")
    .replace(/\n\n/g, " ")
    .replace(/ {3,}/g, "  ")
    .replace(/\t/g, "")
    .replace(/\n+(\s*\n)*/g, "\n");
  const MAX_LEN = 15000;
  if (newText.length > MAX_LEN) {
    console.warn(
      `[cleanedText] Truncating cleaned text from ${newText.length} to ${MAX_LEN} characters.`
    );
    newText = newText.substring(0, MAX_LEN);
  }
  return newText;
};

async function fetchWithTimeout(
  url: string,
  options = {},
  timeout = 4000
): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;
  const fetchTimeout = setTimeout(() => {
    console.warn(`[fetchWithTimeout] Timeout triggered for URL: ${url}`);
    controller.abort();
  }, timeout);
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(fetchTimeout);
    return response;
  } catch (error: any) {
    clearTimeout(fetchTimeout);
    if (error.name === "AbortError") {
      console.error(`[fetchWithTimeout] Request timed out: ${url}`);
      throw new Error(`Request timed out fetching source: ${url}`);
    }
    console.error(`[fetchWithTimeout] Fetch error for ${url}:`, error);
    throw error;
  }
}
