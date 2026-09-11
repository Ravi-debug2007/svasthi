import { GoogleGenAI } from "@google/genai";
import { CheckIn, Insight, Journal } from "@/lib/types";

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function generateGeminiInsight(checkIn: CheckIn, journal: Journal): Promise<Omit<Insight, "id" | "createdAt"> | null> {
  if (!process.env.GEMINI_API_KEY || process.env.DEMO_MODE === "true") return null;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are Dawn, a compassionate mental-wellness companion. Return ONLY valid JSON with keys level (steady|watch), title, evidence (array of up to 3 short factual strings), suggestion, referralRecommended (boolean), disclaimer. Never diagnose, never claim voice metrics establish a condition, and never use alarmist language. Data: ${JSON.stringify({ checkIn: { mood: checkIn.mood, stress: checkIn.stress, energy: checkIn.energy, sleepHours: checkIn.sleepHours, contexts: checkIn.contexts }, journal: { transcript: journal.transcript, features: journal.features } })}`;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json", temperature: 0.4 } });
    const parsed = JSON.parse(response.text || "{}") as Partial<Omit<Insight, "id" | "createdAt" | "source" | "crisis">>;
    if ((parsed.level !== "steady" && parsed.level !== "watch") || !parsed.title || !Array.isArray(parsed.evidence) || !parsed.suggestion) return null;
    return { level: parsed.level, title: parsed.title, evidence: parsed.evidence.map(String).slice(0, 3), suggestion: parsed.suggestion, referralRecommended: Boolean(parsed.referralRecommended), crisis: false, disclaimer: parsed.disclaimer || "This is a wellness signal, not a diagnosis or medical advice.", source: "gemini" };
  } catch {
    return null;
  }
}
