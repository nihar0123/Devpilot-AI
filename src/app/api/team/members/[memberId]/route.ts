import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrgManager } from "@/lib/auth/org";

const ALLOWED_ROLES = new Set(["OWNER", "ADMIN", "MEMBER", "VIEWER"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const guard = await requireOrgManager();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { memberId } = await params;
  const body = await req.json();
  const { role } = body;
  if (typeof role !== "string" || !ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await prisma.organizationMember.update({
    where: { id: memberId, orgId: guard.org.id },
    data: { role },
    select: {
      id: true,
      role: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
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
  const guard = await requireOrgManager();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { memberId } = await params;

  // Prevent removing yourself
  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId, orgId: guard.org.id },
  });

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (member.userId === guard.userId) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  await prisma.organizationMember.delete({
    where: { id: memberId, orgId: guard.org.id },
  });

  return NextResponse.json({ id: memberId, removed: true });
}
