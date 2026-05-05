import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrgManager } from "@/lib/auth/org";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ inviteId: string }> }) {
  const guard = await requireOrgManager();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { inviteId } = await params;

  await prisma.teamInvite.deleteMany({
    where: { id: inviteId, orgId: guard.org.id },
  });

  return NextResponse.json({ success: true, inviteId });
}
