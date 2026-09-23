import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NavLinkAction } from "@/components/ui/NavLinkAction";

/**
 * Honest placeholder (F00 pattern): the guided exercise is F09 on the build
 * plan. This page exists so the insight card's action link works today —
 * support access and navigation must never dead-end.
 */
export default function ExercisesPlaceholder() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Exercises"
        title="A one-minute breather, coming soon."
        description="The guided breathing exercise is on the build plan and is not built yet."
      />
      <EmptyState
        icon="🌬️"
        title="Nothing to guide yet"
        description="When it arrives, this will be one optional one-minute breathing guide — no programs, no streaks, no claimed outcomes. Tele-MANAS at 14416 remains reachable at any hour if you need a person now."
        action={<NavLinkAction href="/">← Back home</NavLinkAction>}
      />
    </div>
  );
}
