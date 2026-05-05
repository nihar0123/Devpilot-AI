import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateUserOrg } from "@/lib/auth/org";

export async function requireWorkspace() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }

  const { org, role } = await getOrCreateUserOrg(session.user.id, session.user.name || "");
  return { session, userId: session.user.id, org, role };
}

export async function getProjectForOrg(projectId: string, orgId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, orgId },
  });
}
