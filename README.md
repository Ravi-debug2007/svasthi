# Svasthi

**Svasthi** is a calm, privacy-minded mental-wellness companion for daily check-ins, written reflections, and supportive conversations with Dawn. It is a hackathon-ready Next.js app with a dependable demo mode and an optional Gemini-powered insight layer.

> Svasthi supports reflection and self-awareness. It does not diagnose, treat, or replace professional or emergency care.

## What you can do

- Record mood, stress, energy, sleep, and context in a quick daily check-in.
- Write a private reflection and receive a gentle, actionable insight.
- View seven-day mood, stress, and sleep trends.
- Talk with **Dawn**, a concise, compassionate wellness companion.
- Route crisis-language signals to immediate Tele-MANAS guidance at **14416**.

## Built with

- Next.js 14, React 18, TypeScript, and Tailwind CSS
- Gemini (`@google/genai`) for optional live insight and chat wording
- Zod for request validation
- An in-memory demo store—no database setup required

## Run it locally

### Prerequisites

- Node.js 18.17 or later
- npm

### Setup

```bash
git clone https://github.com/Ravi-debug2007/svasthi.git
cd svasthi
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`DEMO_MODE=true` is the default and is the recommended setting for local demos: insights and chat use deterministic fallbacks, so the app works without an API key.

## Optional: enable Gemini

To use Gemini for insight wording and Dawn chat responses, update `.env.local`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
DEMO_MODE=false
```

Keep `GEMINI_API_KEY` server-side. Never expose it through a `NEXT_PUBLIC_` variable or commit it to the repository.

Check the active runtime configuration at [`/api/health`](http://localhost:3000/api/health).

## API at a glance

| Route | Purpose |
| --- | --- |
| `POST /api/check-ins` | Save a daily wellbeing check-in |
| `POST /api/journals` | Save a consented text reflection and lightweight voice metadata |
| `POST /api/insights` | Generate a supportive insight from a check-in and reflection |
| `GET /api/dashboard` | Retrieve weekly trends and the latest session data |
| `POST /api/chat` | Send a message to Dawn |
| `GET /api/health` | Confirm demo mode and model configuration |

For request bodies and response shapes, read the [API contract](docs/api-contract.md).

## Privacy and safety notes

- Raw audio is not retained. The MVP accepts a consented transcript plus optional lightweight browser-computed audio features.
- Data is held in memory for the demo session; it is not production persistence.
- Wellness insights are supportive signals, not medical advice.
- Crisis phrases bypass Gemini and surface immediate Tele-MANAS support guidance at **14416**. If someone may be in immediate danger, contact local emergency services now.

## Deploying

Deploy to Vercel (or any Next.js-compatible host) and set environment variables there. For judging or a reliable product walkthrough, use `DEMO_MODE=true`. For a live Gemini experience, configure a server-side `GEMINI_API_KEY` and set `DEMO_MODE=false`.

## Project structure

```text
src/app/               App UI and API routes
src/lib/ai/            Gemini integration and deterministic fallbacks
src/lib/safety/        Crisis-language detection
src/lib/demo-store.ts  In-memory session data for demos
docs/api-contract.md   Endpoint reference
```

## Status

This is an MVP/demo application. Before production use, add authentication, encrypted durable storage, consent controls, observability, and a clinically reviewed safety workflow.
