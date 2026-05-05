import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrCreateUserOrg } from "@/lib/auth/org";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { org, role } = await getOrCreateUserOrg(session.user.id, session.user.name || "");

  return NextResponse.json({
    organization: { id: org.id, name: org.name, slug: org.slug, website: org.website || "", role, plan: "FREE" },
    user: session.user,
  });
}
