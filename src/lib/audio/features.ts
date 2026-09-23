/**
 * Voice-signal primitives shared by the recorder (F03) and the acoustic
 * measurements (F04). The 60-second cap is a product rule
 * (library-docs.md, build-plan.md F03): recordings never exceed one minute.
 */
export const MAX_RECORDING_SECONDS = 60;

export type VoiceFeatures = {
  /** Real recording duration in seconds, clamped to the 60s cap. */
  durationSeconds: number;
  /** Share of frames whose RMS sits near silence, 0..1. */
  pauseRatio: number;
  /** Words per minute computed from the real word count and duration. */
  speakingRateWpm: number;
  /** Real RMS level of the whole clip in dBFS (-120..0). */
  rmsDb: number;
};

const RMS_PAUSE_THRESHOLD = 0.015; // ≈ -36 dBFS; frames below this are "quiet"

/**
 * Convert an amplitude (0..1 linear scale) to dBFS (-120..0).
 * Returns a finite number only — silence maps to -120, never -Infinity.
 */
export function amplitudeToDbfs(rms: number): number {
  if (!Number.isFinite(rms) || rms <= 0) return -120;
  return Math.max(-120, Math.min(0, 20 * Math.log10(rms)));
}

/**
 * Compute descriptive voice features from real PCM frames of an actual
 * recording. These numbers say nothing about emotion or health — they are
 * honest acoustic properties of the audio, full stop (code-standards.md
 * data-honesty rules; F04 will present them with the same framing).
 *
 * `frameRmsValues` are per-frame RMS amplitudes (0..1) already measured from
 * the audio; keeping this pure makes the math directly testable.
 */
export function computeVoiceFeatures(input: {
  frameRmsValues: number[];
  durationSeconds: number;
  transcriptWordCount: number;
}): VoiceFeatures {
  const frames = input.frameRmsValues.filter((value) => Number.isFinite(value) && value >= 0);
  const duration = Number.isFinite(input.durationSeconds)
    ? Math.max(0, Math.min(MAX_RECORDING_SECONDS, input.durationSeconds))
    : 0;

  // Whole-clip RMS level: quadratic mean of the frame RMS values.
  const rms =
    frames.length > 0
      ? Math.sqrt(frames.reduce((sum, value) => sum + value * value, 0) / frames.length)
      : 0;
  const rmsDb = amplitudeToDbfs(rms);

  // Quiet-frame ratio: share of frames sitting near silence.
  const quietFrames = frames.filter((value) => value < RMS_PAUSE_THRESHOLD).length;
  const pauseRatio = frames.length > 0 ? quietFrames / frames.length : 0;

  // Speaking rate: real word count over real duration, clamped for sanity.
  const minutes = duration / 60;
  const wordsPerMinute =
    minutes > 0 && Number.isFinite(input.transcriptWordCount) && input.transcriptWordCount > 0
      ? Math.min(300, Math.round(input.transcriptWordCount / minutes))
      : 0;

  return {
    durationSeconds: Number(duration.toFixed(1)),
    pauseRatio: Number(Math.max(0, Math.min(1, pauseRatio)).toFixed(2)),
    speakingRateWpm: wordsPerMinute,
    rmsDb: Number(rmsDb.toFixed(1)),
  };
}

export function countWords(transcript: string): number {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  return words.length;
}
