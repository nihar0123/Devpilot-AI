import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireWorkspace } from "@/lib/server/projects";

function describeActivity(action: string, metadata: unknown) {
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
      return action.replaceAll("_", " ").toLowerCase();
  }
}

export async function GET() {
  const workspace = await requireWorkspace();
  if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

  const logs = await prisma.auditLog.findMany({
    where: { orgId: workspace.org.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json(logs.map((log) => ({
    id: log.id,
    description: `${log.user?.name || log.user?.email || "Someone"} ${describeActivity(log.action, log.metadata)}`,
    time: log.createdAt.toLocaleString(),
  })));
}
