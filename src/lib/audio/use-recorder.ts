"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_RECORDING_SECONDS } from "@/lib/audio/features";

/**
 * useRecorder — MediaRecorder state machine for the voice journal (F03).
 *
 * Safety/quality rules honoured here (build-plan.md F03 acceptance criteria):
 * - Microphone permission is requested only after a user click (start), never
 *   on mount or page load.
 * - Recording is capped at 60 seconds, enforced two ways: a timer that stops
 *   cleanly at the cap, and a hard timeout slightly after it as a backstop.
 * - Every exit path (stop, cancel, unmount, cap) stops all audio tracks and
 *   revokes object URLs, so the mic indicator can never stay on.
 * - Elapsed time comes from a real timer, and the waveform level comes from
 *   real audio frames (AnalyserNode) — never fabricated.
 * - No automatic upload of audio anywhere: audio is analyzed and discarded
 *   locally; only the user's edited transcript is submitted.
 */

export type RecorderStatus =
  | "idle" // no stream yet; nothing requested
  | "requesting" // getUserMedia in flight after a click
  | "recording"
  | "processing"; // assembling the blob after stop

export type RecorderError = "permission-denied" | "no-microphone" | "unsupported" | "failed";

export type Recording = {
  url: string; // revoked by the hook on reset/unmount
  blob: Blob;
  durationSeconds: number;
  mimeType: string;
};

type RecorderState = {
  status: RecorderStatus;
  /** Real elapsed seconds while recording (tenths precision for the timer). */
  elapsedSeconds: number;
  /** Real instantaneous input level (0..1) from an AnalyserNode, for the live bars. */
  level: number;
  /** True when the 60-second cap stopped the recording by itself. */
  reachedCap: boolean;
  error: RecorderError | null;
  /** The finished recording, ready for playback. */
  recording: Recording | null;
};

const CAP_MS = MAX_RECORDING_SECONDS * 1000;

/** Pick the first recording MIME type the browser actually supports. */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function emptyState(): RecorderState {
  return { status: "idle", elapsedSeconds: 0, level: 0, reachedCap: false, error: null, recording: null };
}

export function useRecorder() {
  const [state, setState] = useState<RecorderState>(emptyState);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const capTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(0);
  const cancelledRef = useRef(false);
  const urlRef = useRef<string | null>(null);
  const stopAtCapRef = useRef<() => void>(() => undefined);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (capTimeoutRef.current) {
      clearTimeout(capTimeoutRef.current);
      capTimeoutRef.current = null;
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  /** Stop all audio tracks and tear down the analysis graph. */
  const teardownStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    analyserRef.current = null;
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
  }, []);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (reachedCap: boolean) => {
      clearTimers();
      teardownStream();
      const elapsed = Math.min((Date.now() - startedAtRef.current) / 1000, MAX_RECORDING_SECONDS);
      const mimeType = recorderRef.current?.mimeType || "audio/webm";
      recorderRef.current = null;
      setState((current) => ({ ...current, status: "processing", elapsedSeconds: elapsed, level: 0 }));
      // MediaRecorder delivers the final chunk with its stop event, so give
      // it a tick to assemble before building the blob.
      window.setTimeout(() => {
        if (cancelledRef.current) return;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        revokeUrl();
        const url = blob.size > 0 ? URL.createObjectURL(blob) : null;
        urlRef.current = url;
        setState({
          status: "idle",
          elapsedSeconds: elapsed,
          level: 0,
          reachedCap,
          error: null,
          recording:
            url && blob.size > 0 ? { url, blob, durationSeconds: elapsed, mimeType } : null,
        });
      }, 0);
    },
    [clearTimers, teardownStream, revokeUrl],
  );

  const stopAtCap = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop(); // onstop → finish(false) for user stops; cap flag set here
      finish(true);
    }
  }, [finish]);
  stopAtCapRef.current = stopAtCap;

  const start = useCallback(async () => {
    setState((current) => {
      if (current.status === "recording" || current.status === "requesting") return current;
      return { ...current, status: "requesting", error: null, reachedCap: false, elapsedSeconds: 0 };
    });

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState((current) => ({ ...current, status: "idle", error: "unsupported" }));
      return;
    }
    cancelledRef.current = false;

    let stream: MediaStream;
    try {
      // Permission prompt happens here — only because the user clicked.
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      const error: RecorderError =
        name === "NotAllowedError" || name === "SecurityError"
          ? "permission-denied"
          : name === "NotFoundError" || name === "OverconstrainedError"
            ? "no-microphone"
            : "failed";
      setState((current) => ({ ...current, status: "idle", error }));
      return;
    }
    if (cancelledRef.current) {
      // Unmounted (or reset) while the permission dialog was open.
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      setState((current) => ({ ...current, status: "idle", error: "failed" }));
      return;
    }

    recorderRef.current = recorder;
    streamRef.current = stream;
    chunksRef.current = [];

    // Live level meter via Web Audio — real frames, not decoration. A failure
    // here is a nice-to-have loss only; recording continues without it.
    try {
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        const buffer = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(buffer);
          let sumSquares = 0;
          for (let i = 0; i < buffer.length; i += 1) {
            const v = (buffer[i] - 128) / 128;
            sumSquares += v * v;
          }
          const level = Math.sqrt(sumSquares / buffer.length);
          setState((current) => ({ ...current, level }));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    } catch {
      // Metering unavailable — recording still works.
    }

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      // The 60s-cap path calls finish(true) itself right after stop(); the
      // processing state it sets wins over this handler's finish(false).
      if (!cancelledRef.current && recorderRef.current) finish(false);
    };

    try {
      recorder.start(250); // gather chunks every 250ms
    } catch {
      teardownStream();
      recorderRef.current = null;
      setState((current) => ({ ...current, status: "idle", error: "failed" }));
      return;
    }

    startedAtRef.current = Date.now();
    setState((current) => ({ ...current, status: "recording", elapsedSeconds: 0, level: 0 }));

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      if (elapsed >= MAX_RECORDING_SECONDS) {
        stopAtCapRef.current();
      } else {
        setState((current) => ({ ...current, elapsedSeconds: elapsed }));
      }
    }, 100);
    capTimeoutRef.current = setTimeout(() => stopAtCapRef.current(), CAP_MS + 500);
  }, [finish, teardownStream]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop(); // onstop → finish(false)
      clearTimers();
    }
  }, [clearTimers]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      // Suppress finish() for this programmatic stop, then discard.
      recorder.onstop = null;
      recorder.stop();
    }
    recorderRef.current = null;
    teardownStream();
    chunksRef.current = [];
    revokeUrl();
    setState(emptyState());
  }, [clearTimers, teardownStream, revokeUrl]);

  const reset = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      cancel();
      return;
    }
    cancelledRef.current = false;
    clearTimers();
    teardownStream();
    chunksRef.current = [];
    revokeUrl();
    setState(emptyState());
  }, [cancel, clearTimers, teardownStream, revokeUrl]);

  // Unmount: the absolute guarantee that nothing keeps listening.
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (capTimeoutRef.current) clearTimeout(capTimeoutRef.current);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioCtxRef.current) void audioCtxRef.current.close().catch(() => undefined);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  return { ...state, start, stop, cancel, reset };
}

/** The full recorder controller handed to presentational components. */
export type RecorderController = ReturnType<typeof useRecorder>;
