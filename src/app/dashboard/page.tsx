"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client/api";
import { useJourney } from "@/components/providers/JourneyProvider";
import { JourneyState } from "@/lib/client/journey-reducer";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NavLinkAction } from "@/components/ui/NavLinkAction";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { PrimaryButtonLink } from "@/components/ui/PrimaryButton";
import { TrendChart, TrendPoint } from "@/components/dashboard/TrendChart";
import { WellnessSummary } from "@/components/dashboard/WellnessSummary";
import { EvidenceList } from "@/components/insights/EvidenceList";
import { VoiceSignals } from "@/components/journal/VoiceSignals";
import { sampleHistory } from "@/lib/demo/fixtures";
import { overlaySampleDays } from "@/lib/dashboard/metrics";
import type { CheckIn, Insight } from "@/lib/types";

/**
 * /dashboard (F07). Understandable trends without misleading provenance:
 * - Real entries and sample fixtures are NEVER blended silently: with the
 *   sample overlay on, sample days are visibly badged, and any date with a
 *   real entry always shows the real entry (overlaySampleDays drops the
 *   sample collision — verified by unit tests).
 * - Streak and the self-report index come from real entries only.
 * - Empty charts explain themselves; a table alternative carries the exact
 *   numbers; no continuous-measurement or wearable claims anywhere.
 * - The latest insight always names its source; voice signals stay visually
 *   separate from the stress chart; the support card is never hidden behind
 *   a score.
 */

type DashboardData = {
  weekly: { date: string; mood: number; stress: number; sleepHours: number }[];
  currentCheckIn: CheckIn | null;
  latestInsight: null;
  stats: { streakDays: number; avgSleepHours: number | null; wellnessScore: number | null };
};

const SAMPLE_NOTE =
  "Sample days are fictional examples so you can see how trends look. On any date where you have a real entry, your real entry is shown instead.";

export default function DashboardPage() {
  const { state } = useJourney();

  if (state.status === "restoring") {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          eyebrow="Trends"
          title="Checking your session…"
          description="One moment — restoring your private space."
        />
      </div>
    );
  }

  if (state.status !== "signed-in") {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          eyebrow="Trends"
          title="Sign in to see your trends."
          description="Your trends are built from your own check-ins, stored privately under your account."
        />
        <EmptyState
          icon="📈"
          title="Trends belong to your account"
          description="Once signed in, your last seven days of mood, stress, and sleep appear here — with sample data clearly separated, never mixed in silently."
          action={<NavLinkAction href="/">← Back home to sign in</NavLinkAction>}
        />
      </div>
    );
  }

  return <DashboardContent state={state} />;
}

function DashboardContent({ state }: { state: JourneyState }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSample, setShowSample] = useState(false);

  // Load the user's real data on mount; failures surface honestly with a
  // retry rather than an empty-looking dashboard.
  useEffect(() => {
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
          setError(err instanceof Error ? err.message : "Could not load your trends.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const checkIns = state.checkIns;
  const latestInsight: Insight | null = state.latestInsight;
  const latestJournal = state.journals[0] ?? null;
  const hasEntries = checkIns.length > 0;
  const streakDays = data?.stats.streakDays ?? 0;
  const score = data?.stats.wellnessScore ?? null;

  // Sample overlay (F07 mock-data policy): fictional six-day history from
  // client-side fixtures only — the server never sends sample data. Gated
  // behind an explicit toggle, badged in every chart, and dropped on any
  // date that has a real entry.
  const sample = useMemo(() => sampleHistory(new Date()), []);
  const mergedDaily = useMemo(
    () =>
      overlaySampleDays(
        (data?.weekly ?? []).map((day) => ({ ...day, hasEntry: true as const })),
        showSample ? sample : [],
      ),
    [data?.weekly, sample, showSample],
  );

  const moodPoints: TrendPoint[] = mergedDaily.map((day) => ({
    date: day.date,
    value: day.mood,
    sample: "sample" in day,
  }));
  const stressPoints: TrendPoint[] = mergedDaily.map((day) => ({
    date: day.date,
    value: day.stress,
    sample: "sample" in day,
  }));
  const sleepPoints: TrendPoint[] = mergedDaily.map((day) => ({
    date: day.date,
    value: day.sleepHours,
    sample: "sample" in day,
  }));
  const sampleVisible = mergedDaily.some((day) => "sample" in day);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          eyebrow="Trends"
          title="Could not load your trends."
          description="Nothing about your data was changed. You can try again."
        />
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Trends"
        title="Seven days, from your own check-ins."
        description="Only days where you actually checked in are shown — gaps stay gaps rather than being estimated. Nothing here is a measurement; every value is what you reported."
      />

      {/* Sample-history toggle (F07 mock-data policy) */}
      <section
        aria-label="Sample data"
        className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
      >
        <div className="flex min-h-[44px] flex-wrap items-center justify-between gap-3">
          <label htmlFor="sample-history-toggle" className="flex items-center gap-3">
            <input
              id="sample-history-toggle"
              type="checkbox"
              checked={showSample}
              onChange={(event) => setShowSample(event.target.checked)}
              className="h-5 w-5 rounded border-stone-300 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            />
            <span className="text-sm font-semibold text-ink">
              Show sample history
              {sampleVisible && <span className="ml-2 align-middle"><SourceBadge kind="sample" /></span>}
            </span>
          </label>
          <p className="text-xs leading-5 text-ink-muted">{SAMPLE_NOTE}</p>
        </div>
      </section>

      {/* Trends */}
      <section aria-label="Your last seven days">
        <h2 className="text-xl font-semibold">Your last seven days</h2>
        {mergedDaily.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon="🌱"
              title="No check-ins in the last seven days"
              description="Your mood, stress, and sleep lines will appear here as you check in. Nothing is estimated in the meantime."
              action={<PrimaryButtonLink href="/check-in">Start today&apos;s check-in →</PrimaryButtonLink>}
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <TrendChart metric="mood" points={moodPoints} />
            <TrendChart metric="stress" points={stressPoints} />
            <TrendChart metric="sleepHours" points={sleepPoints} />
          </div>
        )}
      </section>

      {/* Summary + latest insight */}
      <section className="grid gap-6 lg:grid-cols-2">
        <WellnessSummary score={score} hasEntries={hasEntries} streakDays={streakDays} />

        <div className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-ink">Your latest insight</h3>
          {latestInsight ? (
            <div className="mt-3 space-y-4">
              <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                <SourceBadge kind="ai" />
                {latestInsight.source === "gemini"
                  ? "AI-generated wording"
                  : "Guided response (no AI used)"}
              </p>
              <h4 className="text-lg font-semibold text-ink">{latestInsight.title}</h4>
              <EvidenceList evidence={latestInsight.evidence} />
              <div className="rounded-2xl bg-primary-soft p-4">
                <p className="text-sm font-semibold text-ink">One small next step</p>
                <p className="mt-1.5 text-sm leading-6 text-ink">{latestInsight.suggestion}</p>
              </div>
              <p className="text-xs leading-5 text-ink-muted">{latestInsight.disclaimer}</p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm leading-6 text-ink-muted">
                After a check-in and a reflection, a gentle summary with one suggested next step
                appears here — always labelled with where its wording came from.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <NavLinkAction href="/journal">Write a reflection →</NavLinkAction>
                <NavLinkAction href="/insights">Open insights →</NavLinkAction>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Voice signals — visually separate from the stress chart (spec row) */}
      {latestJournal?.features && (
        <section aria-label="From your latest recording" className="space-y-3">
          <h2 className="text-xl font-semibold">From your latest recording</h2>
          <p className="text-sm leading-6 text-ink-muted">
            Measured from the recording you kept — descriptive only, and never combined with the
            trends above.
          </p>
          <VoiceSignals features={latestJournal.features} />
        </section>
      )}

      {/* Support card — persistent, never hidden behind a score */}
      <section className="rounded-3xl border border-rose-200 bg-support-soft p-6">
        <h2 className="text-lg font-semibold text-support">Need a person right now?</h2>
        <p className="mt-2 text-sm leading-6 text-support">
          Tele-MANAS is available 24/7 at{" "}
          <a href="tel:14416" className="font-semibold underline">
            14416
          </a>
          . Trends or scores on this page never decide whether you can reach support — it is
          always here, and calling is always your choice.
        </p>
      </section>
    </div>
  );
}
