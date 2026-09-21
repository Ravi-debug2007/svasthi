"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client/api";
import { useJourney } from "@/components/providers/JourneyProvider";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { ConsentPanel } from "@/components/consent/ConsentPanel";
import { SourceBadge } from "@/components/ui/SourceBadge";
import type { CheckIn, Insight } from "@/lib/types";

/**
 * Home page (F01 scope): shows the signed-in user's real latest check-in and
 * latest stored insight, plus the consent decision surface. No seeded or
 * sample data is shown here — sample fixtures are a dashboard concern (F07).
 */

type DashboardData = {
  weekly: { date: string; mood: number; stress: number; sleepHours: number }[];
  currentCheckIn: CheckIn | null;
  latestInsight: Insight | null;
  stats: { streakDays: number; avgSleepHours: number; wellnessScore: number | null };
};

export default function Home() {
  const { state } = useJourney();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.status !== "signed-in") return;
    let cancelled = false;
    api<DashboardData>("/api/dashboard")
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load your dashboard.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [state.status]);

  if (state.status !== "signed-in") {
    return (
      <div className="mx-auto max-w-xl space-y-8">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Svasthi</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            How are you really feeling today?
          </h1>
          <p className="mt-4 max-w-lg leading-7 text-ink-muted">
            There is no right answer. A small check-in is enough to start noticing what you need —
            in a private space that belongs to you.
          </p>
        </section>
        <AuthPanel />
        <p className="text-sm leading-6 text-ink-muted">
          If you need support right now,{" "}
          <a href="/support" className="font-semibold text-support underline">
            here is how to reach a person
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-ink-muted">
          {state.email ? `Signed in as ${state.email}` : "Your private space"}
        </p>
        <h1 className="mt-2 max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          How are you really feeling today?
        </h1>
        <p className="mt-4 max-w-lg leading-7 text-ink-muted">
          There is no right answer. A small check-in is enough to start noticing what you need.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/check-in"
            className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Start today&apos;s check-in →
          </Link>
          <Link
            href="/journal"
            className="inline-flex min-h-[44px] items-center rounded-full border border-stone-300 px-6 text-sm font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Write a reflection
          </Link>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-support-soft p-4 text-sm text-support">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Check-in streak",
            value: data ? (data.stats.streakDays > 0 ? `${data.stats.streakDays} days` : "—") : "…",
            badge: "self-reported" as const,
            note: "Counted from your actual check-in days.",
          },
          {
            label: "Sleep average",
            value: data ? `${data.stats.avgSleepHours}h` : "…",
            badge: "self-reported" as const,
            note: "From the sleep hours you reported.",
          },
          {
            label: "Self-report index",
            value: data?.stats.wellnessScore != null ? `${data.stats.wellnessScore}/100` : "—",
            badge: "self-reported" as const,
            note: "An illustrative index from your own ratings. Not a medical measure.",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-ink-muted">{stat.label}</p>
              <SourceBadge kind={stat.badge} />
            </div>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-xs text-ink-muted">{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Your latest insight</h2>
          {state.latestInsight ? (
            <>
              <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                <SourceBadge kind="ai" />
                {state.latestInsight.source === "gemini" ? "AI-generated wording" : "Guided response"}
              </p>
              <h3 className="mt-3 text-lg font-semibold">{state.latestInsight.title}</h3>
              <p className="mt-2 leading-7 text-ink">{state.latestInsight.suggestion}</p>
              <p className="mt-3 text-xs leading-5 text-ink-muted">{state.latestInsight.disclaimer}</p>
            </>
          ) : (
            <p className="mt-3 leading-7 text-ink-muted">
              After a check-in and a reflection, a gentle summary with one suggested next step will
              appear here.
            </p>
          )}
        </div>

        <ConsentPanel>
          <p className="mt-4 text-xs leading-5 text-ink-muted">
            Consent choice made {state.consent.decidedAt ? new Date(state.consent.decidedAt).toLocaleString() : ""}
          </p>
        </ConsentPanel>
      </section>

      <section className="rounded-3xl border border-rose-200 bg-support-soft p-6">
        <h2 className="text-lg font-semibold text-support">Need a person right now?</h2>
        <p className="mt-2 text-sm leading-6 text-support">
          Tele-MANAS is available 24/7 at <a href="tel:14416" className="font-semibold underline">14416</a>.
          Calling is always your choice — nothing here dials automatically.
        </p>
      </section>
    </div>
  );
}
