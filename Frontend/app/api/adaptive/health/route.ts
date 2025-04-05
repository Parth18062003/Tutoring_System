// app/api/adaptive/health/route.ts
import { type NextRequest, NextResponse } from "next/server";

const ADAPTIVE_API_URL = process.env.ADAPTIVE_API_URL;

export async function GET(request: NextRequest) {
  if (!ADAPTIVE_API_URL) {
    console.error("ADAPTIVE_API_URL environment variable is not set.");
    return NextResponse.json(
      { error: "Configuration error: Backend API URL missing." },
      { status: 500 }
    );
  }

  try {
    console.log(`Proxying health check to ${ADAPTIVE_API_URL}/healthcheck`);

    const backendResponse = await fetch(`${ADAPTIVE_API_URL}/healthcheck`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const responseBody = await backendResponse.json();
    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (error: any) {
    console.error("Error in /api/adaptive/health proxy:", error);
    // If backend is down, fetch itself will throw
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Failed to connect to the adaptive content backend.",
        details: error.message,
      },
      { status: 503 }
    ); // Service Unavailable
  }
}
