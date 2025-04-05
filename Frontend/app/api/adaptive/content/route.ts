// app/api/adaptive/content/route.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

const ADAPTIVE_API_URL = process.env.ADAPTIVE_API_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(request: NextRequest) {
    if (!ADAPTIVE_API_URL) {
        console.error("ADAPTIVE_API_URL environment variable is not set.");
        return NextResponse.json({ error: "Configuration error: Backend API URL missing." }, { status: 500 });
    }

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) {
        console.warn("Unauthorized access attempt to /api/adaptive/content");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const requestBody = await request.json();

        // Prepare headers for the backend request
        const backendHeaders: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'text/plain', // Expecting a stream from the backend
            'X-Authenticated-User-Id': userId,
        };
        if (INTERNAL_API_SECRET) {
            backendHeaders['X-Internal-Api-Secret'] = INTERNAL_API_SECRET;
        }

        console.log(`Proxying content request for user ${userId} to ${ADAPTIVE_API_URL}/content/next`);

        // Make the request to the Python backend
        const backendResponse = await fetch(`${ADAPTIVE_API_URL}/content/next`, {
            method: 'POST',
            headers: backendHeaders,
            body: JSON.stringify(requestBody),
            // IMPORTANT for streaming: Use duplex = 'half' if using Node 18+ fetch
            // to allow request body streaming while receiving response stream.
            // May not be strictly necessary if request body is small. Check Node/fetch docs.
             //@ts-ignore - duplex might not be recognized by older TS versions
            duplex: 'half',
        });

        // Check if the backend request itself failed
        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error(`Backend error (${backendResponse.status}): ${errorText}`);
            return NextResponse.json({ error: `Backend service error: ${errorText}` }, { status: backendResponse.status });
        }

        // Check if the response body exists and is readable
        if (!backendResponse.body) {
             console.error("Backend response body is null");
             return NextResponse.json({ error: "Backend returned empty response" }, { status: 500 });
        }

        // --- Stream the response back to the client ---
        const responseStream = backendResponse.body;
        const headersToForward = new Headers();

        // Copy relevant headers from backend response to client response
        backendResponse.headers.forEach((value, key) => {
             const lowerKey = key.toLowerCase();
             // Forward content-type and custom metadata headers
             if (lowerKey === 'content-type' || lowerKey.startsWith('x-')) {
                 headersToForward.set(key, value);
             }
        });

        // Return a streaming response
        return new Response(responseStream, {
            status: backendResponse.status,
            headers: headersToForward,
        });

    } catch (error: any) {
        console.error("Error in /api/adaptive/content proxy:", error);
        // Differentiate between JSON parsing error and other errors
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "Invalid request body format." }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error proxying content request.", details: error.message }, { status: 500 });
    }
}