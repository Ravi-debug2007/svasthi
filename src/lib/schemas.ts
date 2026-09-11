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

export const journalSchema = z.object({
  transcript: z.string().trim().min(1).max(4000),
  features: voiceFeaturesSchema,
  consent: z.literal(true),
});

export const insightRequestSchema = z.object({
  checkInId: z.string().uuid().optional(),
  journalId: z.string().uuid().optional(),
  checkIn: checkInSchema.optional(),
  journal: journalSchema.omit({ consent: true }).optional(),
}).refine((value) => Boolean(value.checkInId || value.checkIn), {
  message: "Provide a checkInId or checkIn payload.",
}).refine((value) => Boolean(value.journalId || value.journal), {
  message: "Provide a journalId or journal payload.",
});

export const chatSchema = z.object({
  message: z.string().trim().min(1).max(1500),
});
