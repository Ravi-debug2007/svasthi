# Svasthi — Dashboard Content & Scoring Spec

## Dashboard content

| Element | Display | Source | Guardrail |
|---|---|---|---|
| Mood trend | Daily values, 1–5 scale | Self-report / sample fixture | Never imply continuous measurement |
| Stress trend | Daily values, 0–10 scale | Self-report / sample fixture | Label "Reported stress" |
| Sleep trend | Hours per day | User-entered / sample fixture | No wearable-device claim |
| Streak | Distinct consecutive check-in days | Actual entries only | Never count sample/fixture days as earned |
| Wellness score | Optional illustrative self-report index | Transparent calculation | Not a medical or validated measure |
| Latest insight | Evidence + one next step | Current active journey | Always show its source |
| Voice signals | Latest recording only | Browser measurements | Keep visually separate from the stress chart |
| Support card | Persistent route to help | Curated content | Never hidden behind a score |

## Mock-data policy

| Mode | Behavior |
|---|---|
| Demo mode | Show six fictional prior days with a persistent badge |
| Today in demo | The actual current interaction, marked as a current demo entry |
| Real, empty session | Show empty states, not fabricated personal history |
| Reset | Restores the exact fictional scenario, nothing more |
| Screenshot/video | Keep sample labels visible — don't crop them out |

## Illustrative wellness score (optional — only build if it survives your own testing)

Prefer the subtitle **"Self-report index"** with a visible explanation of
how it's calculated, shown to the user, not hidden in a tooltip.

If included, the formula is:

```
Score = 100 × [ 0.5 × (m − 1) / 4  +  0.3 × (1 − s / 10)  +  0.2 × (e / 10) ]
```

Where `m` = mood (1–5), `s` = reported stress (0–10), `e` = reported energy
(0–10).

| Rule | Requirement |
|---|---|
| Validation | Only calculate when all required values exist |
| Meaning | Explicitly an illustrative UI summary, say so in the UI |
| Clinical use | Never determine crisis routing or diagnosis from it |
| Colors | Avoid red/green moral judgment of the user's state |
| Sleep | Show separately — don't fold it into a universal "optimal sleep" assumption |
| Acoustics | Never included in the score |
| Missing data | Show "Not enough information" rather than a fake number |
| Formula change | Update this doc and any related tests if you change it |

**If the score creates confusion when you test it on yourself, cut it and
keep the three direct measures (mood/stress/sleep) instead.** It's the
first thing on the "cut if needed" list in `ui-rules.md` for a reason.

## Future upgrades (not in scope now — noted so nobody re-derives them from scratch later)

| Upgrade | Prerequisite |
|---|---|
| Real longitudinal trends | Already covered by Supabase persistence (F01) |
| Personal comparisons | Sufficient real observations + explicit baseline rules |
| Pattern summaries | Minimum-data checks + careful uncertainty language |
| Sleep-device import | Verified integration and consent |
| Professional export | User-controlled selection and sharing |
| Clinically meaningful measures | Appropriate validated instruments and professional review |
