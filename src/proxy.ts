import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If anyone tries to access /admin/login, send them straight to the overview dashboard
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
