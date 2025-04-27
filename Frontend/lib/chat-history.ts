import { Message } from "@ai-sdk/react";
import { generateId } from "ai";
import prisma from "./prisma";
import { getUserId } from "./actions";

// Create a new conversation
export async function createConversation(
  title?: string
): Promise<string | null> {
  const { success, userId, error } = await getUserId();
  if (!userId) return null;

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title: title || "New Conversation",
    },
  });

  return conversation.id;
}

// Load messages for a conversation
// In your loadConversation function, ensure proper mapping of DB messages to Message type
export async function loadConversation(id: string): Promise<Message[] | null> {
  const { success, userId, error } = await getUserId();
  if (!userId) return null;
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!conversation) return null;

  return conversation.messages.map((msg) => ({
    id:
      msg.id ||
      `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Ensure ID exists
    role: msg.role as "data" | "system" | "user" | "assistant",
    content: msg.content,
    createdAt: msg.createdAt,
  }));
}

// Get all conversations for current user
export async function getConversations() {
  const { success, userId, error } = await getUserId();
  if (!userId) return [];

  const conversations = await prisma.conversation.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return conversations;
}

// Save messages
// Update the saveMessages function to trigger title generation when needed
export async function saveMessages({
  conversationId,
  messages,
}: {
  conversationId: string;
  messages: Message[];
}): Promise<boolean> {
  const { success, userId, error } = await getUserId();
  if (!userId) return false;
  // Verify the conversation belongs to the user
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) return false;

  // Delete existing messages for this conversation
  await prisma.message.deleteMany({
    where: {
      conversationId,
    },
  });

  // Create new messages
  await prisma.$transaction(
    messages.map((message) =>
      prisma.message.create({
        data: {
          id: message.id || generateId(),
          conversationId,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt || new Date(),
        },
      })
    )
  );

  // Update conversation last updated timestamp
  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  // Check if we should generate a title (if it's still the default title)
  if (conversation.title === "New Conversation" && messages.length >= 2) {
    // Check if we have both user and assistant messages
    const hasUserMessage = messages.some((m) => m.role === "user");
    const hasAssistantMessage = messages.some((m) => m.role === "assistant");

    if (hasUserMessage && hasAssistantMessage) {
      // Call the generate-title API
      try {
        const response = await fetch(
          `http://localhost:3000/api/chatbot/conversations/${conversationId}/generate-title`,
          {
            method: "POST",
          }
        );
      } catch (error) {
        console.error("Error generating title:", error);
      }
    }
  }

  return true;
}

// Delete a conversation
export async function deleteConversation(id: string): Promise<boolean> {
  const { success, userId, error } = await getUserId();

  if (!userId) return false;

  const result = await prisma.conversation.deleteMany({
    where: {
      id,
      userId,
    },
  });

  return result.count > 0;
}

// Update conversation title
export async function updateConversationTitle(
  id: string,
  title: string
): Promise<boolean> {
  const { success, userId, error } = await getUserId();

  if (!userId) return false;

  const result = await prisma.conversation.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      title,
    },
  });

  return result.count > 0;
}
