import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserId } from '@/lib/actions';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { userId } = await getUserId();
  const id = params.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      return new Response('Conversation not found', { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { userId } = await getUserId();
  const id = params.id;
  const { title } = await request.json();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const updatedConversation = await prisma.conversation.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        title,
      },
    });

    if (updatedConversation.count === 0) {
      return new Response('Conversation not found', { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { userId } = await getUserId();
  const id = params.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const deletedConversation = await prisma.conversation.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (deletedConversation.count === 0) {
      return new Response('Conversation not found', { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}