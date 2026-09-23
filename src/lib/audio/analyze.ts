import {
  computeVoiceFeatures,
  countWords,
  VoiceFeatures,
} from "@/lib/audio/features";

/**
 * Local measurement of a finished recording (F03). The audio never leaves
 * the device: it is decoded with the browser's own AudioContext, measured,
 * and then discarded. If the browser cannot decode the clip, this returns
 * null and the UI says so — no numbers are ever invented to fill the gap.
 */

/** Per-frame RMS amplitudes (0..1) of an AudioBuffer, ~100ms frames. */
export function frameRmsFromAudioBuffer(buffer: AudioBuffer, frameMs = 100): number[] {
  const frameLength = Math.max(1, Math.floor((buffer.sampleRate * frameMs) / 1000));
  const samples = buffer.getChannelData(0);
  const frames: number[] = [];
  for (let start = 0; start < samples.length; start += frameLength) {
    const end = Math.min(start + frameLength, samples.length);
    let sumSquares = 0;
    for (let i = start; i < end; i += 1) {
      sumSquares += samples[i] * samples[i];
    }
    frames.push(Math.sqrt(sumSquares / Math.max(1, end - start)));
  }
  return frames;
}

export async function analyzeRecording(
  blob: Blob,
  durationSeconds: number,
  transcript: string,
): Promise<VoiceFeatures | null> {
  try {
    const AudioCtx =
      typeof window === "undefined"
        ? undefined
        : window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    let decoded: AudioBuffer;
    try {
      decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    } finally {
      void ctx.close().catch(() => undefined);
    }
    return computeVoiceFeatures({
      frameRmsValues: frameRmsFromAudioBuffer(decoded),
      durationSeconds,
      transcriptWordCount: countWords(transcript),
    });
  } catch {
    // Undecodable format or unexpected failure: report honestly as null.
    return null;
  }
}
