"use client";

import { useState, useEffect } from "react";
import { X, MessageSquare, GitMerge } from "lucide-react";
import { GitHubPR, GitHubIssue, GitHubComment } from "@/lib/github/prs-issues";
import { StatusBadge, LabelChip, timeAgo, Spinner } from "./GithubShared";

interface DetailDrawerProps {
  owner: string;
  repo: string;
  type: "pr" | "issue";
  number: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function DetailDrawer({ owner, repo, type, number, isOpen, onClose, onUpdated }: DetailDrawerProps) {
  const [data, setData] = useState<{ item: GitHubPR | GitHubIssue, comments: GitHubComment[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/github/${owner}/${repo}/${type === "pr" ? "pulls" : "issues"}/${number}`)
        .then(res => res.json())
        .then(res => {
          setData({ item: res.pr || res.issue, comments: res.comments });
        })
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [isOpen, owner, repo, type, number]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleAction = async (action: string, payload: any = {}) => {
    setActionLoading(true);
    await fetch(`/api/github/${owner}/${repo}/${type === "pr" ? "pulls" : "issues"}/${number}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload })
    });
    
    const res = await fetch(`/api/github/${owner}/${repo}/${type === "pr" ? "pulls" : "issues"}/${number}`);
    const json = await res.json();
    setData({ item: json.pr || json.issue, comments: json.comments });
    
    setActionLoading(false);
    onUpdated();
    
    if (action === "comment") setCommentInput("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-white/5 bg-[#080810] shadow-2xl transition-transform duration-300 sm:w-[500px] md:w-[600px] lg:w-[700px]">
        {loading || !data ? (
          <Spinner />
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <div className="flex items-center gap-3">
                <StatusBadge 
                  type={type} 
                  state={data.item.state} 
                  merged_at={(data.item as GitHubPR).merged_at}
                  draft={(data.item as GitHubPR).draft}
                />
                <h2 className="text-lg font-semibold text-zinc-100">#{data.item.number}</h2>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <h1 className="mb-2 text-2xl font-bold text-white">{data.item.title}</h1>
              
              <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <img src={data.item.user.avatar_url} alt={data.item.user.login} className="h-6 w-6 rounded-full" />
                  <span className="font-medium text-zinc-200">{data.item.user.login}</span>
                </div>
                <span>opened {timeAgo(data.item.created_at)}</span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={14} /> {data.item.comments}
                </span>
              </div>
              
              {data.item.labels && data.item.labels.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {data.item.labels.map(label => (
                    <LabelChip key={label.id} label={label} />
                  ))}
                </div>
              )}
              
              {type === "pr" && (data.item as GitHubPR).additions !== undefined && (
                <div className="mb-6 flex items-center gap-4 text-sm font-medium">
                  <span className="text-green-400">+{ (data.item as GitHubPR).additions } additions</span>
                  <span className="text-red-400">-{ (data.item as GitHubPR).deletions } deletions</span>
                  <span className="text-zinc-400">{ (data.item as GitHubPR).changed_files } files changed</span>
                </div>
              )}
              
              <div className="prose prose-invert max-w-none border-b border-white/5 pb-8">
                {data.item.body ? (
                   <div className="whitespace-pre-wrap text-sm text-zinc-300">{data.item.body}</div>
                ) : (
                  <p className="italic text-zinc-500">No description provided.</p>
                )}
              </div>
              
              <div className="mt-8 space-y-6">
                <h3 className="text-sm font-semibold text-zinc-200">Activity</h3>
                {data.comments.map(comment => (
                  <div key={comment.id} className="flex gap-4">
                    <img src={comment.user.avatar_url} alt={comment.user.login} className="h-8 w-8 rounded-full" />
                    <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                        <span className="font-medium text-zinc-200">{comment.user.login}</span>
                        <span>{timeAgo(comment.created_at)}</span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm text-zinc-300">{comment.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-white/5 bg-white/[0.01] p-4">
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Leave a comment..."
                  className="flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && commentInput.trim()) {
                      handleAction("comment", { body: commentInput });
                    }
                  }}
                  disabled={actionLoading}
                />
              </div>
              <div className="flex justify-end gap-2">
                {type === "pr" ? (
                  <>
                    {data.item.state === "open" && (
                      <button 
                        onClick={() => handleAction("close")} 
                        disabled={actionLoading}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
                      >
                        Close PR
                      </button>
                    )}
                    {data.item.state === "open" && !(data.item as GitHubPR).draft && (
                      <button 
                        onClick={() => handleAction("merge", { method: "squash" })} 
                        disabled={actionLoading}
                        className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
                      >
                        <GitMerge size={16} /> Merge (Squash)
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {data.item.state === "open" ? (
                      <button 
                        onClick={() => handleAction("close")} 
                        disabled={actionLoading}
                        className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
                      >
                        Close Issue
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAction("reopen")} 
                        disabled={actionLoading}
                        className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
                      >
                        Reopen Issue
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
