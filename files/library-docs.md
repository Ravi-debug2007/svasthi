# Svasthi — Library & API Notes

Practical notes on the specific libraries/APIs this project uses — not full
docs, just the parts that matter here and things worth not re-discovering
each session.

## Next.js 14 (App Router)

- Routes live under `src/app/`; API routes under `src/app/api/*/route.ts`.
- Middleware (`src/middleware.ts`) currently only handles CORS — it is not
  authentication or rate limiting. Don't assume it protects anything.
- Deploy target: Vercel or any Next.js-compatible host.

## Supabase (Postgres + Auth)

- Use the official `@supabase/supabase-js` client; server-side calls should
  use a server client (not the anon key with elevated trust) where writes
  touch data across users.
- **Every table needs RLS enabled**, with a policy like
  `user_id = auth.uid()`. RLS with no policies defined means *no access at
  all* by default — that's the safe failure mode; double-check policies
  exist rather than assuming "RLS on" alone is sufficient.
- Supabase's dashboard (Table Editor, Auth users list) is the place to
  manually verify data — useful since reading raw code isn't the check here.
- Free tier is fine to start; check current limits before scaling.

## Gemini (`@google/genai`)

- Env vars (from `.env.example` in the repo): `GEMINI_API_KEY`,
  `GEMINI_MODEL` (default seen in README: `gemini-2.5-flash`), `DEMO_MODE`.
- **`GEMINI_API_KEY` must stay server-side.** Never expose it via a
  `NEXT_PUBLIC_` variable, never commit it.
- `DEMO_MODE=true` is the safe default — insights and chat use deterministic
  fallbacks, no API key required. Good for local development.
- Every call needs an explicit deadline (spec says 8 seconds) with a
  fallback — see `code-standards.md`.
- Check `/api/health` to confirm current demo-mode/key-presence status at
  runtime.

## Zod

- Used for all request/response validation (`src/lib/schemas.ts`).
- Also used to validate *AI model output* before it reaches the UI —
  malformed or unexpected JSON from Gemini should never pass through
  unchecked.

## MediaRecorder / Web Audio API (voice journal)

- Request microphone permission only after a user click — never on page
  load.
- Requires HTTPS in production (will not work over plain HTTP except on
  localhost).
- Detect supported MIME types before recording — browser support varies.
- Always stop tracks and revoke object URLs on cancel/unmount to avoid
  leaking the microphone indicator staying active.
- Recording cap: 60 seconds (per spec).
- Acoustic measurements computed locally (no upload needed for this):
  duration, RMS level converted to dBFS, and an approximate low-energy
  ("quiet") frame ratio. These are deliberately simple and descriptive —
  resist the urge to make them sound more clinical than they are.

## Costs & limits to watch

Nothing here is free forever — check these periodically (see
`verification-guide.md` Category 5 for the how-to):

| Service | What to watch |
|---|---|
| Supabase | Database size, monthly active users, and API request limits on the free tier |
| Gemini API | Token/request quota under your API key |

If a limit is approaching, note it in `progress-tracker.md`'s known issues
log before it turns into an outage.

## Glossary (jargon used across these files)

| Term | Plain meaning |
|---|---|
| RLS (Row Level Security) | A database rule that blocks a user from ever seeing another user's rows, enforced by the database itself — not just by app code |
| Zod | A tool that checks incoming/outgoing data matches an expected shape, and rejects it if not |
| API route | A URL the app's frontend calls to save or fetch data (e.g. `/api/check-ins`) |
| Deterministic fallback | A fixed, pre-written response used when the AI provider is unavailable or too slow — never blank, never a crash |
| Session / auth | "Session" (old, insecure) meant a self-declared ID with no password. "Auth" (new) means a real login Supabase verifies |
| CI (Continuous Integration) | An automated check that runs tests every time code changes, so mistakes are caught early |

## API contract reference

Full request/response shapes for all existing endpoints:
`docs/api-contract.md` in the repo. Update this doc whenever a route's
contract changes — don't let it drift out of sync with the actual code.
