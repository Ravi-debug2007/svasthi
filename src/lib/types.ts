export type WellnessLevel = "steady" | "watch" | "support";

export type CheckIn = {
  id: string;
  createdAt: string;
  mood: number;
  stress: number;
  energy: number;
  sleepHours: number;
  contexts: string[];
};

export type VoiceFeatures = {
  durationSeconds: number;
  pauseRatio: number;
  speakingRateWpm: number;
  rmsDb?: number;
};

export type Journal = {
  id: string;
  createdAt: string;
  transcript: string;
  /** Absent for typed reflections — only real recordings carry measurements. */
  features?: VoiceFeatures;
};

export type Insight = {
  id: string;
  createdAt: string;
  level: WellnessLevel;
  title: string;
  evidence: string[];
  suggestion: string;
  referralRecommended: boolean;
  crisis: boolean;
  phone?: "14416";
  disclaimer: string;
  source: "gemini" | "fallback";
};

export type DailyMetric = {
  date: string;
  mood: number;
  stress: number;
  sleepHours: number;
};
