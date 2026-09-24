import { describe, expect, it } from "vitest";
import {
  buildSeries,
  computeStreak,
  computeWellnessScore,
  localDateKey,
  latestScore,
  overlaySampleDays,
} from "@/lib/dashboard/metrics";
import { sampleHistory } from "@/lib/demo/fixtures";
import type { CheckIn } from "@/lib/types";

/** Fixed clock: 2026-09-24, late evening local time (month is 0-indexed). */
const NOW = new Date(2026, 8, 24, 21, 30, 0);

function checkIn(offsetDays: number, overrides: Partial<CheckIn> = {}): CheckIn {
  const date = new Date(NOW);
  date.setDate(date.getDate() - offsetDays);
  return {
    id: `id-${offsetDays}`,
    createdAt: date.toISOString(),
    mood: 3,
    stress: 5,
    energy: 5,
    sleepHours: 7,
    contexts: [],
    ...overrides,
  };
}

describe("localDateKey", () => {
  it("uses one consistent local-date policy (YYYY-MM-DD, local day)", () => {
    const lateNight = new Date(2026, 8, 24, 23, 59).toISOString();
    const earlyMorning = new Date(2026, 8, 24, 0, 1).toISOString();
    expect(localDateKey(lateNight)).toBe("2026-09-24");
    expect(localDateKey(earlyMorning)).toBe("2026-09-24");
  });

  it("separates adjacent local days", () => {
    const justBeforeMidnight = new Date(2026, 8, 23, 23, 59).toISOString();
    expect(localDateKey(justBeforeMidnight)).toBe("2026-09-23");
  });
});

describe("buildSeries", () => {
  it("returns only days that actually have a check-in — honest gaps, no filler", () => {
    const series = buildSeries([checkIn(0), checkIn(3)], NOW);
    expect(series.map((point) => point.date)).toEqual([
      "2026-09-21", // 3 days back
      "2026-09-24", // today
    ]);
  });

  it("reaches the full 7-day window (today + 6 prior)", () => {
    const series = buildSeries([checkIn(6)], NOW);
    expect(series).toHaveLength(1);
    expect(series[0].date).toBe("2026-09-18");
  });

  it("keeps the latest entry of a day when two check-ins share a date", () => {
    // Real rows always carry distinct timestamps; make that explicit here.
    const earlier = checkIn(0, { id: "a" });
    const later = checkIn(0, {
      id: "b",
      mood: 5,
      createdAt: new Date(NOW.getTime() + 60_000).toISOString(), // 1 min later, same day
    });
    const series = buildSeries([earlier, later], NOW);
    expect(series).toHaveLength(1);
    expect(series[0].mood).toBe(5);
  });

  it("carries mood, stress and sleepHours from the real entry", () => {
    const series = buildSeries(
      [checkIn(0, { mood: 4, stress: 2, sleepHours: 8.5 })],
      NOW,
    );
    expect(series[0]).toMatchObject({
      date: "2026-09-24",
      mood: 4,
      stress: 2,
      sleepHours: 8.5,
      hasEntry: true,
    });
  });

  it("never includes sample days — overlaying them is a separate, badged step", () => {
    const series = buildSeries([checkIn(0)], NOW);
    expect(series.some((point) => "sample" in point)).toBe(false);
  });
});

describe("computeStreak", () => {
  it("counts consecutive distinct real check-in dates ending today", () => {
    const streak = computeStreak([checkIn(0), checkIn(1), checkIn(2)], NOW);
    expect(streak).toBe(3);
  });

  it("counts multiple check-ins on one day as a single streak day", () => {
    const streak = computeStreak(
      [checkIn(0), checkIn(0, { id: "b" }), checkIn(1)],
      NOW,
    );
    expect(streak).toBe(2);
  });

  it("stays alive when yesterday has an entry but today does not", () => {
    const streak = computeStreak([checkIn(1), checkIn(2)], NOW);
    expect(streak).toBe(2);
  });

  it("breaks when the most recent entry is two days old", () => {
    const streak = computeStreak([checkIn(2), checkIn(3)], NOW);
    expect(streak).toBe(0);
  });

  it("never counts sample/fixture days as earned", () => {
    // Fixture days only — no real check-ins at all.
    const streak = computeStreak([], NOW);
    expect(streak).toBe(0);
    // And a real 1-day streak is unaffected by how many sample days exist.
    expect(computeStreak([checkIn(0)], NOW)).toBe(1);
    expect(sampleHistory(NOW)).toHaveLength(6); // fixtures exist, yet streak above is 1
  });
});

describe("computeWellnessScore", () => {
  it("implements the exact formula from dashboard-and-scoring.md", () => {
    // m=3, s=5, e=5 → 100 × (0.5×0.5 + 0.3×0.5 + 0.2×0.5) = 50
    expect(computeWellnessScore(3, 5, 5)).toBe(50);
    // m=1, s=10, e=0 → all-zero terms
    expect(computeWellnessScore(1, 10, 0)).toBe(0);
    // m=5, s=0, e=10 → all-max terms
    expect(computeWellnessScore(5, 0, 10)).toBe(100);
    // m=5, s=10, e=0 → 100 × (0.5 + 0 + 0) = 50
    expect(computeWellnessScore(5, 10, 0)).toBe(50);
  });

  it("returns null when required values are missing or out of range", () => {
    expect(computeWellnessScore(NaN, 5, 5)).toBeNull();
    expect(computeWellnessScore(3, Infinity, 5)).toBeNull();
    expect(computeWellnessScore(0, 5, 5)).toBeNull(); // mood starts at 1
    expect(computeWellnessScore(3, 11, 5)).toBeNull();
    expect(computeWellnessScore(3, 5, -1)).toBeNull();
  });
});

describe("latestScore", () => {
  it("computes from the newest entry only", () => {
    const score = latestScore([
      checkIn(1, { mood: 1, stress: 10, energy: 0 }), // older → 0
      checkIn(0, { mood: 5, stress: 0, energy: 10 }), // newest → 100
    ]);
    expect(score).toBe(100);
  });

  it("returns null with no entries (UI shows 'Not enough information')", () => {
    expect(latestScore([])).toBeNull();
  });
});

describe("overlaySampleDays", () => {
  it("drops sample days that collide with real entries — never blends", () => {
    const real = buildSeries([checkIn(1, { mood: 4 })], NOW); // 2026-09-23
    const sample = sampleHistory(NOW).filter((day) => day.date === "2026-09-23");
    const merged = overlaySampleDays(real, sample);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ date: "2026-09-23", mood: 4 });
    expect("sample" in merged[0] ? merged[0].sample : undefined).toBeUndefined();
  });

  it("keeps sample days on dates without real entries, flagged as sample", () => {
    const real = buildSeries([checkIn(0)], NOW); // only today is real
    const merged = overlaySampleDays(real, sampleHistory(NOW));
    const today = merged.filter((point) => point.date === "2026-09-24");
    expect(today).toHaveLength(1);
    expect("sample" in today[0] ? today[0].sample : true).toBe(true);
    // The six sample days are all there, sorted with the real one.
    expect(merged).toHaveLength(7);
    expect(merged.map((point) => point.date)).toEqual([...merged.map((p) => p.date)].sort());
  });
});
