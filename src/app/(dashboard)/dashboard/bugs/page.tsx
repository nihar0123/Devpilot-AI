"use client";

import { useMemo, useState } from "react";
import { Bug, ChevronDown, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { CodeInput } from "@/components/ui/CodeInput";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { useProjects } from "@/components/projects/project-provider";

type BugItem = {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  fileName?: string;
  line?: number;
  codeContext?: string;
  suggestedFix: string;
};

type BugResult = {
  totalBugs: number;
  severityBreakdown: { critical: number; high: number; medium: number; low: number };
  bugs: BugItem[];
  savedBugIds?: string[];
};

export default function BugFinderPage() {
  const { selectedProject } = useProjects();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [result, setResult] = useState<BugResult | null>(null);

  const filteredBugs = useMemo(() => {
    if (!result?.bugs) return [];
    return filter === "all" ? result.bugs : result.bugs.filter((bug) => bug.severity === filter);
  }, [result, filter]);

  async function analyze() {
    try {
      setLoading(true);
      const res = await fetch("/api/bug-finder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, language, projectId: selectedProject?.id }) });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as BugResult;
      setResult(data);
      toast.success(data.savedBugIds?.length ? `Saved ${data.savedBugIds.length} bugs to ${selectedProject?.name}` : "Bug scan complete");
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function createTaskFromBug(bug: BugItem, index: number) {
    if (!selectedProject) {
      toast.error("Connect a project first");
      return;
    }
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProject.id,
        title: bug.title,
        description: `${bug.description}\n\nSuggested fix: ${bug.suggestedFix}`,
        priority: bug.severity === "critical" ? "URGENT" : bug.severity === "high" ? "HIGH" : bug.severity === "low" ? "LOW" : "MEDIUM",
        sourceType: "BUG_REPORT",
        sourceId: result?.savedBugIds?.[index],
      }),
    });
    if (!res.ok) {
      toast.error("Could not create task");
      return;
    }
    toast.success("Task created from bug");
  }

  function exportReport() {
    if (!result) return;
    const grouped = ["critical", "high", "medium", "low"].map((severity) => ({ severity, bugs: result.bugs.filter((bug) => bug.severity === severity) }));
    const markdown = [`# Bug Report - ${new Date().toLocaleDateString()}`, ``, `## Summary: ${result.totalBugs} bugs found`, ``];
    grouped.forEach((group) => {
      markdown.push(`### ${group.severity.charAt(0).toUpperCase() + group.severity.slice(1)} Issues`);
      group.bugs.forEach((bug) => markdown.push(`- **${bug.title}**: ${bug.description}`));
      markdown.push("");
    });
    const blob = new Blob([markdown.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bug-report-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="mb-5 text-2xl font-semibold">Bug Finder</h1>
        <p className="mb-4 text-sm text-slate-400">Saving into: {selectedProject?.name ?? "connect a project in the top bar"}</p>
        <CodeInput value={code} onChange={setCode} language={language} onLanguageChange={setLanguage} onAnalyze={analyze} isLoading={loading} analyzeLabel="Find Bugs" />
      </Card>

      <Card>
        {!result && !loading ? <div className="flex min-h-[240px] flex-col items-center justify-center text-center text-slate-400"><Bug size={34} className="mb-4" />No bugs found yet<div className="mt-2 text-sm">Paste your code above to start analyzing</div></div> : null}
        {loading ? <LoadingSkeleton lines={8} height="h-8" /> : null}
        {result ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Found {result.totalBugs} bugs</h2>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-red-500/15 px-3 py-1 text-red-300">{result.severityBreakdown.critical} Critical</span>
                  <span className="rounded-full bg-orange-500/15 px-3 py-1 text-orange-300">{result.severityBreakdown.high} High</span>
                  <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-yellow-300">{result.severityBreakdown.medium} Medium</span>
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-blue-300">{result.severityBreakdown.low} Low</span>
                </div>
              </div>
              <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold" onClick={exportReport}><FileDown size={16} /> Export Report</button>
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", "critical", "high", "medium", "low"].map((item) => <button key={item} type="button" className={`rounded-full px-3 py-1 text-xs ${filter === item ? "bg-white text-slate-900" : "border border-white/10 bg-white/5 text-slate-300"}`} onClick={() => setFilter(item as typeof filter)}>{item}</button>)}
            </div>

            <div className="space-y-4">
              {filteredBugs.map((bug) => {
                const open = expandedId === bug.id;
                const bugIndex = result.bugs.findIndex((item) => item.id === bug.id);
                return (
                  <div key={bug.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                    <button type="button" className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setExpandedId(open ? null : bug.id)}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 h-12 w-1 rounded-full ${bug.severity === "critical" ? "bg-red-400" : bug.severity === "high" ? "bg-orange-400" : bug.severity === "medium" ? "bg-yellow-400" : "bg-blue-400"}`} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2"><SeverityBadge severity={bug.severity} /><span className="font-semibold">{bug.title}</span></div>
                          <p className="mt-2 text-xs text-slate-500">{bug.fileName ?? "snippet"}{bug.line ? `:${bug.line}` : ""}</p>
                        </div>
                      </div>
                      <ChevronDown className={`transition ${open ? "rotate-180" : ""}`} size={18} />
                    </button>
                    {open ? (
                      <div className="space-y-4 border-t border-white/10 px-5 py-5 text-sm text-slate-300">
                        <p>{bug.description}</p>
                        {bug.codeContext ? <pre className="overflow-auto rounded-2xl bg-black/30 p-4 text-xs"><code>{bug.codeContext}</code></pre> : null}
                        <div className="rounded-2xl border-l-4 border-emerald-400 bg-emerald-500/10 p-4 text-emerald-300">Suggested Fix: {bug.suggestedFix}</div>
                        <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold" onClick={() => createTaskFromBug(bug, bugIndex)}>Create task</button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
