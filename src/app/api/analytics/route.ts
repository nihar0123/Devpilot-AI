import { NextResponse } from "next/server";
import { getOverviewTrend } from "@/lib/server/data";

export async function GET() {
  return NextResponse.json(await getOverviewTrend());
}
