import { NextResponse } from "next/server";
import { computeSnapshot } from "@/lib/merchant";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(computeSnapshot());
}
