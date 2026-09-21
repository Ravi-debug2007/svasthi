# Svasthi — Progress Tracker

Update this yourself as you go. Status options: `Not started` · `In
progress` · `Built (unverified)` · `Verified` · `Blocked`.

"Verified" means you personally did the "you verify" checklist for that
ticket in `build-plan.md` — not just that the AI tool said it was done.

| # | Ticket | Status | Verified on | Notes |
|---|---|---|---|---|
| 1 | F01 — Persistence, auth, journey state | Built (unverified) | | 2026-09-21: Code complete. Migration applied to live project (verified: 5 tables, RLS enabled, 13 policies). RLS isolation programmatically verified — cross-user reads/deletes blocked, forged user_id inserts rejected 403, anon sees nothing (see Known Issues for method). Still needs: Ravi's own click-through (sign-up/login/logout in the app) per the ticket's "you verify" step. |
| 2 | F11 (start) — Test harness | Built (unverified) | | 2026-09-21: Vitest 3.2.7 (pinned — v5 conflicts with @types/node 20 used by Next 14), minimal config with @ alias, smoke test, `npm run test`. Real output shown: 1 test passed; tsc/lint/build also pass. Ravi verifies via verification-guide.md Category 2. |
| 3 | F00 — Product shell & design system | Not started | | |
| 4 | F02 — Daily check-in | Not started | | |
| 5 | F08 (banner) — Always-visible support | Not started | | |
| 6 | F03 — Voice journal recording | Not started | | |
| 7 | F04 — Descriptive voice signals | Not started | | |
| 8 | F08 (finish) — Full crisis support & safety | Not started | | |
| 9 | F05 — Personal insights | Not started | | |
| 10 | F06 — Dawn AI companion | Not started | | |
| 11 | F07 — Wellness dashboard | Not started | | |
| 12 | F09 — Guided exercise | Not started | | |
| 13 | F10 — Resource directory | Not started | | |
| 14 | F11 (finish) — Full tests, CI, deploy | Not started | | |
| — | **Gate:** Human security review of RLS policies | Not started | | Required before real users |
| — | **Gate:** Qualified human review of crisis detection & copy | Not started | | Required before real users |

## Known issues log

Use this to track things you notice that aren't fixed yet — a running list
so nothing gets silently forgotten between sessions with your AI tool.

| Found on | Issue | Fixed? |
|---|---|---|
| F01 build | Migration `20260921000000_f01_schema_rls.sql` was written but NOT yet applied to the live Supabase project (verified via REST: PGRST205 "table not found"). App returns 503/401 at runtime until it is run in the Supabase SQL Editor. | **Fixed 2026-09-21** — applied via Management API; tables/policies confirmed live. RLS isolation test (Category 3): two throwaway accounts, user2 saw 0 of user1's rows, anon saw 0, cross-user delete = 0 rows, forged user_id insert → 403. Test users deleted; auth email-confirm setting restored to its original value. |
| F01 build | Crisis copy in `src/lib/safety/crisis.ts` said "Niramaya" — replaced with "Svasthi" during F01. Qualified human review still pending (gate). | Copy replaced; review pending |
| Pre-existing | Streak & wellness-score formula kept (now labeled illustrative and derived from real dates); full provenance-badged dashboard is F07. | Planned F07 |

## Decisions made along the way

A short log of any real decisions that diverge from the plan in the other
context files, so future-you (or a future AI session) knows why.

| Date | Decision | Reason |
|---|---|---|
| 2026-09-21 | Chat now requires sign-in and stores both sides of the conversation in `chat_messages` (was anonymous/ephemeral); bounded to 6 prior messages as history | F01: no shared session; per-user durable storage; prepares F06 bounded history |
| 2026-09-21 | `/api/dashboard` returns only real user rows (seeded sample days removed from the server); sample fixtures moved client-side to `src/lib/demo/fixtures.ts` for F07 to badge | Data-honesty rule: server never blends real and fictional data |
| 2026-09-21 | `/api/journals` response now includes `crisisSignal: boolean` | Lets the client surface support immediately; contract change documented in docs/api-contract.md |
| 2026-09-21 | Nav destinations exist as honest "not built yet" placeholder pages; `/support` is a real page | Support access must never be a dead link; nav must not 404 |
