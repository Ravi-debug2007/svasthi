import { CheckIn, DailyMetric, Insight, Journal } from "@/lib/types";

type SessionData = { checkIns: CheckIn[]; journals: Journal[]; insights: Insight[] };

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const seedMetrics: DailyMetric[] = [
  { date: daysAgo(6), mood: 4, stress: 3, sleepHours: 7.6 },
  { date: daysAgo(5), mood: 4, stress: 4, sleepHours: 7.2 },
  { date: daysAgo(4), mood: 3, stress: 5, sleepHours: 6.8 },
  { date: daysAgo(3), mood: 3, stress: 6, sleepHours: 6.5 },
  { date: daysAgo(2), mood: 3, stress: 6, sleepHours: 6.1 },
  { date: daysAgo(1), mood: 2, stress: 7, sleepHours: 5.9 },
];

const globalStore = globalThis as typeof globalThis & { __svasthiDemoSessions?: Map<string, SessionData> };
const sessions = globalStore.__svasthiDemoSessions ?? new Map<string, SessionData>();
globalStore.__svasthiDemoSessions = sessions;
function session(sessionId: string): SessionData {
  const existing = sessions.get(sessionId);
  if (existing) return existing;
  const created = { checkIns: [], journals: [], insights: [] };
  sessions.set(sessionId, created);
  return created;
}

export const demoStore = {
  addCheckIn(sessionId: string, checkIn: CheckIn) { session(sessionId).checkIns.unshift(checkIn); return checkIn; },
  addJournal(sessionId: string, journal: Journal) { session(sessionId).journals.unshift(journal); return journal; },
  addInsight(sessionId: string, insight: Insight) { session(sessionId).insights.unshift(insight); return insight; },
  checkIns(sessionId: string) { return session(sessionId).checkIns; },
  journal(sessionId: string, id: string) { return session(sessionId).journals.find((item) => item.id === id); },
  checkIn(sessionId: string, id: string) { return session(sessionId).checkIns.find((item) => item.id === id); },
  latestInsight(sessionId: string) { return session(sessionId).insights[0] ?? null; },
  dashboard(sessionId: string) {
    const latest = session(sessionId).checkIns[0];
    const today = new Date().toISOString().slice(0, 10);
    const weekly = latest ? [...seedMetrics, { date: today, mood: latest.mood, stress: latest.stress, sleepHours: latest.sleepHours }] : seedMetrics;
    const averageSleep = weekly.reduce((sum, item) => sum + item.sleepHours, 0) / weekly.length;
    const averageStress = weekly.reduce((sum, item) => sum + item.stress, 0) / weekly.length;
    return {
      weekly,
      currentCheckIn: latest ?? null,
      latestInsight: this.latestInsight(sessionId),
      stats: { streakDays: 7, avgSleepHours: Number(averageSleep.toFixed(1)), wellnessScore: Math.max(0, Math.round(100 - averageStress * 7)) },
      resources: [{ label: "Tele-MANAS crisis support", phone: "14416", available: "24/7" }],
    };
  },
};
