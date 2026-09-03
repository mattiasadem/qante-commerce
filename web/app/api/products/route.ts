import { NextResponse } from "next/server";
import { getProducts } from "@/lib/seed";

export function GET() {
  return NextResponse.json({ products: getProducts() });
}
