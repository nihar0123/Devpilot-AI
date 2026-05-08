import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateUserOrg } from "@/lib/auth/org";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { org, role } = await getOrCreateUserOrg(session.user.id, session.user.name || "");
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const usedAnalyses = await prisma.codeAnalysis.count({
    where: {
      project: { orgId: org.id },
      createdAt: { gte: monthStart },
    },
  });

  return NextResponse.json({
    organization: { id: org.id, name: org.name, slug: org.slug, website: org.website || "", role, plan: "FREE" },
    user: session.user,
    usage: { used: usedAnalyses, limit: 50 },
  });
}
