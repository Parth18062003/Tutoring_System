// app/api/metrics/student/[studentId]/heatmap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const requestedStudentId = session?.user.id || params.studentId; // Use session user ID if available, otherwise use the requested student ID

  // Auth Check
  if (!session || (session.user.id !== requestedStudentId && session.user.role !== 'admin')) {
     return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  if (!API_BASE_URL) {
     return NextResponse.json({ message: 'Backend service URL not configured' }, { status: 500 });
  }

  try {
    const backendResponse = await fetch(`${API_BASE_URL}/metrics/student/${requestedStudentId}/heatmap`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(INTERNAL_API_SECRET && { 'X-Internal-Api-Secret': INTERNAL_API_SECRET }),
        'X-Authenticated-User-Id': session.user.id,
      },
       next: { revalidate: 300 } // Cache heatmap for 5 minutes
    });
    const data = await backendResponse.json();
    if (!backendResponse.ok) {
       return NextResponse.json({ message: data.detail || 'Failed to fetch heatmap from backend' }, { status: backendResponse.status });
    }
    return NextResponse.json(data);
  } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      const status = (error instanceof TypeError && error.message.includes('fetch failed')) ? 503 : 500;
      return NextResponse.json({ message: 'Failed to connect to metrics service (heatmap)', details: errorMessage }, { status });
  }
}