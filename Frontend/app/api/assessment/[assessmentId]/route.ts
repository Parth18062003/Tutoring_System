import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export async function GET(request: NextRequest, props: { params: Promise<{ assessmentId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const assessmentId = params.assessmentId;
    
    const response = await fetch(`${API_BASE_URL}/assessment/${assessmentId}`, {
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