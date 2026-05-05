import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const planId = typeof body.planId === "string" ? body.planId : "pro";

  return NextResponse.json({
    checkoutUrl: `/dashboard/billing?checkout=demo&plan=${encodeURIComponent(planId)}`,
    demoCheckout: true,
    message: "Billing checkout is in demo mode. Configure Stripe price IDs before accepting payments.",
  });
}
