import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NavLinkAction } from "@/components/ui/NavLinkAction";

/**
 * Honest placeholder (F00): the full trends dashboard is F07 on the build
 * plan. Your week at a glance already appears on the home page.
 */
export default function DashboardPlaceholder() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Trends"
        title="Your trends will appear as you check in."
        description="The full trends dashboard is on the build plan and is not built yet. Your week at a glance already appears on the home page."
      />
      <EmptyState
        icon="📈"
        title="No trend charts yet"
        description="When it arrives, sample history will always be clearly badged and kept separate from your real entries."
        action={<NavLinkAction href="/">← Back home</NavLinkAction>}
      />
    </div>
  );
}
