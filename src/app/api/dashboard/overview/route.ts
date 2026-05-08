import { NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/server/projects";
import { getDashboardOverview } from "@/lib/server/data";

export async function GET() {
  const workspace = await requireWorkspace();
  if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

  return NextResponse.json(await getDashboardOverview(workspace.org.id));
}