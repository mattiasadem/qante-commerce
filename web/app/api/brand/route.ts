import { NextResponse } from "next/server";
import { BRAND, logoSvg } from "@/lib/brand";

export function GET() {
  return NextResponse.json({ ...BRAND, logo_svg: logoSvg(32) });
}
