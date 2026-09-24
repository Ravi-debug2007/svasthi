"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  breathingStateAt,
  CYCLE_COUNT,
  EXERCISE_NOTES,
  EXERCISE_SECONDS,
  PHASE_LABELS,
  formatRemaining,
} from "@/lib/exercise/breathing";

/**
 * BreathingExercise (F09, ui-registry scope). One optional paced guide:
 * - One-minute flow (6 × 10s), no hold phase — you never have to hold your
 *   breath; the pattern itself contains none (see src/lib/exercise/breathing.ts).
 * - Start / pause / resume / stop all work; stopping is always fine and
 *   nothing is saved or sent anywhere (no API, no storage on this page).
 * - Text-only mode: auto-enabled when the device asks for reduced motion
 *   (ui-tokens.md: no exceptions) and always available via an explicit
 *   toggle, using exactly the same timing math.
 * - No claimed therapeutic outcome anywhere; "stop if uncomfortable" is
 *   stated plainly.
 * - Support access stays visible throughout — including mid-exercise — and
 *   is user-initiated only.
 */

type Status = "idle" | "running" | "paused" | "done";

export function BreathingExercise() {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [textOnly, setTextOnly] = useState(false);
  const [reducedMotionDefault, setReducedMotionDefault] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Respect prefers-reduced-motion by defaulting to the text-only guide.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) {
      setTextOnly(true);
      setReducedMotionDefault(true);
    }
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setTextOnly(true);
        setReducedMotionDefault(true);
      }
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // One-second ticks only while running. The clock lives here; the phase math
  // is pure and unit-tested, so text-only mode behaves identically.
  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      setElapsed((current) => Math.min(current + 1, EXERCISE_SECONDS));
    }, 1000);
    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === "running" && elapsed >= EXERCISE_SECONDS) {
      setStatus("done");
      setAnnouncement("One minute complete. Nothing else is required.");
    }
  }, [elapsed, status]);

  const state = useMemo(() => breathingStateAt(elapsed), [elapsed]);

  const start = useCallback(() => {
    setElapsed(0);
    setStatus("running");
    setAnnouncement("Guide started. Follow along at your own pace.");
  }, []);

  const pause = useCallback(() => {
    setStatus("paused");
    setAnnouncement("Paused.");
  }, []);

  const resume = useCallback(() => {
    setStatus("running");
    setAnnouncement("Resumed.");
  }, []);

  const stop = useCallback(() => {
    setElapsed(0);
    setStatus("idle");
    setAnnouncement("Stopped. Nothing was saved or sent.");
  }, []);

  const active = status === "running" || status === "paused";
  const phaseLabel =
    status === "done"
      ? "That's one minute"
      : status === "idle"
        ? "Ready when you are"
        : PHASE_LABELS[state.phase];

  return (
    <section
      aria-labelledby="breathing-heading"
      className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6"
    >
      <h2 id="breathing-heading" className="text-lg font-semibold text-ink">
        One-minute breathing guide
      </h2>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        Four seconds in, six seconds out, six times. Optional from start to finish —
        there is nothing to complete and nothing to be good at.
      </p>

      {/* Visual pacing guide — decorative; the text carries the meaning. */}
      {!textOnly && (
        <div className="mt-6 flex justify-center">
          <div
            aria-hidden="true"
            className="h-40 w-40 rounded-full border border-sage-300 bg-primary-soft"
            style={{
              transform: `scale(${active ? (state.phase === "exhale" ? 0.68 : 1) : 0.84})`,
              // The pacing IS the animation here; reduced motion swaps this
              // whole guide for the text-only block below.
              transitionProperty: "transform",
              transitionDuration: `${state.phaseSeconds}s`,
              transitionTimingFunction: "linear",
            }}
          />
        </div>
      )}

      <div className="mt-6 text-center">
        <p
          className="text-2xl font-semibold text-ink"
          aria-live={status === "running" ? "polite" : "off"}
        >
          {phaseLabel}
        </p>
        {active ? (
          <p className="mt-1 text-sm text-ink-muted">
            {state.phaseRemainingSeconds}s in this step · {formatRemaining(state.remainingSeconds)}{" "}
            remaining
          </p>
        ) : status === "done" ? (
          <p className="mt-1 text-sm text-ink-muted">
            Nothing else is expected of you. Repeat only if you want to.
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">
            {CYCLE_COUNT} cycles · {formatRemaining(EXERCISE_SECONDS)} · no breath-holding
          </p>
        )}
      </div>

      <div className="mt-5">
        <ProgressBar
          label={`Guide progress: ${formatRemaining(state.remainingSeconds)} remaining`}
          value={Math.round(state.progress * 100)}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {status === "idle" && (
          <PrimaryButton onClick={start}>Start the one-minute guide</PrimaryButton>
        )}
        {status === "running" && (
          <>
            <PrimaryButton variant="secondary" onClick={pause}>
              Pause
            </PrimaryButton>
            <PrimaryButton variant="secondary" onClick={stop}>
              Stop
            </PrimaryButton>
          </>
        )}
        {status === "paused" && (
          <>
            <PrimaryButton onClick={resume}>Resume</PrimaryButton>
            <PrimaryButton variant="secondary" onClick={stop}>
              Stop
            </PrimaryButton>
          </>
        )}
        {status === "done" && (
          <>
            <PrimaryButton onClick={start}>Go again</PrimaryButton>
            <PrimaryButton variant="secondary" onClick={stop}>
              Reset
            </PrimaryButton>
          </>
        )}
      </div>

      {/* Text-only / reduced-motion option, always user-controllable */}
      <div className="mt-6">
        <label
          htmlFor="breathing-text-only"
          className="flex min-h-[44px] flex-wrap items-center gap-3"
        >
          <input
            id="breathing-text-only"
            type="checkbox"
            checked={textOnly}
            onChange={(event) => setTextOnly(event.target.checked)}
            className="h-5 w-5 rounded border-stone-300 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          />
          <span className="text-sm font-medium text-ink">Text-only mode (no animation)</span>
        </label>
        {reducedMotionDefault && (
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            Your device asks for reduced motion, so text-only mode is on by default. You can turn
            the animation back on above.
          </p>
        )}
      </div>

      {/* Honest notes + support access, visible for the whole exercise */}
      <ul className="mt-6 space-y-1.5 text-xs leading-5 text-ink-muted">
        <li>• {EXERCISE_NOTES.noHold}</li>
        <li>• {EXERCISE_NOTES.stopIfUncomfortable}</li>
        <li>• {EXERCISE_NOTES.noOutcome}</li>
      </ul>

      <p className="mt-4 rounded-2xl border border-rose-200 bg-support-soft p-4 text-sm leading-6 text-support">
        Need a person right now? Tele-MANAS is available 24/7 at{" "}
        <a href="tel:14416" className="font-semibold underline">
          14416
        </a>
        . Nothing here dials automatically.{" "}
        <a href="/support" className="font-semibold underline">
          Other ways to reach support
        </a>
        .
      </p>

      {/* Screen-reader status updates (start/pause/stop/finish) */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
