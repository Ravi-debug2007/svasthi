import Link from "next/link";

/**
 * SupportBanner — persistent access to human support on every page
 * (ui-registry.md; project-overview.md principle 3). Built now, in F00, so
 * no feature is ever built without support access already on screen
 * (build-plan.md F08 banner step).
 *
 * Safety rules honoured here:
 * - Solid background — never translucent — so urgent support text stays fully
 *   readable (ui-rules.md glassmorphism limits).
 * - Tele-MANAS 14416 via a user-initiated `tel:` link only. Svasthi never
 *   places a call automatically.
 * - Not dismissible: human support is never hidden.
 */
export function SupportBanner() {
  return (
    <div className="border-b border-rose-200 bg-support-soft">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 text-sm leading-6 text-support sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
        <p>
          Need a person right now? Tele-MANAS is free, 24/7:{" "}
          <a
            href="tel:14416"
            className="inline-flex min-h-[44px] items-center font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            call 14416
          </a>{" "}
          — calling is always your choice.
        </p>
        <Link
          href="/support"
          className="inline-flex min-h-[44px] items-center rounded-full border border-support px-4 font-semibold text-support transition-colors hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Get support
        </Link>
      </div>
    </div>
  );
}
