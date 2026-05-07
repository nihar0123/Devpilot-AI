export interface GitHubUser {
  login: string;
  avatar_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed" | "all";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  body: string | null;
  user: GitHubUser;
  labels: GitHubLabel[];
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  draft: boolean;
  comments: number;
  head: { ref: string };
  base: { ref: string };
  additions?: number;
  deletions?: number;
  changed_files?: number;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed" | "all";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string | null;
  user: GitHubUser;
  labels: GitHubLabel[];
  assignees: GitHubUser[];
  comments: number;
  pull_request?: { url: string }; // To distinguish PRs from Issues
}

export interface GitHubComment {
  id: number;
  body: string;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
}

async function ghFetch(url: string, token: string | undefined, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  const res = await fetch(`https://api.github.com${url}`, {
    ...init,
    headers,
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`GitHub API error (${res.status}): ${errorText}`);
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  
  if (res.status === 204) {
    return null; // No content
  }
  
  return res.json();
}

export async function listPullRequests(owner: string, repo: string, options: { state?: string; page?: number; perPage?: number }, token?: string) {
  const params = new URLSearchParams();
  if (options.state) params.set("state", options.state);
  if (options.page) params.set("page", options.page.toString());
  if (options.perPage) params.set("per_page", options.perPage.toString());
  return ghFetch(`/repos/${owner}/${repo}/pulls?${params.toString()}`, token);
}

export async function getPullRequest(owner: string, repo: string, number: number, token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/pulls/${number}`, token);
}

export async function listPRComments(owner: string, repo: string, number: number, token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/issues/${number}/comments`, token);
}

export async function commentOnPR(owner: string, repo: string, number: number, body: string, token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/issues/${number}/comments`, token, {
    method: "POST",
    body: JSON.stringify({ body })
  });
}

export async function mergePR(owner: string, repo: string, number: number, method: "merge" | "squash" | "rebase" = "merge", token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/pulls/${number}/merge`, token, {
    method: "PUT",
    body: JSON.stringify({ merge_method: method })
  });
}

export async function closePR(owner: string, repo: string, number: number, token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/pulls/${number}`, token, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" })
  });
}

export async function listIssues(owner: string, repo: string, options: { state?: string; labels?: string; assignee?: string; page?: number; perPage?: number }, token?: string) {
  const params = new URLSearchParams();
  if (options.state) params.set("state", options.state);
  if (options.labels) params.set("labels", options.labels);
  if (options.assignee) params.set("assignee", options.assignee);
  if (options.page) params.set("page", options.page.toString());
  if (options.perPage) params.set("per_page", options.perPage.toString());
  
  const issues: GitHubIssue[] = await ghFetch(`/repos/${owner}/${repo}/issues?${params.toString()}`, token);
  // Filter out PRs, because GitHub Issues API returns both
  return issues.filter(issue => !issue.pull_request);
}

export async function getIssue(owner: string, repo: string, number: number, token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/issues/${number}`, token);
}

export async function listIssueComments(owner: string, repo: string, number: number, token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/issues/${number}/comments`, token);
}

export async function commentOnIssue(owner: string, repo: string, number: number, body: string, token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/issues/${number}/comments`, token, {
    method: "POST",
    body: JSON.stringify({ body })
  });
}

export async function closeIssue(owner: string, repo: string, number: number, token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/issues/${number}`, token, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" })
  });
}

export async function reopenIssue(owner: string, repo: string, number: number, token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/issues/${number}`, token, {
    method: "PATCH",
    body: JSON.stringify({ state: "open" })
  });
}

export async function assignIssue(owner: string, repo: string, number: number, assignees: string[], token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/issues/${number}/assignees`, token, {
    method: "POST",
    body: JSON.stringify({ assignees })
  });
}

export async function addLabelsToIssue(owner: string, repo: string, number: number, labels: string[], token?: string) {
  return ghFetch(`/repos/${owner}/${repo}/issues/${number}/labels`, token, {
    method: "POST",
    body: JSON.stringify({ labels })
  });
}
