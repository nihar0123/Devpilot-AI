import { NextRequest, NextResponse } from "next/server";
import { generateUnitTests } from "@/lib/ai/testGenerator";
import { requireApiSession } from "@/lib/auth/api";

export async function POST(req: NextRequest) {
  try {
    await requireApiSession();
    const { code, language, framework } = await req.json();
    if (!code || code.trim().length < 10) {
      return NextResponse.json({ error: "Please provide valid code to analyze" }, { status: 400 });
    }
    return NextResponse.json(await generateUnitTests(code, language || "typescript", framework || "jest"));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
