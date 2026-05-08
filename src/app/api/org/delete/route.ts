import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { canManageOrg, getOrCreateUserOrg } from "@/lib/auth/org";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { org, role } = await getOrCreateUserOrg(session.user.id, session.user.name || "");
  if (!canManageOrg(role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  await prisma.organization.delete({
    where: { id: org.id },
  });

  return NextResponse.json({ success: true });
}