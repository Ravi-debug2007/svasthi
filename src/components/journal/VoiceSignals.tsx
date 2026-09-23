import { SourceBadge } from "@/components/ui/SourceBadge";
import { VoiceFeatures } from "@/lib/types";

/**
 * VoiceSignals (F04, ui-registry scope). Shows what the user's own device
 * actually measured from their recording — nothing more, nothing less.
 *
 * Rules honoured here (build-plan.md F04 acceptance criteria):
 * - Every number carries the "Measured" provenance badge; nothing is labelled
 *   as detecting emotion, stress, or any clinical state.
 * - Wording is session-specific ("this recording") — never a personal-baseline
 *   comparison ("more pauses than usual"), which architecture.md flags as
 *   unsupported without a real baseline.
 * - If the browser couldn't decode the clip, that is stated plainly
 *   (insufficient-audio state) — numbers are never invented to fill the gap.
 * - Typed reflections simply have no signal section; they were never measured,
 *   so none is shown.
 */

type SignalCard = {
  key: string;
  label: string;
  value: string;
  explanation: string;
};

const NOT_MEASURED_EXPLANATION =
  "Descriptive acoustic properties of the recording. They do not indicate any health or emotional state.";

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function formatDb(db: number | undefined): string {
  // rmsDb is optional in the stored schema; when absent, say so rather than
  // showing a placeholder that looks like a real reading.
  if (typeof db !== "number" || !Number.isFinite(db)) return "not captured";
  return `${db.toFixed(1)} dBFS`;
}

function signalCards(features: VoiceFeatures): SignalCard[] {
  return [
    {
      key: "duration",
      label: "Duration",
      value: formatDuration(features.durationSeconds),
      explanation: "Length of the recording you kept, as timed by your device.",
    },
    {
      key: "level",
      label: "Average loudness",
      value: formatDb(features.rmsDb),
      explanation:
        "Overall volume of this recording, in decibels relative to full scale. Lower numbers mean quieter audio overall.",
    },
    {
      key: "pauseRatio",
      label: "Quiet moments",
      value: `${Math.round(features.pauseRatio * 100)}%`,
      explanation:
        "Share of this recording sitting near silence — natural pauses between words, background noise, and recording quality all affect it.",
    },
    {
      key: "speakingRate",
      label: "Words per minute",
      value:
        features.speakingRateWpm > 0
          ? String(features.speakingRateWpm)
          : "not measurable",
      explanation:
        "Your reviewed words divided by the measured duration. Only meaningful when the transcript matches the audio.",
    },
  ];
}

export function VoiceSignals({ features }: { features?: VoiceFeatures }) {
  if (!features) {
    return null;
  }

  const cards = signalCards(features);
  const levelMissing = typeof features.rmsDb !== "number" || !Number.isFinite(features.rmsDb);

  return (
    <section aria-label="What was measured from your recording" className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-ink">What was measured</h2>
        <SourceBadge kind="measured" />
      </div>

      {levelMissing && (
        <p className="rounded-2xl border border-stone-200 bg-surface p-4 text-sm leading-6 text-ink-muted">
          Your recording couldn&apos;t be fully measured on this device, so some values below are
          missing — they are left out rather than estimated.
        </p>
      )}

      <dl className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-stone-200 bg-surface p-4 shadow-sm"
          >
            <dt className="text-sm text-ink-muted">{card.label}</dt>
            <dd className="mt-1.5">
              <span className="text-2xl font-semibold tracking-tight text-ink">{card.value}</span>
              <p className="mt-1.5 text-xs leading-5 text-ink-muted">{card.explanation}</p>
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-xs leading-5 text-ink-muted">{NOT_MEASURED_EXPLANATION}</p>
    </section>
  );
}
