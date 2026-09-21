"use client";

import { ReactNode } from "react";
import { JourneyProvider, useJourney } from "@/components/providers/JourneyProvider";
import { RequireAuth } from "@/components/auth/AuthPanel";

/**
 * AppShell wraps every page. It provides the journey context and — for F01 —
 * gates the app behind a real signed-in session. There is intentionally no
 * "continue without an account" path: no user, no data, period.
 */

const NAV = [
  { href: "/", label: "Home" },
  { href: "/check-in", label: "Check-in" },
  { href: "/journal", label: "Journal" },
  { href: "/dawn", label: "Dawn" },
  { href: "/dashboard", label: "Trends" },
] as const;

function Shell({ children }: { children: ReactNode }) {
  const { state, signOut } = useJourney();

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="border-b border-stone-200 bg-white/90">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-semibold tracking-tight">Svasthi</span>
            <span className="hidden text-sm text-ink-muted sm:inline">
              A gentler way to check in
            </span>
          </div>
          {state.status === "signed-in" && (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-[16rem] truncate text-sm text-ink-muted sm:inline">
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
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <nav aria-label="Primary" className="flex flex-wrap gap-2">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="min-h-[44px] rounded-full px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="/support"
            className="inline-flex min-h-[44px] items-center rounded-full border border-rose-200 bg-support-soft px-4 py-2.5 text-sm font-semibold text-support transition-colors hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Get support
          </a>
        </div>
      </footer>
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
