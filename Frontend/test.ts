import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import { Session } from "@/lib/auth";

const authRoutes = ["/authentication/sign-in", "/authentication/sign-up"];
const passwordRoutes = ["/authentication/reset-password", "/authentication/forgot-password"];
const adminRoutes = ["/admin"];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isAdminRoute = adminRoutes.includes(pathName);

	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin,
		headers: {
			cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
		},
	});

  if (!session) {
    if (isAuthRoute || isPasswordRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/authentication/sign-in", request.url));
  }

  if (isAuthRoute || isPasswordRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminRoute && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
};
/* import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import { Session } from "@/lib/auth";

const PUBLIC_ROUTES = [
  "/",
  "/authentication/sign-in",
  "/authentication/sign-up",
  "/authentication/reset-password",
  "/authentication/forgot-password",
];

const ADMIN_ROUTES = ["/admin"];

export default async function authMiddleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.includes(path);
  const isAdminRoute = ADMIN_ROUTES.includes(path);

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: process.env.BETTER_AUTH_URL,
      headers: { cookie: request.headers.get("cookie") || "" },
    }
  );

  console.log("Session:", session);
    
  try {

    if (isPublicRoute) {
      // Redirect authenticated users from public routes
      if (session) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      return NextResponse.next();
    }

    // Redirect to sign-in if unauthenticated
    if (!session) {
      return NextResponse.redirect(new URL("/authentication/sign-in", request.url));
    }

    // Admin route protection
    if (isAdminRoute && session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

  } catch (error) {
    console.error("Authentication check failed:", error);
    return NextResponse.redirect(new URL("/authentication/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}; */