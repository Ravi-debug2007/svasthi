import { NextResponse } from "next/server";
import { demoStore } from "@/lib/demo-store";
import { errorResponse, getSessionId } from "@/lib/http";
import { checkInSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = checkInSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Invalid check-in.", 400, parsed.error.flatten());
  const checkIn = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...parsed.data };
  return NextResponse.json({ checkIn: demoStore.addCheckIn(getSessionId(request), checkIn) }, { status: 201 });
}

export function GET(request: Request) {
  return NextResponse.json({ checkIns: demoStore.checkIns(getSessionId(request)) });
}
