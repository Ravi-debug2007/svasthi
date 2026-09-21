import { NextResponse } from "next/server";
import { errorResponse, isAuthContext, requireUser } from "@/lib/http";
import { journalSchema } from "@/lib/schemas";
import { hasCrisisSignal } from "@/lib/safety/crisis";

export const dynamic = "force-dynamic";

function toJournal(row: {
  id: string;
  created_at: string;
  transcript: string;
  voice_features: {
    duration_seconds: string | number;
    pause_ratio: string | number;
    speaking_rate_wpm: string | number;
    rms_db: string | number | null;
  } | null;
}) {
  const features = row.voice_features;
  return {
    id: row.id,
    createdAt: row.created_at,
    transcript: row.transcript,
    features: {
      durationSeconds: Number(features?.duration_seconds ?? 0),
      pauseRatio: Number(features?.pause_ratio ?? 0),
      speakingRateWpm: Number(features?.speaking_rate_wpm ?? 0),
      rmsDb: features?.rms_db == null ? undefined : Number(features.rms_db),
    },
  };
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!isAuthContext(auth)) return auth;

  const parsed = journalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return errorResponse(
      "Invalid journal entry. Consent, a transcript, and voice features are required.",
      400,
      parsed.error.flatten(),
    );
  }

  const { supabase, userId } = auth;

  const { data: journalRow, error: journalError } = await supabase
    .from("journals")
    .insert({ user_id: userId, transcript: parsed.data.transcript, consent: true })
    .select("id, created_at, transcript")
    .single();

  if (journalError || !journalRow) {
    return errorResponse("Could not save your reflection.", 500, journalError?.message);
  }

  const { error: featuresError } = await supabase.from("voice_features").insert({
    journal_id: journalRow.id,
    user_id: userId,
    duration_seconds: parsed.data.features.durationSeconds,
    pause_ratio: parsed.data.features.pauseRatio,
    speaking_rate_wpm: parsed.data.features.speakingRateWpm,
    rms_db: parsed.data.features.rmsDb ?? null,
  });

  if (featuresError) {
    return errorResponse("Could not save the recording measurements.", 500, featuresError.message);
  }

  return NextResponse.json(
    {
      journal: toJournal({ ...journalRow, voice_features: null }),
      // Surfaced so the client can offer support without guessing.
      crisisSignal: hasCrisisSignal(parsed.data.transcript),
    },
    { status: 201 },
  );
}
