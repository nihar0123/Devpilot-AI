import { NextResponse, NextRequest } from "next/server";
import { getPullRequest, listPRComments, commentOnPR, mergePR, closePR } from "@/lib/github/prs-issues";

export async function GET(request: NextRequest, context: any) {
  const params = await context.params;
  const owner = params.owner;
  const repo = params.repo;
  const number = parseInt(params.number, 10);
  
  const token = process.env.GITHUB_TOKEN;
  try {
    const [pr, comments] = await Promise.all([
      getPullRequest(owner, repo, number, token),
      listPRComments(owner, repo, number, token)
    ]);
    return NextResponse.json({ pr, comments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: any) {
  const params = await context.params;
  const owner = params.owner;
  const repo = params.repo;
  const number = parseInt(params.number, 10);
  
  const token = process.env.GITHUB_TOKEN;
  try {
    const body = await request.json();
    const action = body.action;
    
    if (action === "comment") {
      const res = await commentOnPR(owner, repo, number, body.body, token);
      return NextResponse.json(res);
    } else if (action === "merge") {
      const res = await mergePR(owner, repo, number, body.method, token);
      return NextResponse.json(res);
    } else if (action === "close") {
      const res = await closePR(owner, repo, number, token);
      return NextResponse.json(res);
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
