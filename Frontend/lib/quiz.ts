import { QuizData } from "@/types/quiz";

export async function generateQuiz(
  topic: string, 
  difficulty: string, 
  questionCount: number = 5,
  questionTypes: string[] = ['multiple-choice', 'true-false', 'short-answer']
): Promise<QuizData> {
  try {
    const prompt = `Generate a quiz on ${topic} for grade 6-12 students at ${difficulty} difficulty level. Create ${questionCount} questions using a mix of these question types: ${questionTypes.join(', ')}.

Please return the response in the following JSON format only, with no additional text or explanations outside the JSON structure:

{
  "title": "Quiz title related to the topic",
  "description": "Brief description of the quiz",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Correct option here",
      "explanation": "Brief explanation of why this is the correct answer"
    },
    {
      "id": "q2",
      "type": "true-false",
      "question": "Statement that is either true or false",
      "correctAnswer": true,
      "explanation": "Brief explanation of why this is true/false"
    },
    {
      "id": "q3",
      "type": "short-answer",
      "question": "Short answer question here?",
      "correctAnswer": "The correct answer",
      "acceptableAnswers": ["Alternative answer 1", "Alternative answer 2"],
      "explanation": "Brief explanation of the correct answer"
    },
    {
      "id": "q4",
      "type": "matching",
      "question": "Match the items on the left with their corresponding matches on the right",
      "items": [
        {"id": "i1", "text": "Item 1"},
        {"id": "i2", "text": "Item 2"},
        {"id": "i3", "text": "Item 3"}
      ],
      "matches": [
        {"id": "m1", "text": "Match 1"},
        {"id": "m2", "text": "Match 2"},
        {"id": "m3", "text": "Match 3"}
      ],
      "correctPairs": [
        {"itemId": "i1", "matchId": "m2"},
        {"itemId": "i2", "matchId": "m3"},
        {"itemId": "i3", "matchId": "m1"}
      ],
      "explanation": "Brief explanation of the correct matches"
    },
    {
      "id": "q5",
      "type": "fill-in-blank",
      "question": "Fill in the blanks in the following text",
      "text": "The process of [blank-1] is essential for plant growth, as it uses [blank-2] and water to produce glucose.",
      "blanks": [
        {"id": "blank-1", "correctAnswer": "photosynthesis", "acceptableAnswers": ["photo-synthesis"]},
        {"id": "blank-2", "correctAnswer": "carbon dioxide", "acceptableAnswers": ["CO2"]}
      ],
      "explanation": "Brief explanation of the answers"
    }
  ]
}`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma3:4b", // or whichever model you're using with Ollama
        prompt,
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate quiz: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the JSON response from the LLM output
    let quizData: QuizData;
    try {
      // If the response is already parsed JSON
      if (data.response && typeof data.response === "object") {
        quizData = data.response;
      } else {
        // Try to parse the response if it's a string
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          quizData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON from response");
        }
      }
      
      // Validate the structure
      if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error("Invalid quiz data format");
      }
      
      // Add ids if they're missing
      quizData.questions = quizData.questions.map((q, i) => ({
        ...q,
        id: q.id || `q${i+1}`,
      }));
      
      return quizData;
    } catch (error) {
      console.error("Error parsing quiz data:", error);
      throw new Error("Failed to parse quiz data from LLM response");
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}