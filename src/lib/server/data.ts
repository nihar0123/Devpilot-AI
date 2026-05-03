import { prisma } from "@/lib/db/prisma";
import { bugHotspotData, commitActivityData, heatmapData, leaderboardData, qualityTrendData, radarData, recentActivityData, sprintProgressData } from "@/lib/demoData";

const DEMO_MEMBERS = [
  { id: "member-1", name: "Nihar Sharma", email: "nihar@devpilot.ai", role: "OWNER", status: "Active" },
  { id: "member-2", name: "Aarav Mehta", email: "aarav@devpilot.ai", role: "ADMIN", status: "Active" },
  { id: "member-3", name: "Sana Patel", email: "sana@devpilot.ai", role: "MEMBER", status: "Active" },
  { id: "member-4", name: "Maya Singh", email: "maya@devpilot.ai", role: "VIEWER", status: "Pending" },
];

const DEMO_INVITES = [
  { id: "invite-1", email: "newhire@devpilot.ai", role: "MEMBER", sentAt: "2 days ago", expiresAt: "in 5 days", inviteUrl: "https://devpilotai.dev/invite/demo-member", token: "demo-member", status: "PENDING" },
  { id: "invite-2", email: "designer@devpilot.ai", role: "VIEWER", sentAt: "6 hours ago", expiresAt: "in 6 days", inviteUrl: "https://devpilotai.dev/invite/demo-viewer", token: "demo-viewer", status: "PENDING" },
];

export async function getProjects() {
  try {
    return await prisma.project.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, repoUrl: true, createdAt: true } });
  } catch {
    return [
      { id: "project-1", name: "API Gateway", repoUrl: "https://github.com/devpilot/api-gateway", createdAt: new Date().toISOString() },
      { id: "project-2", name: "Dashboard Web", repoUrl: "https://github.com/devpilot/dashboard", createdAt: new Date().toISOString() },
      { id: "project-3", name: "CLI Tools", repoUrl: "https://github.com/devpilot/cli", createdAt: new Date().toISOString() },
    ];
  }
}

export async function getDashboardMetrics() {
  try {
    const [projects, analyses, bugReports, tests] = await Promise.all([
      prisma.project.count(),
      prisma.codeAnalysis.findMany({ select: { score: true } }),
      prisma.bugReport.findMany({ select: { severity: true } }),
      prisma.testSuite.count(),
    ]);

    const avgQuality = analyses.length ? Math.round(analyses.reduce((sum, item) => sum + item.score, 0) / analyses.length) : 78;
    const openBugs = bugReports.filter((bug) => ["high", "critical"].includes(bug.severity.toLowerCase())).length;
    return { totalProjects: projects, avgQuality, openBugs, testsGenerated: tests };
  } catch {
    return { totalProjects: 3, avgQuality: 78, openBugs: 5, testsGenerated: 42 };
  }
}

export async function getOverviewTrend() {
  try {
    const analyses = await prisma.codeAnalysis.findMany({ orderBy: { createdAt: "desc" }, take: 7, select: { score: true, createdAt: true } });
    if (!analyses.length) throw new Error("No data");
    return analyses.reverse().map((entry) => ({ day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(entry.createdAt), score: entry.score }));
  } catch {
    return qualityTrendData.slice(-7).map((entry, index) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index], score: entry.score }));
  }
}

export async function getRecentActivity() {
  return recentActivityData.slice(0, 5);
}

export async function getRepoAnalytics() {
  return {
    metrics: { totalCommits: 1247, prsMerged: 89, avgReviewTime: "4.2 hours", qualityScore: "78/100" },
    commitActivityData,
    qualityTrendData,
    heatmapData,
    bugHotspotData,
    radarData,
  };
}

export async function getTeamData() {
  return { members: DEMO_MEMBERS, invites: DEMO_INVITES, leaderboard: leaderboardData, sprint: sprintProgressData, activity: recentActivityData };
}

export async function getInviteByToken(token: string) {
  return DEMO_INVITES.find((item) => item.token === token) ?? null;
}
