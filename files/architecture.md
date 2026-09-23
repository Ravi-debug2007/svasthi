# Svasthi — Architecture

## Stack (confirmed from the repo, as of this doc)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Do not switch frameworks or split into a separate backend service. Solo builder + already-working API routes = stay put. |
| Language | TypeScript | |
| UI | React 18 | |
| Styling | Tailwind CSS 3 | Global CSS variables in `src/app/globals.css` |
| Validation | Zod | Used for request schemas in `src/lib/schemas.ts` |
| AI provider | Gemini (`@google/genai`) | Configurable model via `GEMINI_MODEL` env var; has a deterministic fallback when `DEMO_MODE=true` or the provider fails |
| Fonts | Local Geist Sans / Geist Mono | Already wired via `src/app/layout.tsx` — reuse, don't add web fonts |
| Current persistence | `globalThis`-backed in-memory `Map` (`src/lib/demo-store.ts`) | **This is the thing being replaced.** Process-local, doesn't survive serverless restarts, and currently defaults to one shared session when no session header is sent. |
| Current auth | None — caller-supplied `x-svasthi-session` header | **Also being replaced.** A session ID is not a credential; anyone with the ID can act as that session. |

## The persistence/auth decision

**Moving to Supabase** (Postgres + Auth), still called from inside the
existing Next.js API routes. This is not a framework rewrite — it's swapping
the storage layer underneath code that's already written and already works.

Why Supabase specifically, for this project:
- Real Postgres — relational data, durable across restarts, supports Row
  Level Security (RLS).
- Auth is built in — replaces the fake session header with real login.
- RLS policies mean a user's data is protected *at the database level*, not
  just by application code the builder can't personally audit. This matters
  a lot for a solo, no-coding-background builder handling sensitive data.
- One dashboard to see users, tables, and data — useful for someone who
  can't read raw code to verify things are working.
- Free tier is enough to run this for real without paying until there are
  actual users.

**Why not FastAPI/NestJS/a separate backend:** The one plausible reason to
switch language (real audio DSP) doesn't apply — Svasthi deliberately keeps
acoustic analysis descriptive and simple (duration, RMS level, quiet-frame
ratio), not ML-grade. Splitting into two deployable services (frontend +
separate backend) roughly doubles the ops surface for a solo builder with no
functional gain here. If real audio ML is ever added, that's the point to
spin up a small dedicated service for *just* that — not before.

## Planned data model (Supabase / Postgres)

```
users              — handled by Supabase Auth
check_ins          — user_id, mood, stress, energy, sleep_hours, created_at
journals           — user_id, transcript, consent, created_at
voice_features     — journal_id, duration, rms_dbfs, quiet_ratio, ...
insights           — user_id, source_check_in_id, source_journal_id,
                      evidence[], next_step, generated_by, created_at
chat_messages      — user_id, role, content, created_at
```

Every table gets a `user_id` column and an RLS policy of
`user_id = auth.uid()`. No table should be readable across users by default.

## Existing API surface (do not break these contracts casually)

| Method & route | Behavior |
|---|---|
| `POST /api/check-ins` | Validates and stores a check-in |
| `GET /api/check-ins` | Returns session check-ins |
| `POST /api/journals` | Requires transcript, voice features, `consent: true`; stores journal |
| `POST /api/insights` | Accepts IDs or inline payloads; runs crisis check before Gemini/fallback |
| `GET /api/dashboard` | Returns metrics and session data |
| `POST /api/chat` | Single-message chat; crisis bypass; Gemini or generic fallback |
| `GET /api/health` | Reports demo flag and key presence; does not test provider availability |

Full request/response shapes: `docs/api-contract.md` in the repo.

## Folder structure — current vs. target

**Current (confirmed):**
```
src/
├── middleware.ts
├── app/
│   ├── api/{chat,check-ins,dashboard,health,insights,journals}/route.ts
│   ├── fonts/, favicon.ico, globals.css, layout.tsx, page.tsx
└── lib/
    ├── ai/{fallback.ts, gemini.ts}
    ├── safety/crisis.ts
    ├── demo-store.ts, http.ts, schemas.ts, types.ts
```

**Target (adds product pages, components, and Supabase client):**
```
src/
├── middleware.ts
├── app/
│   ├── api/                      # existing routes, updated to use Supabase
│   ├── check-in/page.tsx
│   ├── journal/page.tsx
│   ├── insights/page.tsx
│   ├── dawn/page.tsx
│   ├── dashboard/page.tsx
│   ├── exercises/page.tsx
│   ├── support/page.tsx
│   ├── resources/page.tsx
│   ├── layout.tsx, globals.css, page.tsx
├── components/
│   ├── ui/, layout/, providers/
│   ├── check-in/, journal/, insights/, dawn/, dashboard/, exercises/,
│   │   safety/, resources/
└── lib/
    ├── ai/{config.ts, prompts.ts, fallback.ts, gemini.ts}
    ├── audio/, client/, dashboard/, demo/, safety/
    ├── supabase/                 # NEW — client setup, RLS-aware queries
    ├── resources.ts, http.ts, schemas.ts, types.ts
```

No monorepo, no microservices, no Redux, no vector database, no separate
Python inference server.

## Keep / Modify / Remove — the original audit's decisions

Each row is a separate decision, carried over from the source audit and
still valid after the Supabase migration decision:

| Keep | Modify | Remove |
|---|---|---|
| Next.js App Router — avoids a rewrite | Add focused product routes | — |
| TypeScript and Zod — useful contracts | Add response schemas and provenance fields | — |
| Existing API route names — preserve integration investment | Extend contracts deliberately and document behavior changes | — |
| Gemini integration — already wired | Separate system instructions, validate outputs, enforce time budgets | — |
| Deterministic insight fallback — essential for reliability | Make wording truthful and context-sensitive | — |
| Crisis-before-model pattern — correct architectural direction | Add shared UI, broader tests, supportive escalation | — |
| Local font setup — reliable without external font requests | Apply Geist consistently | Starter-only mono styling |
| — | Bound store size / move off in-memory entirely (done via F01) | Shared default session for personal data |
| Seeded history as fictional fixture data | Add visible "Sample history" labels | Hard-coded streak presented as earned |
| Existing visual primitives from Tailwind | Introduce centralized design tokens | Next.js/Vercel starter content |
| Existing CORS behavior, until consumer requirements are understood | Document whether a separate frontend still needs it | No blind removal of middleware |
| Wellness insight concept | Emphasize self-report and uncertainty | Pause-only "watch" classification and unsupported baseline wording |

## Known technical debt and risks (from the original audit)

Still relevant post-migration unless marked otherwise. Use this as a
pre-existing-issues checklist so nothing gets silently reintroduced.

| Finding | Impact | Required action |
|---|---|---|
| Shared fallback session (`"demo-session"`) | Headerless requests could share data within a process | **Resolved by F01** — real auth replaces this entirely |
| Session ID was not authentication | Anyone with an ID could act as that session | **Resolved by F01** |
| Process-local persistence | Data/IDs could disappear across instances/restarts | **Resolved by F01** (Supabase) |
| Unbounded in-memory store | Memory accumulation | **Resolved by F01** (real database has its own limits/monitoring instead) |
| Streak always equals seven | Misleading user feedback | Derive streak from real dates (F07) |
| Arbitrary wellness score | Looks medically meaningful without validation | Label as illustrative self-report index (see `dashboard-and-scoring.md`) |
| Stale/ambiguous daily dates | Seed dates created at module load; mixed local/UTC | Inject a clock, choose one date policy (F07) |
| No acoustic extractor | "Voice analysis" depended on caller-supplied numbers | Implement real browser measurement (F04) |
| Pauses alone trigger a "watch" label | Noise, speech differences, and pauses can be over-interpreted | Keep acoustics descriptive only (F04) |
| "Longer pauses than usual" without a baseline | Unsupported personal comparison | Replace with measured, session-specific wording (F04) |
| Consent absent from inline insight path | Transcript could be processed without consent | Explicit consent required on every path (F01/F05) |
| Journal endpoint didn't run crisis check | Support appeared only if insight/chat was called afterward | Add safety check on journal submission (F08 finish) |
| Narrow crisis patterns | False negatives and false positives | Test direct, indirect, negated, quoted, multilingual examples (F08 finish) |
| Wrong product name ("Niramaya") in crisis copy | Trust-breaking inconsistency | Replace with Svasthi everywhere (F08 finish) |
| Prompt/data concatenation in AI calls | Weak separation against instruction injection | System instruction kept structurally separate from user data (F05/F06) |
| Weak output validation on AI responses | Malformed/unexpected fields could reach the UI | Strict Zod output schema (F05) |
| No explicit AI deadline | Could hang on a slow provider | 8-second deadline + deterministic fallback (F05/F06) |
| Automatic dark mode with no designed dark palette | Unexpected visual inconsistency | Ship one intentional theme first (F00) |
| Accessibility not yet implemented for product controls | Can't claim an accessible experience | Native semantics + testing (ongoing, see `ui-rules.md`) |
| Responsiveness unverified | Can't claim mobile readiness | Test actual target viewports (ongoing) |

