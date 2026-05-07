"use client";

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
    const labelsParam = labelFilter ? `&labels=${encodeURIComponent(labelFilter)}` : "";
    fetch(`/api/github/${parsed.owner}/${parsed.repo}/issues?state=${tab}${labelsParam}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setIssues(data);
        else setIssues([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIssues();
  }, [project, tab, labelFilter]);

  if (!project) return <EmptyState message="Project not found" />;
  if (!parsed) return <EmptyState message="No GitHub repository linked to this project" />;

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
