"use client";

import { ButtonHTMLAttributes } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  busyLabel?: string;
};

/** Primary action button with loading/disabled states (ui-registry.md). */
export function PrimaryButton({ busy, busyLabel, disabled, className, children, ...rest }: PrimaryButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 ${
        className ?? ""
      }`}
    >
      {busy ? (busyLabel ?? "Working…") : children}
    </button>
  );
}
