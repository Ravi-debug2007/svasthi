import { SourceBadge } from "@/components/ui/SourceBadge";

/**
 * EvidenceList (F05, ui-registry scope). Every claim the insight makes,
 * traced back to the user's actual check-in/journal input. This is the
 * data-honesty contract made visible: if a claim can't point at evidence,
 * it doesn't belong in the insight.
 */
export function EvidenceList({ evidence }: { evidence: string[] }) {
  if (evidence.length === 0) return null;
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        Why you&apos;re seeing this
        <SourceBadge kind="self-reported" />
      </p>
      <ul className="mt-2 space-y-1.5">
        {evidence.map((item, index) => (
          <li key={index} className="flex gap-2 text-sm leading-6 text-ink-muted">
            <span aria-hidden="true" className="text-sage-600">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
