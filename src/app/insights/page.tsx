"use client";

import { useState } from "react";
import Link from "next/link";
import { useJourney } from "@/components/providers/JourneyProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NavLinkAction } from "@/components/ui/NavLinkAction";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InsightCard } from "@/components/insights/InsightCard";
import { api, ApiError } from "@/lib/client/api";
import { Insight } from "@/lib/types";

/**
 * /insights (F05). One insight at a time, from the user's most recent
 * check-in and reflection. Rules honoured here:
 * - Consent gate: if AI processing is declined, nothing is sent anywhere —
 *   the page explains and links to the consent choice on the home page.
 * - Pending state is honest ("Preparing your reflection…" — no fabricated
 *   progress bar for an 8-second wait).
 * - The insight renders via InsightCard: evidence rows, fixed disclaimer,
 *   onward actions to exercises/support.
 * - Failures claim nothing: errors say what happened and that nothing saved.
 */

type InsightResponse = { insight: Insight };

export default function InsightsPage() {
  const { state, setInsight } = useJourney();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCheckIn = state.checkIns.length > 0;
  const hasJournal = state.journals.length > 0;

  async function handleGenerate() {
    if (busy) return; // duplicate-submit guard
    setBusy(true);
    setError(null);
    try {
      const body = await api<InsightResponse>("/api/insights", {
        method: "POST",
        body: JSON.stringify({
          checkInId: hasCheckIn ? state.checkIns[0].id : undefined,
          journalId: hasJournal ? state.journals[0].id : undefined,
        }),
      });
      setInsight(body.insight);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `${err.message} Nothing was saved.`
          : "Could not reach the server. Nothing was saved.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (state.status !== "signed-in") {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          eyebrow="Insights"
          title="Sign in to see your reflection."
          description="Insights come from your own check-ins and reflections, stored privately under your account."
        />
        <EmptyState
          icon="📝"
          title="Sign in first"
          description="Your insights are generated from your entries — there is nothing to show until you're signed in."
          action={<NavLinkAction href="/">← Back home to sign in</NavLinkAction>}
        />
      </div>
    );
  }

  if (!state.consent.aiProcessingAllowed) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          eyebrow="Insights"
          title="AI summaries are switched off."
          description="You chose not to have your entries processed by AI — that choice is respected completely. Nothing has been sent anywhere."
        />
        <section className="rounded-3xl border border-stone-200 bg-surface p-6 shadow-sm">
          <p className="text-sm leading-6 text-ink">
            If you change your mind, you can turn AI processing on from the home page. Your
            check-ins and reflections remain saved either way — only generated summaries need this
            consent.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <NavLinkAction href="/">← Change consent on the home page</NavLinkAction>
            <NavLinkAction href="/support">Ways to reach support</NavLinkAction>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="A gentle summary of where you are."
        description="Built from your most recent check-in and reflection. Every claim points back to what you actually entered."
      />

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-rose-200 bg-support-soft p-4 text-sm leading-6 text-support"
        >
          {error}
        </p>
      )}

      {busy && (
        <p
          role="status"
          className="rounded-2xl border border-stone-200 bg-surface p-4 text-sm leading-6 text-ink-muted"
        >
          Preparing your reflection… This usually takes a few seconds.
        </p>
      )}

      {!busy && state.latestInsight && <InsightCard insight={state.latestInsight} />}

      {!busy && !state.latestInsight && (
        <EmptyState
          icon="💡"
          title="No insight yet"
          description="Once you have a check-in and a reflection saved, your first gentle summary will appear here."
          action={<NavLinkAction href="/check-in">← Start with a check-in</NavLinkAction>}
        />
      )}

      <section className="rounded-3xl border border-stone-200 bg-surface p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Generate a new summary</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          Uses your most recent check-in and reflection. If the AI service is slow or unavailable,
          a simple guided response is shown instead — this page never hangs, never blanks out.
        </p>
        <div className="mt-4">
          <PrimaryButton
            type="button"
            onClick={() => void handleGenerate()}
            busy={busy}
            busyLabel="Preparing your reflection…"
            disabled={!hasCheckIn || !hasJournal}
          >
            {state.latestInsight ? "Generate a new summary" : "Generate my summary"}
          </PrimaryButton>
        </div>
        {(!hasCheckIn || !hasJournal) && (
          <p className="mt-3 text-xs leading-5 text-ink-muted">
            You need at least one check-in and one reflection first —{" "}
            {!hasCheckIn ? (
              <Link href="/check-in" className="underline">
                do a check-in
              </Link>
            ) : (
              <Link href="/journal" className="underline">
                write a reflection
              </Link>
            )}
            .
          </p>
        )}
      </section>
    </div>
  );
}
