import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrgManager } from "@/lib/auth/org";
import { sendEmail } from "@/lib/email";
import { teamInviteTemplate } from "@/lib/emailTemplates";

export async function POST(_: NextRequest, { params }: { params: Promise<{ inviteId: string }> }) {
  const guard = await requireOrgManager();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { inviteId } = await params;
  const invite = await prisma.teamInvite.findFirst({
    where: { id: inviteId, orgId: guard.org.id, status: "PENDING" },
    include: { org: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const inviteUrl = `${process.env.APP_URL || "https://devpilotai.dev"}/invite/${invite.token}`;
  await sendEmail({
    to: invite.email,
    subject: `Reminder: Your invitation to ${invite.org.name} on DevPilot AI`,
    html: teamInviteTemplate({
      inviteUrl,
      orgName: invite.org.name,
      role: invite.role,
      invitedBy: guard.session.user?.name || guard.session.user?.email || "A team member",
    }),
  });

  return NextResponse.json({ success: true, inviteId });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ inviteId: string }> }) {
  const guard = await requireOrgManager();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { inviteId } = await params;

  await prisma.teamInvite.deleteMany({
    where: { id: inviteId, orgId: guard.org.id },
  });

  return NextResponse.json({ success: true, inviteId });
}
