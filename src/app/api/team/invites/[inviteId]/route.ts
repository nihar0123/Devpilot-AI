import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ inviteId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteId } = await params;
  
  await prisma.teamInvite.delete({
    where: { id: inviteId },
  }).catch(() => null); // Ignore error if it doesn't exist

  return NextResponse.json({ success: true, inviteId });
}
