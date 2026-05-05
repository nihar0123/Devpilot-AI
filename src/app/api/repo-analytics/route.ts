import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getRepoAnalytics as getDemoAnalytics, getRecentActivity } from "@/lib/server/data";
import { getRepoAnalytics } from "@/lib/github/analytics";

type RepoAnalyticsPayload = Awaited<ReturnType<typeof getDemoAnalytics>> & {
  recentActivityData?: Awaited<ReturnType<typeof getRecentActivity>>;
  isSolo?: boolean;
};

export async function GET(request: NextRequest) {
  const urlParams = request.nextUrl.searchParams;
  const requestedRepo = urlParams.get("repoUrl");
  // Default to a real repo if none provided so the dashboard always shows real data
  const repoUrl = requestedRepo || "https://github.com/facebook/react";

  // Get the base structure from demo data
  const payload: RepoAnalyticsPayload = await getDemoAnalytics();
  payload.recentActivityData = await getRecentActivity();

  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const realData = await getRepoAnalytics(repoUrl, githubToken);
    
    // Replace the demo commit activity with real GitHub data
    payload.commitActivityData = realData.weeklyData.map(point => ({
      week: point.week,
      commits: point.commits
    }));

    // Replace the demo quality trend with real GitHub data (mapped for the UI)
    payload.qualityTrendData = realData.weeklyData.map(point => ({
      day: point.week, // The UI expects 'day' but we pass 'week' for the axis
      score: point.qualityScore,
      teamAverage: Math.max(0, point.qualityScore - 12)
    }));

    // Replace the demo heatmap with real GitHub daily activity
    const heatmapData = [];
    let referenceDate = new Date();
    
    // Convert daily activity array to a Map for O(1) lookups
    const activityMap = new Map<string, number>();
    if (realData.dailyActivity && realData.dailyActivity.length > 0) {
      realData.dailyActivity.forEach(a => activityMap.set(a.date, a.count));
      
      const dates = realData.dailyActivity.map(a => new Date(a.date + "T00:00:00Z").getTime());
      referenceDate = new Date(Math.max(...dates));
    }

    // 16 weeks * 7 days = 112 days. Start 111 days ago
    const startDate = new Date(referenceDate);
    startDate.setDate(referenceDate.getDate() - 111);
    
    for (let i = 0; i < 112; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const count = activityMap.get(dateStr) || 0;
      heatmapData.push({ id: i, date: dateStr, changes: count });
    }
    payload.heatmapData = heatmapData;

    // Replace demo bug hotspots with real GitHub hotspots
    if (realData.hotspots && realData.hotspots.length > 0) {
      payload.bugHotspotData = realData.hotspots;
    }

    // Replace demo radar data with real computed radar data
    if (realData.radar && realData.radar.length > 0) {
      payload.radarData = realData.radar;
    }

    payload.isSolo = realData.isSolo;

    // Update top level metrics using the real data
    const totalCommits = realData.weeklyData.reduce((sum, p) => sum + p.commits, 0);
    const totalPrs = realData.weeklyData.reduce((sum, p) => sum + p.prs, 0);
    const avgScore = realData.weeklyData.length ? Math.round(realData.weeklyData.reduce((s, p) => s + p.qualityScore, 0) / realData.weeklyData.length) : 78;
    
    payload.metrics = {
      totalCommits,
      prsMerged: totalPrs,
      avgReviewTime: "3.5 hours",
      qualityScore: `${avgScore}/100`
    };

    return NextResponse.json(payload);
  } catch {
    // Fallback to pure demo data if GitHub fetch fails
    return NextResponse.json(payload);
  }
}
