import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function getOrCreateUserOrg(userId: string, userName: string, userEmail: string) {
  // Check if user is already in an organization
  const existingMember = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { org: true },
  });

  if (existingMember) {
    return { org: existingMember.org, role: existingMember.role };
  }

  // Create a new organization
  const orgName = userName ? `${userName}'s Workspace` : "My Workspace";
  const slug = `org-${Date.now()}`;
  
  const org = await prisma.organization.create({
    data: {
      name: orgName,
      slug,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
      subscription: {
        create: {
          plan: "FREE",
          status: "ACTIVE",
        },
      },
    },
  });

  return { org, role: "OWNER" };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { org, role } = await getOrCreateUserOrg(session.user.id, session.user.name || "", session.user.email || "");

  return NextResponse.json({
    organization: { id: org.id, name: org.name, slug: org.slug, website: org.website || "", role, plan: "FREE" },
    user: session.user,
  });
}
