// app/api/adaptive-content/feedback/route.ts
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
const ADAPTIVE_API_URL = process.env.ADAPTIVE_API_URL;
const INTERNAL_API_SECRET = process.env.ADAPTIVE_INTERNAL_API_SECRET;

export async function POST(request: NextRequest) {
  if (!ADAPTIVE_API_URL || !INTERNAL_API_SECRET) {
    console.error('Backend API URL or Secret not configured for feedback.');
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  const userId = session.user.id;

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Validate interaction_id presence (basic check)
  if (!requestBody.interaction_id) {
      return NextResponse.json({ error: 'Missing interaction_id in feedback payload.' }, { status: 400 });
  }

  const header = new Headers();
  header.set('Content-Type', 'application/json');
  header.set('X-Authenticated-User-Id', userId);
  header.set('X-Internal-Api-Secret', INTERNAL_API_SECRET);

  try {
    const backendResponse = await fetch(`${ADAPTIVE_API_URL}/feedback/submit`, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(requestBody),
    });

    // Forward the response body (usually JSON) and status from the backend
    const responseBody = await backendResponse.json();
    return NextResponse.json(responseBody, {
        status: backendResponse.status,
        statusText: backendResponse.statusText
     });

  } catch (error: any) {
    console.error('Error calling feedback submit backend:', error);
    return NextResponse.json({ error: `Failed to connect to backend service: ${error.message}` }, { status: 503 });
  }
}