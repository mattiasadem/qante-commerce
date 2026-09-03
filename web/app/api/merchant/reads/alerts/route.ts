import { NextResponse } from "next/server";
import { computeAlerts } from "@/lib/merchant";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ alerts: computeAlerts() });
}
