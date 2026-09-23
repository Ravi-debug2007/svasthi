import Link from "next/link";
import { CrisisPanel } from "@/components/safety/CrisisPanel";

/**
 * /support (F08 finish). Human support is never hidden and never gated: this
 * page has no dependency on any AI feature, auth state, or data store.
 * Emergency guidance and counselling support are clearly distinguished, and
 * the app's detection limits are stated here in plain language — not hidden
 * in a README.
 */
export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <CrisisPanel />

      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold">Not in immediate danger, but want to talk?</h2>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          A crisis line and therapy are different things — both are valid. Tele-MANAS at{" "}
          <a href="tel:14416" className="font-semibold text-support underline">
            14416
          </a>{" "}
          offers free counselling support in multiple Indian languages, around the clock, even when
          nothing is an emergency.
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          Talking to someone you trust — a friend, family member, teacher, or doctor — is also a
          real form of support. You do not have to wait until things are unbearable to reach out.
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          The curated resource directory (verified links to real services, with an honest
          distinction between crisis support and booking therapy) is a separate feature on the
          build plan and is not built yet. Until then, Tele-MANAS at 14416 is the safest starting
          point — it is free, government-run, and available around the clock.
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold">About this app&apos;s limits</h2>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          Svasthi is a wellness tool, not a clinician. It does not diagnose anything. Its
          word-based check for distress language is deliberately simple: it can miss things
          (indirect, veiled, or mixed-language expressions especially) and it can misread things
          (song lyrics, fiction, or jokes may trigger it). Either way, the mistake is on the side
          of offering support — seeing this panel does not mean anything is wrong with you.
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          What it will never do is hide this page from you. Support stays reachable from every
          screen, regardless of what the app detected or failed to detect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-[44px] items-center rounded-full border border-stone-300 px-5 text-sm font-semibold hover:bg-stone-100"
        >
          ← Back home
        </Link>
      </section>
    </div>
  );
}
