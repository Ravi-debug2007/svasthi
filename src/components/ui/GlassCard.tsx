import { ReactNode } from "react";

/**
 * Decorative surface card (ui-registry.md). NOT a universal container —
 * used for hero/reminder surfaces where a little warmth helps. Standard
 * content cards use plain white surface styling instead.
 */
export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/60 bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-sm ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
