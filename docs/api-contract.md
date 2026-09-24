# Svasthi API contract

All requests are same-origin JSON. **Authentication changed in F01:** every
endpoint requires a signed-in Supabase session (cookie-based). The old
`x-svasthi-session` header no longer exists, and there is no anonymous or
shared fallback session — requests without a valid session receive
`401 { "error": { "message": "Please sign in to continue." } }`.

Row ownership is enforced by Postgres Row Level Security (`user_id = auth.uid()`),
in addition to application-level checks.

## POST /api/check-ins

```json
{"mood":3,"stress":7,"energy":3,"sleepHours":6.1,"contexts":["Work","Sleep"]}
```

Returns `201 { "checkIn": { "id": "...", "createdAt": "...", "mood": 3, "stress": 7, "energy": 3, "sleepHours": 6.1, "contexts": ["Work","Sleep"] } }`.

## GET /api/check-ins

Returns `{ "checkIns": [ ...same shape, newest first, limit 90 ] }` for the signed-in user only.

## POST /api/journals

The browser computes voice features. Do not upload raw audio in this MVP.

**Changed in F03:** `features` is now **optional**. A typed reflection (no
recording) is saved without any `voice_features` row — no measurement is
invented for it. When `features` is present, the values must be real local
measurements of the user's actual audio.

```json
{"transcript":"I have a lot on my plate and could not sleep.","features":{"durationSeconds":24,"pauseRatio":0.38,"speakingRateWpm":142,"rmsDb":-23},"consent":true}
```

Typed entries omit `features` entirely:

```json
{"transcript":"Just writing this down before bed.","consent":true}
```

Returns `201 { "journal": { "id": "...", "createdAt": "...", "transcript": "...", "features": { ... } }, "crisisSignal": false }`.

`features` is absent in the response for typed entries. `crisisSignal` is
`true` when the transcript matched the crisis-language detector, so the
client can offer support immediately.

## GET /api/journals

Returns `{ "journals": [ ...same journal shape, newest first, limit 90 ] }
for the signed-in user only. Entries with a recording include `features`;
typed entries omit it.

## POST /api/insights

Reference stored rows by id (your own rows only), or pass inline payloads:

```json
{"checkInId":"uuid","journalId":"uuid"}
```

Inline payloads use the same shapes as the check-in/journal endpoints; an
inline `journal` **must** include `consent: true` — AI processing never runs
on a reflection without explicit consent.

Returns `{ "insight": { "id": "...", "createdAt": "...", "level":"steady|watch|support", "title":"...", "evidence":["..."], "suggestion":"...", "referralRecommended": false, "crisis":false, "disclaimer":"...", "source":"gemini|fallback" } }`.

The insight row is stored in Supabase. If the journal contains a crisis
phrase, the response returns `crisis: true` and `phone: "14416"` without
calling Gemini — the crisis check runs before any model call.

## GET /api/dashboard

Returns the signed-in user's **real** data only:

```json
{
  "weekly": [{ "date": "2026-09-21", "mood": 3, "stress": 6, "sleepHours": 6.1 }],
  "currentCheckIn": { ... } ,
  "latestInsight": null,
  "stats": { "streakDays": 2, "avgSleepHours": 6.4, "wellnessScore": 58 }
}
```

**Changed in F07** (computation moved to `src/lib/dashboard/metrics.ts`, one
consistent local-date policy with an injectable clock):

- `weekly` contains only days **inside the last seven local days** (today +
  6 prior) that actually have a check-in — no seeded filler, no fallback to
  out-of-window entries. Oldest first. Missing days are honest gaps; the UI
  never interpolates them.
- `streakDays` is derived from the user's real distinct check-in dates,
  counting consecutive days ending today or yesterday. Sample/fixture data
  never counts (it is never sent from this endpoint at all).
- `avgSleepHours` averages only the days present in the window and is `null`
  (not `0`) when the window is empty.
- `wellnessScore` is the illustrative self-report index from
  `dashboard-and-scoring.md`, computed from the **newest check-in**:
  `100 × (0.5 × (mood−1)/4 + 0.3 × (1 − stress/10) + 0.2 × energy/10)`,
  rounded and clamped to 0–100. Sleep and voice acoustics are not inputs.
  It is never a medical measure and never drives crisis routing; `null` when
  there is no check-in or values are out of range (the UI then says "Not
  enough information").
- `latestInsight` is always `null` from this endpoint; the client shows the
  insight it received from `POST /api/insights`.

Any sample/demo history shown in the UI comes from client-side fixtures
(`src/lib/demo/fixtures.ts`), is toggle-gated and visibly badged, and is
never served from this endpoint or stored in the database. Where a sample
date collides with a real entry, the UI drops the sample day — real entries
are always authoritative.

## POST /api/chat

```json
{"message":"I feel overwhelmed today."}
```

**Changed in F06:** replies now include a `hint` and the system prompt is the
full verbatim Dawn prompt from `dawn-and-insight-prompts.md`.

Returns `{ "reply": "...", "hint": { "kind": "support", "label": "Ways to reach support", "href": "/support" }, "crisis": false, "source": "gemini|fallback" }`.

- `hint` is `null` for Gemini replies and most fallbacks; when present it
  points only at `/exercises` or `/support` (low-pressure onward actions).
- Requires a signed-in session; both sides of the conversation are stored in
  `chat_messages` under your user id.
- The last six stored messages are sent to the model as bounded history.
- Fallback replies are deterministic, contextual variants — never generic
  filler — and are labelled "no AI used" in the UI.
- On a crisis signal the reply is the fixed support message, `crisis: true`,
  `phone: "14416"` — this happens before any model call, so it works even
  when Gemini is down or `DEMO_MODE=true`.
- User-supplied text is passed as data, never as instructions that override
  the system prompt.

## GET /api/chat

**Added in F06.** Returns `{ "messages": [ { "id": "...", "role": "user|assistant", "content": "...", "createdAt": "..." } ] }` — the signed-in user's most recent 20 conversation rows, oldest first, so `/dawn` can restore the conversation after a refresh. Own rows only (RLS + application check).

## GET /api/health

Returns `{ "ok": true, "demoMode": true, "modelConfigured": true, "supabaseConfigured": true }`.
It never exposes secrets.
