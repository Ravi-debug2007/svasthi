import { describe, expect, it } from "vitest";
import {
  amplitudeToDbfs,
  computeVoiceFeatures,
  countWords,
  MAX_RECORDING_SECONDS,
} from "@/lib/audio/features";

/**
 * Characterization tests for the descriptive acoustic math (F03/F04).
 * These are honest measurements of real audio — the tests pin the honesty
 * properties: finite values only, silence handled, cap respected.
 */
describe("computeVoiceFeatures", () => {
  it("handles pure silence with finite values", () => {
    const features = computeVoiceFeatures({
      frameRmsValues: new Array(20).fill(0),
      durationSeconds: 2,
      transcriptWordCount: 0,
    });
    expect(features.rmsDb).toBe(-120);
    expect(features.pauseRatio).toBe(1);
    expect(Number.isFinite(features.durationSeconds)).toBe(true);
    expect(Number.isFinite(features.speakingRateWpm)).toBe(true);
  });

  it("never emits NaN or Infinity for empty or malformed frame lists", () => {
    for (const frameRmsValues of [[], [NaN, Infinity, -Infinity], [NaN, 0.2, Infinity]]) {
      const features = computeVoiceFeatures({
        frameRmsValues,
        durationSeconds: 10,
        transcriptWordCount: 30,
      });
      for (const value of [
        features.durationSeconds,
        features.pauseRatio,
        features.speakingRateWpm,
        features.rmsDb,
      ]) {
        expect(Number.isFinite(value)).toBe(true);
      }
    }
  });

  it("classifies quiet vs loud frames at the silence threshold", () => {
    // Half the frames near-silence, half clearly voiced.
    const frames = [
      ...new Array(10).fill(0.005), // below the quiet threshold
      ...new Array(10).fill(0.2), // voiced
    ];
    const features = computeVoiceFeatures({
      frameRmsValues: frames,
      durationSeconds: 2,
      transcriptWordCount: 0,
    });
    expect(features.pauseRatio).toBeCloseTo(0.5, 2);
  });

  it("measures louder audio as a higher (less negative) dBFS level", () => {
    const quiet = computeVoiceFeatures({
      frameRmsValues: new Array(10).fill(0.01),
      durationSeconds: 1,
      transcriptWordCount: 0,
    });
    const loud = computeVoiceFeatures({
      frameRmsValues: new Array(10).fill(0.5),
      durationSeconds: 1,
      transcriptWordCount: 0,
    });
    expect(loud.rmsDb).toBeGreaterThan(quiet.rmsDb);
  });

  it("computes speaking rate from the real word count and duration", () => {
    const features = computeVoiceFeatures({
      frameRmsValues: new Array(10).fill(0.2),
      durationSeconds: 60, // one minute
      transcriptWordCount: 150,
    });
    expect(features.speakingRateWpm).toBe(150);
  });

  it("clamps duration to the 60-second cap", () => {
    expect(MAX_RECORDING_SECONDS).toBe(60);
    const features = computeVoiceFeatures({
      frameRmsValues: new Array(10).fill(0.2),
      durationSeconds: 120, // impossible — recordings are capped
      transcriptWordCount: 150,
    });
    expect(features.durationSeconds).toBe(60);
  });

  it("reports zero speaking rate when there is no duration to divide by", () => {
    const features = computeVoiceFeatures({
      frameRmsValues: new Array(10).fill(0.2),
      durationSeconds: 0,
      transcriptWordCount: 150,
    });
    expect(features.speakingRateWpm).toBe(0);
  });
});

describe("amplitudeToDbfs", () => {
  it("maps full scale to 0 dBFS and clamps instead of returning -Infinity", () => {
    expect(amplitudeToDbfs(1)).toBeCloseTo(0, 5);
    expect(amplitudeToDbfs(0)).toBe(-120);
    expect(amplitudeToDbfs(-0.5)).toBe(-120); // nonsensical input, safe output
    expect(Number.isFinite(amplitudeToDbfs(NaN))).toBe(true);
  });
});

describe("countWords", () => {
  it("counts words separated by any whitespace", () => {
    expect(countWords("one two three")).toBe(3);
    expect(countWords("  spaced\tout\nwords  ")).toBe(3);
  });

  it("returns zero for empty or whitespace-only text", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   \n\t ")).toBe(0);
  });
});
