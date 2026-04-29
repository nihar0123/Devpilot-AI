import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email";
import { teamInviteTemplate } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.inviteId) {
    return NextResponse.json({ success: false, error: "Missing inviteId" }, { status: 400 });
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { id: body.inviteId },
    include: { org: true }
  });

  if (!invite) {
    return NextResponse.json({ success: false, error: "Invite not found" }, { status: 404 });
  }

  const inviteUrl = `${process.env.APP_URL || "http://localhost:3000"}/invite/${invite.token}`;
  
  await sendEmail({
    to: invite.email,
    subject: `Reminder: Your invitation to ${invite.org.name} expires soon`,
    html: teamInviteTemplate({
      inviteUrl,
      orgName: invite.org.name,
      role: invite.role,
      invitedBy: 'DevPilot AI',
    }),
  });

  return NextResponse.json({ success: true, inviteId: body.inviteId, status: "Reminder sent" });
}
