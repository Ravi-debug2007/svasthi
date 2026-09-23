import { describe, expect, it } from "vitest";

/**
 * Trivial smoke test (F11 start): proves the harness runs, that the "@/"
 * path alias resolves, and nothing more. Real feature tests arrive with
 * their tickets (F04 audio features, F08 crisis detector, etc.).
 */
import { initialJourneyState } from "@/lib/client/journey-reducer";

describe("test harness", () => {
  it("runs vitest and resolves the @ path alias", () => {
    expect(initialJourneyState.status).toBe("restoring");
    expect(initialJourneyState.checkIns).toEqual([]);
  });
});
