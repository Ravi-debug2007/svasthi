"use client";

import { SourceBadge } from "@/components/ui/SourceBadge";
import { Provenance } from "@/lib/demo/provenance";

/**
 * TrendChart (F07, ui-registry scope). One metric over the last seven local
 * days, drawn honestly:
 * - Only days with a real check-in are plotted — gaps are visible, never
 *   bridged by invented values (code-standards.md data-honesty rules).
 * - Sample/fixture days (when the demo overlay is on) are drawn hollow with
 *   a Sample badge in the header; real days always stay solid + badged.
 * - An accessible <table> alternative carries the same numbers (acceptance:
 *   "Accessible table alternative available").
 * - Axis hints state the scale so a 1–5 mood line is never misread as a
 *   0–100 score, and stress is always labeled "Reported stress".
 * - Respect for prefers-reduced-motion: a plain transition only, nothing
 *   animates in (ui-tokens.md motion rules).
 */

export type TrendMetric = "mood" | "stress" | "sleepHours";

export type TrendPoint = {
  date: string;
  value: number;
  sample: boolean;
};

type MetricConfig = {
  title: string;
  badge: Provenance;
  unit: string;
  min: number;
  max: number;
  scaleNote: string;
  formatValue: (value: number) => string;
  formatTable: (value: number) => string;
  explanation: string;
};

const METRIC_CONFIG: Record<TrendMetric, MetricConfig> = {
  mood: {
    title: "Mood",
    badge: "self-reported",
    unit: "of 5",
    min: 1,
    max: 5,
    scaleNote: "Scale 1–5 from your own daily rating.",
    formatValue: (value) => String(value),
    formatTable: (value) => `${value} of 5`,
    explanation: "Your daily mood rating. Never a measured or inferred value.",
  },
  stress: {
    title: "Reported stress",
    badge: "self-reported",
    unit: "of 10",
    min: 0,
    max: 10,
    scaleNote: "Scale 0–10, self-reported. Not a measured or inferred level.",
    formatValue: (value) => String(value),
    formatTable: (value) => `${value} of 10`,
    explanation: "What you reported each day — not a claim about your body.",
  },
  sleepHours: {
    title: "Sleep",
    badge: "self-reported",
    unit: "hours",
    min: 0,
    max: 12,
    scaleNote: "Hours you entered. No wearable or device claim.",
    formatValue: (value) => `${value}h`,
    formatTable: (value) => `${value} h`,
    explanation: "Hours of sleep you reported. Shown separately from the other trends.",
  },
};

const W = 320;
const H = 120;
const PAD_X = 10;
const PAD_Y = 12;

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TrendChart({
  metric,
  points,
  className,
}: {
  metric: TrendMetric;
  points: TrendPoint[];
  className?: string;
}) {
  const config = METRIC_CONFIG[metric];
  const hasReal = points.some((point) => !point.sample);
  const hasSample = points.some((point) => point.sample);

  return (
    <section
      aria-label={`${config.title} trend`}
      className={`rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6 ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">{config.title}</h3>
        <div className="flex items-center gap-1.5">
          {hasSample && <SourceBadge kind="sample" />}
          {!hasReal && hasSample ? null : <SourceBadge kind={config.badge} />}
        </div>
      </div>
      <p className="mt-1 text-xs leading-5 text-ink-muted">{config.explanation}</p>

      {points.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white p-4 text-sm leading-6 text-ink-muted">
          Your {config.title.toLowerCase()} line will appear here after a check-in. Nothing is
          estimated in the meantime.
        </p>
      ) : (
        <>
          {/* Chart */}
          <div className="mt-4">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              role="img"
              aria-label={`${config.title} over the last seven days. Use the table below for the exact values.`}
            >
              {/* Scale hint line so the range is readable at a glance */}
              <text x={PAD_X} y={PAD_Y - 2} className="fill-stone-400 text-[8px]">
                {`min ${config.formatValue(config.min)} · max ${config.formatValue(config.max)}`}
              </text>
              <TrendLine points={points} config={config} />
            </svg>
          </div>

          {/* Accessible alternative: same numbers, plain table */}
          <details className="mt-3">
            <summary className="min-h-[44px] cursor-pointer text-sm font-semibold text-primary">
              View as a table
            </summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">{`${config.title} values for the last seven days`}</caption>
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
                    <th scope="col" className="py-1.5 pr-3 font-semibold">Date</th>
                    <th scope="col" className="py-1.5 pr-3 font-semibold">Value</th>
                    <th scope="col" className="py-1.5 font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((point) => (
                    <tr key={point.date} className="border-t border-stone-100">
                      <td className="py-1.5 pr-3 text-ink">{formatDateLabel(point.date)}</td>
                      <td className="py-1.5 pr-3 text-ink">{config.formatTable(point.value)}</td>
                      <td className="py-1.5 text-ink-muted">
                        {point.sample ? "Sample data" : "Your entry"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <p className="mt-2 text-xs leading-5 text-ink-muted">{config.scaleNote}</p>
        </>
      )}
    </section>
  );
}

function TrendLine({
  points,
  config,
}: {
  points: TrendPoint[];
  config: MetricConfig;
}) {
  const span = config.max - config.min;
  const chartH = H - PAD_Y * 2;
  const chartW = W - PAD_X * 2;

  const toXY = (index: number, value: number) => {
    const x =
      points.length === 1 ? W / 2 : PAD_X + (index / (points.length - 1)) * chartW;
    const clamped = Math.min(Math.max(value, config.min), config.max);
    const y = PAD_Y + chartH - ((clamped - config.min) / span) * chartH;
    return { x, y };
  };

  return (
    <g>
      {points.map((point, index) => {
        const { x, y } = toXY(index, point.value);
        return (
          <circle
            key={point.date}
            cx={x}
            cy={y}
            r={point.sample ? 3.5 : 4.5}
            className={
              point.sample
                ? "fill-surface stroke-amber-500 stroke-2"
                : "fill-primary stroke-surface stroke-2"
            }
          >
            <title>
              {`${formatDateLabel(point.date)}: ${config.formatTable(point.value)}${
                point.sample ? " (sample data)" : ""
              }`}
            </title>
          </circle>
        );
      })}
      {points.length > 1 && (
        <polyline
          points={points.map((point, index) => {
            const { x, y } = toXY(index, point.value);
            return `${x},${y}`;
          }).join(" ")}
          fill="none"
          className={
            points.some((point) => point.sample)
              ? "stroke-stone-400"
              : "stroke-primary"
          }
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={points.some((point) => point.sample) ? "4 3" : undefined}
        />
      )}
    </g>
  );
}
