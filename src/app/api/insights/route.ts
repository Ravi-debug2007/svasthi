import { NextResponse } from "next/server";
import { errorResponse, isAuthContext, requireUser } from "@/lib/http";
import { insightRequestSchema } from "@/lib/schemas";
import { crisisMessage, hasCrisisSignal } from "@/lib/safety/crisis";
import { generateGeminiInsight } from "@/lib/ai/gemini";
import { fallbackInsight } from "@/lib/ai/fallback";
import type { CheckIn, Insight, Journal } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/insights
 *
 * Two changes from the previous contract (documented in docs/api-contract.md):
 * 1. Auth is required — the user id comes from the Supabase session, and the
 *    caller may only reference their own stored check-in/journal ids.
 * 2. Consent: when the caller supplies an inline journal payload, it must
 *    include `consent: true` for AI processing. The consent decision also
 *    lives client-side, so the client never sends an inline journal when the
 *    user has declined.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (!isAuthContext(auth)) return auth;

  const parsed = insightRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return errorResponse("Invalid insight request.", 400, parsed.error.flatten());
  }

  const { supabase, userId } = auth;

  // Resolve the check-in: by stored id (own rows only) or inline payload.
  let checkIn: CheckIn | null = null;
  if (parsed.data.checkInId) {
    const { data, error } = await supabase
      .from("check_ins")
      .select("id, created_at, mood, stress, energy, sleep_hours, contexts")
      .eq("id", parsed.data.checkInId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return errorResponse("Could not load the requested check-in.", 500, error.message);
    if (data) {
      checkIn = {
        id: data.id,
        createdAt: data.created_at,
        mood: data.mood,
        stress: data.stress,
        energy: data.energy,
        sleepHours: Number(data.sleep_hours),
        contexts: Array.isArray(data.contexts) ? data.contexts : [],
      };
    }
  } else if (parsed.data.checkIn) {
    checkIn = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...parsed.data.checkIn,
    };
  }

  // Resolve the journal: by stored id (own rows only) or inline payload.
  let journal: Journal | null = null;
  if (parsed.data.journalId) {
    const { data, error } = await supabase
      .from("journals")
      .select("id, created_at, transcript")
      .eq("id", parsed.data.journalId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return errorResponse("Could not load the requested journal.", 500, error.message);
    if (data) {
      journal = {
        id: data.id,
        createdAt: data.created_at,
        transcript: data.transcript,
        // A typed reflection has no recording, so it has no measurements —
        // they stay absent rather than being zero-filled.
      };
      const { data: features } = await supabase
        .from("voice_features")
        .select("duration_seconds, pause_ratio, speaking_rate_wpm, rms_db")
        .eq("journal_id", data.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (features) {
        journal.features = {
          durationSeconds: Number(features.duration_seconds),
          pauseRatio: Number(features.pause_ratio),
          speakingRateWpm: Number(features.speaking_rate_wpm),
          rmsDb: features.rms_db == null ? undefined : Number(features.rms_db),
        };
      }
    }
  } else if (parsed.data.journal) {
    journal = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      transcript: parsed.data.journal.transcript,
      features: parsed.data.journal.features,
    };
  }

  if (!checkIn || !journal) {
    return errorResponse("The requested check-in or journal was not found.", 404);
  }

  // Crisis check always runs before any model call (code-standards.md).
  const base = hasCrisisSignal(journal.transcript)
    ? { ...crisisMessage, source: "fallback" as const }
    : (await generateGeminiInsight(checkIn, journal)) ?? fallbackInsight(checkIn, journal);

  const insight: Omit<Insight, "id" | "createdAt"> = {
    ...base,
    disclaimer: base.disclaimer,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("insights")
    .insert({
      user_id: userId,
      source_check_in_id: parsed.data.checkInId ?? null,
      source_journal_id: parsed.data.journalId ?? null,
      level: insight.level,
      title: insight.title,
      evidence: insight.evidence,
      suggestion: insight.suggestion,
      referral_recommended: insight.referralRecommended,
      crisis: insight.crisis,
      generated_by: insight.source,
    })
    .select("id, created_at")
    .single();

  if (insertError || !inserted) {
    return errorResponse("Could not save the insight.", 500, insertError?.message);
  }

  const fullInsight: Insight = {
    ...insight,
    id: inserted.id,
    createdAt: inserted.created_at,
  };
  return NextResponse.json({ insight: fullInsight });
}
