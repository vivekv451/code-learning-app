import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/schools/lookup",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Protect all /api routes except public ones
  if (pathname.startsWith("/api/")) {
    const authHeader = req.headers.get("authorization");
    const cookieToken = req.cookies.get("token")?.value;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : cookieToken;

    if (!token) {
      return Response.json(
        { success: false, error: "Unauthorized — No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json(
        { success: false, error: "Unauthorized — Invalid or expired token" },
        { status: 401 }
      );
    }

    // Attach user info to headers for downstream use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", (decoded as any).id || "");
    requestHeaders.set("x-user-email", (decoded as any).email || "");
    requestHeaders.set("x-user-premium", String((decoded as any).isPremium || false));

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};