import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    key: `dp_${randomBytes(18).toString("hex")}`,
    persisted: false,
    message: "Demo key generated. Persist API keys before enabling production access.",
  });
}
