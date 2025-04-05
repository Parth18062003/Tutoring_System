import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.ADAPTIVE_API_URL || 'http://localhost:8000';
const API_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(
  request: NextRequest,
  // No need for params as we're using request.nextUrl.pathname
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const path = '/content/next'
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authenticated-User-Id': userId,
        'X-Internal-Api-Secret': API_SECRET || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API responded with ${response.status}: ${errorData}`);
      return NextResponse.json(
        { error: `API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    if (path.includes('/content/next')) {
      // For streamed responses
      const stream = response.body;
      if (!stream) {
        return NextResponse.json(
          { error: 'No stream available from upstream API' },
          { status: 500 }
        );
      }
      return new NextResponse(stream, {
        status: response.status,
        headers: responseHeaders,
      });
    } else {
      // For regular JSON responses
      const data = await response.json();
      return NextResponse.json(data, {
        status: response.status,
        headers: responseHeaders,
      });
    }
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to adaptive API' },
      { status: 500 }
    );
  }
}