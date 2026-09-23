"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { JourneyProvider, useJourney } from "@/components/providers/JourneyProvider";
import { RequireAuth } from "@/components/auth/AuthPanel";
import { SupportBanner } from "@/components/safety/SupportBanner";
import { MobileNav } from "@/components/layout/MobileNav";
import { isActivePath, PRIMARY_NAV } from "@/lib/nav";

/**
 * AppShell wraps every page. F00 product shell:
 * - Header with the four primary destinations (ui-rules.md) and active state.
 * - SupportBanner on every page — human support is never hidden, and it is
 *   not dependent on auth or any AI feature.
 * - MobileNav bottom bar on small screens; skip link for keyboard users.
 * - For F01, the app is gated behind a real signed-in session: no user, no
 *   data, period.
 */
function Shell({ children }: { children: ReactNode }) {
  const { state, signOut } = useJourney();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        Skip to content
      </a>

      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Link
            href="/"
            className="flex items-baseline gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <span className="text-lg font-semibold tracking-tight">Svasthi</span>
            <span className="hidden text-sm text-ink-muted sm:inline">
              A gentler way to check in
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
            {PRIMARY_NAV.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-ink-muted hover:bg-stone-100 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {state.status === "signed-in" && (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="max-w-[16rem] truncate text-sm text-ink-muted">
                {state.email}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="min-h-[44px] rounded-full border border-stone-300 px-4 text-sm font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Log out
              </button>
            </div>
          )}
        </div>

        {/* Signed-in identity + logout on small screens (desktop shows them in the header row). */}
        {state.status === "signed-in" && (
          <div className="flex items-center justify-between gap-3 border-t border-stone-100 px-4 py-2 sm:hidden">
            <span className="truncate text-sm text-ink-muted">{state.email}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="min-h-[44px] rounded-full border border-stone-300 px-4 text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Log out
            </button>
          </div>
        )}
      </header>

      <SupportBanner />

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-28 sm:px-8 sm:pb-8"
      >
        {children}
      </main>

      <footer className="hidden border-t border-stone-200 bg-white sm:block">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-8 py-6">
          <p className="text-sm text-ink-muted">
            Svasthi is a wellness companion, not a clinician or an emergency service.
          </p>
          <Link
            href="/support"
            className="min-h-[44px] text-sm font-semibold text-support underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Get support
          </Link>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <JourneyProvider>
      <Shell>
        <RequireAuth>{children}</RequireAuth>
      </Shell>
    </JourneyProvider>
  );
}
