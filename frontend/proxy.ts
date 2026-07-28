import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const userData = request.cookies.get("user_data")?.value;
  // Both cookies are required. Token-only caused an infinite
  // /login ↔ /dashboard redirect loop ("Rendering..." forever).
  const isLoggedIn = Boolean(token && userData);
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");
  const isAuthPath =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isProtectedPath && !isLoggedIn) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // Drop a half-broken session so login stops bouncing back.
    if (token && !userData) {
      response.cookies.delete("auth_token");
    }
    if (!token && userData) {
      response.cookies.delete("user_data");
    }
    return response;
  }

  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/login", "/register"],
};
