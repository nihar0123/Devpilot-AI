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
  try {
    const data = await listPullRequests(owner, repo, { state, page, perPage }, token);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
