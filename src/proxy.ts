import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "eduhub_admin_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (token && token.trim() !== "") {
        return NextResponse.redirect(new URL("/admin/overview", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!token || token.trim() === "") {
      const loginUrl = new URL("/login", request.url);
      if (pathname !== "/admin" && pathname !== "/admin/overview") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
