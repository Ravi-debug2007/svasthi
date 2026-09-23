# Svasthi — Project Overview

**Repo:** https://github.com/Ravi-debug2007/svasthi

## What Svasthi is

Svasthi is a calm, privacy-minded mental-wellness companion. It helps a person
notice changes in how they feel and reflect on them, then makes the next step
toward support easier.

**The pitch is deliberately modest.** Not "we diagnose burnout from your
voice." It is:

> "Svasthi helps people notice changes in how they feel and reflect, then
> makes the next step toward support easier."

## The core user journey

Check in → record a reflection → understand the signals → receive one
helpful next step → access human support.

Every feature in the app exists to serve this one journey. Nothing should be
added that doesn't strengthen one of these five steps.

## Who's building this

One person (Ravi), with no prior coding background, building this by
directing AI coding tools (Claude Code and similar) rather than writing code
by hand. This is not a hackathon project — it's being built as a real
product with real (eventual) users, with no fixed deadline.

**What this means in practice:**
- Every feature must be verifiable by *using* the app (clicking through it),
  not by reading the code.
- Tests matter more here than on a normal team, because they're the main
  safety net when the person directing the work can't personally review the
  code.
- Anything touching security (auth, data access rules) or safety (crisis
  detection, crisis-support copy) needs a second, qualified pair of human
  eyes before real users see it — this is a hard rule, not a nice-to-have.

## Non-negotiable product principles

1. **Never overclaim.** Svasthi measures things (mood self-report, stress
   self-report, basic acoustic properties of a recording). It does not
   diagnose, does not assign clinical risk scores, and never claims a voice
   recording proves an emotional or mental state.
2. **Always label provenance.** Every piece of data shown to the user is
   either: self-reported, measured (real acoustic data), sample/fictional
   (demo fixtures), or AI-generated wording. The user should always be able
   to tell which is which.
3. **Human support is never hidden.** Crisis-support access (Tele-MANAS,
   14416) is available from every screen, independent of whether any AI
   feature is working.
4. **Consent before processing.** A person's reflection (text or voice) is
   not sent anywhere for AI processing without their explicit, visible
   consent.

## Current status (as of this doc)

The repo currently matches its own README description: a Next.js app with
real backend API routes (check-ins, journals, insights, chat, crisis
detection) but an in-memory-only data store (no real database yet) and no
authentication. See `architecture.md` for the technical detail and the
planned Supabase migration.

## Files in this context set

| File | What it covers |
|---|---|
| `project-overview.md` | This file — the pitch, journey, and who's building it |
| `architecture.md` | Tech stack, data model, API contracts, Keep/Modify/Remove decisions, known technical debt |
| `build-plan.md` | All 14 build steps in solo order, each with full spec (files/components/APIs/acceptance criteria) and a ready-to-use AI prompt |
| `progress-tracker.md` | Status of each step, known-issues log, decision log — update this yourself |
| `code-standards.md` | Engineering protocol and data-honesty rules for every change |
| `ui-tokens.md` | Colors, typography, spacing, motion |
| `ui-rules.md` | Accessibility baseline, glassmorphism limits, navigation, state-design copy, scope-cut order |
| `ui-registry.md` | Reusable component list and build status |
| `library-docs.md` | Practical notes on Next.js, Supabase, Gemini, Zod, Web Audio, plus costs/limits and a glossary |
| `verification-guide.md` | Step-by-step methods for checks a non-coder can't do by inference (RLS, test output, crisis logic, costs) |
| `dawn-and-insight-prompts.md` | Full verbatim system prompts for Dawn and insight generation, sample conversations, memory rules |
| `dashboard-and-scoring.md` | Dashboard content spec, mock-data policy, the wellness-score formula and its rules |
| `definition-of-done.md` | Pre-launch checklist and ranked risk list — the final gate before real users |

## Starting a session with your AI tool

Paste something like this at the start of every Claude Code (or similar)
session, before giving it a specific ticket:

> "This is the Svasthi repo (github.com/Ravi-debug2007/svasthi). Before
> doing anything, read every file in the `context/` folder:
> project-overview.md, architecture.md, build-plan.md, progress-tracker.md,
> code-standards.md, ui-tokens.md, ui-rules.md, ui-registry.md,
> library-docs.md, verification-guide.md, dawn-and-insight-prompts.md,
> dashboard-and-scoring.md, and definition-of-done.md. Follow
> code-standards.md for every change. Check progress-tracker.md for what's
> already done before starting anything new."

Then give it the specific ticket prompt from `build-plan.md`.

## Where the full feature spec lives

The original execution manual (`svasthi_dvps25_48-hour_execution_manual.pdf`)
contains full feature tickets (F00–F11), the Dawn AI companion's system
prompt, the full design system, and sample judge Q&A. It was written for a
48-hour hackathon sprint with a 4-person team — the *content* (specs,
prompts, safety rules) is still valid and is the source for the other files
in this context set. The *scheduling* (48-hour clock, per-developer
ownership) is not — see `build-plan.md` for the solo-friendly resequencing.
