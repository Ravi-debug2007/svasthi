import Link from "next/link";

/**
 * Support page — a real page, not a placeholder. Human support is never
 * hidden (project-overview.md principle 3): this page has no dependency on
 * any AI feature, auth state, or data store.
 */
export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-3xl border border-rose-200 bg-support-soft p-8">
        <h1 className="text-2xl font-semibold text-support">If you need support now</h1>
        <p className="mt-3 text-sm leading-6 text-support">
          If you are thinking about harming yourself, or you feel you cannot stay safe, please
          contact Tele-MANAS at{" "}
          <a href="tel:14416" className="font-semibold text-support underline">
            14416
          </a>{" "}
          (available 24/7, across India). Calling is always your choice — Svasthi never places a
          call automatically.
        </p>
        <p className="mt-3 text-sm leading-6 text-support">
          If you are in immediate physical danger, contact your local emergency service.
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold">Counselling and listening support</h2>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          These are for talking things through when you want support but are not in immediate
          danger. A crisis line and therapy are different things — both are valid.
        </p>
        <p className="mt-4 text-sm leading-6 text-ink-muted">
          The curated resource directory (verified links to real services, with an honest
          distinction between crisis support and booking therapy) is a separate feature on the
          build plan and is not built yet. Until then, Tele-MANAS at 14416 is the safest starting
          point — it is free, government-run, and available around the clock.
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold">About this app&apos;s limits</h2>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          Svasthi is a wellness tool, not a clinician. It does not diagnose anything, and its
          word-based detection of distress is limited — it can miss things and it can misread
          things. What it will never do is hide this page from you.
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
