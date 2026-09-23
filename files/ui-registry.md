# Svasthi — UI Component Registry

Keep this updated as components get built — it's the reference that stops
an AI tool from quietly rebuilding a slightly different button on every
ticket.

| Component | Responsibility | Status |
|---|---|---|
| `GlassCard` | Decorative surface — not a universal container | Built (F00) |
| `PrimaryButton` | Primary action, with loading/disabled states. `variant="secondary"` for the muted surface style; `PrimaryButtonLink` is the next/link twin | Built (F00) |
| `StatCard` | Metric + label + provenance badge + optional explanation | Built (F00) |
| `ProgressBar` | Step progress or an explained index (e.g. wellness score) | Built (F00) |
| `MoodCard` | Native radio-group semantics with expressive visual state (fieldset + real radios; faces are decoration) | Built (F02) |
| `ResourceCard` | Service info + verified destination link | Not built (F10) |
| `SourceBadge` | Labels content as "Measured," "Self-reported," "Sample," or "AI wording" | Built (F01) |
| `EmptyState` | Explanation + one clear useful action | Built (F00) |
| `ErrorState` | Plain-language failure message + retry | Built (F00) |
| `SupportBanner` | Persistent access to human support (every page) | Built (F00, banner scope) |
| `CrisisPanel` | Calm crisis routing: immediate-danger vs counselling distinction, user-initiated 14416 link, honest detector-limitation copy; reusable on any surface with optional close | Built (F08 finish) |
| `PageHeader` | Consistent heading + supporting text | Built (F00) |
| `SkeletonCard` | Loading placeholder — must not imply false progress | Not built |
| `NavLinkAction` | Secondary-styled next/link for EmptyState/ErrorState actions and contextual CTAs | Built (F00) |
| `InsightCard` | One insight with AI-wording badge + named source, level chip, evidence rows, suggestion, onward links to exercises/support, fixed disclaimer | Built (F05) |
| `EvidenceList` | Bulleted evidence rows under a Self-reported badge — every claim traces to actual user input | Built (F05) |
| `MobileNav` | Bottom nav bar for small screens: four primary destinations + Get support, active state via aria-current | Built (F00) |
| `VoiceRecorder` | Presentational recorder over the page-owned `useRecorder` controller: real timer + level meter, 60s cap, playback, mic-error copy pointing to typed path | Built (F03) |
| `TranscriptEditor` | Always-available typed reflection editor with live character count and error slot | Built (F03) |
| `VoiceSignals` | Descriptive measured-acoustic cards (duration, loudness, quiet-ratio, words/min) with Measured badge, session-specific wording, and honest missing-measurement state | Built (F04) |

## Rules for adding a new component

1. Check this table first — if something close already exists, extend it
   rather than creating a near-duplicate.
2. New shared UI goes under `src/components/ui/` (per `architecture.md`'s
   target folder structure); feature-specific components go under their own
   folder (`src/components/journal/`, `src/components/dawn/`, etc.).
3. Update this file's status column when a component ships.
4. `SourceBadge` and `SupportBanner` are used across nearly every feature —
   build these early (as part of F00) and treat any screen missing them as
   incomplete.
