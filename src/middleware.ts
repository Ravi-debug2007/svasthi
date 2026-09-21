import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const allowedOrigins = new Set(
  ["http://localhost:3000", "http://localhost:5173", process.env.FRONTEND_ORIGIN]
    .filter((origin): origin is string => Boolean(origin)),
);

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();

  const origin = request.headers.get("origin");
  const headers = new Headers();
  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "content-type");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Vary", "Origin");
  }

  // Refresh the Supabase auth session so server clients always see valid
  // cookies. This is the documented pattern for @supabase/ssr with the
  // Next.js App Router.
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    // Do not add code between this call and the response creation above.
    await supabase.auth.getUser();
  }

  if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers });

  headers.forEach((value, name) => response.headers.set(name, value));
  return response;
}

export const config = { matcher: "/api/:path*" };
