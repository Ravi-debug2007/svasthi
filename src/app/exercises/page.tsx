import { PageHeader } from "@/components/ui/PageHeader";
import { BreathingExercise } from "@/components/exercises/BreathingExercise";
import { NavLinkAction } from "@/components/ui/NavLinkAction";

/**
 * /exercises (F09). One small optional action after reflection:
 * - The one-minute breathing guide (BreathingExercise) with start/pause/stop,
 *   no breath-holding, and a text-only reduced-motion mode.
 * - A grounding alternative for people who'd rather not pace their breathing.
 * - Honest boundaries: no program, no streak, no claimed outcome, nothing
 *   tracked or sent. Support access stays visible on the page and in the
 *   persistent SupportBanner.
 * - No sign-in required: the exercise involves no data and no model call.
 */
export default function ExercisesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Exercises"
        title="One minute, one small action."
        description="An optional paced-breathing guide, and a grounding alternative if pacing isn't for you. Nothing to join, nothing tracked, and you can stop at any point."
      />

      <BreathingExercise />

      <section
        aria-labelledby="grounding-heading"
        className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6"
      >
        <h2 id="grounding-heading" className="text-lg font-semibold text-ink">
          If pacing isn&apos;t for you: grounding
        </h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          A simple noticing exercise. Take it in any order, skip any line, and stop whenever you
          want — nothing here is timed or recorded.
        </p>
        <ol className="mt-4 space-y-2 text-sm leading-6 text-ink">
          <li className="flex gap-3">
            <span className="font-semibold text-primary">5</span>
            <span>things you can see around you</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-primary">4</span>
            <span>things you can touch or feel — a surface, fabric, your own hands</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-primary">3</span>
            <span>things you can hear, near or far</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-primary">2</span>
            <span>things you can smell — or two smells you like remembering</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-primary">1</span>
            <span>thing you can taste — or one taste you remember enjoying</span>
          </li>
        </ol>
        <p className="mt-4 text-xs leading-5 text-ink-muted">
          Some people can&apos;t smell or taste much, and that&apos;s why those lines offer an
          alternative. This is a noticing exercise, not treatment, and no outcome is promised.
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Afterwards</h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          If the exercise left you wanting to write something down, a short reflection is a good
          next step. If it left you feeling worse, that is worth taking seriously — support is
          always available, and reaching it is your choice.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <NavLinkAction href="/journal">Write a reflection →</NavLinkAction>
          <NavLinkAction href="/support">Ways to reach support →</NavLinkAction>
        </div>
      </section>

      <section className="rounded-3xl border border-rose-200 bg-support-soft p-6">
        <h2 className="text-lg font-semibold text-support">Need a person right now?</h2>
        <p className="mt-2 text-sm leading-6 text-support">
          Tele-MANAS is available 24/7 at{" "}
          <a href="tel:14416" className="font-semibold underline">
            14416
          </a>
          . Calling is always your choice — nothing here dials automatically, and nothing on this
          page decides whether you can reach support.
        </p>
      </section>
    </div>
  );
}
