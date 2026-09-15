import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const ADMIN_AREA_ROLES = ["ADMIN", "SUPER_ADMIN", "OPERATIONS_MANAGER", "VENDOR"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isRetailerRoute = pathname.startsWith("/retailer");

  if (!isAdminRoute && !isRetailerRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !ADMIN_AREA_ROLES.includes(session.role)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isRetailerRoute && session.role !== "RETAILER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/retailer/:path*"],
};