"use client";

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
    fetch(`/api/github/${parsed.owner}/${parsed.repo}/pulls?state=${tab}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPrs(data);
        else setPrs([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPRs();
  }, [project, tab]);

  if (!project) return <EmptyState message="Project not found" />;
  if (!parsed) return <EmptyState message="No GitHub repository linked to this project" />;

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
