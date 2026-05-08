"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { parseRepo } from "@/lib/github/analytics";
import { GitHubIssue } from "@/lib/github/prs-issues";
import { StatusBadge, LabelChip, timeAgo, EmptyState, Spinner } from "@/components/github/GithubShared";
import { DetailDrawer } from "@/components/github/DetailDrawer";
import { useProjects } from "@/components/projects/project-provider";

export default function IssuesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { projects } = useProjects();
  const project = projects.find(p => p.id === resolvedParams.id);
  
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("open");
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);

  const repoUrl = project?.repoUrl;
  const parsed = repoUrl ? parseRepo(repoUrl) : null;

  const fetchIssues = () => {
    if (!parsed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const labelsParam = labelFilter ? `&labels=${encodeURIComponent(labelFilter)}` : "";
    fetch(`/api/github/${parsed.owner}/${parsed.repo}/issues?state=${tab}${labelsParam}`)
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || `GitHub API error (${res.status})`);
          }).catch(() => {
            throw new Error(`Failed to fetch issues (HTTP ${res.status})`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setIssues(data);
        else setIssues([]);
      })
      .catch(err => {
        console.error("Issues fetch error:", err);
        setError(err.message || "Failed to fetch issues");
        setIssues([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIssues();
  }, [project, tab, labelFilter]);

  if (!project) {
    return (
      <EmptyState
        message="Select a project from the dashboard to view issues"
        action={
          <Link href="/dashboard" className="rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/15">
            Go to Dashboard
          </Link>
        }
      />
    );
  }
  if (!parsed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-xl font-semibold text-white mb-2">No Repository Linked</h2>
          <p className="text-sm text-slate-400 max-w-md mb-4">
            This project doesn&apos;t have a GitHub repository URL yet. 
            Add one by clicking the project name in the top bar and editing the project.
          </p>
          <p className="text-xs text-slate-500">
            Hover over <strong className="text-slate-300">{project.name}</strong> in the project dropdown and click the ✏️ edit button to add a repo URL.
          </p>
        </div>
      </div>
    );
  }

  const quickLabels = ["bug", "enhancement", "help wanted", "good first issue", "documentation"];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Issues</h1>
        <p className="text-zinc-400">Track and manage issues for {parsed.owner}/{parsed.repo}</p>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-4 border-b border-white/10 pb-2">
        <div className="flex gap-4 border-r border-white/10 pr-4">
          {["open", "closed", "all"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm font-medium capitalize ${tab === t ? "border-b-2 border-violet-500 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setLabelFilter(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${!labelFilter ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"}`}
          >
            All Labels
          </button>
          {quickLabels.map(l => (
            <button 
              key={l}
              onClick={() => setLabelFilter(l)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${labelFilter === l ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 max-w-lg">
            <p className="text-sm font-medium text-red-300 mb-1">Failed to load issues</p>
            <p className="text-xs text-red-400/80">{error}</p>
            <button
              type="button"
              onClick={fetchIssues}
              className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/15"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : issues.length === 0 ? (
        <EmptyState message={`No ${tab} issues found`} />
      ) : (
        <div className="flex flex-col gap-2">
          {issues.map(issue => (
            <div 
              key={issue.id} 
              onClick={() => setSelectedIssue(issue.number)}
              className="flex cursor-pointer flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-medium text-white">{issue.title}</h3>
                  <StatusBadge type="issue" state={issue.state} />
                  {issue.labels?.map(l => <LabelChip key={l.id} label={l} />)}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>#{issue.number} opened {timeAgo(issue.created_at)} by {issue.user?.login}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-xs text-zinc-500">{issue.comments} comments</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedIssue !== null && (
        <DetailDrawer 
          owner={parsed.owner}
          repo={parsed.repo}
          type="issue"
          number={selectedIssue}
          isOpen={selectedIssue !== null}
          onClose={() => setSelectedIssue(null)}
          onUpdated={fetchIssues}
        />
      )}
    </div>
  );
}
