import { NextResponse } from "next/server";
import { requireUser, isAuthContext, errorResponse } from "@/lib/http";
import { buildSeries, computeStreak, latestScore } from "@/lib/dashboard/metrics";
import type { CheckIn } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard
 *
 * Returns the signed-in user's real data only. The client overlays sample
 * fixtures (never sent from here) and must badge them as sample. No data is
 * returned without a signed-in session.
 *
 * F07: date bucketing, streak, and the illustrative self-report index are
 * computed by src/lib/dashboard/metrics.ts — one consistent local-date
 * policy, an injected clock inside that module, and the exact formula from
 * dashboard-and-scoring.md.
 */
export async function GET() {
  const auth = await requireUser();
  if (!isAuthContext(auth)) return auth;

  const { supabase, userId } = auth;

  const { data, error } = await supabase
    .from("check_ins")
    .select("id, created_at, mood, stress, energy, sleep_hours, contexts")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(90);

  if (error) return errorResponse("Could not load your dashboard.", 500, error.message);

  const checkIns: CheckIn[] = (data ?? []).map((row: {
    id: string;
    created_at: string;
    mood: number;
    stress: number;
    energy: number;
    sleep_hours: string | number;
    contexts: string[];
  }) => ({
    id: row.id,
    createdAt: row.created_at,
    mood: row.mood,
    stress: row.stress,
    energy: row.energy,
    sleepHours: Number(row.sleep_hours),
    contexts: Array.isArray(row.contexts) ? row.contexts : [],
  }));

  const weekly = buildSeries(checkIns, new Date());
  const streakDays = computeStreak(checkIns, new Date());

  const averageSleep =
    weekly.length > 0 ? weekly.reduce((sum, item) => sum + item.sleepHours, 0) / weekly.length : null;

  return NextResponse.json({
    // Real days in the last-7-day window only, oldest first. Days without a
    // check-in are absent — the client renders honest gaps, never filler.
    weekly,
    currentCheckIn: checkIns[0] ?? null,
    latestInsight: null,
    stats: {
      // Derived from real distinct check-in dates — never hard-coded, never
      // counted from sample fixtures.
      streakDays,
      // Average over the days actually present in this week's window;
      // null (not a fake 0) when the week has no entries yet.
      avgSleepHours: averageSleep == null ? null : Number(averageSleep.toFixed(1)),
      // Illustrative self-report index from the newest check-in, using the
      // formula in dashboard-and-scoring.md. null when there is no entry —
      // the UI then says "Not enough information" rather than faking a number.
      wellnessScore: latestScore(checkIns),
    },
  });
}
