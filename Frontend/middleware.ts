import authConfig from "./auth.config"
import NextAuth from "next-auth"
 

const { auth } = NextAuth(authConfig)
export default auth(async function middleware(request) {
  if (!request.auth && request.nextUrl.pathname !== "/authentication/sign-in") {
    const newUrl = new URL("/authentication/sign-in", request.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};