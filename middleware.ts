import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { canAccessAdminPath, ADMIN_AREA_ROLES } from "@/lib/auth/roles";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isRetailerRoute = pathname === "/retailer" || pathname.startsWith("/retailer/");

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

  if (isAdminRoute) {
    if (!(ADMIN_AREA_ROLES as readonly string[]).includes(session.role)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Vendors get the vendor pages only — not KYC, roles, settings, hero, etc.
    if (!canAccessAdminPath(session.role, pathname)) {
      return NextResponse.redirect(new URL("/admin/products", request.url));
    }
  }

  if (isRetailerRoute && session.role !== "RETAILER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Hand the path to server components so the layout can re-check against the DB role.
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin/:path*", "/retailer/:path*"],
};