import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Shared browser fetch wrapper. Same-origin JSON with cookies included so
 * the Supabase session reaches API routes. All endpoints require a signed-in
 * session — there is no shared fallback session anymore (F01).
 */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (body && typeof body === "object" && "error" in body &&
        body.error && typeof body.error === "object" && "message" in body.error &&
        typeof body.error.message === "string" && body.error.message) ||
      "Something went wrong. Please try again.";
    throw new ApiError(message, response.status);
  }
  return body as T;
}

/** Sign out everywhere the session may live, then drop the local copy. */
export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
}
