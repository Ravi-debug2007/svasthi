import { NextResponse } from "next/server";
import { demoStore } from "@/lib/demo-store";
import { getSessionId } from "@/lib/http";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return NextResponse.json(demoStore.dashboard(getSessionId(request)));
}
