"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/client/api";
import { useJourney } from "@/components/providers/JourneyProvider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { MoodCard } from "./MoodCard";
import {
  CheckInDraft,
  CheckInFieldErrors,
  CheckInPayload,
  CONTEXT_OPTIONS,
  EMPTY_CHECK_IN_DRAFT,
  validateCheckInDraft,
} from "@/lib/check-in/domain";

/**
 * CheckInForm (F02). Every value is explicit: nothing is submitted that the
 * user did not set (no hidden submission defaults). On failure the entered
 * values are preserved and a retry is offered (ui-rules.md state design);
 * duplicate submits are impossible while busy; the journey state receives
 * the saved check-in so the rest of the app reflects it immediately.
 */

type SuccessfulPost = { checkIn: { id: string; createdAt: string } & CheckInPayload };

export function CheckInForm({ onSaved }: { onSaved?: () => void }) {
  const router = useRouter();
  const { addCheckIn } = useJourney();

  const [draft, setDraft] = useState<CheckInDraft>(EMPTY_CHECK_IN_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<CheckInFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function setDraftField<K extends keyof CheckInDraft>(key: K, value: CheckInDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function toggleContext(option: string) {
    setDraft((current) => {
      const has = current.contexts.includes(option);
      const contexts = has
        ? current.contexts.filter((item) => item !== option)
        : [...current.contexts, option];
      return { ...current, contexts };
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return; // duplicate-submit guard

    setFormError(null);
    const result = validateCheckInDraft(draft);
    if (!result.ok) {
      setFieldErrors(result.errors);
      setFormError("Some values are missing or out of range. Nothing was saved.");
      return;
    }

    setFieldErrors({});
    setBusy(true);
    api<SuccessfulPost>("/api/check-ins", {
      method: "POST",
      body: JSON.stringify(result.value),
    })
      .then((body) => {
        addCheckIn(body.checkIn);
        setSaved(true);
        router.refresh();
        onSaved?.();
      })
      .catch((err: unknown) => {
        setFormError(
          err instanceof ApiError
            ? `${err.message} Your entries are still here — try again.`
            : "Could not reach the server. Your entries are still here — try again.",
        );
      })
      .finally(() => setBusy(false));
  }

  if (saved) {
    return (
      <section
        role="status"
        aria-live="polite"
        className="rounded-3xl border border-sage-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 className="text-xl font-semibold text-ink">Check-in saved</h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          You made a little space for yourself. It is stored under your account — and only yours.
        </p>
        <PrimaryButton
          type="button"
          variant="secondary"
          className="mt-5"
          onClick={() => {
            setDraft(EMPTY_CHECK_IN_DRAFT);
            setSaved(false);
          }}
        >
          Do another check-in
        </PrimaryButton>
      </section>
    );
  }

  const sliderClasses =
    "mt-2 w-full accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <MoodCard
        value={draft.mood}
        onChange={(mood) => setDraftField("mood", mood)}
        error={fieldErrors.mood}
        disabled={busy}
      />

      <section className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-ink">Stress and energy</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          Self-reported, not measured — 0 is the lowest, 10 the highest.
        </p>

        <div className="mt-4 space-y-6">
          <label className="block">
            <span className="flex items-center justify-between text-sm font-semibold text-ink">
              Stress
              <span className="text-ink-muted tabular-nums" aria-hidden="true">
                {draft.stress ?? "—"} of 10
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={draft.stress ?? 0}
              aria-valuetext={draft.stress == null ? "Not set yet" : `${draft.stress} out of 10`}
              onChange={(event) => setDraftField("stress", Number(event.target.value))}
              className={sliderClasses}
              disabled={busy}
            />
            <span className="mt-1 block text-xs text-ink-muted">
              0 = completely calm · 10 = as stressed as you can be
            </span>
          </label>
          {fieldErrors.stress && (
            <p role="alert" className="-mt-3 text-sm text-support">
              {fieldErrors.stress}
            </p>
          )}

          <label className="block">
            <span className="flex items-center justify-between text-sm font-semibold text-ink">
              Energy
              <span className="text-ink-muted tabular-nums" aria-hidden="true">
                {draft.energy ?? "—"} of 10
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={draft.energy ?? 0}
              aria-valuetext={draft.energy == null ? "Not set yet" : `${draft.energy} out of 10`}
              onChange={(event) => setDraftField("energy", Number(event.target.value))}
              className={sliderClasses}
              disabled={busy}
            />
            <span className="mt-1 block text-xs text-ink-muted">
              0 = completely drained · 10 = fully energised
            </span>
          </label>
          {fieldErrors.energy && (
            <p role="alert" className="-mt-3 text-sm text-support">
              {fieldErrors.energy}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-ink">Sleep</h2>
        <label className="mt-3 block">
          <span className="text-sm font-semibold text-ink">
            How long did you sleep last night? (hours)
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={24}
            step={0.5}
            value={draft.sleepHours ?? ""}
            placeholder="e.g. 7.5"
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === "") {
                setDraftField("sleepHours", null);
                return;
              }
              const parsed = Number(raw);
              setDraftField("sleepHours", Number.isFinite(parsed) ? parsed : null);
            }}
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            disabled={busy}
          />
        </label>
        {fieldErrors.sleepHours && (
          <p role="alert" className="mt-2 text-sm text-support">
            {fieldErrors.sleepHours}
          </p>
        )}
      </section>

      <fieldset
        className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6"
        disabled={busy}
      >
        <legend className="px-1 text-base font-semibold text-ink">
          Anything behind today? (optional)
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONTEXT_OPTIONS.map((option) => {
            const checked = draft.contexts.includes(option);
            return (
              <label
                key={option}
                className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                  checked
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-stone-200 bg-white text-ink hover:bg-stone-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleContext(option)}
                  className="h-4 w-4 accent-primary"
                />
                {option}
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-xs leading-5 text-ink-muted">
          Optional — skip entirely if you would rather not say.
        </p>
      </fieldset>

      {formError && (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-support-soft p-4 text-sm leading-6 text-support">
          {formError}
        </p>
      )}

      <PrimaryButton type="submit" busy={busy} busyLabel="Saving your check-in…">
        Save check-in
      </PrimaryButton>

      <p className="text-xs leading-5 text-ink-muted">
        Saved privately to your account. Self-reported numbers power your trends — they are never
        a medical measurement.
      </p>
    </form>
  );
}
