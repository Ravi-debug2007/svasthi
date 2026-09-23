"use client";

import { ReactNode } from "react";

/**
 * TranscriptEditor (F03). The typed reflection is a first-class path, not a
 * fallback bolt-on: it works with or without a microphone, and the user's
 * text is never cleared without their action (save-failure state design in
 * ui-rules.md — preserve the entry, offer a retry).
 */
export function TranscriptEditor({
  value,
  onChange,
  disabled,
  error,
  maxChars = 4000,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  maxChars?: number;
  /** Optional slot for an inserted-transcript notice. */
  children?: ReactNode;
}) {
  return (
    <section
      aria-label="Your reflection"
      className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6"
    >
      <h2 className="text-base font-semibold text-ink">Write or edit your reflection</h2>
      <label className="mt-3 block">
        <span className="text-sm font-semibold text-ink">In your own words</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={8}
          maxLength={maxChars}
          placeholder="Speak for a moment, or write instead — whatever feels easier today."
          className="mt-1 w-full resize-y rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base leading-7 text-ink placeholder:text-ink-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        />
      </label>
      <p className="mt-2 text-xs text-ink-muted tabular-nums">
        {value.trim().length} / {maxChars} characters
      </p>
      {error && (
        <p role="alert" className="mt-1 text-sm leading-6 text-support">
          {error}
        </p>
      )}
      {children}
    </section>
  );
}
