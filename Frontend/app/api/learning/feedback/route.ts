// app/api/learning/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get request body as text first to avoid JSON parse errors
    const bodyText = await request.text();

    // Parse the body
    let feedbackData;
    try {
      feedbackData = JSON.parse(bodyText);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Call the FastAPI backend
    const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authenticated-User-Id": session.user.id,
        "X-Internal-Api-Secret": process.env.INTERNAL_API_SECRET || "",
      },
      body: bodyText, // Use original text to avoid re-serialization issues
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Feedback API error:", errorText);
      return NextResponse.json(
        { error: errorText || response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in feedback proxy:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
