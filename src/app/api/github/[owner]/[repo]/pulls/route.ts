import { NextResponse, NextRequest } from "next/server";
import { listPullRequests } from "@/lib/github/prs-issues";

export async function GET(request: NextRequest, context: any) {
  const params = await context.params;
  const owner = params.owner;
  const repo = params.repo;
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "20", 10);
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GitHub token not configured. Please set GITHUB_TOKEN in your environment variables." }, { status: 500 });
  }
  try {
    const data = await listPullRequests(owner, repo, { state, page, perPage }, token);
    return NextResponse.json(data);
  } catch (error: any) {
    const msg = error.message || "Unknown error";
    if (msg.includes("404")) {
      return NextResponse.json({ error: `Repository ${owner}/${repo} not found. Check the repo URL is correct.` }, { status: 404 });
    }
    if (msg.includes("403")) {
      return NextResponse.json({ error: "GitHub API rate limit exceeded or token lacks permissions. Check your GITHUB_TOKEN." }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
