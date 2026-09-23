# Svasthi — Verification Guide (for a non-coder directing AI tools)

Some "you verify" steps in `build-plan.md` can be done just by clicking
around the app. A few can't — they need a specific method. This file is
that method, written with no assumed coding knowledge.

## Category 1: Things you verify by using the app

Just click through it. If it works the way it's supposed to, it's verified.
Most of `build-plan.md`'s checklist is this category — no extra help
needed here.

## Category 2: "Did the code actually work" checks

When your AI tool says it ran lint / typecheck / tests / build:

1. Ask it to show you the actual command output, not just "all checks
   passed." A real pass looks like a short summary with zero red/error
   text. If you see the word "error" or "failed" anywhere, it didn't pass —
   even if the AI tool's summary sentence says otherwise.
2. Ask specifically: "did you actually run this command just now, or are
   you describing what it should do?" AI tools sometimes describe expected
   behavior instead of running something. You want to see real output.

## Category 3: Security — verifying Row Level Security (RLS) on Supabase

This is the one that matters most and can't be skipped. Do this after F01
and again anytime you add a new table:

1. Log into your Supabase project dashboard → **Table Editor**.
2. Click on each table (e.g. `check_ins`, `journals`). Confirm there's a
   `user_id` column on every table that holds personal data.
3. Go to **Authentication** → **Policies** (or the RLS section under Table
   Editor for that table). For every table, confirm:
   - RLS is shown as **Enabled** (not just "created" — it must say enabled)
   - At least one policy exists for each of Select/Insert/Update you use
4. **The actual test:** create two throwaway accounts in your app (e.g.
   `test1@example.com` and `test2@example.com`). Log in as test1, submit a
   check-in. Log out, log in as test2. Go to the dashboard/check-in history
   screen. **You should see nothing from test1.** If you see test1's data
   while logged in as test2, RLS is broken — stop and fix this before
   anything else, including before showing the app to anyone else.
5. Ask your AI tool directly: "show me the exact RLS policy SQL for every
   table" and paste it back here (or into `progress-tracker.md`'s known
   issues log) so there's a record of what was actually applied.

## Category 4: Verifying the crisis-detection logic

You can't personally judge whether crisis-language detection is clinically
appropriate — that's the qualified-human-review gate in `build-plan.md`.
What you *can* verify yourself first, before that review:

1. Type a few test phrases into the journal/chat (never anything you
   actually feel — pick clearly fictional test lines) and confirm the
   support banner/panel appears.
2. Confirm the crisis response never depends on the AI provider (Gemini)
   being up — turn on `DEMO_MODE=true` and confirm crisis phrases still
   trigger support guidance.
3. Confirm the Tele-MANAS number shown is **14416** and the copy doesn't
   say "Niramaya" anywhere (an old product name that needs to be fully
   removed).

## Category 5: Cost/quota checks

Once a month (or before any big round of testing):

1. Supabase dashboard → **Usage** — check you're within free-tier limits.
2. Google AI Studio / Gemini console — check API usage against your quota.

If either is close to a limit, that's worth a note in `progress-tracker.md`
before it becomes a surprise outage.
