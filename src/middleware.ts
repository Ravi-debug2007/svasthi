import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = new Set(
  ["http://localhost:3000", "http://localhost:5173", process.env.FRONTEND_ORIGIN]
    .filter((origin): origin is string => Boolean(origin)),
);

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();
  const origin = request.headers.get("origin");
  const headers = new Headers();
  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "content-type, x-svasthi-session");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Vary", "Origin");
  }
  if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers });
  const response = NextResponse.next();
  headers.forEach((value, name) => response.headers.set(name, value));
  return response;
}

export const config = { matcher: "/api/:path*" };
