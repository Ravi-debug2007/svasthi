import { ReactNode } from "react";
import { SourceBadge } from "@/components/ui/SourceBadge";

/**
 * MessageBubble (F06, ui-registry scope). One chat turn with honest labels:
 * - Dawn's messages always carry the AI badge — never passed off as human.
 * - Fallback replies are named as guided responses, not AI wording.
 * - Layout stays still (no animation) so reduced-motion users are safe.
 */

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "gemini" | "fallback";
};

export function MessageBubble({
  message,
  children,
}: {
  message: ChatMessage;
  /** Optional slot under the text (e.g. the fallback hint link). */
  children?: ReactNode;
}) {
  const isDawn = message.role === "assistant";

  if (!isDawn) {
    return (
      <article className="ml-auto max-w-[85%] rounded-3xl rounded-br-lg bg-primary px-5 py-3.5 text-sm leading-6 text-white sm:max-w-[75%]">
        <p className="whitespace-pre-wrap">{message.content}</p>
      </article>
    );
  }

  const sourceLabel =
    message.source === "fallback"
      ? "Guided response (no AI used)"
      : message.source === "gemini"
        ? "AI-generated wording"
        : "Dawn";

  return (
    <article className="mr-auto max-w-[85%] space-y-2 sm:max-w-[75%]">
      <div className="flex items-center gap-2">
        <SourceBadge kind="ai" />
        <span className="text-xs text-ink-muted">{sourceLabel}</span>
      </div>
      <div className="rounded-3xl rounded-bl-lg border border-stone-200 bg-surface px-5 py-3.5 text-sm leading-6 text-ink shadow-sm">
        <p className="whitespace-pre-wrap">{message.content}</p>
        {children}
      </div>
    </article>
  );
}
