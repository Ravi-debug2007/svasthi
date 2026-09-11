# Svasthi

Svasthi is a demo-ready mental-wellness backend for a Stitch-generated Next.js interface. It supports daily check-ins, consented voice-journal metadata, Dawn chat, supportive insights, dashboard trends, and an immediate 14416 crisis path.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Keep `DEMO_MODE=true` for a reliable offline demo, or set `GEMINI_API_KEY` and a verified `GEMINI_MODEL` for live insight wording.
3. Run `npm run dev`.

## Safety and privacy

- The MVP does not retain raw audio. The browser sends a consented transcript and lightweight Web Audio feature summary.
- Insights are wellness signals, not diagnoses or medical advice.
- Crisis phrases bypass Gemini and return immediate Tele-MANAS support guidance at 14416.
- The demo store is in-memory. Add authenticated, encrypted persistence only after the hackathon.

## Frontend integration

See [the API contract](docs/api-contract.md). Stitch should call the endpoints with a stable `x-svasthi-session` value per browser session.

## Deploy

Import this project into Vercel and set `DEMO_MODE=true` for judging. Do not expose `GEMINI_API_KEY` through `NEXT_PUBLIC_` variables.
