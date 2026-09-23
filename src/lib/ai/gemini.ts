import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "@/lib/ai/config";
import { insightOutputSchema } from "@/lib/schemas";
import { INSIGHT_SYSTEM_PROMPT, FIXED_NON_MEDICAL_DISCLAIMER } from "@/lib/ai/prompts";
import { calculateLevel } from "@/lib/ai/fallback";
import { CheckIn, Insight, Journal } from "@/lib/types";

/**
 * F05 insight generation via Gemini. Three safety rules enforced here:
 *
 * 1. The model provides wording only. Level, referral, crisis, and the fixed
 *    disclaimer are decided by application logic — never by the model
 *    (dawn-and-insight-prompts.md: "the application supplies safety routing").
 * 2. Output is validated with a strict Zod schema (insightOutputSchema);
 *    anything malformed, missing, or oversized falls back deterministically
 *    instead of reaching the UI (code-standards.md).
 * 3. An 8-second hard deadline: the race below rejects on AI_CONFIG.timeoutMs
 *    even where the SDK's own httpOptions timeout is not honored exactly.
 */

function withDeadline<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI_DEADLINE_EXCEEDED")), ms),
    ),
  ]);
}

export async function generateGeminiInsight(
  checkIn: CheckIn,
  journal: Journal,
): Promise<Omit<Insight, "id" | "createdAt"> | null> {
  if (!process.env.GEMINI_API_KEY || process.env.DEMO_MODE === "true") return null;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // User data is kept as a data payload, structurally separate from the
  // system instruction (code-standards.md AI-provider handling).
  const dataPayload = JSON.stringify({
    checkIn: {
      mood: checkIn.mood,
      stress: checkIn.stress,
      energy: checkIn.energy,
      sleepHours: checkIn.sleepHours,
      contexts: checkIn.contexts,
    },
    journal: {
      transcript: journal.transcript,
      // Absent for typed reflections — the model is never told a measurement
      // exists when none does.
      features: journal.features,
    },
  });

  try {
    const response = await withDeadline(
      ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: dataPayload,
        config: {
          systemInstruction: INSIGHT_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.4,
          httpOptions: { timeout: AI_CONFIG.timeoutMs },
        },
      }),
      AI_CONFIG.timeoutMs,
    );

    // Strict shape validation — malformed, missing, or oversized fields are
    // rejected rather than coerced into the UI.
    const parsed: unknown = JSON.parse(response.text || "{}");
    const validated = insightOutputSchema.safeParse(parsed);
    if (!validated.success) return null;

    // Safety decisions are application-owned; only the wording came from the
    // model. Level derives from self-reported data (F04: acoustics never
    // escalate), and "watch" is what routes a referral suggestion.
    const level = calculateLevel(checkIn, journal);

    return {
      title: validated.data.title,
      evidence: validated.data.evidence.slice(0, 3),
      suggestion: validated.data.suggestion,
      level,
      referralRecommended: level === "watch",
      crisis: false,
      disclaimer: FIXED_NON_MEDICAL_DISCLAIMER,
      source: "gemini",
    };
  } catch {
    // Deadline exceeded, malformed JSON, or provider failure — the caller
    // falls back deterministically (never blank, never a crash).
    return null;
  }
}
