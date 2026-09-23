/**
 * Navigation model (ui-rules.md): exactly four primary destinations.
 * "Get support" (→ /support) is persistent everywhere but is deliberately
 * NOT a primary destination — it lives in the SupportBanner, the mobile
 * bottom bar, and the footer.
 *
 * Contextual links (not in nav): Home → /check-in, Insight card → /exercises,
 * Support page → /resources.
 */
export const PRIMARY_NAV = [
  { href: "/", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/dawn", label: "Dawn" },
  { href: "/dashboard", label: "Trends" },
] as const;

/** Home matches exactly; sections match themselves and nested paths only. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
