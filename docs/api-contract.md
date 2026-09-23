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

- `weekly` contains only days that actually have a check-in (no seeded filler).
- `streakDays` is derived from the user's real distinct check-in dates.
- `wellnessScore` is an illustrative self-report index (`100 − avg(stress)×7`,
  clamped to 0), never a medical measure; `null` when there is no data.
- `latestInsight` is always `null` from this endpoint in F01; the client shows
  the insight it received from `POST /api/insights`.

Any sample/demo history shown in the UI comes from client-side fixtures,
visibly badged, and is never served from this endpoint or stored in the
database.

## POST /api/chat

```json
{"message":"I feel overwhelmed today."}
```

Returns `{ "reply": "...", "crisis": false, "source": "gemini|fallback" }`.

- Requires a signed-in session; both sides of the conversation are stored in
  `chat_messages` under your user id.
- The last six stored messages are sent to the model as bounded history.
- On a crisis signal the reply is the fixed support message, `crisis: true`,
  `phone: "14416"` — this happens before any model call, so it works even
  when Gemini is down or `DEMO_MODE=true`.
- User-supplied text is passed as data, never as instructions that override
  the system prompt.

## GET /api/health

Returns `{ "ok": true, "demoMode": true, "modelConfigured": true, "supabaseConfigured": true }`.
It never exposes secrets.
