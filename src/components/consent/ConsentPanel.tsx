"use client";

import { ReactNode } from "react";
import { useJourney } from "@/components/providers/JourneyProvider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

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
          <PrimaryButton type="button" onClick={grantConsent}>
            Yes, allow AI processing
          </PrimaryButton>
          <PrimaryButton type="button" variant="secondary" onClick={declineConsent}>
            No, keep it private
          </PrimaryButton>
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
      <PrimaryButton
        type="button"
        variant="secondary"
        className="mt-4"
        onClick={state.consent.aiProcessingAllowed ? declineConsent : grantConsent}
      >
        {state.consent.aiProcessingAllowed ? "Turn AI processing off" : "Turn AI processing on"}
      </PrimaryButton>
      {children}
    </section>
  );
}
