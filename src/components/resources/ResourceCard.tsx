import { Resource } from "@/lib/resources";
import { SourceBadge } from "@/components/ui/SourceBadge";

interface ResourceCardProps {
  resource: Resource;
}

/**
 * ResourceCard (F10, ui-registry scope).
 * Displays a verified mental health service or referral handoff:
 * - Unmistakable distinction between acute crisis services and scheduled counseling.
 * - Factual operational details: hours, cost, languages, and governing body.
 * - Correct external-link semantics (opens in new tab, rel="noopener noreferrer", aria notice).
 * - Honest verification metadata: month/year verified by maintainers.
 * - Sample demo fixture badging via SourceBadge if isSample is true.
 * - Accessible 44px+ interactive touch targets with visible focus rings.
 */
export function ResourceCard({ resource }: ResourceCardProps) {
  const isCrisis = resource.isCrisis;

  return (
    <article
      aria-labelledby={`resource-title-${resource.id}`}
      className={`flex flex-col justify-between rounded-3xl border p-6 shadow-sm transition-shadow sm:p-7 ${
        isCrisis
          ? "border-rose-200 bg-support-soft/40 hover:shadow-md"
          : "border-stone-200 bg-surface hover:shadow-md"
      }`}
    >
      <div>
        {/* Header badges: Category, Crisis distinction, and Sample provenance */}
        <div className="flex flex-wrap items-center gap-2">
          {resource.isSample ? (
            <SourceBadge kind="sample" />
          ) : (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                isCrisis
                  ? "border-rose-300 bg-rose-50 text-support"
                  : "border-sage-300 bg-sage-50 text-sage-800"
              }`}
            >
              {isCrisis ? "24/7 Crisis Intervention" : "Non-emergency Support"}
            </span>
          )}

          <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-xs font-medium text-ink-muted capitalize">
            {resource.category}
          </span>
        </div>

        {/* Title and Operator */}
        <div className="mt-3">
          <h3
            id={`resource-title-${resource.id}`}
            className="text-lg font-semibold text-ink sm:text-xl"
          >
            {resource.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-ink-muted">
            Operated by {resource.operator}
          </p>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm leading-6 text-ink-muted">{resource.description}</p>

        {/* Practical Operational Metadata */}
        <dl className="mt-4 grid grid-cols-1 gap-2.5 border-t border-stone-200/70 pt-4 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-ink">Hours & Availability</dt>
            <dd className="mt-0.5 text-ink-muted">{resource.hours}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Cost Model</dt>
            <dd className="mt-0.5 text-ink-muted">{resource.cost}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-ink">Languages Available</dt>
            <dd className="mt-0.5 leading-5 text-ink-muted">
              {resource.languages.join(", ")}
            </dd>
          </div>
        </dl>
      </div>

      {/* Footer: Verification metadata & Action buttons */}
      <div className="mt-6 border-t border-stone-200/70 pt-4">
        <p className="text-[11px] text-ink-muted">
          Verified by Svasthi maintainers as of {resource.verifiedAsOf}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          {resource.phone && (
            <a
              href={`tel:${resource.phone}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <span className="mr-1.5" aria-hidden="true">
                📞
              </span>
              Call {resource.phoneDisplay ?? resource.phone}
            </a>
          )}

          {resource.email && (
            <a
              href={`mailto:${resource.email}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-stone-300 bg-white px-4 text-xs font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <span className="mr-1.5" aria-hidden="true">
                ✉️
              </span>
              Email
            </a>
          )}

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-stone-300 bg-white px-4 text-xs font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Visit Website
            <svg
              className="ml-1.5 h-3.5 w-3.5 text-ink-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  );
}
