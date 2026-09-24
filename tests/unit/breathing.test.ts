import { describe, expect, it } from "vitest";
import {
  BREATHING_STEPS,
  breathingStateAt,
  CYCLE_COUNT,
  CYCLE_SECONDS,
  EXERCISE_NOTES,
  EXERCISE_SECONDS,
  formatRemaining,
  PHASE_LABELS,
} from "@/lib/exercise/breathing";

describe("breathing pattern", () => {
  it("has no breath-hold step — the user never has to hold their breath", () => {
    for (const step of BREATHING_STEPS) {
      expect(["inhale", "exhale"]).toContain(step.phase);
    }
    // No phase type named hold, and no step long enough to imply one.
    expect(BREATHING_STEPS.some((step) => /hold/i.test(step.phase))).toBe(false);
    expect(BREATHING_STEPS).toHaveLength(2);
  });

  it("is a one-minute flow: 6 cycles of 10 seconds", () => {
    expect(CYCLE_SECONDS).toBe(10);
    expect(EXERCISE_SECONDS).toBe(60);
    expect(CYCLE_COUNT).toBe(6);
    expect(CYCLE_COUNT * CYCLE_SECONDS).toBe(EXERCISE_SECONDS);
  });

  it("labels both phases in plain language", () => {
    expect(PHASE_LABELS.inhale).toBe("Breathe in");
    expect(PHASE_LABELS.exhale).toBe("Breathe out");
  });
});

describe("breathingStateAt", () => {
  it("starts on inhale with the full minute remaining", () => {
    const state = breathingStateAt(0);
    expect(state.phase).toBe("inhale");
    expect(state.phaseRemainingSeconds).toBe(4);
    expect(state.remainingSeconds).toBe(60);
    expect(state.progress).toBe(0);
    expect(state.done).toBe(false);
  });

  it("switches to exhale exactly at the 4-second boundary", () => {
    expect(breathingStateAt(3).phase).toBe("inhale");
    expect(breathingStateAt(3).phaseRemainingSeconds).toBe(1);
    expect(breathingStateAt(4).phase).toBe("exhale");
    expect(breathingStateAt(4).phaseElapsedSeconds).toBe(0);
  });

  it("starts a new cycle exactly at the 10-second boundary", () => {
    expect(breathingStateAt(9).phase).toBe("exhale");
    expect(breathingStateAt(9).phaseRemainingSeconds).toBe(1);
    expect(breathingStateAt(10).phase).toBe("inhale");
    expect(breathingStateAt(10).phaseElapsedSeconds).toBe(0);
  });

  it("never reports a zero-or-negative phase countdown while active", () => {
    for (let elapsed = 0; elapsed < EXERCISE_SECONDS; elapsed += 1) {
      const state = breathingStateAt(elapsed);
      expect(state.phaseRemainingSeconds).toBeGreaterThan(0);
      expect(state.remainingSeconds).toBeGreaterThan(0);
      expect(state.done).toBe(false);
    }
  });

  it("finishes exactly at 60 seconds", () => {
    const last = breathingStateAt(59);
    expect(last.done).toBe(false);
    expect(last.remainingSeconds).toBe(1);

    const final = breathingStateAt(60);
    expect(final.done).toBe(true);
    expect(final.remainingSeconds).toBe(0);
    expect(final.progress).toBe(1);
  });

  it("clamps out-of-range and fractional input instead of trusting it", () => {
    expect(breathingStateAt(-30).elapsedSeconds).toBe(0);
    expect(breathingStateAt(-30).phase).toBe("inhale");
    expect(breathingStateAt(9999).done).toBe(true);
    expect(breathingStateAt(9999).remainingSeconds).toBe(0);
    // Fractional seconds floor rather than producing a nonsense phase.
    expect(breathingStateAt(4.9).phase).toBe("exhale");
    expect(breathingStateAt(4.9).elapsedSeconds).toBe(4);
  });

  it("progress is monotonic across the whole flow", () => {
    let previous = -1;
    for (let elapsed = 0; elapsed <= EXERCISE_SECONDS; elapsed += 1) {
      const { progress } = breathingStateAt(elapsed);
      expect(progress).toBeGreaterThanOrEqual(previous);
      previous = progress;
    }
  });
});

describe("formatRemaining", () => {
  it("formats a plain m:ss countdown", () => {
    expect(formatRemaining(60)).toBe("1:00");
    expect(formatRemaining(59)).toBe("0:59");
    expect(formatRemaining(5)).toBe("0:05");
    expect(formatRemaining(0)).toBe("0:00");
  });

  it("never shows negative time", () => {
    expect(formatRemaining(-12)).toBe("0:00");
  });
});

describe("honest copy pins", () => {
  // The estate of "no claimed therapeutic outcome" (F09 acceptance criterion).
  const CLAIM_WORDS = [/\bcure\b/i, /\brelieve\b/i, /\breduces?\b/i, /\bheals?\b/i, /\btherapeutic\b/i];

  it("claims no therapeutic outcome anywhere in the shared copy", () => {
    for (const copy of Object.values(EXERCISE_NOTES)) {
      for (const claim of CLAIM_WORDS) {
        expect(claim.test(copy)).toBe(false);
      }
    }
  });

  it("states the no-hold rule, the stop-if-uncomfortable rule, and the no-outcome rule", () => {
    expect(EXERCISE_NOTES.noHold).toMatch(/no breath-holding/i);
    expect(EXERCISE_NOTES.stopIfUncomfortable).toMatch(/^stop if you feel uncomfortable/i);
    expect(EXERCISE_NOTES.noOutcome).toMatch(/not treatment/i);
    expect(EXERCISE_NOTES.noOutcome).toMatch(/no outcome is promised/i);
  });
});
