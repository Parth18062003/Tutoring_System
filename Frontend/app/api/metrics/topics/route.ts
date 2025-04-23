// app/api/metrics/topics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Your Better Auth instance
import { headers } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Optional: Restrict topic metrics to admins or teachers?
  // if (!session || session.user.role !== 'admin') {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

   if (!API_BASE_URL) {
     return NextResponse.json({ message: 'Backend service URL not configured' }, { status: 500 });
  }

  try {
     const backendResponse = await fetch(`${API_BASE_URL}/metrics/topics`, {
       method: 'GET',
       headers: {
         'Accept': 'application/json',
         ...(INTERNAL_API_SECRET && { 'X-Internal-Api-Secret': INTERNAL_API_SECRET }),
       },
       next: { revalidate: 300 } // Revalidate topic metrics less often, e.g., 5 mins
     });

     const data = await backendResponse.json();

     if (!backendResponse.ok) {
       return NextResponse.json(
         { message: data.detail || 'Failed to fetch topic metrics from backend' },
         { status: backendResponse.status }
       );
     }

     return NextResponse.json(data);

  } catch (error) {
     console.error('Error fetching topic metrics:', error);
     const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
     const status = (error instanceof TypeError && error.message.includes('fetch failed')) ? 503 : 500;
     return NextResponse.json({ message: 'Failed to connect to metrics service', details: errorMessage }, { status });
  }
}