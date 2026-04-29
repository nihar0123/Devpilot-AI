import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateUserOrg } from "../context/route";
import { sendEmail } from "@/lib/email";
import { teamInviteTemplate } from "@/lib/emailTemplates";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { org } = await getOrCreateUserOrg(session.user.id, session.user.name || "", session.user.email || "");

  const invites = await prisma.teamInvite.findMany({
    where: { orgId: org.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    invites.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      sentAt: inv.createdAt.toISOString().split("T")[0],
      expiresAt: inv.expiresAt.toISOString().split("T")[0],
      inviteUrl: `${process.env.APP_URL || "http://localhost:3000"}/invite/${inv.token}`,
      status: inv.status,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { org } = await getOrCreateUserOrg(session.user.id, session.user.name || "", session.user.email || "");

  // Check if invite already exists
  const existingInvite = await prisma.teamInvite.findFirst({
    where: { orgId: org.id, email: body.email, status: "PENDING" },
  });

  if (existingInvite) {
    return NextResponse.json({ error: "Invite already sent" }, { status: 400 });
  }

  // Create invite
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await prisma.teamInvite.create({
    data: {
      orgId: org.id,
      email: body.email,
      role: body.role,
      expiresAt,
    },
  });

  const inviteUrl = `${process.env.APP_URL || "http://localhost:3000"}/invite/${invite.token}`;

  // Send Email using Gmail SMTP
  await sendEmail({
    to: body.email,
    subject: `You have been invited to join ${org.name} on DevPilot AI`,
    html: teamInviteTemplate({
      inviteUrl,
      orgName: org.name,
      role: body.role,
      invitedBy: session.user.name || session.user.email || 'A team member',
    }),
  });

  return NextResponse.json({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    sentAt: "just now",
    expiresAt: "in 7 days",
    inviteUrl,
    status: invite.status,
  });
}
