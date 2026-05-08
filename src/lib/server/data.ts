import { prisma } from "@/lib/db/prisma";
import { bugHotspotData, commitActivityData, heatmapData, leaderboardData, qualityTrendData, radarData, recentActivityData, sprintProgressData } from "@/lib/demoData";
import { describeActivity, getActivityFeed } from "@/lib/server/activity";

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

export async function getDashboardMetrics(orgId?: string) {
  try {
    const analysisWhere = orgId ? { project: { orgId } } : undefined;
    const bugWhere = orgId ? { project: { orgId } } : undefined;
    const [projects, analyses, bugReports, tests] = await Promise.all([
      prisma.project.count(orgId ? { where: { orgId } } : undefined),
      prisma.codeAnalysis.findMany({ where: analysisWhere, select: { score: true } }),
      prisma.bugReport.findMany({ where: bugWhere, select: { severity: true } }),
      prisma.testSuite.count(orgId ? { where: { project: { orgId } } } : undefined),
    ]);

    const avgQuality = analyses.length ? Math.round(analyses.reduce((sum, item) => sum + item.score, 0) / analyses.length) : 78;
    const openBugs = bugReports.filter((bug) => ["high", "critical"].includes(bug.severity.toLowerCase())).length;
    return { totalProjects: projects, avgQuality, openBugs, testsGenerated: tests };
  } catch {
    return { totalProjects: 3, avgQuality: 78, openBugs: 5, testsGenerated: 42 };
  }
}

export async function getOverviewTrend(orgId?: string) {
  try {
    const analyses = await prisma.codeAnalysis.findMany({
      where: orgId ? { project: { orgId } } : undefined,
      orderBy: { createdAt: "desc" },
      take: 7,
      select: { score: true, createdAt: true },
    });
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

export async function getDashboardOverview(orgId: string) {
  const [metrics, trend, activity] = await Promise.all([
    getDashboardMetrics(orgId),
    getOverviewTrend(orgId),
    getActivityFeed(orgId, 5),
  ]);

  return { metrics, trend, activity };
}

export async function getTeamOverview(orgId: string) {
  const [members, invites, tasks, activityLogs] = await Promise.all([
    prisma.organizationMember.findMany({
      where: { orgId },
      orderBy: { joinedAt: "asc" },
      select: {
        id: true,
        userId: true,
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.teamInvite.findMany({
      where: { orgId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, createdAt: true, expiresAt: true, status: true, token: true },
    }),
    prisma.task.findMany({
      where: { orgId },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        status: true,
        projectId: true,
        createdById: true,
        completedById: true,
        assignee: { select: { name: true, email: true } },
        completedBy: { select: { name: true, email: true } },
      },
    }),
    prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const completedCounts = new Map<string, number>();
  const createdCounts = new Map<string, number>();
  for (const task of tasks) {
    if (task.completedById) completedCounts.set(task.completedById, (completedCounts.get(task.completedById) ?? 0) + 1);
    createdCounts.set(task.createdById, (createdCounts.get(task.createdById) ?? 0) + 1);
  }

  const activityCounts = new Map<string, number>();
  for (const log of activityLogs) {
    if (log.userId) activityCounts.set(log.userId, (activityCounts.get(log.userId) ?? 0) + 1);
  }

  const leaderboard = members
    .map((member) => {
      const completed = completedCounts.get(member.userId) ?? 0;
      const created = createdCounts.get(member.userId) ?? 0;
      const activity = activityCounts.get(member.userId) ?? 0;
      return {
        id: member.userId,
        name: member.user.name || member.user.email?.split("@")[0] || "Unknown User",
        role: member.role,
        score: completed * 25 + created * 10 + activity * 5,
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 5);

  return {
    members: members.map((member) => ({
      id: member.id,
      userId: member.userId,
      name: member.user.name || member.user.email?.split("@")[0] || "Unknown User",
      email: member.user.email,
      role: member.role,
      status: "Active",
    })),
    invites: invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      sentAt: invite.createdAt.toISOString().split("T")[0],
      expiresAt: invite.expiresAt.toISOString().split("T")[0],
      inviteUrl: `${process.env.APP_URL || "https://devpilotai.dev"}/invite/${invite.token}`,
      status: invite.status,
    })),
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      assignee: task.assignee,
      completedBy: task.completedBy,
      projectId: task.projectId,
    })),
    activity: activityLogs.map((log) => ({
      id: log.id,
      description: `${log.user?.name || log.user?.email || "Someone"} ${describeActivity(log.action, log.metadata)}`,
      time: log.createdAt.toISOString(),
    })),
    leaderboard,
  };
}

export async function getInviteByToken(token: string) {
  return DEMO_INVITES.find((item) => item.token === token) ?? null;
}
