"use client";

import { useEffect, useState } from "react";
import { useJourney } from "@/components/providers/JourneyProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { CheckInForm } from "@/components/check-in/CheckInForm";
import { localDateString, MOOD_FACES, MOOD_LABELS } from "@/lib/check-in/domain";

/**
 * /check-in (F02). The daily check-in takes under a minute: mood, stress,
 * energy, sleep, optional context. If the user already checked in today,
 * their entry is shown — and checking in again is allowed, because the day
 * can change underneath you. Every value shown is self-reported.
 */
export default function CheckInPage() {
  const { state } = useJourney();
  // The date is computed after mount so server and client render agree.
  const [today, setToday] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setToday(localDateString());
  }, []);

  const todaysCheckIn =
    today != null
      ? (state.checkIns.find(
          (checkIn) => localDateString({ now: new Date(checkIn.createdAt) }) === today,
        ) ?? null)
      : null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Daily check-in"
        title="A small check-in can be a good place to start."
        description="Under a minute: how you feel, how stressed, how energetic, and how long you slept. No long writing required."
      />

      {todaysCheckIn && !showForm && (
        <section
          aria-label="Today's check-in"
          className="rounded-3xl border border-sage-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-4xl leading-none">
                {MOOD_FACES[todaysCheckIn.mood]}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  {MOOD_LABELS[todaysCheckIn.mood]}
                </h2>
                <p className="text-sm text-ink-muted">
                  Checked in today at{" "}
                  {new Date(todaysCheckIn.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <SourceBadge kind="self-reported" />
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl bg-primary-soft px-2 py-3">
              <dt className="text-xs font-semibold text-ink-muted">Stress</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">
                {todaysCheckIn.stress}/10
              </dd>
            </div>
            <div className="rounded-2xl bg-primary-soft px-2 py-3">
              <dt className="text-xs font-semibold text-ink-muted">Energy</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">
                {todaysCheckIn.energy}/10
              </dd>
            </div>
            <div className="rounded-2xl bg-primary-soft px-2 py-3">
              <dt className="text-xs font-semibold text-ink-muted">Sleep</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">
                {todaysCheckIn.sleepHours}h
              </dd>
            </div>
          </dl>

          {todaysCheckIn.contexts.length > 0 && (
            <p className="mt-4 flex flex-wrap gap-2">
              {todaysCheckIn.contexts.map((context) => (
                <span
                  key={context}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-ink-muted"
                >
                  {context}
                </span>
              ))}
            </p>
          )}

          <p className="mt-5 text-sm leading-6 text-ink-muted">
            That&apos;s today&apos;s first check-in. If the day changed underneath you, you can
            check in again — both entries are kept.
          </p>
          <PrimaryButton
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => setShowForm(true)}
          >
            Check in again
          </PrimaryButton>
        </section>
      )}

      {(todaysCheckIn === null || showForm) && <CheckInForm />}
    </div>
  );
}
