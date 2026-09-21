import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}

/**
 * Local-date key (YYYY-MM-DD) for a timestamp. One consistent policy:
 * bucketed by the API server's local day. Kept as a named function so a
 * user-timezone policy can replace it in one place later.
 */
export function getSessionTimezoneSafeDate(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type AuthContext = {
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
};

/**
 * Resolves the authenticated user from the request's session cookies.
 * Every API route must call this before touching data — there is no
 * fallback session and no caller-supplied user id (F01).
 *
 * The Supabase client is typed loosely here to keep this file free of
 * generated database types; queries are still validated at runtime by Zod
 * schemas and RLS.
 */
export async function requireUser(): Promise<AuthContext | NextResponse> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return errorResponse("The server is not configured for Supabase yet.", 503);
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return errorResponse("Please sign in to continue.", 401);
  }
  return { userId: data.user.id, supabase };
}

export function isAuthContext(value: AuthContext | NextResponse): value is AuthContext {
  return value instanceof NextResponse === false;
}
