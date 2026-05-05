import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireWorkspace } from "@/lib/server/projects";
import { recordActivity } from "@/lib/server/activity";

export async function GET() {
  const workspace = await requireWorkspace();
  if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

  const projects = await prisma.project.findMany({
    where: { orgId: workspace.org.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, repoUrl: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const workspace = await requireWorkspace();
  if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const repoUrl = typeof body.repoUrl === "string" ? body.repoUrl.trim() : "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      repoUrl: repoUrl || null,
      userId: workspace.userId,
      orgId: workspace.org.id,
    },
    select: { id: true, name: true, repoUrl: true, createdAt: true, updatedAt: true },
  });

  await recordActivity({
    orgId: workspace.org.id,
    userId: workspace.userId,
    action: "PROJECT_CREATED",
    target: project.id,
    metadata: { name: project.name, repoUrl: project.repoUrl },
  });

  return NextResponse.json(project, { status: 201 });
}
