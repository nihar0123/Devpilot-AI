import { NextRequest, NextResponse } from "next/server";
import { findBugs } from "@/lib/ai/bugFinder";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/server/activity";
import { getProjectForOrg, requireWorkspace } from "@/lib/server/projects";

export async function POST(req: NextRequest) {
  try {
    const workspace = await requireWorkspace();
    if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

    const { code, language, projectId } = await req.json();
    if (!code || code.trim().length < 10) {
      return NextResponse.json({ error: "Please provide valid code to analyze" }, { status: 400 });
    }

    const result = await findBugs(code, language || "typescript");
    let savedBugIds: string[] = [];

    if (typeof projectId === "string" && projectId) {
      const project = await getProjectForOrg(projectId, workspace.org.id);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const created = await prisma.$transaction(
        result.bugs.map((bug) =>
          prisma.bugReport.create({
            data: {
              projectId: project.id,
              severity: bug.severity,
              title: bug.title,
              description: bug.description,
              fileName: bug.fileName,
              lineNumber: bug.line,
              codeContext: bug.codeContext,
              suggestedFix: bug.suggestedFix,
            },
          }),
        ),
      );
      savedBugIds = created.map((bug) => bug.id);

      await recordActivity({
        orgId: workspace.org.id,
        userId: workspace.userId,
        action: "AI_BUG_REPORT_SAVED",
        target: project.id,
        metadata: { projectId: project.id, bugCount: savedBugIds.length },
      });
    }

    return NextResponse.json({ ...result, savedBugIds });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
