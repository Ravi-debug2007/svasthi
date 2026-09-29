/**
 * F09 breathing-pattern logic — pure (a function of elapsed seconds; the
 * component owns the clock) and unit-tested, following the pattern used by
 * check-in/domain.ts, journal/domain.ts, and dashboard/metrics.ts.
 *
 * Constraints from build-plan.md F09 + ui-tokens.md:
 * - One-minute flow: 60 seconds, six ten-second cycles.
 * - NO hold step exists in the pattern — the user never has to hold their
 *   breath (acceptance criterion). There is deliberately no "hold" phase type.
 * - Copy constants avoid any claimed therapeutic outcome: this is a pacing
 *   guide, not treatment (pinned by tests).
 * - Motion: the animated guide lives in the component; this module is pure
 *   so the reduced-motion/text-only mode uses exactly the same math.
 */

export type BreathPhase = "inhale" | "exhale";

export type BreathStep = { phase: BreathPhase; seconds: number };

/** 4s in, 6s out. No hold step — by design, not by omission. */
export const BREATHING_STEPS: readonly BreathStep[] = [
  { phase: "inhale", seconds: 4 },
  { phase: "exhale", seconds: 6 },
];

export const CYCLE_SECONDS = BREATHING_STEPS.reduce(
  (total, step) => total + step.seconds,
  0,
);

/** One-minute flow (acceptance criterion). */
export const EXERCISE_SECONDS = 60;

export const CYCLE_COUNT = EXERCISE_SECONDS / CYCLE_SECONDS;

export const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: "Breathe in",
  exhale: "Breathe out",
};

/** Honest copy, shared so the page and the component can't drift apart. */
export const EXERCISE_NOTES = {
  noHold: "There is no breath-holding in this pattern — you never need to hold your breath.",
  stopIfUncomfortable:
    "Stop if you feel uncomfortable, dizzy, or short of breath. Stopping is always fine.",
  noOutcome:
    "A simple pacing guide, not treatment. No outcome is promised, and nothing here is tracked or sent anywhere.",
} as const;

export type BreathingState = {
  elapsedSeconds: number;
  phase: BreathPhase;
  /** Length of the current phase in seconds. */
  phaseSeconds: number;
  phaseElapsedSeconds: number;
  /** Seconds left in the current phase (>= 1 while the flow is running). */
  phaseRemainingSeconds: number;
  /** Seconds left in the whole exercise. */
  remainingSeconds: number;
  /** 0..1 completed. */
  progress: number;
  done: boolean;
};

/** Pure state at `elapsedSeconds`; clamps out-of-range input. */
export function breathingStateAt(elapsedSeconds: number): BreathingState {
  const elapsed = Math.max(
    0,
    Math.min(Math.floor(elapsedSeconds), EXERCISE_SECONDS),
  );
  const done = elapsed >= EXERCISE_SECONDS;
  const cycleElapsed = elapsed % CYCLE_SECONDS;
  const [inhale, exhale] = BREATHING_STEPS;
  const inInhale = cycleElapsed < inhale.seconds;
  const step = inInhale ? inhale : exhale;
  const phaseElapsedSeconds = inInhale ? cycleElapsed : cycleElapsed - inhale.seconds;

  return {
    elapsedSeconds: elapsed,
    phase: step.phase,
    phaseSeconds: step.seconds,
    phaseElapsedSeconds,
    phaseRemainingSeconds: step.seconds - phaseElapsedSeconds,
    remainingSeconds: EXERCISE_SECONDS - elapsed,
    progress: elapsed / EXERCISE_SECONDS,
    done,
  };
}

/** "0:42" — plain, screen-reader-friendly countdown text. */
export function formatRemaining(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
