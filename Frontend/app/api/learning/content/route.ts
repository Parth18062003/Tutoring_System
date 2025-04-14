// app/api/learning/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ContentRequest } from '@/types/api-types';

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    // Check for request body
    const contentText = await request.text();
    
    if (!contentText || contentText.trim() === '') {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }
    
    // Safely parse JSON
    let contentRequest: ContentRequest;
    try {
      contentRequest = JSON.parse(contentText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!contentRequest.content_type || !contentRequest.subject) {
      return NextResponse.json(
        { error: 'Missing required fields: content_type and subject are required' },
        { status: 400 }
      );
    }

    // Get session for authentication
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Forward request to backend API
    const response = await fetch(`${API_BASE_URL}/content/next`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authenticated-User-Id': session.user.id,
        'X-Internal-Api-Secret': process.env.INTERNAL_API_SECRET || '',
      },
      body: contentText, // Use the original text to avoid re-serialization issues
    });
    
    // Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || response.statusText },
        { status: response.status }
      );
    }
    
    // Return streaming response
    const headers = new Headers();
    for (const [key, value] of response.headers.entries()) {
      headers.set(key, value);
    }
    
    return new NextResponse(response.body, {
      headers,
      status: response.status,
    });
    
  } catch (error: unknown) {
    console.error('Error in content proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}