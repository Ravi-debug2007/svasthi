"use client";

import { MOOD_FACES, MOOD_LABELS } from "@/lib/check-in/domain";

/**
 * MoodCard — native radio-group semantics with expressive visual state
 * (ui-registry.md). Real <input type="radio"> elements carry the state so
 * screen readers and keyboards get correct behavior for free; the faces are
 * decoration, not the control. Arrow keys move between moods natively.
 */

const MOODS = [1, 2, 3, 4, 5] as const;

export function MoodCard({
  value,
  onChange,
  error,
  disabled,
}: {
  value: number | null;
  onChange: (mood: number) => void;
  error?: string;
  disabled?: boolean;
}) {
  const errorId = "mood-error";

  return (
    <fieldset
      aria-describedby={error ? errorId : undefined}
      className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6"
      disabled={disabled}
    >
      <legend className="px-1 text-base font-semibold text-ink">
        How are you feeling right now?
      </legend>

      <div className="mt-3 flex flex-wrap gap-2">
        {MOODS.map((mood) => {
          const checked = value === mood;
          return (
            <label
              key={mood}
              className={`group inline-flex min-h-[44px] min-w-[64px] cursor-pointer flex-col items-center justify-center rounded-2xl border px-3 py-2 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                checked
                  ? "border-primary bg-primary-soft"
                  : "border-stone-200 bg-white hover:bg-stone-50"
              }`}
            >
              <input
                type="radio"
                name="mood"
                value={mood}
                checked={checked}
                onChange={() => onChange(mood)}
                className="sr-only"
              />
              <span aria-hidden="true" className="text-2xl leading-none">
                {MOOD_FACES[mood]}
              </span>
              <span
                className={`mt-1 text-xs font-semibold ${
                  checked ? "text-primary" : "text-ink-muted"
                }`}
              >
                {MOOD_LABELS[mood]}
              </span>
              <span className="sr-only">{`Mood ${mood} of 5: ${MOOD_LABELS[mood]}`}</span>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-3 text-sm text-support">
          {error}
        </p>
      )}
    </fieldset>
  );
}
