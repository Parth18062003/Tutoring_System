import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import { Session } from "@/lib/auth";
import { getSessionCookie } from "better-auth/cookies";

const authRoutes = ["/authentication/sign-in", "/authentication/sign-up", "/authentication/two-factor"];
const passwordRoutes = [
  "/authentication/reset-password",
  "/authentication/forgot-password",
];
const adminRoutes = ["/admin"];
const publicRoutes = ["/", ]

export default async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isAdminRoute = adminRoutes.includes(pathName);
  const isPublicRoute = publicRoutes.includes(pathName);

/*   	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin,
		headers: {
			cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
		},
	});  */
  const session = getSessionCookie(request);
  if (!session) {
    if (isAuthRoute || isPasswordRoute || isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(
      new URL("/authentication/sign-in", request.url)
    );
  }

  if (session) {
    if(isPublicRoute) {
      return NextResponse.next();
    }
    if (isAuthRoute || isPasswordRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

/*     if (isAdminRoute && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  } */

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

/* import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
 
type Session = typeof auth.$Infer.Session;
 
export async function middleware(request: NextRequest) {
	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: process.env.BETTER_AUTH_URL,
		headers: {
			cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
		},
	});
 
	if (!session) {
		return NextResponse.redirect(new URL("/authentication/sign-in", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
	matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"], // Apply middleware to specific routes
}; */