
import Chatbot from '@/components/chatbot/Chatbot';
import ChatSidebar from '@/components/chatbot/chatbot-sidebar';
import ReturnButtons from '@/components/return-buttons';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { getUserId } from '@/lib/actions';
import { loadConversation } from '@/lib/chat-history';
import { redirect } from 'next/navigation';

export default async function ChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { userId } = await getUserId();
  const id = params.id;

  // Redirect to sign in if not authenticated
  if (!userId) {
    return redirect('/authentication/sign-in');
  }

  // Load the conversation
  const messages = await loadConversation(params.id);

  // If conversation not found or doesn't belong to user, redirect to new chat
  if (!messages) {
    return redirect('/chatbot');
  }

  return (
    <SidebarProvider>
    <ChatSidebar />
    <SidebarInset>
      <main>
        <div className="flex justify-between px-2">
          
          <SidebarTrigger className="z-10" size="lg"/>
        <ReturnButtons />
        </div>
        <Chatbot conversationId={id} initialMessages={messages}/>
      </main>
    </SidebarInset>
  </SidebarProvider>
  )
}