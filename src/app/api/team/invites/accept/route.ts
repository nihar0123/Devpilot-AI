import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email";
import { welcomeEmailTemplate } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  // Find the invite
  const invite = await prisma.teamInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.status === "ACCEPTED") {
    return NextResponse.json({ error: "Invite already accepted" }, { status: 400 });
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 400 });
  }

  // Check if user is already a member
  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      orgId_userId: {
        orgId: invite.orgId,
        userId: session.user.id,
      },
    },
  });

  if (existingMember) {
    return NextResponse.json({ error: "Already a member of this workspace" }, { status: 400 });
  }

  // Add the user to the organization
  const [member] = await prisma.$transaction([
    prisma.organizationMember.create({
      data: {
        orgId: invite.orgId,
        userId: session.user.id,
        role: invite.role,
      },
      include: { org: true }
    }),
    prisma.teamInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  // Send Welcome Email
  if (session.user.email) {
    await sendEmail({
      to: session.user.email,
      subject: `Welcome to ${member.org.name} on DevPilot AI!`,
      html: welcomeEmailTemplate({
        userName: session.user.name || 'Developer',
        orgName: member.org.name,
      }),
    });
  }

  return NextResponse.json({ success: true });
}
