# Svasthi — UI Tokens

Visual direction: **"Warm morning light, clear typography, quiet
confidence."** Borrow Calm's spaciousness, Headspace's friendliness, and
Finch's encouragement — not their exact assets or interfaces.

These are proposed values; verify actual rendered contrast (especially text
on `primary-soft`, `lavender-soft`, `peach-soft`) once implemented.

## Color palette

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F7F8F4` | Page background |
| `surface` | `#FFFFFF` | Main cards |
| `ink` | `#20352D` | Primary text |
| `muted` | `#52655C` | Secondary text |
| `primary` | `#28624D` | Primary actions |
| `primary-soft` | `#E4F0E8` | Selected states |
| `lavender-soft` | `#EEEAF6` | Dawn (chat) surfaces |
| `peach-soft` | `#FFF0E5` | Gentle highlights |
| `border` | `#D9E3DB` | Surface boundaries |
| `support` | `#8E3038` | Urgent support emphasis |
| `support-soft` | `#FCEDEF` | Crisis/support background |
| `focus` | `#3459C7` | Keyboard focus ring |

## Typography

Font family: existing local Geist Sans (already wired in `layout.tsx` —
don't introduce a second font family).

| Element | Size |
|---|---|
| Hero | 36–44px desktop; 30–34px mobile |
| Page title | 28–32px |
| Card heading | 18–22px |
| Body | 16px, ~1.5 line height |
| Secondary text | 14px minimum — never smaller for privacy/safety copy |

## Spacing & layout

| Token | Value |
|---|---|
| Spacing scale | 4px base |
| Card padding | 20px mobile; 24–28px desktop |
| Radius | 20–24px cards; 12–16px inputs |
| Content width | ~1120px max |
| Reading width | ~65 characters for long text |

## Motion

- 150–220ms transitions.
- Always respect `prefers-reduced-motion` — no exceptions, including for the
  breathing exercise (F09), which needs a non-animated fallback mode.
