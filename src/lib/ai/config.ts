/**
 * AI provider configuration. Kept in one place so every call site applies
 * the same model and deadline rules (code-standards.md).
 */
export const AI_CONFIG = {
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  /** Hard deadline for any model call; on expiry the deterministic fallback runs. */
  timeoutMs: 8_000,
} as const;
