import { z } from "zod";
import { checkInSchema } from "@/lib/schemas";

/**
 * Check-in domain logic (F02). Pure and testable: the form owns interaction,
 * this module owns the rules. Ranges mirror checkInSchema exactly — mood 1–5,
 * stress/energy 0–10, sleep 0–24, at most 8 context tags. There are no
 * hidden defaults anywhere: the user's values are what get submitted.
 */

export const CONTEXT_OPTIONS = [
  "Work",
  "Study",
  "Sleep",
  "Health",
  "Relationships",
  "Money",
  "Family",
  "Something else",
] as const;

export const MOOD_LABELS: Record<number, string> = {
  1: "Really struggling",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export const MOOD_FACES: Record<number, string> = {
  1: "😣",
  2: "🙁",
  3: "😐",
  4: "🙂",
  5: "😄",
};

export type CheckInDraft = {
  mood: number | null;
  stress: number | null;
  energy: number | null;
  sleepHours: number | null;
  contexts: string[];
};

export type CheckInFieldErrors = Partial<
  Record<"mood" | "stress" | "energy" | "sleepHours" | "contexts", string>
>;

export const EMPTY_CHECK_IN_DRAFT: CheckInDraft = {
  mood: null,
  stress: null,
  energy: null,
  sleepHours: null,
  contexts: [],
};

/**
 * Validate a draft. `null` means "not filled in yet" — surfaced as a
 * field-level error rather than silently defaulted (F02: no hidden
 * submission defaults). Returns a ready-to-post payload on success.
 */
export type CheckInPayload = z.infer<typeof checkInSchema>;

export function validateCheckInDraft(
  draft: CheckInDraft,
): { ok: true; value: CheckInPayload } | { ok: false; errors: CheckInFieldErrors } {
  const errors: CheckInFieldErrors = {};

  if (draft.mood == null) errors.mood = "Choose the face closest to how you feel.";
  if (draft.stress == null) errors.stress = "Set your stress level using the slider.";
  if (draft.energy == null) errors.energy = "Set your energy level using the slider.";

  if (draft.sleepHours == null) {
    errors.sleepHours = "Enter how long you slept, in hours.";
  } else if (!Number.isFinite(draft.sleepHours)) {
    errors.sleepHours = "Sleep hours must be a number.";
  } else if (draft.sleepHours < 0 || draft.sleepHours > 24) {
    errors.sleepHours = "Sleep hours must be between 0 and 24.";
  }

  if (draft.contexts.length > 8) {
    errors.contexts = "Pick at most 8 context tags.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const parsed = parseCheckInPayload({
    mood: draft.mood as number,
    stress: draft.stress as number,
    energy: draft.energy as number,
    sleepHours: draft.sleepHours as number,
    contexts: draft.contexts,
  });
  if (!parsed.ok) {
    // Belt and braces: draft-level checks passed, schema-level failed.
    return { ok: false, errors: { contexts: "One of the values is out of range. Please review." } };
  }
  return { ok: true, value: parsed.value };
}

/** Round a slider-style value and validate it against the server schema. */
function parseCheckInPayload(value: {
  mood: number;
  stress: number;
  energy: number;
  sleepHours: number;
  contexts: string[];
}): { ok: true; value: CheckInPayload } | { ok: false } {
  const result = checkInSchema.safeParse(value);
  return result.success ? { ok: true, value: result.data } : { ok: false };
}

/**
 * Local calendar date as YYYY-MM-DD — one consistent local-date policy
 * (architecture.md: dates must not mix local and UTC interpretations).
 */
export function localDateString(clock: { now?: Date } = {}): string {
  const now = clock.now ?? new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
