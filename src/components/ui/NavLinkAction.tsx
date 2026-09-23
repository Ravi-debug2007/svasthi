import Link from "next/link";
import { AnchorHTMLAttributes, ReactNode } from "react";

type NavLinkActionProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

/**
 * NavLinkAction — a next/link styled like the secondary button. Used for
 * EmptyState/ErrorState actions and contextual CTAs so every link target
 * keeps the 44px minimum touch target and the visible focus ring.
 */
export function NavLinkAction({ href, children, className, ...rest }: NavLinkActionProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[44px] items-center rounded-full border border-stone-300 bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
        className ?? ""
      }`}
      {...rest}
    >
      {children}
    </Link>
  );
}
