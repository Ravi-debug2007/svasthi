"use client";

import { ReactNode } from "react";
import { useJourney } from "@/components/providers/JourneyProvider";

/**
 * Consent panel: explicit, visible consent before any reflection is sent for
 * AI processing (project-overview.md principle 4, F01 acceptance criteria).
 * Declining never blocks writing or storing a reflection locally — it only
 * means "do not send my words to the AI provider".
 */
export function ConsentPanel({ children }: { children?: ReactNode }) {
  const { state, grantConsent, declineConsent } = useJourney();

  if (!state.consent.decidedAt) {
    return (
      <section
        role="group"
        aria-labelledby="consent-heading"
        className="rounded-3xl border border-sage-200 bg-white p-6 shadow-sm"
      >
        <h2 id="consent-heading" className="text-lg font-semibold text-ink">
          Before we go further
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          If you write or record a reflection, would you like it sent for AI processing — a brief,
          generated summary with one suggested next step?
        </p>
        <ul className="mt-3 space-y-1 text-sm leading-6 text-ink-muted">
          <li>• Your reflection stays private to your account either way.</li>
          <li>• Saying no only skips the AI wording. Nothing else changes.</li>
          <li>• You can change this at any time.</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={grantConsent}
            className="min-h-[44px] rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Yes, allow AI processing
          </button>
          <button
            type="button"
            onClick={declineConsent}
            className="min-h-[44px] rounded-full border border-stone-300 px-6 text-sm font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            No, keep it private
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      role="group"
      aria-labelledby="consent-status"
      className="rounded-3xl border border-sage-200 bg-white p-6 shadow-sm"
    >
      <h2 id="consent-status" className="text-lg font-semibold text-ink">
        AI processing is {state.consent.aiProcessingAllowed ? "on" : "off"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        {state.consent.aiProcessingAllowed
          ? "Reflections you submit may be sent for AI processing to generate a supportive summary."
          : "Your reflections are kept out of AI processing. You can still write, save, and read them."}
      </p>
      <button
        type="button"
        onClick={state.consent.aiProcessingAllowed ? declineConsent : grantConsent}
        className="mt-4 min-h-[44px] rounded-full border border-stone-300 px-5 text-sm font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {state.consent.aiProcessingAllowed ? "Turn AI processing off" : "Turn AI processing on"}
      </button>
      {children}
    </section>
  );
}
