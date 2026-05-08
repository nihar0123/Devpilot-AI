import { GitPullRequest, GitMerge, CircleDot, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDistanceToNow } from "date-fns";
import type { ReactNode } from "react";
import { GitHubLabel, GitHubUser } from "@/lib/github/prs-issues";

export function StatusBadge({ state, type, merged_at, draft }: { state: string, type: "pr" | "issue", merged_at?: string | null, draft?: boolean }) {
  if (type === "pr") {
    if (merged_at) {
      return (
        <span className="flex w-max items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400">
          <GitMerge size={12} /> Merged
        </span>
      );
    }
    if (draft) {
      return (
        <span className="flex w-max items-center gap-1 rounded-full bg-slate-500/20 px-2 py-0.5 text-xs font-medium text-slate-400">
          <GitPullRequest size={12} /> Draft
        </span>
      );
    }
    if (state === "closed") {
      return (
        <span className="flex w-max items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
          <XCircle size={12} /> Closed
        </span>
      );
    }
    return (
      <span className="flex w-max items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
        <GitPullRequest size={12} /> Open
      </span>
    );
  } else {
    if (state === "closed") {
      return (
        <span className="flex w-max items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400">
          <CircleDot size={12} /> Closed
        </span>
      );
    }
    return (
      <span className="flex w-max items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
        <CircleDot size={12} /> Open
      </span>
    );
  }
}

function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}

export function LabelChip({ label }: { label: GitHubLabel }) {
  const color = label.color.startsWith("#") ? label.color : `#${label.color}`;
  const textColor = getContrastYIQ(color);
  return (
    <span 
      className="rounded-full px-2 py-0.5 text-xs font-medium" 
      style={{ backgroundColor: color, color: textColor }}
      title={label.description}
    >
      {label.name}
    </span>
  );
}

export function ReviewerAvatars({ reviewers }: { reviewers: GitHubUser[] }) {
  if (!reviewers || reviewers.length === 0) return null;
  const max = 3;
  const visible = reviewers.slice(0, max);
  const overflow = reviewers.length - max;
  
  return (
    <div className="flex -space-x-2 overflow-hidden">
      {visible.map((r) => (
        <img key={r.login} className="inline-block h-6 w-6 rounded-full ring-2 ring-[#080810]" src={r.avatar_url} alt={r.login} title={r.login} />
      ))}
      {overflow > 0 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-white ring-2 ring-[#080810]">
          +{overflow}
        </span>
      )}
    </div>
  );
}

export function timeAgo(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "sometime ago";
  }
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
      <CircleDot size={32} className="mb-4 opacity-50" />
      <p>{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
    </div>
  );
}
