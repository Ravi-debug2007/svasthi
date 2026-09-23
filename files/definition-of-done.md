# Svasthi — Definition of Done (Before Real Users)

This is the release-quality bar, not a "looks done" bar. Use it as a final
gate before anyone other than you uses the app, and revisit it after any
significant change.

## Release checklist

| Area | Requirement |
|---|---|
| Product experience | End-to-end journey (check-in → journal → insight → support) works without a developer console open |
| Responsiveness | Tested at 360px, 390px, tablet, and desktop widths |
| Accessibility | Keyboard nav, labels, focus states, contrast, and reduced motion all checked |
| Consistency | Shared design tokens used throughout; no leftover starter branding or wrong product name anywhere |
| Voice capture | Record/stop/playback and cleanup all work on a real device |
| Voice credibility | Measurements are real, and limitations are stated in the UI, not just in this doc |
| Insights | Evidence-based, schema-validated, disclaimer always present |
| Crisis visibility | Support access available on every screen, not just some |
| Crisis behavior | Journal, chat, and insight paths all tested against the crisis detector |
| Consent | Every processing/upload path requires explicit consent |
| Demo reliability | Provider timeout and microphone-denial paths both handled gracefully |
| State continuity | No dependency on in-memory/serverless process state (Supabase confirmed working) |
| Dashboard integrity | Sample data labeled; streak derived from real entries |
| Resource credibility | Every listed destination actually checked, not assumed |
| Performance | Production build tested, not just dev mode |
| Security | No client-exposed secrets; RLS verified per `verification-guide.md`; request payload limits in place |
| Documentation | README and context files match what's actually implemented, not aspirational features |

## Risk list, ranked (fix top-down before real users)

| Priority | Risk | Why it matters |
|---|---|---|
| P0 | No real auth/persistence | Privacy and reliability risk — fix via F01 |
| P0 | Hidden or absent crisis access | Incomplete support story |
| P0 | Unlabeled synthetic/sample data | Damages trust the moment someone notices |
| P0 | Unsupported voice-to-health claims anywhere in copy | Scientifically and ethically weak, actively harmful if believed |
| P0 | RLS not actually verified (only assumed working) | Silent data-exposure risk |
| P1 | Wrong product name anywhere in safety copy | Signals rushed, unreviewed work |
| P1 | AI requests without an explicit timeout | Can hang the app for a real user |
| P1 | No mobile/keyboard verification done | Product feels unfinished, excludes users |
| P1 | Fake streak or an unexplained score | Misrepresents the user's own data back to them |
| P1 | Generic, repetitive Dawn replies | Weak emotional connection, undermines the product's purpose |
| P2 | Excessive animation/glass effects | Distraction and performance cost, low priority to fix |
| P2 | Too many disconnected or half-built screens | Dilutes the core journey — better to finish fewer things well |

## The two gates that need someone other than you

Repeated from `build-plan.md` because they matter enough to say twice:

1. **RLS / access-control review** — confirm, with a second person if
   possible, that the two-account test in `verification-guide.md`
   Category 3 actually passes.
2. **Crisis-detection and safety-copy review** — get someone with relevant
   mental-health or crisis-response knowledge to look at
   `src/lib/safety/crisis.ts`'s patterns and the actual wording shown to a
   distressed user, before real people rely on it.

Nothing else on this list requires outside judgment — everything else you
can verify yourself with `verification-guide.md`.
