import { NextRequest } from "next/server";
import { successResponse } from "lib/auth";

export async function POST(req: NextRequest) {
  const response = successResponse({ message: "Logged out successfully" });
  // Clear cookie if used
  const headers = new Headers(response.headers);
  headers.set(
    "Set-Cookie",
    "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict"
  );
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}