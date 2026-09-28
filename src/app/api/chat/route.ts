import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { errorResponse, isAuthContext, requireUser } from "@/lib/http";
import { chatSchema } from "@/lib/schemas";
import { crisisMessage, hasCrisisSignal } from "@/lib/safety/crisis";
import { AI_CONFIG } from "@/lib/ai/config";
import { DAWN_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { selectDawnReply } from "@/lib/dawn/fallbacks";

export const dynamic = "force-dynamic";

/** History returned to the client on GET, and sent to the model on POST. */
const HISTORY_LIMIT = 20;

export async function POST(request: Request) {
  // Chat requires a signed-in user so messages can be stored privately
  // (chat_messages table). There is no anonymous chat session.
  const auth = await requireUser();
  if (!isAuthContext(auth)) return auth;
  const { supabase, userId } = auth;

  const parsed = chatSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("A message is required.", 400, parsed.error.flatten());

  const userMessage = parsed.data.message;

  // Crisis check runs before any model call and before storage — a slow or
  // failed AI provider can never delay a safety response (code-standards.md).
  if (hasCrisisSignal(userMessage)) {
    return NextResponse.json({
      reply: crisisMessage.suggestion,
      hint: { kind: "support", label: "Ways to reach support", href: "/support" },
      crisis: true,
      phone: "14416",
      source: "fallback",
    });
  }

  // Store the user's message first (own row only).
  const { error: storeError } = await supabase.from("chat_messages").insert({
    user_id: userId,
    role: "user",
    content: userMessage,
  });
  if (storeError) return errorResponse("Could not save your message.", 500, storeError.message);

  // Last six prior messages as bounded history, own rows only (F06: "at most
  // six prior messages sent as history" — a hard ceiling, never exceeded).
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6);
  const priorMessages = (history ?? []).reverse();

  if (process.env.GEMINI_API_KEY && process.env.DEMO_MODE !== "true") {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const contents = [
        ...priorMessages.map((entry: { role: string; content: string }) => ({
          role: entry.role === "assistant" ? "model" : "user",
          parts: [{ text: entry.content }],
        })),
        { role: "user", parts: [{ text: userMessage }] },
      ];
      const response = await ai.models.generateContent({
        model: AI_CONFIG.model,
        contents,
        config: {
          // Full verbatim Dawn prompt from dawn-and-insight-prompts.md.
          systemInstruction: DAWN_SYSTEM_PROMPT,
          httpOptions: { timeout: AI_CONFIG.timeoutMs },
        },
      });
      const reply = response.text?.trim();
      if (reply) {
        await supabase.from("chat_messages").insert({
          user_id: userId,
          role: "assistant",
          content: reply.slice(0, 4000),
        });
        return NextResponse.json({ reply, hint: null, crisis: false, source: "gemini" });
      }
    } catch {
      // Fall through to the deterministic reply below.
    }
  }

  // Deterministic fallback: reviewed, contextual variants (never generic
  // filler). The reply is honest about not being AI — the client labels it.
  const fallback = selectDawnReply(userMessage);
  await supabase.from("chat_messages").insert({
    user_id: userId,
    role: "assistant",
    // Persist the reply text so a reload shows the same conversation; hints
    // are re-derived client-side from the same deterministic selector.
    content: fallback.text.slice(0, 4000),
  });
  return NextResponse.json({
    reply: fallback.text,
    hint: fallback.hint,
    crisis: false,
    source: "fallback",
  });
}

export async function GET() {
  // Restore the signed-in user's recent conversation after a refresh. Own
  // rows only, oldest first so the client can render in order.
  const auth = await requireUser();
  if (!isAuthContext(auth)) return auth;
  const { supabase, userId } = auth;

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);
  if (error) return errorResponse("Could not load your conversation.", 500, error.message);

  const messages = (data ?? [])
    .slice()
    .reverse()
    .map((row: { id: string; role: string; content: string; created_at: string }) => ({
      id: row.id,
      role: row.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: row.content,
      createdAt: row.created_at,
    }));

  return NextResponse.json({ messages });
}
