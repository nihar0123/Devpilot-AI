import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/server/activity";
import { getProjectForOrg, requireWorkspace } from "@/lib/server/projects";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const workspace = await requireWorkspace();
  if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

  const { projectId } = await params;
  const project = await getProjectForOrg(projectId, workspace.org.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const repoUrl = typeof body.repoUrl === "string" ? body.repoUrl.trim() : undefined;

  if (name !== undefined && name.length < 2) {
    return NextResponse.json({ error: "Project name is too short" }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: {
      ...(name !== undefined && { name }),
      ...(repoUrl !== undefined && { repoUrl: repoUrl || null }),
    },
    select: { id: true, name: true, repoUrl: true, archived: true, createdAt: true, updatedAt: true },
  });

  await recordActivity({
    orgId: workspace.org.id,
    userId: workspace.userId,
    action: "PROJECT_UPDATED",
    target: updated.id,
    metadata: { name: updated.name, repoUrl: updated.repoUrl },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const workspace = await requireWorkspace();
  if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

  const { projectId } = await params;
  const project = await getProjectForOrg(projectId, workspace.org.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  await prisma.project.update({
    where: { id: project.id },
    data: { archived: true, archivedAt: new Date() },
  });

  await recordActivity({
    orgId: workspace.org.id,
    userId: workspace.userId,
    action: "PROJECT_ARCHIVED",
    target: project.id,
    metadata: { name: project.name },
  });

  return NextResponse.json({ success: true });
}
