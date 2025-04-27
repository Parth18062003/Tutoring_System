import { getUserId } from '@/lib/actions';
import { createConversation } from '@/lib/chat-history';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { userId } = await getUserId();
  
  // Redirect to sign in if not authenticated
  if (!userId) {
    return redirect('/authentication/sign-in');
  }
  
  // Create a new conversation and redirect to it
  const id = await createConversation();
  if (id) {
    return redirect(`/chatbot/${id}`);
  }
  
  // Fallback
  return <div>Error creating conversation</div>;
}