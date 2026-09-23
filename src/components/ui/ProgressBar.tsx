/**
 * ProgressBar — step progress or an explained index (ui-registry.md).
 * It only ever renders a value the caller actually computed — there is no
 * fake/animated progress here (ui-rules.md state design: no fabricated
 * progress percentage). Color is set by the caller: the default green suits
 * progress; pass `tone="support"` for the wellness index's support token.
 */
export function ProgressBar({
  label,
  value,
  max = 100,
  tone = "primary",
  className,
}: {
  /** Accessible name — required so the bar means something on its own. */
  label: string;
  /** Current value; non-finite or out-of-range values render as empty. */
  value: number;
  max?: number;
  tone?: "primary" | "support";
  className?: string;
}) {
  const clamped =
    Number.isFinite(value) && max > 0 ? Math.min(Math.max(value, 0), max) : 0;
  const percent = Math.round((clamped / max) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={percent}
      className={`h-2.5 w-full overflow-hidden rounded-full bg-primary-soft ${
        className ?? ""
      }`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-200 ${
          tone === "support" ? "bg-support" : "bg-primary"
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
