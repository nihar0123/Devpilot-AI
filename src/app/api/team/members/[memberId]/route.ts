import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId } = await params;
  const body = await req.json();
  const { role } = body;

  const updated = await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role },
    include: { user: true },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.user.name || updated.user.email?.split("@")[0] || "Unknown",
    email: updated.user.email,
    role: updated.role,
    success: true,
  });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId } = await params;

  // Prevent removing yourself
  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });

  if (member?.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  await prisma.organizationMember.delete({
    where: { id: memberId },
  });

  return NextResponse.json({ id: memberId, removed: true });
}
