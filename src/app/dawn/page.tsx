import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NavLinkAction } from "@/components/ui/NavLinkAction";

/**
 * Honest placeholder (F00): the Dawn chat companion is F06 on the build
 * plan. The chat API endpoint already exists behind it.
 */
export default function DawnPlaceholder() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Dawn"
        title="A quiet place to reflect, out loud."
        description="The Dawn chat companion is on the build plan and is not built yet. The chat API endpoint is already available for it."
      />
      <EmptyState
        icon="🌅"
        title="Dawn isn't awake yet"
        description="When it arrives, Dawn is a brief, compassionate conversation with clear limits — an AI companion, clearly labelled, never a therapist."
        action={<NavLinkAction href="/">← Back home</NavLinkAction>}
      />
    </div>
  );
}
