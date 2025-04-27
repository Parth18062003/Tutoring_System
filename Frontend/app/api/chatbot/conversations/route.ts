import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/actions";

export async function GET(request: NextRequest) {
  const { success, userId, error } = await getUserId();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await getUserId();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: "New Conversation",
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
