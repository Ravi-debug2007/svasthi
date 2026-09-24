import type { CheckIn, DailyMetric } from "@/lib/types";
import type { SampleDay } from "@/lib/demo/fixtures";

/**
 * F07 dashboard metrics — pure, clock-injected, testable (code-standards.md).
 *
 * One consistent local-date policy lives here: a check-in belongs to the
 * LOCAL day of its `createdAt` timestamp, computed with the injected clock
 * (architecture.md: "Stale/ambiguous daily dates — inject a clock, choose
 * one date policy").
 *
 * Data-honesty rules honoured by this module:
 * - Nothing here fabricates data. Days without a check-in are simply absent
 *   from the series — there is no interpolation and no seeded filler.
 * - Streaks count only REAL distinct check-in dates (dashboard-and-scoring.md:
 *   "Never count sample/fixture days as earned").
 * - Sample fixture days are carried separately and can be overlaid only by
 *   the UI, which must badge them (SampleHistoryBanner / SourceBadge).
 */

/** Local-date key (YYYY-MM-DD) for an instant, per the one date policy. */
export function localDateKey(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Local-date key for a day `offsetDays` before the injected now. */
function dayKeyAt(now: Date, offsetDays: number): string {
  const probe = new Date(now);
  probe.setDate(probe.getDate() - offsetDays);
  return localDateKey(probe.toISOString());
}

/**
 * The latest check-in per local day wins for that day's values (a later
 * check-in is the user's most recent reflection of how that day went).
 * Multiple entries on one day are kept distinct for streak counting.
 */
export function checkInsByDate(checkIns: CheckIn[]): Map<string, CheckIn> {
  const byDate = new Map<string, CheckIn>();
  // checkIns arrive newest-first from the API; first write per date = latest
  // entry of that day. Sort defensively so ordering bugs can't flip this.
  const sorted = [...checkIns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  for (const entry of sorted) {
    const key = localDateKey(entry.createdAt);
    if (!byDate.has(key)) byDate.set(key, entry);
  }
  return byDate;
}

export type DayPoint = DailyMetric & { hasEntry: true };

/**
 * Fixed 7-day window (today + 6 prior local days). Days without a real
 * check-in are omitted — honest gaps, not zeros masquerading as "fine".
 */
export function buildSeries(
  checkIns: CheckIn[],
  now: Date,
  windowDays = 7,
): DayPoint[] {
  const byDate = checkInsByDate(checkIns);
  const series: DayPoint[] = [];
  for (let offset = windowDays - 1; offset >= 0; offset -= 1) {
    const key = dayKeyAt(now, offset);
    const entry = byDate.get(key);
    if (entry) {
      series.push({
        date: key,
        mood: entry.mood,
        stress: entry.stress,
        sleepHours: entry.sleepHours,
        hasEntry: true,
      });
    }
  }
  return series;
}

/**
 * Streak of consecutive distinct REAL check-in dates, ending today or
 * yesterday (checking in yesterday keeps a streak alive until the day
 * passes). Never counts sample/fixture days.
 */
export function computeStreak(checkIns: CheckIn[], now: Date): number {
  const distinct = new Set(checkIns.map((entry) => localDateKey(entry.createdAt)));
  if (distinct.size === 0) return 0;
  if (!distinct.has(dayKeyAt(now, 0)) && !distinct.has(dayKeyAt(now, 1))) {
    return 0;
  }
  let streak = 0;
  let offset = distinct.has(dayKeyAt(now, 0)) ? 0 : 1;
  while (distinct.has(dayKeyAt(now, offset))) {
    streak += 1;
    offset += 1;
  }
  return streak;
}

/**
 * Illustrative self-report index — the exact formula from
 * dashboard-and-scoring.md:
 *
 *   Score = 100 × [ 0.5 × (m − 1) / 4  +  0.3 × (1 − s / 10)  +  0.2 × (e / 10) ]
 *
 * where m = mood (1–5), s = reported stress (0–10), e = reported energy
 * (0–10). Only computed when ALL required values exist; null otherwise
 * ("Not enough information" is shown rather than a fake number). Sleep and
 * voice acoustics are deliberately NOT inputs. This is an illustrative UI
 * summary of the user's own ratings — never a medical or validated measure,
 * and never an input to crisis routing.
 */
export function computeWellnessScore(
  mood: number,
  stress: number,
  energy: number,
): number | null {
  const values = [mood, stress, energy];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return null;
  }
  if (mood < 1 || mood > 5 || stress < 0 || stress > 10 || energy < 0 || energy > 10) {
    return null;
  }
  const moodPart = 0.5 * ((mood - 1) / 4);
  const stressPart = 0.3 * (1 - stress / 10);
  const energyPart = 0.2 * (energy / 10);
  const score = 100 * (moodPart + stressPart + energyPart);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Newest real check-in's index, or null when there is nothing to compute
 * from (missing values render as "Not enough information" in the UI).
 */
export function latestScore(checkIns: CheckIn[]): number | null {
  const newest = [...checkIns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
  if (!newest) return null;
  return computeWellnessScore(newest.mood, newest.stress, newest.energy);
}

/**
 * Overlay sample fixture days onto real series points, keeping real entries
 * authoritative: if a real entry exists for a date, the sample day for that
 * date is DROPPED, never blended. The result's `sample` flag travels with
 * every sample point so the UI must badge it.
 */
export function overlaySampleDays(
  real: DayPoint[],
  sample: SampleDay[],
): (DayPoint | SampleDay)[] {
  const realDates = new Set(real.map((point) => point.date));
  const sampleFiltered = sample.filter((day) => !realDates.has(day.date));
  return [...real, ...sampleFiltered].sort((a, b) => a.date.localeCompare(b.date));
}
