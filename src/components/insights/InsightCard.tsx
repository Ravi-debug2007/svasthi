import { SourceBadge } from "@/components/ui/SourceBadge";
import { PrimaryButtonLink } from "@/components/ui/PrimaryButton";
import { NavLinkAction } from "@/components/ui/NavLinkAction";
import { EvidenceList } from "@/components/insights/EvidenceList";
import { Insight, WellnessLevel } from "@/lib/types";

/**
 * InsightCard (F05, ui-registry scope). One insight, honestly framed:
 * - "AI wording" badge — always shown, with the actual source named
 *   (Gemini vs guided fallback), never passed off as the user's own thought.
 * - Evidence rows trace every claim to the user's real input.
 * - Fixed non-medical disclaimer, always visible.
 * - Actionable path onward: exercises (when suggested) or support — never a
 *   dead end, never a claimed therapeutic outcome.
 */

const LEVEL_COPY: Record<WellnessLevel, { label: string; className: string }> = {
  steady: { label: "Steady", className: "border-sage-300 bg-sage-50 text-sage-800" },
  watch: { label: "Worth watching", className: "border-amber-300 bg-amber-50 text-amber-900" },
  support: { label: "Support suggested", className: "border-rose-200 bg-support-soft text-support" },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const levelCopy = LEVEL_COPY[insight.level];

  return (
    <article className="rounded-3xl border border-stone-200 bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <SourceBadge kind="ai" />
        <span className="text-xs text-ink-muted">
          {insight.source === "gemini" ? "AI-generated wording" : "Guided response (no AI used)"}
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${levelCopy.className}`}
        >
          {levelCopy.label}
        </span>
      </div>

      <h2 className="mt-4 text-xl font-semibold text-ink">{insight.title}</h2>

      <div className="mt-4">
        <EvidenceList evidence={insight.evidence} />
      </div>

      <div className="mt-5 rounded-2xl bg-primary-soft p-4">
        <p className="text-sm font-semibold text-ink">One small next step</p>
        <p className="mt-1.5 text-sm leading-6 text-ink">{insight.suggestion}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButtonLink href="/exercises" variant={insight.referralRecommended ? "secondary" : undefined}>
          Try a one-minute exercise
        </PrimaryButtonLink>
        <NavLinkAction href="/support">Ways to reach support</NavLinkAction>
      </div>

      <p className="mt-5 text-xs leading-5 text-ink-muted">{insight.disclaimer}</p>
    </article>
  );
}
