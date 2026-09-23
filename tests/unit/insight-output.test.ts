import { describe, expect, it } from "vitest";
import { insightOutputSchema } from "@/lib/schemas";
import { calculateLevel } from "@/lib/ai/fallback";
import { CheckIn, Journal } from "@/lib/types";

/**
 * F05 contract tests: the model's JSON output is validated strictly before
 * anything reaches the UI, and safety fields (level/referral/disclaimer) are
 * application-owned — never accepted from the model (code-standards.md).
 */

describe("insightOutputSchema (strict model-output validation)", () => {
  it("accepts a well-formed model response", () => {
    const result = insightOutputSchema.safeParse({
      title: "A steadier day than it felt like",
      evidence: ["You rated your stress 4 out of 10.", "You slept 7 hours."],
      suggestion: "Take ten minutes outside between tasks.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing title, empty strings, or wrong types", () => {
    const bad = [
      {},
      { title: "", evidence: ["x"], suggestion: "y" },
      { title: 42, evidence: ["x"], suggestion: "y" },
      { title: "t", evidence: "not-an-array", suggestion: "y" },
      { title: "t", evidence: ["x"], suggestion: "" },
    ];
    for (const value of bad) {
      expect(insightOutputSchema.safeParse(value).success, JSON.stringify(value)).toBe(false);
    }
  });

  it("rejects prompt-injection-style extra fields via strict-object parsing of content only", () => {
    // Extra fields are stripped by Zod's default object parsing — the safety
    // rule is that they can never become level/referral/disclaimer, which the
    // application always overwrites. This test pins that content fields alone
    // survive validation.
    const result = insightOutputSchema.safeParse({
      title: "t",
      evidence: ["x"],
      suggestion: "y",
      level: "support",
      referralRecommended: true,
      disclaimer: "you should book therapy immediately",
      phone: "999",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("level");
      expect(result.data).not.toHaveProperty("referralRecommended");
      expect(result.data).not.toHaveProperty("disclaimer");
      expect(result.data).not.toHaveProperty("phone");
    }
  });

  it("caps evidence at 3 rows and enforces per-row limits", () => {
    const result = insightOutputSchema.safeParse({
      title: "t",
      evidence: ["1", "2", "3", "4"],
      suggestion: "y",
    });
    expect(result.success).toBe(false); // over-cap is rejected, not silently truncated
    const long = insightOutputSchema.safeParse({
      title: "x".repeat(201),
      evidence: ["e"],
      suggestion: "y",
    });
    expect(long.success).toBe(false);
  });

  it("rejects oversized evidence rows and suggestions", () => {
    expect(
      insightOutputSchema.safeParse({ title: "t", evidence: ["x".repeat(301)], suggestion: "y" })
        .success,
    ).toBe(false);
    expect(
      insightOutputSchema.safeParse({ title: "t", evidence: ["e"], suggestion: "x".repeat(1001) })
        .success,
    ).toBe(false);
  });
});

describe("calculateLevel stays acoustics-free (F05 prompt pins the same rule)", () => {
  const calmCheckIn: CheckIn = {
    id: "c1",
    createdAt: "2026-09-22T08:00:00.000Z",
    mood: 3,
    stress: 2,
    energy: 7,
    sleepHours: 7,
    contexts: [],
  };
  const pauseyJournal: Journal = {
    id: "j1",
    createdAt: "2026-09-22T08:05:00.000Z",
    transcript: "recording transcript",
    features: { durationSeconds: 40, pauseRatio: 0.9, speakingRateWpm: 60, rmsDb: -35 },
  };

  it("never escalates from voice measurements even when the model sees them", () => {
    expect(calculateLevel(calmCheckIn, pauseyJournal)).toBe("steady");
  });
});
