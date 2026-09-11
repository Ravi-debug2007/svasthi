const crisisPatterns = [
  /\b(kill myself|end my life|suicide|suicidal|want to die|self[- ]?harm|hurt myself)\b/i,
  /\b(no reason to live|cannot go on)\b/i,
];

export function hasCrisisSignal(text: string) {
  return crisisPatterns.some((pattern) => pattern.test(text));
}

export const crisisMessage = {
  level: "support" as const,
  title: "You deserve immediate support",
  evidence: ["Your message may suggest that you are in immediate distress."],
  suggestion: "Please contact Tele-MANAS now at 14416, reach someone you trust, or contact your local emergency service if you may act on these thoughts.",
  referralRecommended: true,
  crisis: true,
  phone: "14416" as const,
  disclaimer: "Niramaya is not an emergency service or a substitute for professional care.",
};
