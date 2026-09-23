import { z } from "zod";

export const checkInSchema = z.object({
  mood: z.number().int().min(1).max(5),
  stress: z.number().int().min(0).max(10),
  energy: z.number().int().min(0).max(10),
  sleepHours: z.number().min(0).max(24),
  contexts: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
});

export const voiceFeaturesSchema = z.object({
  durationSeconds: z.number().min(0).max(300),
  pauseRatio: z.number().min(0).max(1),
  speakingRateWpm: z.number().min(0).max(300),
  rmsDb: z.number().min(-120).max(0).optional(),
});

/**
 * F03: `features` is optional — a typed reflection has no recording to
 * measure. When present, the values are real measurements computed in the
 * browser from the user's actual audio (never invented).
 */
export const journalSchema = z.object({
  transcript: z.string().trim().min(1).max(4000),
  features: voiceFeaturesSchema.optional(),
  consent: z.literal(true),
});

/**
 * Insight requests may reference stored rows by id (own rows only) or pass
 * inline payloads. An inline journal must carry explicit consent — the
 * consent gate can never be skipped on the inline path (F01/F05).
 */
export const insightRequestSchema = z
  .object({
    checkInId: z.string().uuid().optional(),
    journalId: z.string().uuid().optional(),
    checkIn: checkInSchema.optional(),
    journal: journalSchema.optional(),
  })
  .refine((value) => Boolean(value.checkInId || value.checkIn), {
    message: "Provide a checkInId or checkIn payload.",
  })
  .refine((value) => Boolean(value.journalId || value.journal), {
    message: "Provide a journalId or journal payload.",
  });

export const chatSchema = z.object({
  message: z.string().trim().min(1).max(1500),
});

/**
 * F05: strict shape check for the AI model's JSON output. Anything missing,
 * mistyped, or oversized is rejected — the deterministic fallback runs
 * instead of letting malformed wording reach the UI (code-standards.md:
 * validate AI output with Zod before it reaches the UI).
 *
 * Deliberately NOT trusted from the model: level, referralRecommended, and
 * the disclaimer are overwritten in application logic after validation —
 * safety routing is never a model decision.
 */
export const insightOutputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  evidence: z.array(z.string().trim().min(1).max(300)).max(3),
  suggestion: z.string().trim().min(1).max(1000),
});

export type InsightOutput = z.infer<typeof insightOutputSchema>;
