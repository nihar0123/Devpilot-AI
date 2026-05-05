import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email";
import { teamInviteTemplate } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ success: false, error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expiresBefore = new Date(now);
  expiresBefore.setHours(expiresBefore.getHours() + 24);

  const invites = await prisma.teamInvite.findMany({
    where: {
      status: "PENDING",
      expiresAt: {
        gt: now,
        lte: expiresBefore,
      },
    },
    include: { org: true },
  });

  let sent = 0;
  for (const invite of invites) {
    const inviteUrl = `${process.env.APP_URL || "https://devpilotai.dev"}/invite/${invite.token}`;

    const result = await sendEmail({
      to: invite.email,
      subject: `Reminder: Your invitation to ${invite.org.name} expires soon`,
      html: teamInviteTemplate({
        inviteUrl,
        orgName: invite.org.name,
        role: invite.role,
        invitedBy: "DevPilot AI",
      }),
    });

    if (result.success) sent += 1;
  }

  return NextResponse.json({ success: true, scanned: invites.length, sent });
}
