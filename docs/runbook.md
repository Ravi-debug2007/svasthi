# Svasthi — Deployment, Operations & Reliability Runbook

This document details the deployment pipeline, operational invariants, health monitoring, and incident response procedures for Svasthi.

---

## 1. System Architecture Overview

Svasthi is a mental-wellness companion web application designed around strict data-honesty and safety invariants.

- **Frontend & App Shell:** Next.js 14 App Router, React 18, Tailwind CSS. Every route sits behind the `AppShell` with persistent `SupportBanner` and `RequireAuth` session gate.
- **Data & Auth Layer:** Supabase (PostgreSQL with Row Level Security and Supabase Auth). RLS policies strictly enforce `auth.uid() = user_id` across all 5 tables (`check_ins`, `journals`, `voice_features`, `insights`, `chat_messages`). No shared or anonymous sessions.
- **AI & Processing:** Google Gemini API (`gemini-2.5-flash`) with an explicit 8-second hard deadline (`Promise.race` + SDK timeout) and deterministic fallback responses. Model output is strictly Zod-validated before reaching the UI.
- **Local Audio Analysis:** In-browser Web Audio API (`AnalyserNode`). Audio waveforms are measured locally and discarded; raw audio is **never** uploaded or stored on any server.
- **Safety & Crisis Interventions:** 19 regex patterns covering direct, indirect, and Hinglish distress language. Evaluated **before** any AI model call and before data storage. Urgent support (Tele-MANAS `14416`, KIRAN `1800-599-0019`, Emergency `112`) is always user-initiated.
- **Resource Directory:** Static, curated directory of verified Indian mental health organizations (`/resources`), distinguishing 24/7 crisis lines from scheduled counseling.

---

## 2. Environment Variables & Secret Hygiene

Configure the following variables in deployment environments (Vercel, container env, or `.env.local` for local development):

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client & Server) | Supabase project endpoint (e.g., `https://xyzcompany.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client & Server) | Supabase publishable anonymous key. RLS enforces security at database level. |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret (Server Only) | Supabase service role key. Strictly for automated migrations or administrative tasks; never expose to client bundle. |
| `GEMINI_API_KEY` | Secret (Server Only) | Google Gemini API key. Accessed strictly inside Next.js Route Handlers (`src/app/api/*`). |
| `DEMO_MODE` | Server / Optional | `"true"` or `"false"`. Controls whether demo mode indicators are reported by `/api/health`. |

### Secret Hygiene Rules
- Never commit `.env*` files containing active keys to version control.
- Never prefix server-only keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) with `NEXT_PUBLIC_`.
- Verify client bundle outputs before deployment with `npm run build` and secret pattern scanning (`sbp_`, `AIza`).

---

## 3. Pre-Deployment Verification Protocol

Run the five-phase pre-deployment verification suite locally or in CI:

```bash
# 1. ESLint check
npm run lint

# 2. TypeScript compilation check
npx tsc --noEmit

# 3. Unit test suite (104 tests)
npm test

# 4. Production Next.js build
npm run build

# 5. Playwright End-to-End test suite (12 tests)
npm run test:e2e
```

### Pre-Launch Human Review Gates
Before opening the system to non-builder users, complete the two required human gates:
1. **Supabase RLS Policy Audit:** Run cross-user isolation verification (verify user B cannot read, update, or delete user A's rows; anonymous requests receive 0 rows).
2. **Crisis Detection & Copy Audit:** Have a qualified mental health clinician or safety reviewer audit the patterns in `src/lib/safety/crisis.ts` and the crisis UI copy.

---

## 4. Deployment Procedures

### Deploying to Vercel (Recommended)
1. Link repository to Vercel.
2. In Project Settings → Environment Variables, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `GEMINI_API_KEY`.
3. Set Build Command: `npm run build`.
4. Deploy. Verify production URL responds with HTTP 200 on `/api/health`.

### Self-Hosted / Docker Node.js Deployment
1. Build container image with Node.js 20 LTS:
   ```bash
   npm ci
   npm run build
   ```
2. Start server:
   ```bash
   npm run start
   ```
3. Ensure server process runs behind an HTTPS reverse proxy (Nginx, Caddy, or Cloudflare) with HTTP/2 and modern TLS.

### Database Migrations (Supabase)
Migrations reside in `supabase/migrations/`:
- `20260921000000_f01_schema_rls.sql`: Initial schema, 5 tables, RLS enabled, 13 policies.
Apply migrations via Supabase CLI (`supabase db push`) or execute in the Supabase Management Console SQL Editor.

---

## 5. Health Monitoring & Telemetry

### Health Check Endpoint
- **URL:** `GET /api/health`
- **Authentication:** None (Public)
- **Response Format:**
  ```json
  {
    "ok": true,
    "demoMode": false,
    "modelConfigured": true,
    "supabaseConfigured": true
  }
  ```

### Continuous Probes
Set up external monitoring (e.g., UptimeRobot, Datadog, BetterStack) to poll `GET /api/health` every 60 seconds:
- **Success Criteria:** HTTP 200, `ok: true`, `modelConfigured: true`, `supabaseConfigured: true`.
- **Alert Trigger:** Any HTTP 5xx, response time > 5000ms, or `ok: false`.

---

## 6. Incident Response & Failure Scenarios

### Scenario A: Gemini API Outage or Latency Spike
- **Symptom:** AI insights or Dawn chat take longer than 8 seconds, or return upstream HTTP 500/503.
- **Expected Application Behavior:** The 8-second `Promise.race` deadline triggers. Fallback logic selects a reviewed, deterministic response (`classifyDawnContext` / `selectDawnReply` or `generateFallbackInsight`). Content is clearly badged with `Guided response (no AI used)`.
- **Action:** No emergency intervention required; the app gracefully degrades without crashing. Monitor Google Cloud status page.

### Scenario B: Microphone Denial or Incompatibility
- **Symptom:** User browser denies microphone permissions, no microphone hardware exists, or MediaRecorder is unsupported.
- **Expected Application Behavior:** VoiceRecorder detects error and displays: `"Your microphone isn't available. You can still write your reflection below."` The typed reflection editor remains fully functional.
- **Action:** Advise user that typing is a first-class feature and no microphone is needed.

### Scenario C: Acute Crisis Signal Triggered
- **Symptom:** User enters distress phrasing (e.g., self-harm, suicidal ideation) in Journal or Dawn chat.
- **Expected Application Behavior:** The application surfaces `CrisisPanel` immediately. Emergency lines (Tele-MANAS `14416`, KIRAN `1800-599-0019`, Emergency `112`) are prominently presented. In Dawn chat, crisis routing bypasses model calls and prevents storing unsafe disclosures.
- **Action:** Ensure telephonic links remain user-initiated only (`tel:14416`). Svasthi never auto-dials.

### Scenario D: Supabase Connectivity Interruption
- **Symptom:** User experiences login failure or API routes return HTTP 503 (`"The server is not configured for Supabase yet"`).
- **Expected Application Behavior:** Check-in and journal forms display: `"Could not reach the server. Your entries are still here — try again."` User input is preserved in memory and not lost.
- **Action:** Verify Supabase project status, connection pool limits, and API keys.

---

## 7. Demo Reset & Test Fixtures Procedure

- Fictional sample fixtures exist strictly client-side in `src/lib/demo/fixtures.ts` (dashboard trends) and `src/lib/resources.ts` (`SAMPLE_RESOURCE`).
- Demo fixtures are toggle-gated behind explicit user controls (`"Show sample history"` and `"Include sample demo fixture"`).
- Every sample fixture is unmistakably labeled with `<SourceBadge kind="sample" />`.
- Real user check-in data always supersedes demo fixtures on date collisions.
- Logging out (`signOut()`) immediately clears all in-memory journey state, local check-ins, reflections, and insights from client view.
