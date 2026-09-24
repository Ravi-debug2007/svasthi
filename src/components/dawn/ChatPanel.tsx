"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { MessageBubble, ChatMessage } from "@/components/dawn/MessageBubble";
import { api, ApiError } from "@/lib/client/api";

/**
 * ChatPanel (F06, ui-registry scope): message list, accessible composer,
 * suggested opening prompts, honest pending state.
 *
 * Rules honoured here:
 * - AI label on every Dawn message (via MessageBubble), source named.
 * - Clear-conversation is client-side: it removes what this page holds. The
 *   copy says so honestly — provider/system retention is not claimed away.
 * - Duplicate submits are guarded while a send is in flight; the composer
 *   disables so a retry can never double-post the same turn.
 * - Suggested prompts are user-initiated buttons, not auto-sent messages.
 */

export type ChatHint = {
  kind: "exercise" | "support";
  label: string;
  href: string;
} | null;

type ChatResponse = { reply: string; hint: ChatHint; crisis: boolean; source: "gemini" | "fallback" };

const SUGGESTED_PROMPTS = [
  "I have a lot on my plate and can't switch off.",
  "I didn't do anything useful today.",
  "Does my slow voice mean I'm depressed?",
  "Do you remember last month?",
];

export function ChatPanel({
  initialMessages,
  onCrisis,
}: {
  initialMessages: ChatMessage[];
  /** Called when the server reports a crisis signal so the page can raise the shared CrisisPanel. */
  onCrisis?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  // Fallback hints attach to the specific reply they arrived with; reloaded
  // history shows the conversation without them (hints are session-local).
  const [hints, setHints] = useState<Record<string, NonNullable<ChatHint>>>({});

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return; // duplicate-submit guard
    setBusy(true);
    setError(null);
    const localId = `local-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: localId, role: "user", content: trimmed },
    ]);
    setDraft("");
    try {
      const body = await api<ChatResponse>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });
      const replyId = `${localId}-reply`;
      setMessages((prev) => [
        ...prev,
        {
          id: replyId,
          role: "assistant",
          content: body.reply,
          source: body.source,
        },
      ]);
      if (body.hint) setHints((prev) => ({ ...prev, [replyId]: body.hint! }));
      // Crisis routing: raise the shared panel (support before conversation).
      if (body.crisis) onCrisis?.();
    } catch (err) {
      // The user's own turn stays visible; only the failure is reported.
      setError(
        err instanceof ApiError
          ? `${err.message} Your message was not sent.`
          : "Could not reach the server. Your message was not sent.",
      );
    } finally {
      setBusy(false);
    }
  }

  function clearConversation() {
    // Honest scope: this clears the conversation THIS page holds. Server
    // rows under the user's own account are not claimed to be erased from
    // every provider system (dawn-and-insight-prompts.md memory rules).
    setMessages([]);
    setCleared(true);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {messages.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearConversation}
            className="min-h-[44px] rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Clear this conversation
          </button>
        </div>
      )}

      {cleared && (
        <p role="status" className="text-xs leading-5 text-ink-muted">
          Conversation cleared on this device. Older messages may still exist in your account
          storage — clearing here does not claim to delete them everywhere.
        </p>
      )}

      {messages.length === 0 ? (
        <section className="rounded-3xl border border-stone-200 bg-surface p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Start, if and when you want to</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            A suggestion is not a script — edit it or write your own. Nothing is sent until you
            press send.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className="min-h-[44px] rounded-full border border-sage-300 bg-sage-50 px-4 text-left text-sm text-sage-800 transition-colors hover:bg-sage-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="space-y-5" aria-live="polite">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message}>
              {hints[message.id] && (
                <p className="mt-3 border-t border-stone-200 pt-3">
                  <a
                    href={hints[message.id].href}
                    className="inline-flex min-h-[44px] items-center text-sm font-semibold text-primary underline"
                  >
                    {hints[message.id].label} →
                  </a>
                </p>
              )}
            </MessageBubble>
          ))}
          {busy && (
            <p role="status" className="text-sm leading-6 text-ink-muted">
              Dawn is taking a moment…
            </p>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-rose-200 bg-support-soft p-4 text-sm leading-6 text-support"
        >
          {error}
        </p>
      )}

      <form
        className="rounded-3xl border border-stone-200 bg-surface p-4 shadow-sm sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <label htmlFor="dawn-message" className="text-sm font-semibold text-ink">
          Write to Dawn
        </label>
        <textarea
          id="dawn-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          maxLength={1500}
          placeholder="Whatever you bring, it stays between you and this page."
          className="mt-2 w-full resize-y rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm leading-6 text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          aria-describedby="dawn-message-limit"
        />
        <p id="dawn-message-limit" className="mt-1 text-xs text-ink-muted">
          Up to 1500 characters. {draft.length}/1500
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-ink-muted">
            Dawn is an AI companion — supportive, never a therapist or emergency service.
          </p>
          <PrimaryButton type="submit" busy={busy} busyLabel="Sending…" disabled={draft.trim().length === 0}>
            Send
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
