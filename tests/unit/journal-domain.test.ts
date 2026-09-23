import { describe, expect, it } from "vitest";
import {
  buildJournalPayload,
  validateJournalTranscript,
} from "@/lib/journal/domain";
import { Recording } from "@/lib/audio/use-recorder";

/**
 * Characterization tests for the journal domain rules (F03). The transcript
 * path must work with no microphone at all, and a kept recording is the only
 * source of features — never fabricated ones.
 */
describe("validateJournalTranscript", () => {
  it("rejects empty and whitespace-only reflections", () => {
    expect(validateJournalTranscript("")).toBeTruthy();
    expect(validateJournalTranscript("   \n  ")).toBeTruthy();
  });

  it("accepts a single short sentence", () => {
    expect(validateJournalTranscript("Today was heavy, but I got through it.")).toBeNull();
  });

  it("rejects reflections beyond 4000 characters", () => {
    expect(validateJournalTranscript("a".repeat(4001))).toBeTruthy();
    expect(validateJournalTranscript("a".repeat(4000))).toBeNull();
  });
});

describe("buildJournalPayload", () => {
  it("builds a typed payload with consent and no features", async () => {
    const result = await buildJournalPayload({
      transcript: "Just a typed reflection today.",
      keptRecording: null,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.consent).toBe(true);
      expect(result.value.features).toBeUndefined();
      expect(result.value.transcript).toBe("Just a typed reflection today.");
    }
  });

  it("reports a transcript problem without throwing", async () => {
    const result = await buildJournalPayload({ transcript: "   ", keptRecording: null });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.transcript).toBeTruthy();
  });

  it("omits features when the recording cannot be measured, rather than inventing them", async () => {
    const blob = new Blob(["not really audio"], { type: "audio/webm" });
    const recording: Recording = {
      url: "blob:mock",
      blob,
      durationSeconds: 12,
      mimeType: "audio/webm",
    };
    const result = await buildJournalPayload({
      transcript: "Spoken, but undecodable.",
      keptRecording: recording,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      // analyzeRecording fails on garbage audio in Node (no AudioContext);
      // the payload must still be valid, just honestly feature-less.
      expect(result.value.features).toBeUndefined();
    }
  });
});
