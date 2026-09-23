import Link from "next/link";
import { crisisMessage } from "@/lib/safety/crisis";

/**
 * CrisisPanel (F08, ui-registry scope). The one calm, prominent component
 * used everywhere a crisis signal surfaces (journal save, Dawn chat, insight,
 * /support page).
 *
 * Safety rules honoured here (ui-rules.md crisis-signal state, code-standards.md
 * safety-critical rules):
 * - Calm, prominent, solid backgrounds — no celebratory animation, no
 *   dismissive tone, no translucency on urgent support text.
 * - Immediate danger is distinguished from counselling support, and both
 *   paths are user-initiated (`tel:` links only — Svasthi never auto-calls).
 * - No claim of monitoring or comprehensiveness: the detector's limits are
 *   stated in the copy itself, not hidden.
 * - Dismissal only hides the panel for this visit-state, not support itself —
 *   the SupportBanner and /support page remain reachable everywhere.
 * - No dependency on AI, auth state, or data stores — it renders anywhere.
 */
export function CrisisPanel({ onClose }: { onClose?: () => void }) {
  return (
    <section
      role="alert"
      aria-label="Immediate support"
      className="rounded-3xl border border-rose-200 bg-support-soft p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-support">{crisisMessage.title}</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-full border border-support/40 px-4 text-sm font-semibold text-support hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Close
          </button>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-support">
        Some of what you shared suggests things might be heavy right now. You deserve support from
        a person, not just an app.
      </p>

      {/* Immediate danger vs counselling support — clearly separated (F08). */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-rose-300 bg-white/80 p-4">
          <h3 className="text-sm font-semibold text-support">If you might act now</h3>
          <p className="mt-1.5 text-sm leading-6 text-support">
            Contact your local emergency service or go to the nearest emergency department. This is
            the fastest route when there is immediate danger.
          </p>
        </div>
        <div className="rounded-2xl border border-rose-300 bg-white/80 p-4">
          <h3 className="text-sm font-semibold text-support">Free, 24/7 counselling support</h3>
          <p className="mt-1.5 text-sm leading-6 text-support">
            Tele-MANAS:{" "}
            <a
              href="tel:14416"
              className="inline-flex min-h-[44px] items-center font-semibold underline"
            >
              call 14416
            </a>{" "}
            — across India, any hour. Reaching out is always your choice; nothing is dialed
            automatically.
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-support">
        You can also{" "}
        <Link href="/support" className="font-semibold underline">
          see every way to reach support
        </Link>
        , including talking to someone you trust.
      </p>

      <p className="mt-3 text-xs leading-5 text-support/90">{crisisMessage.disclaimer}</p>
    </section>
  );
}
