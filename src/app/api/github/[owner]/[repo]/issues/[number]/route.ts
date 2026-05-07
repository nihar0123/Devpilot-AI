import { NextResponse, NextRequest } from "next/server";
import { getIssue, listIssueComments, commentOnIssue, closeIssue, reopenIssue, assignIssue, addLabelsToIssue } from "@/lib/github/prs-issues";

export async function GET(request: NextRequest, context: any) {
  const params = await context.params;
  const owner = params.owner;
  const repo = params.repo;
  const number = parseInt(params.number, 10);
  
  const token = process.env.GITHUB_TOKEN;
  try {
    const [issue, comments] = await Promise.all([
      getIssue(owner, repo, number, token),
      listIssueComments(owner, repo, number, token)
    ]);
    return NextResponse.json({ issue, comments });
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
      const res = await commentOnIssue(owner, repo, number, body.body, token);
      return NextResponse.json(res);
    } else if (action === "close") {
      const res = await closeIssue(owner, repo, number, token);
      return NextResponse.json(res);
    } else if (action === "reopen") {
      const res = await reopenIssue(owner, repo, number, token);
      return NextResponse.json(res);
    } else if (action === "assign") {
      const res = await assignIssue(owner, repo, number, body.assignees, token);
      return NextResponse.json(res);
    } else if (action === "label") {
      const res = await addLabelsToIssue(owner, repo, number, body.labels, token);
      return NextResponse.json(res);
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
