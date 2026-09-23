import { describe, expect, it } from "vitest";
import { calculateLevel, fallbackInsight } from "@/lib/ai/fallback";
import { CheckIn, Journal } from "@/lib/types";

/**
 * Characterization tests for the F04 honesty rules (code-standards.md data
 * honesty; architecture.md risk table: "pauses alone trigger a 'watch' label"
 * is a defect — acoustics stay descriptive only).
 */

const baseCheckIn: CheckIn = {
  id: "check-in-1",
  createdAt: "2026-09-22T08:00:00.000Z",
  mood: 3,
  stress: 4,
  energy: 6,
  sleepHours: 7,
  contexts: [],
};

const calmCheckIn: CheckIn = { ...baseCheckIn, stress: 2, energy: 7 };
const stressedCheckIn: CheckIn = { ...baseCheckIn, stress: 9 };

const typedJournal: Journal = {
  id: "journal-1",
  createdAt: "2026-09-22T08:05:00.000Z",
  transcript: "Just a typed reflection.",
};

const pauseyRecording: Journal = {
  ...typedJournal,
  features: { durationSeconds: 40, pauseRatio: 0.6, speakingRateWpm: 80, rmsDb: -30 },
};

describe("calculateLevel (F04: acoustics descriptive only)", () => {
  it("never lets a high pause ratio alone produce a watch level", () => {
    // This exact input used to return "watch" — the defect architecture.md flags.
    expect(calculateLevel(calmCheckIn, pauseyRecording)).toBe("steady");
  });

  it("still escalates on strong self-reported signals", () => {
    expect(calculateLevel(stressedCheckIn, typedJournal)).toBe("watch");
    expect(calculateLevel({ ...calmCheckIn, energy: 1 }, typedJournal)).toBe("watch");
  });

  it("stays steady for calm self-reports regardless of any audio measurements", () => {
    expect(calculateLevel(calmCheckIn, typedJournal)).toBe("steady");
    expect(
      calculateLevel(calmCheckIn, {
        ...typedJournal,
        features: { durationSeconds: 60, pauseRatio: 1, speakingRateWpm: 0, rmsDb: -120 },
      }),
    ).toBe("steady");
  });
});

describe("fallbackInsight evidence honesty", () => {
  it("cites acoustic data as a session-specific measurement, not a personal baseline", () => {
    const insight = fallbackInsight(calmCheckIn, pauseyRecording);
    const acoustic = insight.evidence.find((line) => line.includes("quiet moments"));
    expect(acoustic).toBeTruthy();
    expect(acoustic).toMatch(/Measured from your audio/);
    expect(acoustic).toMatch(/this recording/);
    expect(acoustic).not.toMatch(/usual|baseline|compared to (your|past)/i);
  });

  it("never cites acoustics for a typed reflection (no recording, no measurements)", () => {
    const insight = fallbackInsight(calmCheckIn, typedJournal);
    expect(insight.evidence.some((line) => line.includes("recording"))).toBe(false);
    expect(insight.evidence).toContain("You made time to notice how you are feeling today.");
  });

  it("keeps the fixed non-medical disclaimer and fallback source", () => {
    const insight = fallbackInsight(calmCheckIn, typedJournal);
    expect(insight.disclaimer).toBe("This is a wellness signal, not a diagnosis or medical advice.");
    expect(insight.source).toBe("fallback");
    expect(insight.crisis).toBe(false);
  });
});
