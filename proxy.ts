import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// Files that must never be served, even if one is dropped into the project by mistake.
const PROBE = /^\/(?:\.env(?:\.|$|\/)|.env$|\.git(?:\/|$)|prisma(?:\/|$)|node_modules(?:\/|$)|package-lock\.json$)/i;

function hidden() {
  return new NextResponse("Not found", { status: 404, headers: { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" } });
}

// Cheap first gate only: bounces visitors with no session cookie. Every admin page,
// action, and file route still verifies the session and ADMIN role against the database.
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (PROBE.test(path)) return hidden();
  if (!path.startsWith("/admin") || path === "/admin/login") return NextResponse.next();
  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/.env", "/.env/:path*", "/.git/:path*", "/prisma/:path*", "/node_modules/:path*", "/package-lock.json"],
};
