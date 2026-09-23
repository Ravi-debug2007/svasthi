import { ReactNode } from "react";

/**
 * EmptyState — explanation + one clear useful action (ui-registry.md).
 * Copy direction comes from ui-rules.md's state design table, e.g.
 * "Your trends will appear as you check in." — meaningful, never blank.
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  /** Single clear action; use the exported NavLinkAction for links. */
  action?: ReactNode;
  /** Optional decorative-but-hidden glyph (e.g. an emoji). */
  icon?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-sage-300 bg-white p-8 text-center">
      {icon && (
        <span aria-hidden="true" className="block text-3xl">
          {icon}
        </span>
      )}
      <h3 className="mt-2 text-lg font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
