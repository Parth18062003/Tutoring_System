import { streamText } from 'ai';
import { ollama } from 'ollama-ai-provider';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    const result = await streamText({
      model: ollama('gemma3:4b'),
      system: messages.find((m: any) => m.role === 'system')?.content || '',
      messages: messages.filter((m: any) => m.role !== 'system')
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}