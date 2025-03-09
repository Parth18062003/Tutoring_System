/* /* import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { ipAddress } from "@vercel/functions";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(2, "10s"),
  ephemeralCache: new Map(),
  prefix: "@upstash/ratelimit",
  analytics: true,
});

const { auth } = NextAuth(authConfig);
export default auth(async function middleware(request) {
  if (!request.auth && request.nextUrl.pathname !== "/authentication/sign-in") {
    const newUrl = new URL("/authentication/sign-in", request.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  const req = request as NextRequest;
  const path = req.nextUrl.pathname;
  if (path.startsWith("/api/auth") || path.startsWith("/authentication")) {
    const ip = ipAddress(req) ?? "127.0.0.1";
    const { success, limit, remaining } = await ratelimit.limit(ip);

    const res = success
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/api/blocked", request.url));
    if (!success) {
      res.headers.set("X-RateLimit-Success", success.toString());
      res.headers.set("X-RateLimit-Limit", limit.toString());
      res.headers.set("X-RateLimit-Remaining", remaining.toString());
      
      return NextResponse.redirect(new URL("/api/blocked", request.url));

    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
 
import { NextRequest } from "next/server"
import authConfig from "./auth.config"
import NextAuth from "next-auth"
 
// Use only one of the two middleware options below
// 1. Use middleware directly
// export const { auth: middleware } = NextAuth(authConfig)
 
// 2. Wrapped middleware option
const { auth } = NextAuth(authConfig)
export default auth(async function middleware(req: NextRequest) {
  // Your custom middleware logic goes here
  
}) */