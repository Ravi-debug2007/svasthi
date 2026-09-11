# Svasthi API contract

All requests are same-origin JSON. The frontend may send an anonymous `x-svasthi-session` header to keep a demo journey together. Omit it to use `demo-session`.

## POST /api/check-ins

```json
{"mood":3,"stress":7,"energy":3,"sleepHours":6.1,"contexts":["Work","Sleep"]}
```

Returns `{ "checkIn": { "id": "...", "createdAt": "...", ... } }`.

## POST /api/journals

The browser computes voice features. Do not upload raw audio in this MVP.

```json
{"transcript":"I have a lot on my plate and could not sleep.","features":{"durationSeconds":24,"pauseRatio":0.38,"speakingRateWpm":142,"rmsDb":-23},"consent":true}
```

Returns `{ "journal": { "id": "...", ... } }`.

## POST /api/insights

Use the IDs returned by the previous calls, with the same `x-svasthi-session` header.

```json
{"checkInId":"uuid","journalId":"uuid"}
```

Returns `{ "insight": { "level":"steady|watch|support", "title":"...", "evidence":["..."], "suggestion":"...", "crisis":false, "disclaimer":"...", "source":"gemini|fallback" } }`.

If the journal contains a crisis phrase, the response returns `crisis: true` and `phone: "14416"` without calling Gemini.

## GET /api/dashboard

Returns seeded seven-day trends plus the current session's most recent check-in and insight.

## POST /api/chat

```json
{"message":"I feel overwhelmed today."}
```

Returns `{ "reply": "...", "crisis": false }`. The response includes `phone: "14416"` for a crisis signal.

## GET /api/health

Returns `{ "ok": true, "demoMode": true, "modelConfigured": false }`. It never exposes secrets.
