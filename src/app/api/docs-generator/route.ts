import { NextRequest, NextResponse } from "next/server";
import { generateDocs } from "@/lib/ai/docsGenerator";
import { requireApiSession } from "@/lib/auth/api";

export async function POST(req: NextRequest) {
  try {
    await requireApiSession();
    const { code, projectName, docTypes } = await req.json();
    if (!code || code.trim().length < 10) {
      return NextResponse.json({ error: "Please provide valid code to analyze" }, { status: 400 });
    }
    return NextResponse.json(await generateDocs(code, projectName || "DevPilot AI", docTypes || ["readme"]));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
