"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bug, FolderOpen, TestTube, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/StatsCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

type TrendPoint = { day: string; score: number };
type ActivityItem = { id: string; type: string; description: string; time: string };
type RepoAnalytics = { bugHotspotData?: Array<{ bugs: number }>; recentActivityData?: ActivityItem[] };

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalProjects: 0, avgQuality: 78, openBugs: 0, testsGenerated: 0 });
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [projectsRes, analyticsRes, repoRes] = await Promise.all([fetch("/api/projects"), fetch("/api/analytics"), fetch("/api/repo-analytics")]);
        const projects = (await projectsRes.json()) as Array<{ id: string }>;
        const analytics = (await analyticsRes.json()) as TrendPoint[];
        const repo = (await repoRes.json()) as RepoAnalytics;
        if (!mounted) return;
        setMetrics({
          totalProjects: projects.length || 0,
          avgQuality: analytics.length ? Math.round(analytics.reduce((sum, item) => sum + item.score, 0) / analytics.length) : 78,
          openBugs: repo.bugHotspotData?.reduce((sum, item) => sum + item.bugs, 0) ?? 5,
          testsGenerated: 42,
        });
        setTrend(analytics);
        setActivity((repo.recentActivityData ?? []).slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Projects" value={metrics.totalProjects} icon={<FolderOpen size={20} />} iconColor="text-purple-300" trend="+2 this month" loading={loading} />
        <StatsCard title="Avg Quality Score" value={`${metrics.avgQuality}/100`} icon={<TrendingUp size={20} />} iconColor="text-blue-300" trend="+5 from last week" loading={loading} />
        <StatsCard title="Open Bugs" value={metrics.openBugs} icon={<Bug size={20} />} iconColor="text-rose-300" trend="-3 from last week" trendUp={false} loading={loading} />
        <StatsCard title="Tests Generated" value={metrics.testsGenerated} icon={<TestTube size={20} />} iconColor="text-emerald-300" trend="+12 this month" loading={loading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card>
          <h2 className="text-xl font-semibold">Code Quality Trend</h2>
          <div className="mt-6 h-[320px]">
            {loading ? <LoadingSkeleton lines={8} height="h-8" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="quality-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7568ff" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#7568ff" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: "#08101d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} />
                  <Area type="monotone" dataKey="score" stroke="#8d83ff" fill="url(#quality-gradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <div className="mt-5 space-y-3">
            {loading ? <LoadingSkeleton lines={5} height="h-16" /> : activity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm font-medium">{item.description}</p>
                <p className="mt-1 text-xs text-slate-400">{item.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/code-review" className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-4 py-4 text-sm font-semibold text-purple-200">Review Code</Link>
          <Link href="/dashboard/bugs" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-sm font-semibold text-rose-200">Find Bugs</Link>
          <Link href="/dashboard/docs" className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-4 text-sm font-semibold text-blue-200">Generate Docs</Link>
          <Link href="/dashboard/tests" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm font-semibold text-emerald-200">Create Tests</Link>
        </div>
      </Card>
    </div>
  );
}
