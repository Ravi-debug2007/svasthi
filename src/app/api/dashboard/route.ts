import { NextResponse } from "next/server";
import { getSessionTimezoneSafeDate, requireUser, isAuthContext, errorResponse } from "@/lib/http";
import type { CheckIn } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard
 *
 * Returns the signed-in user's real data only. The client overlays sample
 * fixtures (never sent from here) and must badge them as sample. No data is
 * returned without a signed-in session.
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

  const checkIns = (data ?? []).map((row: {
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

  // One consistent local-date policy: dates are bucketed by the API server's
  // local day. Injected via getSessionTimezoneSafeDate so it can be replaced
  // with a user-timezone policy later without touching callers.
  const localDate = (iso: string) => getSessionTimezoneSafeDate(iso);
  const today = getSessionTimezoneSafeDate(new Date().toISOString());

  const byDate = new Map<string, { mood: number; stress: number; sleepHours: number }>();
  for (const entry of checkIns) {
    // First entry per date wins (latest check-in of that local day).
    if (!byDate.has(localDate(entry.createdAt))) {
      byDate.set(localDate(entry.createdAt), {
        mood: entry.mood,
        stress: entry.stress,
        sleepHours: entry.sleepHours,
    });
    }
  }

  const days: { date: string; mood: number; stress: number; sleepHours: number }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = getSessionTimezoneSafeDate(date.toISOString());
    const entry = byDate.get(key);
    if (entry) days.push({ date: key, ...entry });
  }

  // Streak: consecutive distinct local dates ending today or yesterday,
  // derived from real rows — never hard-coded.
  const distinctDates = Array.from(byDate.keys()).sort();
  let streakDays = 0;
  if (distinctDates.length > 0) {
    const cursor = new Date();
    const yesterday = new Date(cursor);
    yesterday.setDate(yesterday.getDate() - 1);
    const starts =
      distinctDates.includes(today) || distinctDates.includes(getSessionTimezoneSafeDate(yesterday.toISOString()));
    if (starts) {
      const probe = new Date(cursor);
      while (true) {
        const key = getSessionTimezoneSafeDate(probe.toISOString());
        if (!distinctDates.includes(key)) break;
        streakDays += 1;
        probe.setDate(probe.getDate() - 1);
      }
    }
  }

  type WeekDay = { date: string; mood: number; stress: number; sleepHours: number };
  const recent: WeekDay[] =
    days.length > 0
      ? days
      : checkIns.slice(0, 7).map((entry: CheckIn) => ({
          date: localDate(entry.createdAt),
          mood: entry.mood,
          stress: entry.stress,
          sleepHours: entry.sleepHours,
        }));

  const averageSleep =
    recent.length > 0 ? recent.reduce((sum, item) => sum + item.sleepHours, 0) / recent.length : 0;
  const averageStress =
    recent.length > 0 ? recent.reduce((sum, item) => sum + item.stress, 0) / recent.length : 0;

  return NextResponse.json({
    weekly: recent,
    currentCheckIn: checkIns[0] ?? null,
    latestInsight: null,
    stats: {
      streakDays,
      avgSleepHours: Number(averageSleep.toFixed(1)),
      // Illustrative self-report index only — not a medical measure.
      wellnessScore: recent.length > 0 ? Math.max(0, Math.round(100 - averageStress * 7)) : null,
    },
  });
}
