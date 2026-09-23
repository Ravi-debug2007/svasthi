import { ReactNode } from "react";

/**
 * ErrorState — plain-language failure message + retry (ui-registry.md).
 * Per ui-rules.md state design ("save failure"): preserve whatever the user
 * entered or did, and offer a concrete retry — never a dead end.
 */
export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description: string;
  /** Usually a retry button — must be a real, working control. */
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="rounded-3xl border border-rose-200 bg-support-soft p-6"
    >
      <h3 className="text-lg font-semibold text-support">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-support">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
