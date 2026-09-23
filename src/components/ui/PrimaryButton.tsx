"use client";

import Link from "next/link";
import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const PRIMARY_CLASSES =
  "inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60";

const SECONDARY_CLASSES =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-stone-300 bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses = {
  primary: PRIMARY_CLASSES,
  secondary: SECONDARY_CLASSES,
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  busyLabel?: string;
  /** "secondary" keeps the same geometry with the muted surface style. */
  variant?: keyof typeof variantClasses;
};

/**
 * PrimaryButton — primary action with loading/disabled states
 * (ui-registry.md). The `variant` prop lets ConsentPanel, AuthPanel, and
 * future forms share one implementation instead of hand-rolled copies.
 */
export function PrimaryButton({
  busy,
  busyLabel,
  disabled,
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`${variantClasses[variant]} ${className ?? ""}`}
    >
      {busy ? (busyLabel ?? "Working…") : children}
    </button>
  );
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: keyof typeof variantClasses;
  children: ReactNode;
};

/** Link twin of PrimaryButton for navigation actions (uses next/link). */
export function PrimaryButtonLink({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: LinkProps) {
  return (
    <Link href={href} className={`${variantClasses[variant]} ${className ?? ""}`} {...rest}>
      {children}
    </Link>
  );
}
