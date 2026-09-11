import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { errorResponse } from "@/lib/http";
import { chatSchema } from "@/lib/schemas";
import { crisisMessage, hasCrisisSignal } from "@/lib/safety/crisis";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = chatSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("A message is required.", 400, parsed.error.flatten());
  if (hasCrisisSignal(parsed.data.message)) return NextResponse.json({ reply: crisisMessage.suggestion, crisis: true, phone: "14416" });
  if (process.env.GEMINI_API_KEY && process.env.DEMO_MODE !== "true") {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash", contents: `You are Dawn, a compassionate mental-wellness companion. Reply in 2 concise sentences. Do not diagnose. User: ${parsed.data.message}` });
      if (response.text) return NextResponse.json({ reply: response.text, crisis: false });
    } catch { /* Fall through to reliable demo reply. */ }
  }
  return NextResponse.json({ reply: "Thank you for sharing that. Take your time—would one small, gentle next step, like a glass of water or a minute of breathing, feel possible right now?", crisis: false, source: "fallback" });
}
