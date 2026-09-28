# Svasthi

<p align="center">
  <strong>A calm, privacy-minded mental wellness companion for honest reflection, acoustic self-awareness, and compassionate guidance.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js" alt="Next.js 14"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Auth_%26_RLS-emerald?style=flat-square&logo=supabase" alt="Supabase"></a>
  <a href="https://ai.google.dev"><img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=flat-square&logo=google" alt="Gemini AI"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2D6?style=flat-square&logo=tailwind-css" alt="Tailwind CSS"></a>
  <a href="https://vitest.dev"><img src="https://img.shields.io/badge/Vitest-3.2-yellow?style=flat-square&logo=vitest" alt="Vitest"></a>
  <a href="https://telemanas.mohfw.gov.in"><img src="https://img.shields.io/badge/Crisis_Support-Tele--MANAS_14416-8E3038?style=flat-square" alt="Tele-MANAS"></a>
</p>

---

> ### ⚠️ Important Safety & Medical Notice
> **Svasthi is a tool for personal reflection, pacing, and self-awareness. It does not diagnose, treat, prevent, or cure any mental health or medical condition, nor does it replace professional psychiatric care, clinical therapy, or emergency services.**
>
> If you or someone you know is experiencing acute distress or thoughts of self-harm, please connect with trained human support immediately:
> - **India (Tele-MANAS):** Call **`14416`** or **`1800-891-4416`** (Toll-free, 24/7, multi-lingual mental health care)
> - **India (KIRAN Mental Health Helpline):** Call **`1800-599-0019`** (Toll-free, 24/7)
> - **Emergency Services:** Call **`112`** or proceed to the nearest medical emergency room.

---

## 🌿 Overview & Philosophy

**Svasthi** helps individuals notice subtle shifts in how they feel, reflect on life's daily moments in a private sanctuary, and take gentle, low-pressure steps toward wellbeing.

The pitch of Svasthi is deliberately modest:
> *"Svasthi helps people notice changes in how they feel and reflect, then makes the next step toward support easier."*

Unlike conventional wellbeing apps that make exaggerated claims, Svasthi adheres to **radical data honesty**:
1. **Never overclaim**: Acoustic recordings are analyzed for descriptive audio properties (duration, pause ratio, speaking rate, loudness) — they are never framed as clinical depression biomarkers or diagnostic proof of an emotional state.
2. **Never fabricate data**: Unset sliders announce *"Not set yet"* rather than defaulting to hidden zeros. Missing calendar days are displayed as honest gaps, not artificially smoothed lines. Streaks count only real calendar check-in days.
3. **Never blend real and fictional data**: Sample history fixtures exist strictly client-side behind an explicit toggle, are clearly badged in amber, and are never persisted to the database.
4. **Guaranteed crisis reachability**: Crisis support access (Tele-MANAS `14416`) is permanently visible across all screens, independent of network status or AI availability.
5. **Absolute audio privacy**: Audio files are **never uploaded**. Browser Web Audio extracts numerical statistics locally and drops the audio buffers immediately.

---

## 🔄 The 5-Step Core Journey

Every screen and capability in Svasthi serves this continuous 5-step reflection loop:

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. CHECK IN    │ ──> │   2. REFLECT    │ ──> │ 3. UNDERSTAND   │ ──> │  4. NEXT STEP   │ ──> │5. ACCESS SUPPORT│
│                 │     │                 │     │    SIGNALS      │     │                 │     │                 │
│ Daily mood,     │     │ Private voice   │     │ Descriptive     │     │ Grounded insight│     │ Always-visible  │
│ stress, energy, │     │ or typed notes  │     │ acoustic facts  │     │ 1-min breathing │     │ Tele-MANAS      │
│ sleep & context │     │ (consent-gated) │     │ & honest badges │     │ or Dawn chat    │     │ 14416 guidance  │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 📱 Application Tour & User Flow

| Route | Feature | Purpose & Privacy Safeguards |
|---|---|---|
| **`/`** | **Home / Sanctuary** | Central overview displaying today's check-in status, reflection status, direct links to begin the journey, quick access to guided breathing, and persistent crisis support. |
| **`/check-in`** | **Daily Check-in** | Log mood (1–5), reported stress (0–10), energy (0–10), sleep hours, and up to 8 contextual tags. Untouched sliders clearly announce *"Not set yet"* with no silent defaults. |
| **`/journal`** | **Voice & Text Journal** | Record up to 60s of voice reflection with live decibel metering or type a private reflection. Zero audio uploads: audio is measured locally in-browser via Web Audio API. Per-submission AI consent gate. |
| **`/insights`** | **Grounded Insights** | Synthesize today's check-in and reflection into one actionable next step. Safety levels (*Steady*, *Worth watching*, *Support suggested*) are deterministically assigned by app rules, never by the AI model. |
| **`/dawn`** | **Dawn AI Companion** | A concise, supportive wellness conversationalist. Strictly bounded to a 6-message historical memory. Features sensitive crisis pre-screening before any LLM invocation and safe offline fallbacks. |
| **`/dashboard`** | **Honest Trends & Streaks** | 7-day trend charts for mood, reported stress, and sleep duration with honest gaps for missed days. Accessible `<details>` data tables, toggleable sample history overlay, and transparent Self-Report Index. |
| **`/exercises`** | **1-Minute Guided Breathing** | Resonant-frequency pacing guide (4s inhale / 6s exhale, 6 cycles = 60s) designed with **zero breath-holding**. Ambient-aware reduced-motion detection with automatic and manual text-only mode, plus 5-4-3-2-1 sensory grounding. |
| **`/support`** | **Crisis Directory** | Curated emergency and mental health directory featuring one-tap dialing to Tele-MANAS (`14416`), KIRAN (`1800-599-0019`), and Emergency Services (`112`), with gentle crisis coping instructions. |

---

## 🏷️ The 5-Tier Data Provenance System

Every metric, card, and insight presented in Svasthi carries an explicit provenance badge so users always know the exact origin of their data:

* <kbd>**Self-reported**</kbd> — Data entered directly by the user (e.g., mood ratings, sleep duration, journal text).
* <kbd>**Measured**</kbd> — Factual acoustic measurements calculated locally by the browser's Web Audio engine from an actual recording (duration, RMS loudness, pause ratio, speaking rate).
* <kbd>**AI-generated wording**</kbd> — Natural language phrasing generated by Gemini 2.5 Flash under strict safety constraints and Zod schema validation.
* <kbd>**Guided response (no AI used)**</kbd> — Deterministic, clinically reviewed offline fallbacks used when `DEMO_MODE=true`, offline, or when model timeouts occur.
* <kbd>**Sample data**</kbd> — Fictional demo fixtures. Available only via an explicit toggle on the Trends page; styled with amber badges and never blended into the database.

---

## 🛡️ Architecture & Security Principles

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                              │
│                                                                        │
│   Next.js 14 App Router  ·  Tailwind CSS Calm Palette  ·  Web Audio    │
│   Local PCM Feature Extraction (Zero Audio Uploaded)                   │
│   prefers-reduced-motion Auto-Detection  ·  Accessible Focus & ARIA   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (Same-Origin JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       SERVER (Next.js API Routes)                      │
│                                                                        │
│   1. Auth Gate (Supabase SSR Session Cookie)                           │
│   2. Pre-LLM Safety Pipeline (19-Pattern Crisis Language Detector)    │
│   3. Zod Request & Response Schema Validation                          │
│   4. Deterministic Business Logic (Safety Tiers, Resonant Metrics)     │
│   5. Gemini 2.5 Flash (8s Timeout + Deterministic Fallback)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ RLS-Enforced Queries (auth.uid())
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PERSISTENCE (Supabase PostgreSQL)                    │
│                                                                        │
│   5 Core Tables: check_ins, journals, voice_features,                  │
│                  insights, chat_messages                               │
│   13 Strict Row Level Security (RLS) Policies                          │
│   Cross-Tenant Access Physically Blocked at Database Engine Level      │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Security Safeguards

1. **PostgreSQL Row Level Security (RLS)**: Every row is bound to `auth.uid() = user_id`. Cross-user reads, updates, and deletes are physically rejected by Postgres.
2. **Zero Audio Uploads**: Voice reflections are processed in-memory via the browser's `AudioContext` and `AnalyserNode`. Numerical metrics (duration, RMS dBFS, pause ratio, words/min) are computed, and audio buffers are immediately released.
3. **Pre-LLM Crisis Pipeline**: Text is screened against a 19-pattern crisis detector *before* any external network call or LLM prompt. Detecting distress immediately returns Tele-MANAS guidance without sending user text to external AI models.
4. **Recall-Biased Crisis Safety**: Negation and quotations (`"I would never hurt myself"`) deliberately trigger the support panel. A false positive shows a calm support card; a false negative could leave someone in danger.
5. **Deterministic Safety Classification**: The AI model is restricted to generating text suggestions only. Safety severity levels (*Steady*, *Worth watching*, *Support suggested*), referral recommendations, and disclaimer texts are computed strictly by application code.
6. **Zod Schema Sanitization**: All incoming requests, outgoing responses, and AI model outputs are validated through strict Zod schemas (`src/lib/schemas.ts`), stripping prompt injections or unauthorized fields.
7. **Per-Entry Consent Control**: Reflections are never submitted for AI synthesis without the user explicitly choosing the AI-enabled submission action.

---

## 🛠️ Tech Stack

```text
├── Frontend Framework  : Next.js 14.2 (App Router), React 18, TypeScript 5
├── Styling & Tokens    : Tailwind CSS 3.4 (Custom calm tokens: canvas, ink, primary, sage, support)
├── Database & Auth     : Supabase (@supabase/ssr, @supabase/supabase-js, PostgreSQL, 13 RLS policies)
├── AI Engine           : Google Gemini 2.5 Flash (@google/genai) with deterministic offline fallbacks
├── Request Validation  : Zod 4.x / 3.x schema enforcement
├── Audio Processing    : Native Web Audio API (AnalyserNode, PCM RMS extraction, local processing)
└── Test Framework      : Vitest 3.2.7
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: `v18.17.0` or higher
* **npm**: `v9.0.0` or higher
* **Supabase Account**: A free database project at [supabase.com](https://supabase.com) (or local Supabase CLI)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Ravi-debug2007/svasthi.git
cd svasthi
npm install
```

### 2. Configure Environment Variables

Copy the template to `.env.local`:

```bash
# On Linux / macOS
cp .env.example .env.local

# On Windows (PowerShell)
Copy-Item .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# ---- Supabase (Required for Auth & Data Isolation) ----
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# ---- Gemini AI (Optional - leave DEMO_MODE=true for offline fallbacks) ----
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# Set to true to use deterministic, reviewed offline fallbacks without calling Gemini API
DEMO_MODE=true
```

> **Security Note:** Never prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`. Keep API keys strictly server-side.

### 3. Initialize Supabase Database & RLS

1. Open your **Supabase Dashboard** → **SQL Editor**.
2. Run the migration script located at:
   ```text
   supabase/migrations/20260921000000_f01_schema_rls.sql
   ```
3. This creates all 5 tables (`check_ins`, `journals`, `voice_features`, `insights`, `chat_messages`) with 13 Row Level Security policies.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To verify configuration status and API readiness at any time, visit the health check endpoint:
[`http://localhost:3000/api/health`](http://localhost:3000/api/health).

---

## 🧪 Testing & Verification

Svasthi includes an automated Vitest test harness covering domain logic, audio feature mathematics, breathing cycle mechanics, crisis detection, and dashboard metrics:

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npx vitest

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint
npm run lint

# Build for production
npm run build
```

---

## 📡 API Reference

All requests require a valid Supabase session cookie (handled automatically by the browser client).

| Method | Endpoint | Description | Request / Response Details |
|---|---|---|---|
| `POST` | `/api/check-ins` | Record daily wellbeing check-in | Payload: `{ mood, stress, energy, sleepHours, contexts }` |
| `GET` | `/api/check-ins` | Retrieve check-in history | Returns newest 90 check-ins for the authenticated user |
| `POST` | `/api/journals` | Save reflection & optional voice metrics | Payload: `{ transcript, consent: true, features? }`. Returns `crisisSignal: boolean` |
| `GET` | `/api/journals` | Retrieve reflection history | Returns newest 90 journal entries for the authenticated user |
| `POST` | `/api/insights` | Synthesize check-in + reflection | Payload: `{ checkInId, journalId }`. Pre-screened for crisis phrases |
| `GET` | `/api/dashboard` | Fetch 7-day trend metrics & streak | Returns 7-day local window, real distinct check-in streak, Self-Report Index |
| `POST` | `/api/chat` | Send a message to Dawn companion | Payload: `{ message }`. Bounded by 6 prior turns; crisis pre-screened |
| `GET` | `/api/chat` | Fetch conversation history | Restores latest 20 chat messages for the authenticated user |
| `GET` | `/api/health` | System health & runtime diagnostics | Returns `{ ok, demoMode, modelConfigured, supabaseConfigured }` |

*For complete schema definitions, error codes, and field validation, see [docs/api-contract.md](docs/api-contract.md).*

---

## 📂 Project Structure

```text
svasthi/
├── docs/                      # Architectural contracts
│   └── api-contract.md        # Definitive REST API specification
├── files/                     # Specifications, UI tokens & guidelines
│   ├── architecture.md        # Technical architecture & threat model
│   ├── build-plan.md          # 14-step implementation roadmap
│   ├── progress-tracker.md    # Feature status & decision logs
│   ├── code-standards.md      # Data honesty rules & engineering protocol
│   ├── ui-tokens.md           # Color, typography, and motion guidelines
│   ├── ui-rules.md            # Accessibility baseline & navigation rules
│   ├── dawn-and-insight-prompts.md # System prompts & fallback copy
│   └── dashboard-and-scoring.md    # Trends spec & scoring formula
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/               # Server-side API route handlers
│   │   ├── check-in/          # Wellbeing check-in page
│   │   ├── journal/           # Voice & typed reflection page
│   │   ├── insights/          # Grounded personal insight display
│   │   ├── dawn/              # Dawn companion chat interface
│   │   ├── dashboard/         # 7-day trend charts & metrics
│   │   ├── exercises/         # 1-minute guided breathing tool
│   │   ├── support/           # Tele-MANAS crisis support directory
│   │   ├── globals.css        # Svasthi color tokens & base styling
│   │   ├── layout.tsx         # Root layout with SupportBanner & AppShell
│   │   └── page.tsx           # Home sanctuary & daily overview
│   ├── components/            # Reusable UI component library
│   │   ├── auth/              # Supabase authentication panels
│   │   ├── check-in/          # CheckInForm, MoodCard, sliders
│   │   ├── journal/           # VoiceRecorder, TranscriptEditor, VoiceSignals
│   │   ├── dashboard/         # TrendChart, WellnessSummary, table view
│   │   ├── dawn/              # ChatPanel, MessageBubble, suggestions
│   │   ├── exercises/         # BreathingExercise visualizer & text mode
│   │   ├── layout/            # AppShell, MobileNav, headers
│   │   ├── safety/            # CrisisPanel, SupportBanner
│   │   └── ui/                # GlassCard, StatCard, SourceBadge, ProgressBar
│   └── lib/                   # Core business logic & utilities
│       ├── ai/                # Gemini client, system prompts & fallbacks
│       ├── audio/             # Browser Web Audio PCM analysis & math
│       ├── check-in/          # Domain validators & score calculations
│       ├── dashboard/         # Clock-injected metrics & streak algorithms
│       ├── exercise/          # Pure breathing cycle math (no hold step)
│       ├── safety/            # 19-pattern crisis language detector
│       ├── supabase/          # SSR and browser client configurations
│       └── schemas.ts         # Central Zod validation schemas
├── supabase/
│   └── migrations/            # SQL migration scripts & RLS policies
└── tests/
    └── unit/                  # Vitest unit test suites
```

---

## 🤝 Ethical Commitments & Pre-Launch Gates

Svasthi is built as a humane, dependable product with high architectural care. The following verification gates are maintained:

- [x] **Client-Side Audio Safety**: Audio buffers are processed entirely in-memory and discarded without cloud transmission.
- [x] **RLS Data Isolation**: Programmatically verified that Row Level Security strictly prevents cross-user access.
- [x] **Accessible Reduced Motion**: Calming exercises support 100% text-only operation for reduced-motion preferences.
- [x] **Safe Resonant Breathing**: Pacing is locked to 4s in / 6s out (0.1 Hz) with zero breath-holding to prevent hyperventilation distress.
- [ ] **Human Security Audit**: Independent review of Supabase RLS and session cookie security before general public use.
- [ ] **Clinical Safety Review**: Multi-lingual clinical evaluation of crisis language patterns and onward support copy by qualified mental health professionals.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.

<p align="center">
  <sub>Built with care, calm, and integrity. Dedicated to supporting personal self-awareness and humane technology.</sub>
</p>
