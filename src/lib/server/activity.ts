import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type ActivityFeedItem = {
  id: string;
  description: string;
  time: string;
};

export function describeActivity(action: string, metadata: unknown) {
  const data = typeof metadata === "object" && metadata !== null ? metadata as Record<string, unknown> : {};
  const title = typeof data.title === "string" ? data.title : undefined;
  const name = typeof data.name === "string" ? data.name : undefined;

  switch (action) {
    case "PROJECT_CREATED":
      return `Created project ${name ?? "workspace project"}`;
    case "PROJECT_UPDATED":
      return `Updated project ${name ?? "workspace project"}`;
    case "TASK_CREATED":
      return `Created task ${title ?? "Untitled task"}`;
    case "TASK_COMPLETED":
      return `Completed task ${title ?? "task"}`;
    case "TASK_UPDATED":
      return `Updated task ${title ?? "task"}`;
    case "TASK_DELETED":
      return "Deleted a task";
    case "AI_CODE_REVIEW_SAVED":
      return "Saved an AI code review";
    case "AI_BUG_REPORT_SAVED":
      return "Saved bug finder results";
    case "AI_DOCS_SAVED":
      return "Saved generated documentation";
    case "AI_TESTS_SAVED":
      return "Saved generated tests";
    default:
      return typeof action === "string" ? action.replaceAll("_", " ").toLowerCase() : "did something";
  }
}

export async function getActivityFeed(orgId: string, take = 20): Promise<ActivityFeedItem[]> {
  const logs = await prisma.auditLog.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    take,
    include: { user: { select: { name: true, email: true } } },
  });

  return logs.map((log) => ({
    id: log.id,
    description: `${log.user?.name || log.user?.email || "Someone"} ${describeActivity(log.action, log.metadata)}`,
    time: log.createdAt.toISOString(),
  }));
}

export async function recordActivity({
  orgId,
  userId,
  action,
  target,
  metadata,
}: {
  orgId?: string | null;
  userId?: string | null;
  action: string;
  target?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: { orgId, userId, action, target, metadata },
    });
  } catch (error) {
    console.error("Failed to record activity:", error);
  }
}
