"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatsCard } from "@/components/ui/StatsCard";
import { useProjects } from "@/components/projects/project-provider";

type MetricSummary = { totalCommits: number; prsMerged: number; avgReviewTime: string; qualityScore: string };
type CommitPoint = { week: string; commits: number };
type QualityPoint = { day: string; score: number; teamAverage: number };
type HeatCell = { id: number; date: string; changes: number };
type HotspotRow = { path: string; bugs: number; changes: number; riskLevel: string };
type RadarPoint = { metric: string; you: number; team: number };
type AnalyticsPayload = { metrics: MetricSummary; commitActivityData: CommitPoint[]; qualityTrendData: QualityPoint[]; heatmapData: HeatCell[]; bugHotspotData: HotspotRow[]; radarData: RadarPoint[]; isSolo?: boolean };

export default function RepoAnalyticsPage() {
  const { selectedProject } = useProjects();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [sortDesc, setSortDesc] = useState(true);
  
  const [repoInput, setRepoInput] = useState("");
  const [repoUrl, setRepoUrl] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (repoUrl) params.set("repoUrl", repoUrl);
        if (selectedProject?.id) params.set("projectId", selectedProject.id);
        const url = params.toString() ? `/api/repo-analytics?${params}` : "/api/repo-analytics";
        const res = await fetch(url);
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as AnalyticsPayload;
        if (mounted) setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [repoUrl, selectedProject?.id]);

  const handleRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim()) {
      setLoading(true);
      setRepoUrl(repoInput.trim());
    }
  };

  const analytics = data ?? { metrics: { totalCommits: 1247, prsMerged: 89, avgReviewTime: "4.2 hours", qualityScore: "78/100" }, commitActivityData: [], qualityTrendData: [], heatmapData: [], bugHotspotData: [], radarData: [] };

  const hotspotRows = useMemo(() => {
    const rows = [...analytics.bugHotspotData];
    return rows.sort((a, b) => sortDesc ? b.bugs - a.bugs : a.bugs - b.bugs);
  }, [analytics.bugHotspotData, sortDesc]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">Analyse a GitHub Repository</h2>
            <p className="text-sm text-slate-400">Using {selectedProject?.name ?? "the selected project"} as the cockpit context. Paste a repo URL to override it for this view.</p>
          </div>
        </div>
        <form onSubmit={handleRepoSubmit} className="mt-4 flex gap-3">
          <input
            id="repo-url-input"
            type="url"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="https://github.com/facebook/react"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            id="fetch-repo-btn"
            type="submit"
            disabled={loading || !repoInput.trim()}
            className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Fetch"}
          </button>
          {repoUrl && (
            <button
              id="clear-repo-btn"
              type="button"
              onClick={() => { setLoading(true); setRepoUrl(""); setRepoInput(""); }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              Clear
            </button>
          )}
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Commits" value={analytics.metrics.totalCommits} icon={<span>?</span>} loading={loading} />
        <StatsCard title="PRs Merged" value={analytics.metrics.prsMerged} icon={<span>?</span>} loading={loading} />
        <StatsCard title="Avg Review Time" value={analytics.metrics.avgReviewTime} icon={<span>?</span>} loading={loading} />
        <StatsCard title="Code Quality Score" value={analytics.metrics.qualityScore} icon={<span>?</span>} loading={loading} />
      </div>

      {loading ? <LoadingSkeleton lines={8} height="h-24" /> : (
        <>
          <Card>
            <h2 className="text-xl font-semibold">Commit Activity (Last 12 Weeks) {repoUrl && <span className="text-sm font-normal text-purple-400 ml-2">{repoUrl}</span>}</h2>
            <div className="mt-6 overflow-x-auto"><div className="h-[320px] min-w-[400px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.commitActivityData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" /><XAxis dataKey="week" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#08101d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} /><Bar dataKey="commits" fill="#7568ff" radius={10} /></BarChart></ResponsiveContainer></div></div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <h2 className="text-xl font-semibold">Quality Score Trend</h2>
              <div className="mt-6 overflow-x-auto"><div className="h-[320px] min-w-[400px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.qualityTrendData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" /><XAxis dataKey="day" hide /><YAxis domain={[0, 100]} stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#08101d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} /><Legend /><Line type="monotone" dataKey="score" name="Your score" stroke="#8d83ff" strokeWidth={3} dot={false} />{!analytics.isSolo && <Line type="monotone" dataKey="teamAverage" name="Team average" stroke="#60a5fa" strokeDasharray="6 6" strokeWidth={2} dot={false} />}</LineChart></ResponsiveContainer></div></div>
            </Card>
            <Card>
              <h2 className="text-xl font-semibold">File Change Heatmap</h2>
              <div className="mt-6 overflow-x-auto"><div className="min-w-[400px]"><div className="mb-3 grid grid-cols-7 gap-2 text-xs text-slate-500"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div><div className="grid grid-cols-7 gap-2">{analytics.heatmapData.map((cell) => <div key={cell.id} title={`${cell.changes} changes on ${cell.date}`} className={`h-8 rounded ${cell.changes === 0 ? "bg-white/5" : cell.changes <= 2 ? "bg-purple-900/40" : cell.changes <= 5 ? "bg-purple-700/60" : cell.changes <= 10 ? "bg-purple-500/80" : "bg-purple-400"}`} />)}</div></div></div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Bug Hotspot Files</h2>
              <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm" onClick={() => setSortDesc((value) => !value)}>Sort by Bugs</button>
            </div>
            <div className="mt-6 overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-slate-400"><tr><th className="pb-3">File Path</th><th className="pb-3">Bugs</th><th className="pb-3">Changes</th><th className="pb-3">Risk Level</th></tr></thead><tbody>{hotspotRows.map((row) => <tr key={row.path} className="border-t border-white/10"><td className="py-3">{row.path}</td><td>{row.bugs}</td><td>{row.changes}</td><td><span className={`rounded-full px-3 py-1 text-xs ${row.riskLevel === "Critical" ? "bg-red-500/15 text-red-300" : row.riskLevel === "High" ? "bg-orange-500/15 text-orange-300" : row.riskLevel === "Medium" ? "bg-yellow-500/15 text-yellow-300" : "bg-emerald-500/15 text-emerald-300"}`}>{row.riskLevel}</span></td></tr>)}</tbody></table></div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold">{analytics.isSolo ? "Your Productivity Radar" : "Team Productivity Radar"}</h2>
            <div className="mt-6 overflow-x-auto"><div className="h-[340px] min-w-[400px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={analytics.radarData}><PolarGrid stroke="rgba(255,255,255,0.16)" /><PolarAngleAxis dataKey="metric" stroke="#cbd5e1" /><PolarRadiusAxis stroke="#64748b" /><Radar dataKey="you" name="You" stroke="#8d83ff" fill="#8d83ff" fillOpacity={0.35} />{!analytics.isSolo && <Radar dataKey="team" name="Team Avg" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} />}<Legend /><Tooltip contentStyle={{ background: "#08101d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} /></RadarChart></ResponsiveContainer></div></div>
          </Card>
        </>
      )}
    </div>
  );
}
