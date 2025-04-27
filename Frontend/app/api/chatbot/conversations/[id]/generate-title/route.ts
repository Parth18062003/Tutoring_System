import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserId } from '@/lib/actions';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { generateText } from 'ai';

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_API_KEY ?? '',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  // 1. Auth check
  const { success, userId } = await getUserId();
  if (!success || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Load up to 6 user messages in chronological order
    const convo = await prisma.conversation.findUnique({
      where: { id, userId },
      include: {
        messages: {
          where: { role: 'user' },
          orderBy: { createdAt: 'asc' },
          take: 6,
        },
      },
    });
    if (!convo) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (convo.title !== 'New Conversation') {
        return NextResponse.json({ title: convo.title });
      }
      
    if (convo.messages.length === 0) {
      return NextResponse.json({ title: 'New Conversation' });
    }

    
    // 3. Build LLM prompt: system + user messages
    const systemPrompt = `
You are a creative assistant that generates very short, descriptive titles (3–5 words) summarizing a chat based only on the user's questions. Reply with exactly the title text, nothing else.
`.trim();
    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...convo.messages.map(m => ({ role: 'user', content: m.content })),
    ];

    // 4. Call the LLM
    const { text: generated } = await generateText({
        model: togetherai('meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'),
        system: systemPrompt,
        // generateText expects a single prompt string, so join your user messages:
        prompt: convo.messages.map(m => m.content).join('\n'),
      });
      let title = generated.trim() || 'New Conversation';

    // 5. Clean up and truncate
    title = title.replace(/^["']|["']$/g, '').substring(0, 50).trim() || 'New Conversation';

    // 6. Persist back to the database
    await prisma.conversation.update({
      where: { id, userId },
      data: { title },
    });

    return NextResponse.json({ title });
  } catch (err) {
    console.error('Error generating title:', err);
    return NextResponse.json({ error: 'Error generating title' }, { status: 500 });
  }
}