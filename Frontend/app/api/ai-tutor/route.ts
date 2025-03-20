import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Format messages for Ollama
    const ollamaMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add instruction to format response with markdown
    if (ollamaMessages[0].role === 'system') {
      ollamaMessages[0].content += ' Format your responses using markdown with headers, lists, bold for important concepts, and code blocks for formulas when applicable.'
    }

    // Call Ollama API
    const ollamaResponse = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemma3:4b', // Change to any model you have in Ollama
        messages: ollamaMessages,
        stream: false
      })
    });

    if (!ollamaResponse.ok) {
      console.error(`Ollama error: ${ollamaResponse.status}`);
      return NextResponse.json({ error: 'Failed to get response from Ollama' }, { status: 500 });
    }

    // Parse the response
    const data = await ollamaResponse.json();
    let responseText = data.message?.content || "No response content";
    
    // Clean up any malformed markdown that might be returned
    responseText = responseText.replace(/\*\s*\*\s*([^*]+)\*\s*\*/g, '**$1**'); // Fix bold text
    
    // Return the assistant's message
    return NextResponse.json({ 
      response: responseText
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}