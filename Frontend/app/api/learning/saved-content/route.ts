import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get('content_type');
    const subject = searchParams.get('subject');
    
    // Build URL with query parameters
    let url = `${API_BASE_URL}/content/saved`;
    const params = new URLSearchParams();
    if (contentType) params.append('content_type', contentType);
    if (subject) params.append('subject', subject);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Authenticated-User-Id': session.user.id,
        'X-Internal-Api-Secret': process.env.INTERNAL_API_SECRET || '',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || response.statusText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}