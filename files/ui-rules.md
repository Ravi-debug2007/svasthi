# Svasthi — UI Rules

## Glassmorphism (used sparingly — decorative only)

| Rule | Reason |
|---|---|
| Use blur only for decorative header/hero surfaces | Limits visual and performance cost |
| Keep text on high-opacity backgrounds | Protects contrast |
| Provide a solid-background fallback | Browser resilience |
| Avoid nested translucent cards | Prevents muddy hierarchy |
| Do not animate blur | Avoids unnecessary GPU work |
| Never use translucency on urgent support text | Safety information must always stay fully readable |

## Accessibility — non-negotiable baseline

- Full keyboard navigation on every interactive control.
- Visible focus states everywhere (use the `focus` color token).
- No horizontal overflow at 360px viewport width.
- 44px minimum touch targets.
- `prefers-reduced-motion` respected app-wide.
- Native semantic HTML for form controls (radio groups for mood, not custom
  divs pretending to be radios) — screen readers depend on this.
- No automatic dark mode without a deliberately designed dark palette —
  ship one intentional theme first (this project's current global CSS would
  otherwise switch to an unstyled dark mode automatically; that's a known
  defect to fix, not a feature).

## Navigation

Four primary destinations, not eight competing nav items:

| Surface | Destination |
|---|---|
| Home | `/` |
| Journal | `/journal` |
| Dawn (chat) | `/dawn` |
| Trends | `/dashboard` |
| Persistent, everywhere | "Get support" → `/support` |

Contextual links (not primary nav): Home → `/check-in`, Insight card → `/exercises`,
Support page → `/resources`.

## State design — what to actually write for each state

| State | Copy direction |
|---|---|
| First visit | "A small check-in can be a good place to start." |
| Empty journal | "Speak for a moment, or write instead." |
| Microphone denied | "Your microphone isn't available. You can still write your reflection." |
| Recording | Real elapsed time + real waveform — never fake either |
| Processing | "Preparing your reflection…" — no fabricated progress percentage |
| Provider timeout | "Using a simple guided response for now." |
| No trend data | "Your trends will appear as you check in." |
| Sample history | Persistent, visible "Sample history" badge |
| Save failure | Preserve the user's typed text; offer retry |
| Exercise complete | "You made a little space for yourself." |
| Crisis signal | Calm, prominent support panel — no celebratory animation, no dismissive tone |

## Scope discipline

If time/effort pressure ever pushes toward cutting something, cut in this
order — and never cut the "never cut" list:

**Cut in this order if needed:** animated mascot → dark mode → extra
exercises → automatic transcription → advanced chart interactions →
long-term memory features.

**Never cut:** crisis access, consent flows, data-source labeling, the
typed-input fallback (for when voice isn't available), or the end-to-end
check-in → journal → insight → support journey.
