"use client";

import { MAX_RECORDING_SECONDS } from "@/lib/audio/features";
import { RecorderController, Recording } from "@/lib/audio/use-recorder";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

/**
 * VoiceRecorder (F03, ui-registry scope). Presentational: it renders the
 * recorder controller the page owns and reports "keep this recording" via
 * onKeep. Rules honoured here:
 * - The microphone is touched only after "Start recording" is clicked —
 *   never on page load.
 * - One-minute cap with a real elapsed timer and a real level meter (no fake
 *   waveform, no fabricated progress).
 * - Playback through an <audio> element bound to the actual recording.
 * - Every exit path (stop, re-record, cancel, cap, unmount) tears the
 *   microphone down via the hook.
 * - If the mic isn't available or is denied, the message points to the typed
 *   editor that is always on the page — voice is never the only way in.
 */

const ERROR_COPY: Record<
  "permission-denied" | "no-microphone" | "unsupported" | "failed",
  string
> = {
  "permission-denied": "Your microphone isn't available. You can still write your reflection below.",
  "no-microphone": "No microphone was found. You can still write your reflection below.",
  unsupported: "This browser can't record audio. You can still write your reflection below.",
  failed: "Recording didn't start. You can still write your reflection below.",
};

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function VoiceRecorder({
  recorder,
  onKeep,
}: {
  recorder: RecorderController;
  /** Called when the user reviews a finished recording and keeps it. */
  onKeep: (recording: Recording) => void;
}) {
  function handleStart() {
    void recorder.start();
  }

  const busy = recorder.status === "requesting" || recorder.status === "processing";

  return (
    <section
      aria-label="Voice recorder"
      className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6"
    >
      <h2 className="text-base font-semibold text-ink">Record a voice reflection</h2>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        Up to one minute. The audio stays on your device — only your words, once you review and
        save them, are stored. Recording never starts without you clicking.
      </p>

      {recorder.status === "recording" ? (
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 animate-pulse rounded-full bg-support"
            />
            <p className="text-lg font-semibold tabular-nums" role="timer" aria-live="off">
              {formatClock(recorder.elapsedSeconds)} / {formatClock(MAX_RECORDING_SECONDS)}
            </p>
          </div>
          {/* Real level meter from the live stream — hidden from screen readers
              because it carries no information beyond "sound is arriving". */}
          <div
            aria-hidden="true"
            className="mt-3 flex h-6 items-end gap-1 overflow-hidden"
          >
            {Array.from({ length: 20 }).map((_, index) => {
              const active = recorder.level > (index + 1) / 22;
              return (
                <span
                  key={index}
                  className={`w-2 rounded-sm transition-colors ${active ? "bg-primary" : "bg-stone-200"}`}
                  style={{ height: `${25 + index * 3}%` }}
                />
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryButton type="button" onClick={recorder.stop}>
              Stop
            </PrimaryButton>
            <PrimaryButton type="button" variant="secondary" onClick={recorder.cancel}>
              Cancel
            </PrimaryButton>
          </div>
          <p className="mt-3 text-xs leading-5 text-ink-muted">
            Recording stops by itself at {formatClock(MAX_RECORDING_SECONDS)}.
          </p>
        </div>
      ) : recorder.recording ? (
        <div className="mt-4 space-y-3">
          {recorder.reachedCap && (
            <p className="text-sm leading-6 text-ink-muted">
              Stopped at the one-minute limit — that&apos;s the whole recording.
            </p>
          )}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- raw local audio clip, not timed media */}
          <audio controls src={recorder.recording.url} className="w-full max-w-md" />
          <p className="text-sm leading-6 text-ink-muted">
            Duration {recorder.recording.durationSeconds.toFixed(1)}s. Listen back, then keep it
            or discard it.
          </p>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="button" onClick={() => onKeep(recorder.recording as Recording)}>
              Use this recording
            </PrimaryButton>
            <PrimaryButton type="button" variant="secondary" onClick={recorder.reset}>
              Record again
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <PrimaryButton
            type="button"
            onClick={handleStart}
            busy={busy}
            busyLabel="Asking to use your microphone…"
          >
            Start recording
          </PrimaryButton>
          {recorder.error && (
            <p role="alert" className="mt-3 text-sm leading-6 text-support">
              {ERROR_COPY[recorder.error]}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
