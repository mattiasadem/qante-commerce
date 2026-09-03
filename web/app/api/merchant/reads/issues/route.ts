import { NextResponse } from "next/server";
import { computeIssues } from "@/lib/merchant";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ issues: computeIssues() });
}
