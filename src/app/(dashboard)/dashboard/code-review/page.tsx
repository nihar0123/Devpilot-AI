"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { CodeInput } from "@/components/ui/CodeInput";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

type ReviewIssue = {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  snippet?: string;
  suggestedFix: string;
};

type SecurityRisk = {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  cwe?: string;
};

type ReviewResult = {
  score: number;
  summary: string;
  issues: ReviewIssue[];
  refactoredCode: string;
  securityRisks: SecurityRisk[];
};

export default function CodeReviewPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "issues" | "refactored" | "security">("overview");
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [result, setResult] = useState<ReviewResult | null>(null);

  const filteredIssues = useMemo(() => {
    if (!result?.issues) return [];
    return filter === "all" ? result.issues : result.issues.filter((issue) => issue.severity === filter);
  }, [result, filter]);

  async function analyze() {
    try {
      setLoading(true);
      const res = await fetch("/api/code-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, language }) });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as ReviewResult;
      setResult(data);
      toast.success(`Analysis complete! Score: ${data.score}/100`);
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h1 className="mb-5 text-2xl font-semibold">AI Code Review</h1>
        <CodeInput value={code} onChange={setCode} language={language} onLanguageChange={setLanguage} onAnalyze={analyze} isLoading={loading} analyzeLabel="Analyze Code" />
      </Card>

      <Card>
        {!result && !loading ? <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-400">Run an analysis to see scoring, issues, refactors, and security guidance.</div> : null}
        {loading ? <LoadingSkeleton lines={10} height="h-8" /> : null}
        {result ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-between gap-6 xl:flex-row">
              <ScoreCircle score={result.score} />
              <div className="flex-1">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Review Summary</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{result.summary}</p>
              </div>
            </div>

            <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 text-sm">
              {["overview", "issues", "refactored", "security"].map((item) => (
                <button key={item} type="button" className={`rounded-xl px-4 py-2 ${tab === item ? "bg-white text-slate-900" : "text-slate-300"}`} onClick={() => setTab(item as typeof tab)}>
                  {item === "issues" ? `Issues (${result.issues.length})` : item === "refactored" ? "Refactored Code" : item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            {tab === "overview" ? (
              <div className="space-y-4">
                {result.issues.slice(0, 4).map((issue) => (
                  <div key={issue.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    {issue.severity === "low" ? <CheckCircle2 className="mt-0.5 text-emerald-300" size={18} /> : <AlertTriangle className="mt-0.5 text-amber-300" size={18} />}
                    <div>
                      <p className="font-medium">{issue.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === "issues" ? (
              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {["all", "critical", "high", "medium", "low"].map((item) => (
                    <button key={item} type="button" className={`rounded-full px-3 py-1 text-xs ${filter === item ? "bg-white text-slate-900" : "border border-white/10 bg-white/5 text-slate-300"}`} onClick={() => setFilter(item as typeof filter)}>{item}</button>
                  ))}
                </div>
                <div className="space-y-4">
                  {filteredIssues.length ? filteredIssues.map((issue) => (
                    <div key={issue.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold">{issue.title}</h3>
                        <SeverityBadge severity={issue.severity} />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{issue.description}</p>
                      {issue.snippet ? <pre className="mt-4 overflow-auto rounded-2xl bg-black/30 p-4 text-xs"><code>{issue.snippet}</code></pre> : null}
                      <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">Suggested Fix: {issue.suggestedFix}</div>
                    </div>
                  )) : <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">No issues found! Great code.</div>}
                </div>
              </div>
            ) : null}

            {tab === "refactored" ? <CodeBlock code={result.refactoredCode} language={language} /> : null}

            {tab === "security" ? (
              <div className="space-y-4">
                {result.securityRisks.length ? result.securityRisks.map((risk) => (
                  <div key={risk.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3"><ShieldAlert className="text-rose-300" size={18} /><h3 className="text-lg font-semibold">{risk.title}</h3></div>
                      <SeverityBadge severity={risk.severity} />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{risk.description}</p>
                    {risk.cwe ? <p className="mt-2 text-xs text-slate-500">{risk.cwe}</p> : null}
                  </div>
                )) : <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">No security issues detected.</div>}
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
