import { provenanceBadge, Provenance } from "@/lib/demo/provenance";

/**
 * Labels content as Self-reported / Measured / Sample / AI wording
 * (ui-registry.md, code-standards.md data-honesty rules).
 */
export function SourceBadge({ kind, className }: { kind: Provenance; className?: string }) {
  const badge = provenanceBadge(kind);
  return (
    <span
      title={badge.title}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.className} ${className ?? ""}`}
    >
      {badge.label}
    </span>
  );
}
