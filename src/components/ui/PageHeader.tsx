import { ReactNode } from "react";

/**
 * PageHeader — consistent page heading + supporting text (ui-registry.md).
 * Static layout only; per-page content arrives via props.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional row of action links/buttons rendered under the description. */
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      )}
      <h1
        className={`text-3xl font-semibold leading-tight tracking-tight sm:text-4xl ${
          eyebrow ? "mt-3" : ""
        }`}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-base leading-7 text-ink-muted">{description}</p>
      )}
      {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
