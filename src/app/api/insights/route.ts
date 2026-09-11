import { NextResponse } from "next/server";
import { generateGeminiInsight } from "@/lib/ai/gemini";
import { fallbackInsight } from "@/lib/ai/fallback";
import { demoStore } from "@/lib/demo-store";
import { errorResponse, getSessionId } from "@/lib/http";
import { insightRequestSchema } from "@/lib/schemas";
import { crisisMessage, hasCrisisSignal } from "@/lib/safety/crisis";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = insightRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Invalid insight request.", 400, parsed.error.flatten());
  const sessionId = getSessionId(request);
  const checkIn = parsed.data.checkInId
    ? demoStore.checkIn(sessionId, parsed.data.checkInId)
    : parsed.data.checkIn && { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...parsed.data.checkIn };
  const journal = parsed.data.journalId ? demoStore.journal(sessionId, parsed.data.journalId) : parsed.data.journal && { id: crypto.randomUUID(), createdAt: new Date().toISOString(), transcript: parsed.data.journal.transcript, features: parsed.data.journal.features };
  if (!checkIn || !journal) return errorResponse("The requested check-in or journal was not found.", 404);
  const base = hasCrisisSignal(journal.transcript) ? { ...crisisMessage, source: "fallback" as const } : (await generateGeminiInsight(checkIn, journal)) ?? fallbackInsight(checkIn, journal);
  const insight = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...base };
  demoStore.addInsight(sessionId, insight);
  return NextResponse.json({ insight });
}
