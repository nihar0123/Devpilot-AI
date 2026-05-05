import { NextRequest, NextResponse } from "next/server";
import { generateDocs } from "@/lib/ai/docsGenerator";
import { prisma } from "@/lib/db/prisma";
import { recordActivity } from "@/lib/server/activity";
import { getProjectForOrg, requireWorkspace } from "@/lib/server/projects";

export async function POST(req: NextRequest) {
  try {
    const workspace = await requireWorkspace();
    if ("error" in workspace) return NextResponse.json({ error: workspace.error }, { status: workspace.status });

    const { code, projectName, docTypes, projectId } = await req.json();
    if (!code || code.trim().length < 10) {
      return NextResponse.json({ error: "Please provide valid code to analyze" }, { status: 400 });
    }

    const result = await generateDocs(code, projectName || "DevPilot AI", docTypes || ["readme"]);
    let savedDocumentationId: string | null = null;

    if (typeof projectId === "string" && projectId) {
      const project = await getProjectForOrg(projectId, workspace.org.id);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      const docs = await prisma.documentation.create({
        data: {
          projectId: project.id,
          readme: result.readme,
          setupGuide: result.setupGuide,
          apiDocs: result.apiDocs,
          moduleSummary: result.moduleSummary,
        },
      });
      savedDocumentationId = docs.id;

      await recordActivity({
        orgId: workspace.org.id,
        userId: workspace.userId,
        action: "AI_DOCS_SAVED",
        target: docs.id,
        metadata: { projectId: project.id, docTypes: docTypes || ["readme"] },
      });
    }

    return NextResponse.json({ ...result, savedDocumentationId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
