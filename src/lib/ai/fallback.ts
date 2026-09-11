import { CheckIn, Insight, Journal, WellnessLevel } from "@/lib/types";

export function calculateLevel(checkIn: CheckIn, journal: Journal): WellnessLevel {
  if (checkIn.stress >= 8 || checkIn.energy <= 2 || journal.features.pauseRatio >= 0.35) return "watch";
  return "steady";
}

export function fallbackInsight(checkIn: CheckIn, journal: Journal): Omit<Insight, "id" | "createdAt"> {
  const level = calculateLevel(checkIn, journal);
  const evidence: string[] = [];
  if (checkIn.stress >= 7) evidence.push(`You rated your stress ${checkIn.stress} out of 10.`);
  if (checkIn.energy <= 3) evidence.push(`Your energy was ${checkIn.energy} out of 10.`);
  if (checkIn.sleepHours < 6.5) evidence.push(`You reported ${checkIn.sleepHours} hours of sleep.`);
  if (journal.features.pauseRatio >= 0.35) evidence.push("Your reflection included longer pauses than usual for this demo signal.");
  if (evidence.length === 0) evidence.push("You made time to notice how you are feeling today.");
  return {
    level,
    title: level === "watch" ? "A gentle pause may help" : "You have made space for yourself today",
    evidence,
    suggestion: level === "watch" ? "Try one minute of slow breathing: inhale for four, hold for four, and exhale for six. If this feeling stays with you, consider speaking with someone you trust." : "Keep one small restorative activity in your day—water, a brief walk, or a few quiet breaths.",
    referralRecommended: level === "watch",
    crisis: false,
    disclaimer: "This is a wellness signal, not a diagnosis or medical advice.",
    source: "fallback",
  };
}
