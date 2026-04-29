import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ checkoutUrl: "/dashboard/settings?tab=billing&upgraded=true" });
}
