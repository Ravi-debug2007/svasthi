import { NextResponse } from "next/server";
import { demoStore } from "@/lib/demo-store";
import { errorResponse, getSessionId } from "@/lib/http";
import { journalSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = journalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Invalid journal entry. Consent, a transcript, and voice features are required.", 400, parsed.error.flatten());
  const journal = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), transcript: parsed.data.transcript, features: parsed.data.features };
  return NextResponse.json({ journal: demoStore.addJournal(getSessionId(request), journal) }, { status: 201 });
}
