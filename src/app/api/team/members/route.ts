import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateUserOrg } from "@/lib/auth/org";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { org } = await getOrCreateUserOrg(session.user.id, session.user.name || "");

  const members = await prisma.organizationMember.findMany({
    where: { orgId: org.id },
    include: { user: true },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name || m.user.email?.split("@")[0] || "Unknown User",
      email: m.user.email,
      role: m.role,
      status: "Active",
    }))
  );
}
