import { NextResponse } from "next/server";
import { errorResponse, isAuthContext, requireUser } from "@/lib/http";
import { journalSchema } from "@/lib/schemas";
import { hasCrisisSignal } from "@/lib/safety/crisis";
import type { Journal } from "@/lib/types";

export const dynamic = "force-dynamic";

function toJournal(row: {
  id: string;
  created_at: string;
  transcript: string;
  voice_features:
    | {
        duration_seconds: string | number;
        pause_ratio: string | number;
        speaking_rate_wpm: string | number;
        rms_db: string | number | null;
      }
    | null;
}): Journal {
  const features = row.voice_features;
  return {
    id: row.id,
    createdAt: row.created_at,
    transcript: row.transcript,
    // Absent when there is no recording — typed reflections carry no measurements.
    features: features
      ? {
          durationSeconds: Number(features.duration_seconds),
          pauseRatio: Number(features.pause_ratio),
          speakingRateWpm: Number(features.speaking_rate_wpm),
          rmsDb: features.rms_db == null ? undefined : Number(features.rms_db),
        }
      : undefined,
  };
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!isAuthContext(auth)) return auth;

  const parsed = journalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return errorResponse(
      "Invalid journal entry. Consent and a transcript are required.",
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

  // Voice features exist only for a real recording. Typed reflections are
  // saved without a voice_features row — nothing is invented for them.
  let features: Journal["features"] | undefined;
  if (parsed.data.features) {
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
    features = parsed.data.features;
  }

  return NextResponse.json(
    {
      journal: toJournal({ ...journalRow, voice_features: features ?? null }),
      // Surfaced so the client can offer support without guessing.
      crisisSignal: hasCrisisSignal(parsed.data.transcript),
    },
    { status: 201 },
  );
}

export async function GET() {
  const auth = await requireUser();
  if (!isAuthContext(auth)) return auth;

  const { supabase, userId } = auth;
  const { data, error } = await supabase
    .from("journals")
    .select(
      "id, created_at, transcript, voice_features(duration_seconds, pause_ratio, speaking_rate_wpm, rms_db)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(90);

  if (error) return errorResponse("Could not load your reflections.", 500, error.message);
  return NextResponse.json({
    journals: (data ?? []).map((row: Parameters<typeof toJournal>[0]) => toJournal(row)),
  });
}
