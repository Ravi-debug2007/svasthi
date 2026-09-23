"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, PRIMARY_NAV } from "@/lib/nav";

/**
 * MobileNav — bottom navigation for small screens (F00). The four primary
 * destinations from ui-rules.md, plus "Get support", which is persistent
 * everywhere and visually distinguished. Desktop uses the header nav in
 * AppShell; this bar is hidden from `sm` upwards.
 *
 * Accessibility: real links (not buttons), aria-current on the active
 * destination, 44px+ touch targets, and safe-area padding for notched phones.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="grid grid-cols-5">
        {PRIMARY_NAV.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 pt-1.5 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-focus ${
                  active ? "text-primary" : "text-ink-muted"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1 w-6 rounded-full ${active ? "bg-primary" : "bg-transparent"}`}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href="/support"
            className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 pt-1.5 text-xs font-semibold text-support focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-focus"
          >
            <span aria-hidden="true" className="h-1 w-6 rounded-full bg-transparent" />
            Support
          </Link>
        </li>
      </ul>
    </nav>
  );
}
