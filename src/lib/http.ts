import { NextResponse } from "next/server";

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}

export function getSessionId(request: Request) {
  return request.headers.get("x-svasthi-session")?.slice(0, 100) || "demo-session";
}
