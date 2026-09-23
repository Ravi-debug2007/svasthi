# Svasthi — Build Plan (Solo, No Deadline, Full Detail)

This resequences the original F00–F11 feature tickets for one person
directing an AI coding tool, working one slice at a time — with the **full
spec** for every ticket included directly (files to touch, components,
APIs, acceptance criteria), not just a summary. No hour-by-hour schedule,
no per-developer ownership — those were hackathon-specific and are dropped.

**Note on this revision:** the original PDF's F08 (Crisis Support and
Safety) only appeared once as a single ticket. This resequencing splits it
into an early minimal banner (so support is visible from the very first
screen you build) and a later full-completion pass (the actual crisis
panel, expanded detector tests, and wiring into every content-processing
route). Both are included below — don't skip the "finish" pass.

**How to use each ticket:** copy the full block (spec + prompt) straight
into your AI coding tool. Don't start the next ticket until you've
personally verified the current one using the "you verify" checklist. For
any check you can't do just by clicking around, see `verification-guide.md`.

---

## 1. F01 — Journey State, Consent, and Persistence (Supabase)

**Goal:** Make the journey work with real, durable, per-user data instead of
in-memory storage.
**User story:** As a user, I know what is stored or sent, and my data is
mine alone.

**Files to create:** `src/components/providers/JourneyProvider.tsx`,
`src/lib/client/api.ts`, `src/lib/client/journey-reducer.ts`,
`src/lib/demo/fixtures.ts`, `src/lib/demo/provenance.ts`,
`src/lib/ai/config.ts`, `src/lib/supabase/client.ts`,
`src/lib/supabase/server.ts`

**Files to modify:** `src/lib/http.ts`, `src/lib/demo-store.ts` (replaced),
`src/lib/schemas.ts`, `src/lib/types.ts`,
`src/app/api/insights/route.ts`, `src/app/api/health/route.ts`,
`src/app/layout.tsx`, `docs/api-contract.md`

**Components needed:** Consent panel, source badge, clear-session control,
demo reset control, sign-up/login/logout UI

**APIs needed:** Existing endpoints, updated to use the authenticated
user's ID; inline insight payloads preferred over ID lookups

**Mock data needed:** Fictional six-day history and one sample reflection,
clearly flagged as fixtures (never mixed with real rows)

**Acceptance criteria:**
- Real active data is stored via Supabase, tied to the authenticated user
- Only explicitly fictional demo state may exist as visibly labeled fixtures
- Explicit consent required before any external (AI) processing
- No shared default session — no user, no data, period
- RLS enforced on every table (see `verification-guide.md` Category 3)
- Logging out / clearing session clears visible client-side data
- Model/source status shown to the user is always truthful

*You verify:* you can sign up, log in, log out, and see (in the Supabase
dashboard) that a row got created under your own user ID and only yours.
Then run `verification-guide.md` Category 3 in full — this is the single
most important check in this whole plan.

> **Prompt for your AI tool:** "Read project-overview.md, architecture.md,
> and code-standards.md in the context folder first. Implement F01 for
> Svasthi: replace src/lib/demo-store.ts and the x-svasthi-session header
> approach with Supabase (Postgres + Auth). Add a Supabase client (server
> and browser), create the check_ins/journals/voice_features/insights/
> chat_messages tables with RLS policies (user_id = auth.uid()) as
> described in architecture.md, add sign-up/login/logout UI, and update
> src/lib/http.ts and the API routes to use the authenticated user's ID
> instead of a session header. Preserve existing route names and response
> shapes in docs/api-contract.md unless this change requires updating
> them — if so, update that doc too. Follow code-standards.md. Report every
> file changed and every command you actually ran, including the exact RLS
> policy SQL for each table."

---

## 2. F11 (start only) — Test Harness Setup

**Goal:** Get a working test setup in place before building further, so
every future ticket can add real tests as it goes.

**Files to create:** `vitest.config.ts` (minimal), one trivial test file
**Files to modify:** `package.json` (add `test` script)

*You verify:* `npm run test` runs and shows a passing test. Use
`verification-guide.md` Category 2 to check the output actually looks like
a pass.

> **Prompt for your AI tool:** "Read code-standards.md. Set up Vitest for
> this project — package.json currently has no test script or test
> dependency. Add one trivial passing test to confirm the harness works,
> and an npm `test` script. Don't test any feature logic yet, this is just
> harness setup. Show me the actual command output when you run it."

---

## 3. F00 — Product Shell and Design System

**Goal:** Establish one premium visual language and reliable navigation.
**User story:** As a user, I can understand where I am and reach my next
action without effort.

**Files to create:** `src/components/ui/GlassCard.tsx`,
`src/components/ui/PrimaryButton.tsx`, `src/components/ui/StatCard.tsx`,
`src/components/ui/ProgressBar.tsx`, `src/components/layout/AppShell.tsx`,
`src/components/layout/MobileNav.tsx`

**Files to modify:** `src/app/page.tsx`, `src/app/layout.tsx`,
`src/app/globals.css`, `tailwind.config.ts`

**Components needed:** Shared buttons, surface cards, page headings,
desktop/mobile navigation

**APIs needed:** None

**Mock data needed:** Static greeting only — never invent a user identity

**Acceptance criteria:**
- Starter Next.js branding fully removed
- Keyboard navigation works throughout
- No horizontal overflow at 360px
- Visible focus states everywhere
- `prefers-reduced-motion` respected
- 44px minimum touch targets

*You verify:* the app no longer shows the default Next.js starter page;
navigation links work; it doesn't look broken on your phone.

> **Prompt for your AI tool:** "Read project-overview.md, ui-tokens.md,
> ui-rules.md, and ui-registry.md in the context folder. Implement F00 for
> Svasthi: replace the default Next.js starter homepage (src/app/page.tsx)
> with a real wellness home page and a shared AppShell, using the four nav
> destinations in ui-rules.md. Build the 'Not built' components in
> ui-registry.md this needs — at minimum GlassCard, PrimaryButton,
> PageHeader, and SupportBanner — using the tokens in ui-tokens.md. Update
> ui-registry.md's status column for whatever you build. Follow
> code-standards.md."

---

## 4. F02 — Daily Mood Check-in

**Goal:** Complete a useful check-in in under 45 seconds.
**User story:** As a user, I can express how I feel without writing a long
explanation.

**Files to create:** `src/app/check-in/page.tsx`,
`src/components/check-in/CheckInForm.tsx`,
`src/components/check-in/MoodCard.tsx`

**Files to modify:** `src/app/page.tsx`

**Components needed:** Mood radio group, labeled stress/energy controls,
sleep input, context toggles

**APIs needed:** Existing `POST /api/check-ins` through the shared client

**Mock data needed:** Sample values only in explicit demo mode

**Acceptance criteria:**
- Mood 1–5; stress/energy 0–10; sleep 0–24
- No hidden submission defaults
- Errors announced accessibly
- Duplicate submit clicks prevented
- Submitted values update the active journey state

*You verify:* you can submit a check-in and it shows up (in Supabase) tied
to your account.

> **Prompt for your AI tool:** "Read architecture.md's API table and
> code-standards.md. Build the daily check-in page at /check-in using the
> existing POST /api/check-ins endpoint, updated to use Supabase per F01.
> Use the MoodCard and shared UI components from ui-registry.md. Mood 1–5,
> stress/energy 0–10, sleep 0–24 hours, matching checkInSchema in
> src/lib/schemas.ts. Preserve entered values if submission fails, and
> prevent duplicate submissions."

---

## 5. F08 (banner only, early) — Always-Visible Support Access

**Goal:** No feature is ever built without support access already present
on screen.

**Files to create:** `src/components/safety/SupportBanner.tsx` (minimal
version)

*You verify:* a support link/banner is visible on every page you've built
so far, and the Tele-MANAS number (14416) is correct. Run
`verification-guide.md` Category 4, steps 1 and 3.

> **Prompt for your AI tool:** "Read ui-rules.md's state design table and
> project-overview.md's safety principles. Build just the SupportBanner
> component (already listed in ui-registry.md) and add it to the AppShell
> so it appears on every page already built. Link to Tele-MANAS at 14416
> with a user-initiated tel: link, no automatic calling. Don't build the
> full /support page or crisis-detection logic yet, that's F08 (finish)
> later in this plan."

---

## 6. F03 — Voice Journal

**Goal:** Deliver a real recording experience with a dependable transcript
path.
**User story:** As a user, I can speak, review my reflection, and decide
what to share.

**Files to create:** `src/app/journal/page.tsx`,
`src/components/journal/VoiceRecorder.tsx`,
`src/components/journal/TranscriptEditor.tsx`,
`src/lib/audio/use-recorder.ts`

**Files to modify:** `src/app/api/journals/route.ts`

**Components needed:** Record/stop controls, elapsed timer, waveform,
playback, transcript editor

**APIs needed:** Existing journal API; no audio-upload endpoint in the core
build

**Mock data needed:** Explicit "Use sample reflection" fixture only

**Acceptance criteria:**
- Microphone permission requested only after a click
- HTTPS supported
- Recording capped at 60 seconds
- Tracks stop on cancel/unmount; object URLs revoked
- Typed journal works fully without a microphone
- No automatic upload
- Consent required before processing

*You verify:* on your actual phone and at least one desktop browser —
record, stop, play back, and also confirm a typed-reflection fallback works
if you deny microphone access.

> **Prompt for your AI tool:** "Read library-docs.md's MediaRecorder/Web
> Audio notes. Build the voice journal recorder at /journal: record, stop,
> playback using MediaRecorder, a 60-second cap, microphone permission
> requested only after a click, a typed-reflection option always available,
> and tracks stopped plus object URLs revoked on every exit path including
> cancel and unmount. Follow code-standards.md."

---

## 7. F04 — Descriptive Voice Signals

**Goal:** Compute genuine acoustic measurements without diagnosing emotion.
**User story:** As a user, I can see what was measured and understand its
limitations.

**Files to create:** `src/lib/audio/features.ts`,
`src/components/journal/VoiceSignals.tsx`,
`tests/unit/audio-features.test.ts`

**Files to modify:** `src/lib/types.ts`, `src/lib/schemas.ts`,
`src/lib/ai/fallback.ts`

**Components needed:** Signal cards, measurement explanation,
insufficient-audio state

**APIs needed:** None — local Web Audio analysis only

**Mock data needed:** Synthetic PCM test signals, never fabricated live
readings

**Acceptance criteria:**
- Computes duration and approximate low-energy ratio
- Finite values only (no NaN/Infinity leaking to the UI)
- Silence and noise handled gracefully
- Transcript timing labels are honest about what's estimated
- No personal-baseline claim without an actual valid baseline
- Acoustics alone never trigger a clinical/referral classification

*You verify:* the numbers shown (duration, level, quiet-ratio) change
sensibly between a loud recording, a quiet recording, and silence. Watch
for any wording that sounds like a diagnosis — that's a red flag to fix
immediately, not a style nitpick.

> **Prompt for your AI tool:** "Read library-docs.md's acoustic measurement
> notes. Implement duration, RMS dBFS, and an approximate quiet-frame-ratio
> calculation as pure, testable functions in src/lib/audio/features.ts.
> Follow the data-honesty rules in code-standards.md — never label these as
> detecting emotion, stress, or any clinical state. Add unit tests for
> silence, short clips, and normal audio."

---

## 8. F08 (finish) — Full Crisis Support and Safety

**Goal:** Make human-support options available independently of AI, and
make sure every content-processing route is covered.
**User story:** As a user in distress, I can find immediate support without
completing a workflow.

**Files to create:** `src/app/support/page.tsx`,
`src/components/safety/CrisisPanel.tsx`, `tests/unit/crisis.test.ts`

**Files to modify:** `src/lib/safety/crisis.ts`,
`src/app/api/journals/route.ts`, `src/app/api/chat/route.ts`,
`src/app/api/insights/route.ts`

**Components needed:** Full crisis panel, immediate-danger vs. counselling
distinction, user-initiated call link

**APIs needed:** None external — support rendering has no dependency

**Mock data needed:** Fictional direct/indirect distress test fixtures for
testing only

**Acceptance criteria:**
- 14416 visible from every route
- Emergency guidance clearly distinguished from counselling support
- No automatic calling
- No claim of monitoring or comprehensiveness
- All "Niramaya" branding fully replaced with "Svasthi"
- Journal, chat, and insight paths all run the safety check
- Detector limitations documented in the UI copy, not hidden

*You verify:* type a few clearly fictional test phrases into journal/chat
and confirm the support panel appears; confirm it still works with
`DEMO_MODE=true` (i.e. doesn't depend on Gemini being up). Run
`verification-guide.md` Category 4 in full.

> **Prompt for your AI tool:** "Read ui-rules.md's state design and
> code-standards.md's safety-critical rules. Build F08 fully: the /support
> page, a CrisisPanel component, expanded test coverage in
> src/lib/safety/crisis.ts (direct, indirect, negated, quoted, third-person,
> and reviewed Hindi/Hinglish examples where available), and wire a safety
> check into the journal, chat, and insights API routes so every path
> surfaces support guidance when needed. Replace any remaining 'Niramaya'
> branding with 'Svasthi'. Never claim the detector is comprehensive or
> clinically validated."

---

## 9. F05 — Personal Insights

**Goal:** Explain one useful next step from known evidence.
**User story:** As a user, I understand why a suggestion appeared and can
choose what to do.

**Files to create:** `src/app/insights/page.tsx`,
`src/components/insights/InsightCard.tsx`,
`src/components/insights/EvidenceList.tsx`, `src/lib/ai/prompts.ts`

**Files to modify:** `src/lib/ai/gemini.ts`, `src/lib/ai/fallback.ts`,
`src/lib/schemas.ts`, `src/app/api/insights/route.ts`

**Components needed:** Insight summary, evidence rows, source badge,
exercise/support action links

**APIs needed:** Existing `POST /api/insights`

**Mock data needed:** A deterministic "overwhelmed student" example, for
fallback wording only

**Acceptance criteria:**
- Every claim traces back to actual input data
- Fixed non-medical disclaimer always shown
- Strict output schema validated with Zod
- 8-second deadline with deterministic fallback
- Crisis check runs before any model call
- No invented comparison history
- Actionable navigation to exercises/support

*You verify:* read several generated insights yourself. Do they sound
reasonable? Do they ever claim something not actually supported by your
check-in/journal? Do they include the fixed non-medical disclaimer?

> **Prompt for your AI tool:** "Read code-standards.md's AI-provider-
> handling and data-honesty rules. Build /insights using the existing POST
> /api/insights endpoint. Validate Gemini's JSON output with a strict Zod
> schema before it reaches the UI. Enforce an 8-second timeout with a
> deterministic fallback. Include the fixed non-medical disclaimer on every
> insight. Every claim shown must trace to actual check-in/journal data,
> never an invented comparison. Use the insight-generation prompt from
> dawn-and-insight-prompts.md as the system instruction."

---

## 10. F06 — Dawn AI Companion

**Goal:** Provide brief, compassionate conversation with clear boundaries.
**User story:** As a user, I can reflect with Dawn without mistaking it for
a therapist.

**Files to create:** `src/app/dawn/page.tsx`,
`src/components/dawn/ChatPanel.tsx`, `src/components/dawn/MessageBubble.tsx`

**Files to modify:** `src/app/api/chat/route.ts`, `src/lib/ai/prompts.ts`,
`src/lib/schemas.ts`

**Components needed:** Message list, composer, suggested opening prompts,
typing/pending state

**APIs needed:** Existing chat endpoint; optional bounded history added
compatibly

**Mock data needed:** Reviewed contextual fallback variants (not generic
"I'm here for you" filler)

**Acceptance criteria:**
- Existing `{message}` request shape still accepted
- At most six prior messages sent as history
- No hidden durable memory across sessions
- Clear AI label always shown
- Source (Gemini vs. fallback) returned consistently
- Crisis routing works even when the model call fails
- Retries never duplicate messages

*You verify:* have a real conversation with it. Try describing distress and
confirm it hands off to crisis support appropriately rather than just
chatting normally.

> **Prompt for your AI tool:** "Read code-standards.md's safety-critical
> rules. Build /dawn as a chat UI using the existing POST /api/chat
> endpoint. Bound history to at most 6 prior messages, keep crisis-
> detection routing ahead of any model call, and never let client-supplied
> text override the system prompt. Use the full Dawn system prompt from
> dawn-and-insight-prompts.md as the system instruction, including its
> sample conversations as a tone reference."

---

## 11. F07 — Wellness Dashboard

**Goal:** Present understandable trends without misleading provenance.
**User story:** As a user, I can distinguish my entries from sample data
and notice patterns.

**Files to create:** `src/app/dashboard/page.tsx`,
`src/components/dashboard/TrendChart.tsx`,
`src/components/dashboard/WellnessSummary.tsx`,
`src/lib/dashboard/metrics.ts`

**Files to modify:** Supabase query layer (replacing old `demo-store.ts`
dashboard logic)

**Components needed:** Mood chart, stress chart, sleep chart, streak card,
self-report index

**APIs needed:** Existing dashboard API retained; active journey merged
client-side

**Mock data needed:** Six explicitly fictional prior days, badged as sample

**Acceptance criteria:**
- Today's entry reflects actual submission
- Dates correct, using an injected clock and one consistent local-date
  policy
- Sample data clearly labeled
- Empty chart state is meaningful, not blank
- Accessible table alternative available
- Wellness-score formula visible to the user (see `dashboard-and-scoring.md`)
- Streak derived from real distinct check-in dates, never hard-coded

*You verify:* sample/demo data is clearly labeled as such and separate
from your real entries; your real streak count matches your actual
check-in days.

> **Prompt for your AI tool:** "Read code-standards.md's data-honesty rules,
> ui-rules.md's sample-history state design, and dashboard-and-scoring.md
> for the exact score formula and mock-data policy. Build /dashboard:
> mood/stress/sleep trends, with any sample/fixture data visibly badged and
> separated from real entries. Derive the streak from actual distinct
> check-in dates, never hard-code it."

---

## 12. F09 — Guided Wellness Exercise

**Goal:** Offer one small action after reflection.
**User story:** As a user, I can try a brief calming exercise without
committing to a program.

**Files to create:** `src/app/exercises/page.tsx`,
`src/components/exercises/BreathingExercise.tsx`

**Components needed:** Optional paced-breathing guide, grounding
alternative, start/pause/stop

**APIs needed:** None

**Acceptance criteria:**
- One-minute flow
- No mandatory breath hold
- Clear "stop if uncomfortable" instruction
- Reduced-motion mode available
- No claimed therapeutic outcome
- Crisis access remains visible throughout

*You verify:* start, pause, stop all work; nothing forces you to hold your
breath; there's a text-only option.

> **Prompt for your AI tool:** "Read ui-tokens.md's motion rules. Build
> /exercises: one optional one-minute breathing guide, start/pause/stop
> controls, no mandatory breath-holding, a text-only reduced-motion mode,
> and a grounding alternative."

---

## 13. F10 — Resource Directory and Referral Handoff

**Goal:** Turn "consider support" into a clear, honest action.
**User story:** As a user, I can find a credible service or prepare to seek
professional support.

**Files to create:** `src/app/resources/page.tsx`,
`src/components/resources/ResourceCard.tsx`, `src/lib/resources.ts`

**Components needed:** Resource cards, support-category filter,
verification metadata

**APIs needed:** None — curated static records

**Mock data needed:** Optional fictional card, only in explicit demo mode

**Acceptance criteria:**
- No fabricated clinician credentials, availability, or booking
- Official destinations actually checked before listing
- External-link semantics correct (opens appropriately, marked external)
- Sample cards unmistakably labeled
- Crisis service clearly distinguished from therapy booking

*You verify:* every link actually works and goes where it claims to.

> **Prompt for your AI tool:** "Build /resources: a small, curated,
> statically-typed list of support destinations. Do not invent clinician
> credentials, availability, or bookings, only include what you can confirm
> is real as of writing."

---

## 14. F11 (finish) — Full Tests, CI, and Deployment Reliability

**Goal:** Make the real experience reproducible — for you, and for anyone
who uses it later.
**User story:** As the builder, I can complete a full run-through even when
the model or microphone fails.

**Files to create:** `playwright.config.ts`, `tests/e2e/journey.spec.ts`,
`tests/e2e/fallbacks.spec.ts`, `.github/workflows/ci.yml`,
`docs/runbook.md`

**Files to modify:** `package.json`, `package-lock.json`, `README.md`

**Components needed:** Demo reset/status controls reused from F01

**APIs needed:** Existing health endpoint

**Mock data needed:** Synthetic demo fixtures and mocked provider failures

**Acceptance criteria:**
- Lint, typecheck, unit tests, and build all pass
- End-to-end test passes against the deployed build
- Denied-microphone path passes
- No secrets exposed anywhere in the repo or client bundle
- Demo reset is reproducible
- README updated to reflect actual implemented behavior, not aspirational
  features

*You verify:* `npm run build` succeeds; a fresh person (or you, in an
incognito window) can go through the whole journey on the deployed URL.

> **Prompt for your AI tool:** "Read code-standards.md. Expand the test
> suite to cover the main journey, provider failure/timeout, microphone
> denial, consent rejection, and crisis routing. Add a minimal CI workflow.
> Write a deployment/runbook doc. Show me the actual pass/fail output,
> never an inferred summary."

---

## Before any real (non-you) user touches this app

Regardless of how far down this list you are — get a qualified human to
review:
- The crisis-detection patterns and crisis-support copy
  (`src/lib/safety/crisis.ts` and the F08 UI)
- The Supabase RLS policies (confirm users genuinely cannot see each
  other's data — don't take "it worked when I tried it" as proof)

This is the one gate on this list that isn't "verify it yourself" — it
specifically requires someone else's judgment. See `definition-of-done.md`
for the full pre-launch checklist.
