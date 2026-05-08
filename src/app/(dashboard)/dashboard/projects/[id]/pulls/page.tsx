"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { parseRepo } from "@/lib/github/analytics";
import { GitHubPR } from "@/lib/github/prs-issues";
import { StatusBadge, LabelChip, ReviewerAvatars, timeAgo, EmptyState, Spinner } from "@/components/github/GithubShared";
import { DetailDrawer } from "@/components/github/DetailDrawer";
import { useProjects } from "@/components/projects/project-provider";

export default function PullsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { projects } = useProjects();
  const project = projects.find(p => p.id === resolvedParams.id);
  
  const [prs, setPrs] = useState<GitHubPR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("open");
  const [selectedPR, setSelectedPR] = useState<number | null>(null);

  const repoUrl = project?.repoUrl;
  const parsed = repoUrl ? parseRepo(repoUrl) : null;

  const fetchPRs = () => {
    if (!parsed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/github/${parsed.owner}/${parsed.repo}/pulls?state=${tab}`)
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || `GitHub API error (${res.status})`);
          }).catch(() => {
            throw new Error(`Failed to fetch pull requests (HTTP ${res.status})`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setPrs(data);
        else setPrs([]);
      })
      .catch(err => {
        console.error("PR fetch error:", err);
        setError(err.message || "Failed to fetch pull requests");
        setPrs([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPRs();
  }, [project, tab]);

  if (!project) {
    return (
      <EmptyState
        message="Select a project from the dashboard to view pull requests"
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

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Pull Requests</h1>
        <p className="text-zinc-400">Manage and review pull requests for {parsed.owner}/{parsed.repo}</p>
      </div>
      
      <div className="mb-6 flex gap-4 border-b border-white/10 pb-2">
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
      
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 max-w-lg">
            <p className="text-sm font-medium text-red-300 mb-1">Failed to load pull requests</p>
            <p className="text-xs text-red-400/80">{error}</p>
            <button
              type="button"
              onClick={fetchPRs}
              className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/15"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : prs.length === 0 ? (
        <EmptyState message={`No ${tab} pull requests found`} />
      ) : (
        <div className="flex flex-col gap-2">
          {prs.map(pr => (
            <div 
              key={pr.id} 
              onClick={() => setSelectedPR(pr.number)}
              className="flex cursor-pointer flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-medium text-white">{pr.title}</h3>
                  <StatusBadge type="pr" state={pr.state} draft={pr.draft} merged_at={pr.merged_at} />
                  {pr.labels?.map(l => <LabelChip key={l.id} label={l} />)}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>#{pr.number} opened {timeAgo(pr.created_at)} by {pr.user?.login}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <ReviewerAvatars reviewers={pr.requested_reviewers || []} />
                <div className="text-xs text-zinc-500">{pr.comments} comments</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedPR !== null && (
        <DetailDrawer 
          owner={parsed.owner}
          repo={parsed.repo}
          type="pr"
          number={selectedPR}
          isOpen={selectedPR !== null}
          onClose={() => setSelectedPR(null)}
          onUpdated={fetchPRs}
        />
      )}
    </div>
  );
}
