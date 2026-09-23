/**
 * Crisis-language detection (F08).
 *
 * Honest framing, repeated in the UI: this is a deliberately conservative,
 * recall-biased word-pattern check — NOT a clinically validated safety system.
 * It exists to catch plain-language distress phrases and route to human
 * support; it can and will miss indirect, veiled, multilingual, sarcastic,
 * or coded expressions. Human support is offered unconditionally elsewhere
 * (SupportBanner on every page, /support always reachable), so a miss here
 * degrades to the banner, not to silence.
 *
 * Design policy (accepted trade-offs, documented in progress-tracker.md):
 * - Recall over precision. A false positive costs a calm support panel; a
 *   false negative costs support reaching someone who needs it. We bias
 *   toward over-triggering.
 * - Negation and quotation are NOT filtered out. "I would never kill myself"
 *   or a quoted "she wants to die" still triggers a support panel — annoying
 *   for the honest user, but safer for the ambiguous one (the writer may be
 *   talking about themselves). The panel copy is written to be non-alarmist
 *   so an unnecessary trigger stays gentle.
 * - Third-person and fictional mentions trigger too ("the character ends his
 *   life"), for the same reason.
 * - One deliberate precision carve-out: reflexive harm phrasing only. Bare
 *   "is killing me" (as in "this movie is killing me") does NOT trigger,
 *   because that colloquialism is constant in everyday journals and would
 *   train users to ignore the panel. Reflexive forms ("kill myself",
 *   "killing myself") always trigger. This trades a little recall for the
 *   credibility of the one panel that matters.
 * - Patterns are word-bounded, case-insensitive, cover common Hinglish
 *   distress phrasing (Tele-MANAS audience), and accept both straight and
 *   typographic apostrophes. Devanagari script and other Indian languages
 *   are NOT covered — a documented limitation stated in the UI.
 */

export const crisisPatterns: RegExp[] = [
  // Direct, explicit statements.
  /\b(?:kill(?:ing)?\s+myself)\b/i,
  /\b(?:end(?:ing|s)?\s+(?:my|this|his|her|their)\s+life|end(?:ing)?\s+it\s+all)\b/i,
  /\b(?:tak(?:ing|e)\s+my\s+(?:own\s+)?life)\b/i,
  /\b(?:suicide|suicidal)\b/i,
  /\b(?:want(?:\s+to)?\s+die|wanna\s+die|wish\s+i\s+(?:was|were)\s+dead|better\s+off\s+dead)\b/i,
  /\b(?:self[-\s]?harm|self[-\s]?injur\w*|cut(?:ting)?\s+myself|hurt(?:ing)?\s+myself)\b/i,
  /\b(?:hang(?:ing)?\s+myself|overdose|pills?\s+to\s+end\s+it)\b/i,
  /\b(?:no\s+reason\s+to\s+(?:live|go\s+on)|can(?:no|['\u2019])t\s+go\s+on|not\s+worth\s+living)\b/i,
  /\b(?:better\s+off\s+without\s+me|better\s+off\s+if\s+I\s+(?:wasn['\u2019]t|weren['\u2019]t|was\s+not|were\s+not)\s+around)\b/i,
  /\b(?:goodbye\s+forever|this\s+is\s+goodbye)\b/i,
  /\b(?:(?:do\s+not|do(?:n['\u2019])?t)\s+want\s+to\s+(?:live|be\s+here)(?:\s+anymore)?)\b/i,

  // Indirect / veiled phrasing that still expresses self-harm intent.
  /\b(?:not\s+be\s+around\s+anymore|disappear\w*\s+forever|wasn['\u2019]t\s+around\s+(?:anymore|at\s+all))\b/i,
  /\b(?:what['\u2019]?s\s+the\s+point\s+of\s+(?:living|going\s+on|anything))\b/i,
  /\b(?:tired\s+of\s+(?:living|being\s+alive|this\s+life))\b/i,
  /\b(?:(?:plans?|thoughts?)\s+of\s+(?:ending\s+(?:it|everything|my\s+life)|killing\s+myself|suicide))\b/i,

  // Common Hinglish distress phrases (Tele-MANAS audience).
  /\b(?:jeene\s+ka\s+(?:koi|kuch)\s+(?:man\s+nahi|reason\s+nahi))\b/i,
  /\b(?:marna\s+chaht\w*(?:\s+hoo?n|\s+he|\s+hun)?)\b/i,
  /\b(?:khudkhushi|aatmahatya)\w*\b/i,
  /\b(?:jaan\s+de\w*)\b/i,
  /\b(?:zinda\s+rehne\s+ka\s+koi\s+dil\s+nahi(?:\s+karta)?)\b/i,
];

/** True when the text matches any crisis pattern. Deliberately over-eager. */
export function hasCrisisSignal(text: string): boolean {
  if (!text) return false;
  return crisisPatterns.some((pattern) => pattern.test(text));
}

export const crisisMessage = {
  level: "support" as const,
  title: "You deserve immediate support",
  evidence: ["Your message may suggest that you are in immediate distress."],
  suggestion:
    "Please contact Tele-MANAS now at 14416, reach someone you trust, or contact your local emergency service if you may act on these thoughts.",
  referralRecommended: true,
  crisis: true,
  phone: "14416" as const,
  disclaimer:
    "Svasthi is not an emergency service or a substitute for professional care. Crisis-language detection is limited and can miss or misread messages — human support is always available regardless.",
};
