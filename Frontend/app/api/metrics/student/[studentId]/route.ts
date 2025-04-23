// app/api/metrics/student/[studentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Your Better Auth instance
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

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized: Not logged in' }, { status: 401 });
  }

  // Security Check: Allow access only to own data or if user is admin
  const accessingOwnData = session.user.id === requestedStudentId;
  const isAdmin = session.user.role === 'admin'; // Adjust role check as needed

  if (!accessingOwnData && !isAdmin) {
     return NextResponse.json({ message: 'Forbidden: Cannot access another user\'s metrics' }, { status: 403 });
  }

   if (!API_BASE_URL) {
     return NextResponse.json({ message: 'Backend service URL not configured' }, { status: 500 });
  }

  try {
     const backendResponse = await fetch(`${API_BASE_URL}/metrics/student/${requestedStudentId}`, {
       method: 'GET',
       headers: {
         'Accept': 'application/json',
         ...(INTERNAL_API_SECRET && { 'X-Internal-Api-Secret': INTERNAL_API_SECRET }),
         // Forward the actual user ID if backend needs it for context (even if path has it)
         'X-Authenticated-User-Id': session.user.id,
       },
       // Consider caching student metrics with revalidation
       next: { revalidate: 60 } // Revalidate every 60 seconds
     });

     const data = await backendResponse.json();

     if (!backendResponse.ok) {
       return NextResponse.json(
         { message: data.detail || `Failed to fetch metrics for student ${requestedStudentId} from backend` },
         { status: backendResponse.status }
       );
     }

     return NextResponse.json(data);

  } catch (error) {
      console.error(`Error fetching student metrics for ${requestedStudentId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      const status = (error instanceof TypeError && error.message.includes('fetch failed')) ? 503 : 500;
      return NextResponse.json({ message: 'Failed to connect to metrics service', details: errorMessage }, { status });
  }
}