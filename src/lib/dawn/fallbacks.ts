/**
 * Dawn's deterministic fallback replies (F06).
 *
 * These are REVIEWED contextual variants (build-plan.md F06 mock-data
 * requirement: "Reviewed contextual fallback variants (not generic 'I'm here
 * for you' filler)"). They exist so the conversation never dead-ends when
 * Gemini is unconfigured, slow, or failing — the honest guided response is
 * always available, and the UI always labels it as not-AI.
 *
 * Wording rules honoured (code-standards.md, dawn-and-insight-prompts.md):
 * no diagnosis, no clinical claims, no claimed therapeutic outcome, no
 * invented memory of the user's history, at most one gentle question,
 * support access offered without pressure.
 */

export type DawnContext =
  | "overwhelm"
  | "low-mood"
  | "sleep"
  | "work"
  | "gratitude"
  | "general";

export type DawnReply = {
  text: string;
  /** Shown as a low-pressure suggestion under the reply (support, exercise). */
  hint: { kind: "exercise" | "support"; label: string; href: string } | null;
};

const VARIANTS: Record<DawnContext, DawnReply[]> = {
  overwhelm: [
    {
      text: "That sounds like a lot to hold at once. You don't have to sort all of it tonight — would picking one small piece to set down, or pausing for a minute first, feel more possible?",
      hint: { kind: "exercise", label: "Try a one-minute breathing exercise", href: "/exercises" },
    },
    {
      text: "Feeling stretched across too many things is heavy. One option: choose the single next step and let the rest wait. Which piece feels most urgent to you right now?",
      hint: null,
    },
  ],
  "low-mood": [
    {
      text: "It sounds like today felt discouraging. Would it help to notice one thing you managed, even if it was simply getting through a difficult day?",
      hint: null,
    },
    {
      text: "Thank you for saying that here. Low days deserve gentleness, not a fix. If you want, we can find one small, kind next step together — or just leave it there for now.",
      hint: { kind: "support", label: "Ways to reach support", href: "/support" },
    },
  ],
  sleep: [
    {
      text: "Restless nights make everything harder to carry. A wind-down ritual — dim light, slower breathing, no screens for a bit — sometimes helps the body settle. What do your evenings usually look like?",
      hint: { kind: "exercise", label: "A slow-breathing guide is available", href: "/exercises" },
    },
  ],
  work: [
    {
      text: "Work pressure has a way of following you home. One gentle boundary, like a fixed stop time or a short walk after logging off, can sometimes help. Would something like that fit your week?",
      hint: null,
    },
  ],
  gratitude: [
    {
      text: "It's good you noticed that. Naming what went well is worth doing, whatever the day looked like. Is there more in that thread you'd like to reflect on?",
      hint: null,
    },
  ],
  general: [
    {
      text: "Thank you for sharing that. Take your time — would one small, gentle next step, like a glass of water or a minute of breathing, feel possible right now?",
      hint: null,
    },
    {
      text: "I hear you. There's no rush here. If it helps, you could tell me a little more, or we could simply let this be a moment where you said it out loud.",
      hint: null,
    },
    {
      text: "That took something to put into words. One option is a small reset — water, air, a slower breath. What would feel least like an effort right now?",
      hint: { kind: "exercise", label: "Try a one-minute breathing exercise", href: "/exercises" },
    },
  ],
};

/** Keywords matched case-insensitively against the user's message. */
const CONTEXT_KEYWORDS: Array<{ context: DawnContext; words: string[] }> = [
  { context: "sleep", words: ["sleep", "insomnia", "awake", "night", "tired", "exhausted"] },
  {
    context: "overwhelm",
    words: ["overwhelmed", "too much", "can't cope", "cant cope", "stressed", "anxious", "panic", "deadline"],
  },
  {
    context: "work",
    words: ["work", "boss", "office", "job", "study", "exam", "college", "assignment", "manager"],
  },
  {
    context: "low-mood",
    words: ["sad", "low", "down", "empty", "numb", "hopeless", "lonely", "useless", "worthless"],
  },
  { context: "gratitude", words: ["thank", "better", "good day", "happy", "grateful", "managed"] },
];

/**
 * Pure context classification for fallback selection. Conservative on
 * purpose: when nothing matches clearly, "general" is the safest voice —
 * it acknowledges without guessing at specifics.
 */
export function classifyDawnContext(message: string): DawnContext {
  const text = message.toLowerCase();
  for (const { context, words } of CONTEXT_KEYWORDS) {
    if (words.some((word) => text.includes(word))) {
      return context;
    }
  }
  return "general";
}

/**
 * Deterministic variant choice: rotate by message length so repeated sends
 * in one conversation don't always return the same sentence, while staying
 * fully predictable and testable.
 */
export function selectDawnReply(message: string): DawnReply {
  const context = classifyDawnContext(message);
  const variants = VARIANTS[context];
  const index = message.length % variants.length;
  return variants[index];
}
