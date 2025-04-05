// app/api/adaptive-content/next/route.ts
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

const ADAPTIVE_API_URL = process.env.ADAPTIVE_API_URL;
const INTERNAL_API_SECRET = process.env.ADAPTIVE_INTERNAL_API_SECRET;

export async function POST(request: NextRequest) {
  if (!ADAPTIVE_API_URL) {
    console.error("ADAPTIVE_API_URL environment variable is not set.");
    return NextResponse.json(
      { error: "Backend service configuration error." },
      { status: 500 }
    );
  }
  if (!INTERNAL_API_SECRET) {
    console.error(
      "ADAPTIVE_INTERNAL_API_SECRET environment variable is not set."
    );
    return NextResponse.json(
      { error: "Internal API credential missing." },
      { status: 500 }
    );
  }

  // 1. Get User Session (Server-side)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }
  const userId = session.user.id;

  // 2. Get request body from frontend
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  // 3. Prepare headers for the backend API call
  const header = new Headers();
  header.set("Content-Type", "application/json");
  header.set("X-Authenticated-User-Id", userId);
  header.set("X-Internal-Api-Secret", INTERNAL_API_SECRET);
  // You could forward other safe headers if needed
  // headers.set('Accept', request.headers.get('Accept') || '*/*');

  try {
    // 4. Make the actual call to the Python backend
    const backendResponse = await fetch(`${ADAPTIVE_API_URL}/content/next`, {
      method: "POST",
      headers: header,
      body: JSON.stringify(requestBody),
      // IMPORTANT for streaming: Use duplex 'half' to allow reading response while request might still be sending (less critical for simple POST)
      // @ts-ignore - duplex is standard but might not be in all TS lib versions yet
      duplex: "half",
    });

    // 5. Check if backend call was successful before streaming
    if (!backendResponse.ok) {
      // Try to get error message from backend response body
      const errorBody = await backendResponse.text();
      console.error(`Backend error (${backendResponse.status}): ${errorBody}`);
      return NextResponse.json(
        {
          error: `Backend service error: ${errorBody || backendResponse.statusText}`,
        },
        { status: backendResponse.status }
      );
    }

    // 6. Stream the response back to the frontend client
    // Ensure the response body exists
    if (!backendResponse.body) {
      return NextResponse.json(
        { error: "Backend returned empty response body." },
        { status: 500 }
      );
    }

    // Forward essential headers from backend (like the interaction metadata)
    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      // Only forward specific headers you expect or need, especially custom ones
      if (
        key.toLowerCase().startsWith("x-") ||
        key.toLowerCase() === "content-type"
      ) {
        responseHeaders.set(key, value);
      }
    });

    // Return a new NextResponse that streams the body from the backend response
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders, // Forward the extracted headers
    });
  } catch (error: any) {
    console.error("Error calling adaptive content backend:", error);
    // Log specific fetch errors if possible
    if (error.cause) {
      console.error("Fetch error cause:", error.cause);
    }
    return NextResponse.json(
      { error: `Failed to connect to backend service: ${error.message}` },
      { status: 503 }
    ); // Service Unavailable
  }
}
