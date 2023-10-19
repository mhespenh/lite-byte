import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateToken } from "./util/token-validate";

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get("token");

  if (!tokenCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isTokenValid = await validateToken(tokenCookie.value);
  if (isTokenValid) {
    return NextResponse.next();
  }

  console.log("Invalid token, redirecting to login");
  const redirectedResponse = NextResponse.redirect(
    new URL("/login", request.url)
  );
  redirectedResponse.cookies.delete("token");
  return redirectedResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - login (login page)
     * - signup (signup page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|login|signup|_next/static|_next/image|favicon.ico).*)",
  ],
};
