import type { DailyMetric } from "@/lib/types";

/**
 * Fictional fixture data for the demo "sample history" state. These rows are
 * NEVER written to Supabase and never mixed with real user rows — the UI
 * must badge them as sample data wherever they are shown.
 *
 * Dates are produced by an injected clock so the fixture set is
 * deterministic and testable (see code-standards.md data-honesty rules).
 */

export type SampleDay = DailyMetric & { sample: true };

export function sampleHistory(now: Date = new Date()): SampleDay[] {
  const day = (offset: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    return date.toISOString().slice(0, 10);
  };
  return [
    { date: day(6), mood: 4, stress: 3, sleepHours: 7.6, sample: true },
    { date: day(5), mood: 4, stress: 4, sleepHours: 7.2, sample: true },
    { date: day(4), mood: 3, stress: 5, sleepHours: 6.8, sample: true },
    { date: day(3), mood: 3, stress: 6, sleepHours: 6.5, sample: true },
    { date: day(2), mood: 3, stress: 6, sleepHours: 6.1, sample: true },
    { date: day(1), mood: 2, stress: 7, sleepHours: 5.9, sample: true },
  ];
}

/** One fictional reflection, for demo mode only — always labeled as sample. */
export const sampleReflection = {
  transcript:
    "Deadline week. I keep rereading the same page and the coffee is going cold. Nothing is technically wrong, I am just running on fumes.",
  features: { durationSeconds: 34, pauseRatio: 0.31, speakingRateWpm: 138, rmsDb: -24 },
  sample: true,
} as const;
