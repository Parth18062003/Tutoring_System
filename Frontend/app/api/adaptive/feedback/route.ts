// app/api/adaptive/feedback/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const ADAPTIVE_API_URL = process.env.ADAPTIVE_API_URL;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

export async function POST(request: NextRequest) {
  if (!ADAPTIVE_API_URL) {
    console.error("ADAPTIVE_API_URL environment variable is not set.");
    return NextResponse.json(
      { error: "Configuration error: Backend API URL missing." },
      { status: 500 }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    console.warn("Unauthorized access attempt to /api/adaptive/feedback");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const requestBody = await request.json();

    // Simple validation: ensure interaction_id is present
    if (!requestBody?.interaction_id) {
      return NextResponse.json(
        { error: "Missing 'interaction_id' in request body." },
        { status: 400 }
      );
    }

    // Prepare headers for the backend request
    const backendHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json", // Expecting JSON response
      "X-Authenticated-User-Id": userId,
    };
    if (INTERNAL_API_SECRET) {
      backendHeaders["X-Internal-Api-Secret"] = INTERNAL_API_SECRET;
    }

    console.log(
      `Proxying feedback submission for user ${userId} to ${ADAPTIVE_API_URL}/feedback/submit`
    );

    // Make the request to the Python backend
    const backendResponse = await fetch(`${ADAPTIVE_API_URL}/feedback/submit`, {
      method: "POST",
      headers: backendHeaders,
      body: JSON.stringify(requestBody),
    });

    // Forward the backend's response (status and body)
    const responseBody = await backendResponse.json();
    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (error: any) {
    console.error("Error in /api/adaptive/feedback proxy:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body format." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: "Internal server error proxying feedback submission.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
