import { NextRequest, NextResponse } from "next/server";
import { generateUnitTests } from "@/lib/ai/testGenerator";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/server/activity";
import { getProjectForOrg, requireWorkspace } from "@/lib/server/projects";

export async function POST(req: NextRequest) {
  try {
    const workspace = await requireWorkspace();
    if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

    const { code, language, framework, projectId } = await req.json();
    if (!code || code.trim().length < 10) {
      return NextResponse.json({ error: "Please provide valid code to analyze" }, { status: 400 });
    }

    const result = await generateUnitTests(code, language || "typescript", framework || "jest");
    let savedTestSuiteId: string | null = null;

    if (typeof projectId === "string" && projectId) {
      const project = await getProjectForOrg(projectId, workspace.org.id);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const suite = await prisma.testSuite.create({
        data: {
          projectId: project.id,
          language: language || "typescript",
          framework: framework || "jest",
          generatedCode: result.testCode,
          testCount: result.testCount,
          edgeCaseCount: result.edgeCaseCount,
          mockCount: result.mockCount,
        },
      });
      savedTestSuiteId = suite.id;

      await recordActivity({
        orgId: workspace.org.id,
        userId: workspace.userId,
        action: "AI_TESTS_SAVED",
        target: suite.id,
        metadata: { projectId: project.id, testCount: result.testCount },
      });
    }

    return NextResponse.json({ ...result, savedTestSuiteId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
