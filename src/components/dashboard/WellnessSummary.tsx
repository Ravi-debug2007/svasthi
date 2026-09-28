"use client";

import { SourceBadge } from "@/components/ui/SourceBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";

/**
 * WellnessSummary (F07, ui-registry scope):
 * - Illustrative self-report index with the FORMULA VISIBLE in the UI (spec:
 *   "a visible explanation of how it's calculated, shown to the user, not
 *   hidden in a tooltip"). Not a medical or validated measure.
 * - Missing data renders "Not enough information" — never a fake number.
 * - Streak counts only real distinct check-in dates, and says so.
 * - No red/green moral judgment: support-toned bar, neutral wording.
 */

export type WellnessSummaryProps = {
  /** Index from the newest real check-in, or null when it can't be computed. */
  score: number | null;
  /** True when there are real entries but the newest one lacks mood/stress/energy. */
  hasEntries: boolean;
  streakDays: number;
};

export function WellnessSummary({ score, hasEntries, streakDays }: WellnessSummaryProps) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">Self-report index</h3>
        <SourceBadge kind="self-reported" />
      </div>

      {score == null ? (
        <p className="mt-3 text-3xl font-semibold tracking-tight text-ink-muted">
          Not enough information
        </p>
      ) : (
        <>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-ink">
            {score}
            <span className="ml-1 text-base font-normal text-ink-muted">/100</span>
          </p>
          <div className="mt-4">
            <ProgressBar
              label={`Self-report index: ${score} of 100`}
              value={score}
              tone="support"
            />
          </div>
        </>
      )}

      {/* Formula visible in the UI, per dashboard-and-scoring.md */}
      <p className="mt-4 text-xs leading-5 text-ink-muted">
        How this is calculated: 100 × ( 0.5 × (mood−1)/4 + 0.3 × (1−stress/10) + 0.2 ×
        energy/10 ), using your newest check-in. It is an illustrative summary of your own
        ratings — <strong className="font-semibold">not</strong> a medical or validated
        measure, and it never decides what support you are offered. Sleep is shown
        separately, and nothing about your voice goes into this number.
      </p>

      <hr className="my-5 border-stone-100" />

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">Check-in streak</h3>
        <SourceBadge kind="self-reported" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">
        {streakDays > 0 ? `${streakDays} day${streakDays === 1 ? "" : "s"}` : "—"}
      </p>
      <p className="mt-1.5 text-xs leading-5 text-ink-muted">
        {streakDays > 0
          ? "Counted from your actual distinct check-in dates. Sample data never counts toward it."
          : hasEntries
            ? "Your streak restarts after a two-day gap. Check in today to begin a new one."
            : "Counted from your real check-in days once you start checking in."}
      </p>
    </div>
  );
}
