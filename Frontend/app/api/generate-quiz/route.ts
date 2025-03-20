import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const {
      classNum,
      subject,
      topic,
      questionCount = 5,
      difficulty = "medium",
      questionTypes = ["mcq", "shortAnswer"]
    } = await req.json();

    // Create a detailed system prompt for quiz generation
    const systemPrompt = `You are an expert NCERT curriculum educator for Class ${classNum}. 
Generate a comprehensive quiz about "${topic}" for the subject "${subject}".
Use age-appropriate language for ${getAgeFromClass(classNum)} year old students and ensure content is aligned with NCERT curriculum.
Format your response using markdown with proper organization.

The quiz must follow this structure:
1. Start with a brief introduction about the topic
2. Generate exactly ${questionCount} questions of the following types: ${questionTypes.join(", ")}
3. For multiple-choice questions (mcq), provide 4 options with only one correct answer
4. For short answer questions, keep the expected answer brief
5. For true/false questions, clearly state the statement to be evaluated
6. Include difficulty level for each question (easy, medium, hard)
7. Provide the correct answers separately at the end in an "Answer Key" section

Ensure questions test both conceptual understanding and application of knowledge.
Make questions clear, unambiguous, and appropriate for Class ${classNum} students.
The overall difficulty should be ${difficulty}.`;

    // Call Ollama API without streaming
    const response = await fetch(
      `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma3:4b", // or whatever model you're using
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Please generate a quiz on ${topic} for Class ${classNum} ${subject} with ${questionCount} questions.`,
            },
          ],
          stream: false,
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

    // Return the quiz content
    return NextResponse.json({
      response: responseText,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}

function getAgeFromClass(classNum: string): string {
  const classNumber = parseInt(classNum);
  return `${classNumber + 5}-${classNumber + 6}`;
}