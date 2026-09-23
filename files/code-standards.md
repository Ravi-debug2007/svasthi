# Svasthi — Code Standards & Engineering Protocol

Give this file to your AI coding tool alongside every ticket. These rules
apply to every change, regardless of which feature is being built.

## Process rules

1. Work on a feature branch, not `master`.
2. Read the current relevant files, API contracts (`docs/api-contract.md`),
   and any existing tests before editing anything.
3. Add a characterization test (a test that captures current behavior)
   *before* changing existing behavior — this protects against silently
   breaking something that already worked.
4. Keep changes scoped to the ticket at hand. Don't refactor unrelated code
   "while you're in there."
5. Never fabricate data, clinical claims, providers, or test results. If
   something can't be verified (a link, a provider's behavior), say so
   rather than guessing.
6. Don't add a new dependency without explaining, in plain language, why an
   existing tool in the project can't do the job.
7. Run lint, TypeScript checking, relevant tests, and the production build
   before calling anything done.
8. At the end of a change: report which files changed, whether any API
   contract changed, which commands were actually run, and anything that
   remains unverified.
9. Never commit credentials, recordings, or real (non-fictional)
   mental-health disclosures to the repo.

## Data honesty rules (specific to this app)

Every piece of data the UI shows must be labeled as one of:
- **Self-reported** (mood, stress, energy, sleep the user typed)
- **Measured** (real acoustic properties computed from actual audio)
- **Sample/fictional** (demo fixture data — always visibly badged as such)
- **AI-generated wording** (Gemini or fallback text, source shown)

Never blend these silently. If a chart or card mixes real and sample data,
that must be visually obvious, not a footnote.

## Validation & typing

- TypeScript throughout.
- Zod schemas for all API request/response validation (`src/lib/schemas.ts`).
- AI-generated JSON output (insights, chat) gets validated against a strict
  Zod schema before it reaches the UI — never trust model output shape
  blindly.

## Safety-critical code gets extra rules

Anything touching `src/lib/safety/crisis.ts`, crisis-support UI, or consent
flows:
- Gets tests covering direct distress language, indirect/ambiguous concern,
  negated statements ("I would never hurt myself"), and quoted/third-person
  text.
- Never removes or weakens support-access visibility as a side effect of an
  unrelated change.
- Changes here should be flagged explicitly in your report to the user, even
  if the ticket wasn't about safety — this is the one area that always
  deserves a second look.

## AI-provider handling

- Every Gemini call has an explicit timeout (8 seconds, per the original
  spec) with a deterministic fallback — a hung request must never block the
  user's journey.
- System instructions and user-supplied data (transcripts, chat messages)
  are kept structurally separate in the prompt — user text is data, never
  treated as instructions that override the system prompt.
- Crisis-language checks run *before* any model call, not after — so a
  slow/failed AI call can never delay a safety response.

## What "done" means for any ticket

- Lint, typecheck, unit tests, and the production build all pass.
- The acceptance criteria in the ticket (see `build-plan.md`) are met.
- The "you verify" step has actually been done by clicking through the app,
  not just inferred from the AI tool's report.
