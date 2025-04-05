import { auth } from '@/lib/auth';
import { ContentRequest } from '@/types/tutor';
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
    
    // Parse the request body
    const contentRequest: ContentRequest = await request.json();
    
    // Forward the request to the RL backend
    const response = await fetch(`${RL_API_URL}/content/next`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authenticated-User-Id': session.user.id,
        'X-Internal-Api-Secret': INTERNAL_API_SECRET
      },
      body: JSON.stringify(contentRequest)
    });
    
    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${errorText}` },
        { status: response.status }
      );
    }
    
    // Create a streaming response
    const responseStream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }
            
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        }
      }
    });
    
    // Pass along all headers from the original response
    const header = new Headers();
    response.headers.forEach((value, key) => {
      header.set(key, value);
    });
    
    // Return the streaming response
    return new NextResponse(responseStream, {
      headers: header,
      status: response.status,
    });
  } catch (error) {
    console.error('Error in content API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}