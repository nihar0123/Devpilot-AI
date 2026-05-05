import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/server/activity";
import { getProjectForOrg, requireWorkspace } from "@/lib/server/projects";

const STATUSES = new Set(["TODO", "IN_PROGRESS", "DONE"]);
const PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);

function serializeTask(task: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string;
  sourceType: string | null;
  sourceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  assignee: { id: string; name: string | null; email: string | null } | null;
  createdBy: { id: string; name: string | null; email: string | null };
  completedBy: { id: string; name: string | null; email: string | null } | null;
}) {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
  };
}

export async function GET(req: NextRequest) {
  const workspace = await requireWorkspace();
  if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

  const projectId = req.nextUrl.searchParams.get("projectId");
  const where = { orgId: workspace.org.id, ...(projectId ? { projectId } : {}) };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      completedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(tasks.map(serializeTask));
}

export async function POST(req: NextRequest) {
  const workspace = await requireWorkspace();
  if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

  const body = await req.json().catch(() => ({}));
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const status = typeof body.status === "string" && STATUSES.has(body.status) ? body.status : "TODO";
  const priority = typeof body.priority === "string" && PRIORITIES.has(body.priority) ? body.priority : "MEDIUM";
  const assigneeId = typeof body.assigneeId === "string" && body.assigneeId ? body.assigneeId : null;

  if (!projectId || !title) {
    return NextResponse.json({ error: "Project and title are required" }, { status: 400 });
  }

  const project = await getProjectForOrg(projectId, workspace.org.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (assigneeId) {
    const assignee = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: workspace.org.id, userId: assigneeId } },
    });
    if (!assignee) return NextResponse.json({ error: "Assignee is not in this workspace" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      orgId: workspace.org.id,
      projectId: project.id,
      title,
      description: description || null,
      status,
      priority,
      assigneeId,
      createdById: workspace.userId,
      sourceType: typeof body.sourceType === "string" ? body.sourceType : null,
      sourceId: typeof body.sourceId === "string" ? body.sourceId : null,
      ...(status === "DONE" ? { completedById: workspace.userId, completedAt: new Date() } : {}),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      completedBy: { select: { id: true, name: true, email: true } },
    },
  });

  await recordActivity({
    orgId: workspace.org.id,
    userId: workspace.userId,
    action: "TASK_CREATED",
    target: task.id,
    metadata: { projectId: project.id, title: task.title, assigneeId },
  });

  return NextResponse.json(serializeTask(task), { status: 201 });
}
