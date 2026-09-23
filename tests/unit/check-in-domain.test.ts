import { describe, expect, it } from "vitest";
import {
  EMPTY_CHECK_IN_DRAFT,
  localDateString,
  validateCheckInDraft,
} from "@/lib/check-in/domain";

/**
 * Characterization tests for the check-in rules (F02). Ranges must mirror
 * checkInSchema exactly — the server is the authority, these protect the
 * client from drifting away from it.
 */
describe("validateCheckInDraft", () => {
  it("rejects an empty draft with a message for every required field", () => {
    const result = validateCheckInDraft(EMPTY_CHECK_IN_DRAFT);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "energy",
        "mood",
        "sleepHours",
        "stress",
      ]);
    }
  });

  it("accepts the smallest and largest valid values", () => {
    for (const draft of [
      { mood: 1, stress: 0, energy: 0, sleepHours: 0, contexts: [] },
      { mood: 5, stress: 10, energy: 10, sleepHours: 24, contexts: ["Work"] },
    ]) {
      const result = validateCheckInDraft(draft);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(draft);
      }
    }
  });

  it("rejects values outside the schema ranges", () => {
    for (const draft of [
      { mood: 0, stress: 0, energy: 0, sleepHours: 7, contexts: [] },
      { mood: 6, stress: 0, energy: 0, sleepHours: 7, contexts: [] },
      { mood: 3, stress: -1, energy: 0, sleepHours: 7, contexts: [] },
      { mood: 3, stress: 0, energy: 11, sleepHours: 7, contexts: [] },
      { mood: 3, stress: 0, energy: 0, sleepHours: 24.5, contexts: [] },
      { mood: 3, stress: 0, energy: 0, sleepHours: -0.5, contexts: [] },
    ]) {
      expect(validateCheckInDraft(draft).ok).toBe(false);
    }
  });

  it("does not invent defaults for missing values", () => {
    // mood/stress/energy unset (null) must not silently become numbers.
    const result = validateCheckInDraft({
      mood: null,
      stress: null,
      energy: null,
      sleepHours: 7,
      contexts: [],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects more than 8 context tags", () => {
    const result = validateCheckInDraft({
      mood: 3,
      stress: 4,
      energy: 5,
      sleepHours: 7,
      contexts: ["a", "b", "c", "d", "e", "f", "g", "h", "i"],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.contexts).toBeTruthy();
  });
});

describe("localDateString", () => {
  it("formats a local calendar date, not UTC", () => {
    // 2026-09-21 23:30 local where local is ahead of UTC.
    const date = new Date(2026, 8, 21, 23, 30);
    expect(localDateString({ now: date })).toBe("2026-09-21");
  });

  it("pads month and day", () => {
    expect(localDateString({ now: new Date(2026, 0, 5) })).toBe("2026-01-05");
  });

  it("defaults to the real clock when none is injected", () => {
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(localDateString()).toBe(expected);
  });
});
