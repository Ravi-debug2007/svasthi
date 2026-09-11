import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, demoMode: process.env.DEMO_MODE === "true", modelConfigured: Boolean(process.env.GEMINI_API_KEY) });
}
