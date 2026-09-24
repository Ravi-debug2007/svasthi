"use client";

import { useEffect, useState } from "react";
import { useJourney } from "@/components/providers/JourneyProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NavLinkAction } from "@/components/ui/NavLinkAction";
import { ChatPanel } from "@/components/dawn/ChatPanel";
import { ChatMessage } from "@/components/dawn/MessageBubble";
import { CrisisPanel } from "@/components/safety/CrisisPanel";
import { api } from "@/lib/client/api";

/**
 * /dawn (F06). Brief, compassionate conversation with clear boundaries:
 * - Sign-in gate: conversations are stored privately under the user's own
 *   account; there is no anonymous chat session (F01 decision).
 * - Consent gate: Dawn runs on an AI model, so the same AI-processing
 *   consent governs it. Declined means nothing is sent — respected fully.
 * - AI label is always present (MessageBubble), source named per reply.
 * - Crisis routing works even when the model is down: the server answers
 *   with the fixed support message and this page raises CrisisPanel.
 * - Pending state is honest; retries never duplicate messages (guarded).
 */
export default function DawnPage() {
  const { state } = useJourney();
  const [history, setHistory] = useState<ChatMessage[] | null>(null);
  const [historyError, setHistoryError] = useState(false);
  const [crisisVisible, setCrisisVisible] = useState(false);

  const signedIn = state.status === "signed-in";

  // Restore the recent conversation (own rows, server-side). A failure
  // leaves an empty conversation rather than blocking the page.
  useEffect(() => {
    if (!signedIn) {
      setHistory(null);
      return;
    }
    let cancelled = false;
    setHistoryError(false);
    api<{ messages: ChatMessage[] }>("/api/chat")
      .then((result) => {
        if (!cancelled) setHistory(Array.isArray(result.messages) ? result.messages : []);
      })
      .catch(() => {
        if (!cancelled) {
          setHistory([]);
          setHistoryError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  if (state.status !== "signed-in") {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          eyebrow="Dawn"
          title="A quiet place to reflect, out loud."
          description="Dawn is a brief, compassionate conversation with clear limits — an AI companion, clearly labelled, never a therapist."
        />
        <EmptyState
          icon="🌅"
          title="Sign in to talk with Dawn"
          description="Conversations stay private under your own account, so Dawn needs you signed in. There is no shared or anonymous session."
          action={<NavLinkAction href="/">← Back home to sign in</NavLinkAction>}
        />
      </div>
    );
  }

  if (!state.consent.aiProcessingAllowed) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          eyebrow="Dawn"
          title="Dawn is switched off by your consent choice."
          description="Dawn replies are generated with an AI model, so the AI-processing consent governs this page. You chose not to have your entries processed by AI — nothing has been sent anywhere."
        />
        <section className="rounded-3xl border border-stone-200 bg-surface p-6 shadow-sm">
          <p className="text-sm leading-6 text-ink">
            Your check-ins and reflections remain saved either way. If you change your mind, you can
            turn AI processing on from the home page — or reach a person directly instead.
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
        eyebrow="Dawn"
        title="A quiet place to reflect, out loud."
        description="Dawn listens without judging and offers one small next step. It may get things wrong, it never diagnoses, and it is not a replacement for people or professional care."
      />

      {crisisVisible && <CrisisPanel onClose={() => setCrisisVisible(false)} />}

      {historyError && (
        <p role="status" className="text-xs leading-5 text-ink-muted">
          Previous messages could not be loaded — you can still start a new conversation.
        </p>
      )}

      {history === null ? (
        <p role="status" className="text-sm leading-6 text-ink-muted">
          Opening your conversation…
        </p>
      ) : (
        <ChatPanel initialMessages={history} onCrisis={() => setCrisisVisible(true)} />
      )}
    </div>
  );
}
