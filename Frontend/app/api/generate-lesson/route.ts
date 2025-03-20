import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const {
      classNum,
      subject,
      topic,
      sections = ["explanation", "keyPoints", "examples", "practice"],
    } = await req.json();

    // Create a detailed system prompt for lesson generation
    const systemPrompt = `You are an expert NCERT curriculum educator for Class ${classNum}. 
Generate a comprehensive, well-structured lesson about "${topic}" for the subject "${subject}".
Use clear explanations, age-appropriate language for ${getAgeFromClass(classNum)} year old students, and NCERT-aligned content.
Format your response using markdown with headers, lists, bold text for important concepts, and proper organization.

The lesson must follow this structure:
1. Start with a brief introduction to the topic
2. Provide a detailed explanation with properly formatted definitions and concepts
3. Include key points or takeaways as a bulleted list
4. Give practical examples with step-by-step solutions where applicable
5. Provide ${classNum === "11" || classNum === "12" ? "3-4" : "2-3"} practice questions with answers
${sections.includes("visual") ? "6. Describe a visual representation or diagram that would help students understand the concept" : ""}

Make the content engaging, accurate according to NCERT standards, and include proper headings for each section.`;

    // Call Ollama API without streaming
    const response = await fetch(
      `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma3:4b",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Please generate a complete lesson on ${topic} for Class ${classNum} ${subject}.`,
            },
          ],
          stream: false, // Set to false to disable streaming
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ollama error: ${response.status}, ${errorText}`);
      throw new Error(`Ollama error: ${response.status}`);
    }

    // Parse the complete response
    const data = await response.json();
    let responseText = data.message?.content || "No response content";

    // Clean up any malformed markdown that might be returned
    responseText = responseText.replace(/\*\s*\*\s*([^*]+)\*\s*\*/g, "**$1**"); // Fix bold text
    
    return NextResponse.json({
      response: responseText,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: "Failed to generate lesson" }, { status: 500 });
  }
}

function getAgeFromClass(classNum: string): string {
  const classNumber = parseInt(classNum);
  return `${classNumber + 5}-${classNumber + 6}`;
}