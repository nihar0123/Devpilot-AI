import { NextRequest, NextResponse } from "next/server";
import { analyzeCode } from "@/lib/ai/codeReview";
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

    const result = await analyzeCode(code, language || "typescript");
    let savedAnalysisId: string | null = null;

    if (typeof projectId === "string" && projectId) {
      const project = await getProjectForOrg(projectId, workspace.org.id);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const analysis = await prisma.codeAnalysis.create({
        data: {
          projectId: project.id,
          score: result.score,
          summary: result.summary,
          suggestions: result.issues,
          securityIssues: result.securityRisks,
          refactoredCode: result.refactoredCode,
          language: language || "typescript",
        },
      });
      savedAnalysisId = analysis.id;

      await recordActivity({
        orgId: workspace.org.id,
        userId: workspace.userId,
        action: "AI_CODE_REVIEW_SAVED",
        target: analysis.id,
        metadata: { projectId: project.id, score: result.score, issueCount: result.issues.length },
      });
    }

    return NextResponse.json({ ...result, savedAnalysisId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
