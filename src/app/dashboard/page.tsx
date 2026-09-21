import Link from "next/link";

export default function DashboardPlaceholder() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Trends</h1>
      <p className="mt-3 leading-7 text-ink-muted">
        The full trends dashboard is on the build plan and is not built yet. Your week at a glance
        already appears on the home page.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-[44px] items-center rounded-full border border-stone-300 px-5 text-sm font-semibold hover:bg-stone-100"
      >
        ← Back home
      </Link>
    </div>
  );
}
