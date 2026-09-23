import { ReactNode } from "react";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Provenance } from "@/lib/demo/provenance";

/**
 * Metric + label + provenance badge + optional explanation
 * (ui-registry.md). The badge is not optional decoration — every number
 * shown to the user must say where it came from (code-standards.md).
 */
export function StatCard({
  label,
  value,
  badge,
  explanation,
  className,
}: {
  label: string;
  value: ReactNode;
  badge: Provenance;
  explanation?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6 ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-ink-muted">{label}</p>
        <SourceBadge kind={badge} />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {explanation && (
        <p className="mt-1.5 text-xs leading-5 text-ink-muted">{explanation}</p>
      )}
    </div>
  );
}
