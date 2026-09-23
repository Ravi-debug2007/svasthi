import { NextResponse } from "next/server";
import { errorResponse, isAuthContext, requireUser } from "@/lib/http";
import { checkInSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

/** Convert a Supabase row into the API's camelCase CheckIn shape. */
function toCheckIn(row: {
  id: string;
  created_at: string;
  mood: number;
  stress: number;
  energy: number;
  sleep_hours: string | number;
  contexts: string[];
}) {
  return {
    id: row.id as string,
    createdAt: row.created_at,
    mood: row.mood,
    stress: row.stress,
    energy: row.energy,
    sleepHours: Number(row.sleep_hours),
    contexts: Array.isArray(row.contexts) ? row.contexts : [],
  };
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!isAuthContext(auth)) return auth;

  const parsed = checkInSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Invalid check-in.", 400, parsed.error.flatten());

  const { supabase, userId } = auth;
  const { data, error } = await supabase
    .from("check_ins")
    .insert({
      user_id: userId,
      mood: parsed.data.mood,
      stress: parsed.data.stress,
      energy: parsed.data.energy,
      sleep_hours: parsed.data.sleepHours,
      contexts: parsed.data.contexts,
    })
    .select("id, created_at, mood, stress, energy, sleep_hours, contexts")
    .single();

  if (error) return errorResponse("Could not save your check-in.", 500, error.message);
  return NextResponse.json({ checkIn: toCheckIn(data) }, { status: 201 });
}

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

  if (error) return errorResponse("Could not load your check-ins.", 500, error.message);
  return NextResponse.json({ checkIns: (data ?? []).map(toCheckIn) });
}
