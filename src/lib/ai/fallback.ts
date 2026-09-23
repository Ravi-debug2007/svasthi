import { FIXED_NON_MEDICAL_DISCLAIMER } from "@/lib/ai/prompts";
import { CheckIn, Insight, Journal, WellnessLevel } from "@/lib/types";

export function calculateLevel(checkIn: CheckIn, journal: Journal): WellnessLevel {
  // F04 rule (architecture.md, risk table): acoustics stay descriptive only.
  // The level is driven by self-reported check-in data alone — never by voice
  // measurements. Pauses in particular can reflect background noise, recording
  // quality, or natural speech differences, so they must not push anyone
  // toward a "watch" classification on their own.
  void journal; // kept in the signature for API stability; acoustics intentionally unused here
  if (checkIn.stress >= 8 || checkIn.energy <= 2) {
    return "watch";
  }
  return "steady";
}

export function fallbackInsight(checkIn: CheckIn, journal: Journal): Omit<Insight, "id" | "createdAt"> {
  const level = calculateLevel(checkIn, journal);
  const evidence: string[] = [];
  if (checkIn.stress >= 7) evidence.push(`You rated your stress ${checkIn.stress} out of 10.`);
  if (checkIn.energy <= 3) evidence.push(`Your energy was ${checkIn.energy} out of 10.`);
  if (checkIn.sleepHours < 6.5) evidence.push(`You reported ${checkIn.sleepHours} hours of sleep.`);
  // Cite acoustics only when a real recording actually exists (F03: typed
  // reflections carry no measurements, and none may be invented). Wording is
  // measured and session-specific — no "usual" or personal-baseline claim,
  // which architecture.md flags as unsupported comparison (F04).
  if (journal.features != null && journal.features.pauseRatio >= 0.35) {
    evidence.push(
      `Measured from your audio: about ${Math.round(journal.features.pauseRatio * 100)}% of this recording was quiet moments.`,
    );
  }
  if (evidence.length === 0) evidence.push("You made time to notice how you are feeling today.");
  return {
    level,
    title: level === "watch" ? "A gentle pause may help" : "You have made space for yourself today",
    evidence,
    suggestion: level === "watch" ? "Try one minute of slow breathing: inhale for four, hold for four, and exhale for six. If this feeling stays with you, consider speaking with someone you trust." : "Keep one small restorative activity in your day—water, a brief walk, or a few quiet breaths.",
    referralRecommended: level === "watch",
    crisis: false,
    disclaimer: FIXED_NON_MEDICAL_DISCLAIMER,
    source: "fallback",
  };
}
