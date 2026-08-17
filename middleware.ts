import { NextRequest, NextResponse } from "next/server";

// Edge middleware can't import lib/adminAuth (uses Node's `cookies()`/`crypto` APIs
// which aren't available in the Edge runtime), so it re-derives the same token
// check independently here using the Web Crypto API instead of Node's `crypto`.
// SHA-256 output is identical either way, so this still matches the cookie
// value set by lib/adminAuth.ts (which runs in the Node runtime, in API routes).
async function expectedToken(): Promise<string | null> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const bytes = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_session")?.value;
    const expected = await expectedToken();
    if (!expected || token !== expected) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
