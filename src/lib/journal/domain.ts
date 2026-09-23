import { z } from "zod";
import { journalSchema } from "@/lib/schemas";
import { Recording } from "@/lib/audio/use-recorder";
import { analyzeRecording } from "@/lib/audio/analyze";

/**
 * Journal domain logic (F03). Pure and testable: the page owns interaction,
 * this module owns the rules. Mirrors journalSchema — the server is the
 * authority, this keeps the client from drifting away from it.
 */

export type JournalFieldErrors = Partial<Record<"transcript" | "consent" | "recording", string>>;

export type JournalPayload = z.infer<typeof journalSchema>;

export function validateJournalTranscript(transcript: string): string | null {
  const trimmed = transcript.trim();
  if (trimmed.length === 0) {
    return "Write (or record) a reflection first — even one sentence is enough.";
  }
  if (trimmed.length > 4000) {
    return "Reflections can be up to 4000 characters. Shorten yours a little.";
  }
  return null;
}

/**
 * Build the POST payload. Features come from real local measurement of the
 * actual recording; when the browser can't measure the clip, features are
 * omitted and the UI says so — numbers are never invented to fill the gap.
 */
export async function buildJournalPayload(input: {
  transcript: string;
  keptRecording: Recording | null;
}): Promise<{ ok: true; value: JournalPayload } | { ok: false; errors: JournalFieldErrors }> {
  const errors: JournalFieldErrors = {};

  const transcriptError = validateJournalTranscript(input.transcript);
  if (transcriptError) errors.transcript = transcriptError;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  let features: JournalPayload["features"] | undefined;
  if (input.keptRecording) {
    const measured = await analyzeRecording(
      input.keptRecording.blob,
      input.keptRecording.durationSeconds,
      input.transcript,
    );
    if (measured) {
      features = {
        durationSeconds: measured.durationSeconds,
        pauseRatio: measured.pauseRatio,
        speakingRateWpm: measured.speakingRateWpm,
        rmsDb: measured.rmsDb,
      };
    }
  }

  const parsed = journalSchema.safeParse({
    transcript: input.transcript.trim(),
    ...(features ? { features } : {}),
    consent: true,
  });
  if (!parsed.success) {
    return { ok: false, errors: { transcript: "One of the values is out of range. Please review." } };
  }
  return { ok: true, value: parsed.data };
}
