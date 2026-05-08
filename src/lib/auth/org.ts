import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export const MANAGE_ORG_ROLES = new Set(["OWNER", "ADMIN"]);

export function canManageOrg(role: string) {
  return MANAGE_ORG_ROLES.has(role);
}

export async function getOrCreateUserOrg(userId: string, userName = "") {
  const existingMember = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { org: true },
  });

  if (existingMember) {
    return { org: existingMember.org, role: existingMember.role };
  }

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

export async function requireOrgManager() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }

  // Fast path: org info cached in JWT
  const cachedOrgId = (session as any).orgId as string | undefined;
  const cachedRole = (session as any).orgRole as string | undefined;

  if (cachedOrgId && cachedRole) {
    if (!canManageOrg(cachedRole)) {
      return { error: "Insufficient permissions" as const, status: 403 as const };
    }
    return { session, userId: session.user.id, org: { id: cachedOrgId }, role: cachedRole };
  }

  // Slow path
  const { org, role } = await getOrCreateUserOrg(session.user.id, session.user.name || "");
  if (!canManageOrg(role)) {
    return { error: "Insufficient permissions" as const, status: 403 as const };
  }

  return { session, userId: session.user.id, org, role };
}
