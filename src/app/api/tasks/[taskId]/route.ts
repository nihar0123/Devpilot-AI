import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/server/activity";
import { requireWorkspace } from "@/lib/server/projects";

const STATUSES = new Set(["TODO", "IN_PROGRESS", "DONE"]);
const PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const workspace = await requireWorkspace();
  if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

  const { taskId } = await params;
  const existing = await prisma.task.findFirst({ where: { id: taskId, orgId: workspace.org.id } });
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const nextStatus = typeof body.status === "string" && STATUSES.has(body.status) ? body.status : undefined;
  const nextPriority = typeof body.priority === "string" && PRIORITIES.has(body.priority) ? body.priority : undefined;
  const nextAssigneeId = body.assigneeId === null ? null : typeof body.assigneeId === "string" ? body.assigneeId : undefined;
  
  let nextDeadline: Date | null | undefined = undefined;
  if (body.deadline === null) nextDeadline = null;
  else if (typeof body.deadline === "string") {
    const parsed = new Date(body.deadline);
    if (!isNaN(parsed.getTime())) nextDeadline = parsed;
  }

  if (nextAssigneeId) {
    const assignee = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: workspace.org.id, userId: nextAssigneeId } },
    });
    if (!assignee) return NextResponse.json({ error: "Assignee is not in this workspace" }, { status: 400 });
  }

  const completedNow = nextStatus === "DONE" && existing.status !== "DONE";
  const reopened = nextStatus && nextStatus !== "DONE";

  const updated = await prisma.task.update({
    where: { id: existing.id },
    data: {
      ...(typeof body.title === "string" && { title: body.title.trim() }),
      ...(typeof body.description === "string" && { description: body.description.trim() || null }),
      ...(nextStatus && { status: nextStatus }),
      ...(nextPriority && { priority: nextPriority }),
      ...(nextAssigneeId !== undefined && { assigneeId: nextAssigneeId }),
      ...(nextDeadline !== undefined && { deadline: nextDeadline }),
      ...(completedNow && { completedById: workspace.userId, completedAt: new Date() }),
      ...(reopened && { completedById: null, completedAt: null }),
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
    action: completedNow ? "TASK_COMPLETED" : "TASK_UPDATED",
    target: updated.id,
    metadata: { title: updated.title, status: updated.status, assigneeId: updated.assigneeId, priority: updated.priority },
  });

  return NextResponse.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    deadline: updated.deadline?.toISOString() ?? null,
    completedAt: updated.completedAt?.toISOString() ?? null,
  });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const workspace = await requireWorkspace();
  if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

  const { taskId } = await params;
  const deleted = await prisma.task.deleteMany({ where: { id: taskId, orgId: workspace.org.id } });
  if (!deleted.count) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await recordActivity({
    orgId: workspace.org.id,
    userId: workspace.userId,
    action: "TASK_DELETED",
    target: taskId,
  });

  return NextResponse.json({ success: true, taskId });
}
