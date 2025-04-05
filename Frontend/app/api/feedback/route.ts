import { auth } from '@/lib/auth';
import { SessionFeedback } from '@/types/tutor';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Your RL backend API URL
const RL_API_URL = process.env.RL_API_URL || 'http://localhost:8000';
// Secret shared with your backend for internal API access
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse the feedback data
    const feedbackData: SessionFeedback = await request.json();
    
    // Forward the feedback to the RL backend
    const response = await fetch(`${RL_API_URL}/feedback/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authenticated-User-Id': session.user.id,
        'X-Internal-Api-Secret': INTERNAL_API_SECRET
      },
      body: JSON.stringify(feedbackData)
    });
    
    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${errorText}` },
        { status: response.status }
      );
    }
    
    // Return the response from the backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in feedback API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}