"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { useJourney } from "@/components/providers/JourneyProvider";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { ConsentPanel } from "@/components/consent/ConsentPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { PrimaryButtonLink } from "@/components/ui/PrimaryButton";
import { SourceBadge } from "@/components/ui/SourceBadge";
import type { CheckIn, Insight } from "@/lib/types";

/**
 * Home page. F01 behavior preserved: real data for the signed-in user only,
 * no seeded or sample data (sample fixtures are a dashboard concern, F07).
 * F00: rendered from the shared design-system components.
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
    if (state.status !== "signed-in") {
      setData(null);
      return;
    }
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
        <PageHeader
          eyebrow="Svasthi"
          title="How are you really feeling today?"
          description="There is no right answer. A small check-in is enough to start noticing what you need — in a private space that belongs to you."
        />
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
      <PageHeader
        eyebrow={state.email ? `Signed in as ${state.email}` : "Your private space"}
        title="How are you really feeling today?"
        description="There is no right answer. A small check-in is enough to start noticing what you need."
      >
        <PrimaryButtonLink href="/check-in">Start today&apos;s check-in →</PrimaryButtonLink>
        <PrimaryButtonLink href="/journal" variant="secondary">
          Write a reflection
        </PrimaryButtonLink>
      </PageHeader>

      {error && (
        <ErrorState
          title="Could not load your data"
          description={error}
          action={
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[44px] rounded-full border border-support bg-white px-5 text-sm font-semibold text-support transition-colors hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Try again
            </button>
          }
        />
      )}

      <section aria-label="This week at a glance" className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Check-in streak"
          value={data ? (data.stats.streakDays > 0 ? `${data.stats.streakDays} days` : "—") : "…"}
          badge="self-reported"
          explanation="Counted from your actual check-in days."
        />
        <StatCard
          label="Sleep average"
          value={data ? `${data.stats.avgSleepHours}h` : "…"}
          badge="self-reported"
          explanation="From the sleep hours you reported."
        />
        <StatCard
          label="Self-report index"
          value={data?.stats.wellnessScore != null ? `${data.stats.wellnessScore}/100` : "—"}
          badge="self-reported"
          explanation="An illustrative index from your own ratings. Not a medical measure."
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Your latest insight</h2>
          {state.latestInsight ? (
            <>
              <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                <SourceBadge kind="ai" />
                {state.latestInsight.source === "gemini"
                  ? "AI-generated wording"
                  : "Guided response"}
              </p>
              <h3 className="mt-3 text-lg font-semibold">{state.latestInsight.title}</h3>
              <p className="mt-2 leading-7 text-ink">{state.latestInsight.suggestion}</p>
              <p className="mt-3 text-xs leading-5 text-ink-muted">
                {state.latestInsight.disclaimer}
              </p>
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
            Consent choice made{" "}
            {state.consent.decidedAt ? new Date(state.consent.decidedAt).toLocaleString() : ""}
          </p>
        </ConsentPanel>
      </section>

      <section className="rounded-3xl border border-rose-200 bg-support-soft p-6">
        <h2 className="text-lg font-semibold text-support">Need a person right now?</h2>
        <p className="mt-2 text-sm leading-6 text-support">
          Tele-MANAS is available 24/7 at{" "}
          <a href="tel:14416" className="font-semibold underline">
            14416
          </a>
          . Calling is always your choice — nothing here dials automatically.
        </p>
      </section>
    </div>
  );
}
