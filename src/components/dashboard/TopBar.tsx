"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, FolderGit2, Menu, Plus, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/components/projects/project-provider";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/code-review": "AI Code Review",
  "/dashboard/docs": "Documentation Generator",
  "/dashboard/bugs": "Bug Finder",
  "/dashboard/tests": "Test Generator",
  "/dashboard/analytics": "Repo Analytics",
  "/dashboard/tasks": "Team Tasks",
  "/dashboard/team": "Team Dashboard",
  "/dashboard/settings": "Settings",
};

export function DashboardTopBar({ onOpenMenu, user }: { onOpenMenu: () => void; user?: { name?: string | null } | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const { projects, selectedProject, selectedProjectId, setSelectedProjectId, createProject, loading } = useProjects();
  const title = useMemo(() => titles[pathname] ?? "Dashboard", [pathname]);
  const initials = (user?.name ?? "DP").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  async function handleCreateProject() {
    const created = await createProject({ name: projectName, repoUrl });
    if (created) {
      setProjectName("");
      setRepoUrl("");
      setNewProjectOpen(false);
      setProjectOpen(false);
    }
  }

  return (
    <div className="glass sticky top-4 z-40 flex flex-wrap items-center justify-between gap-4 rounded-3xl px-4 py-3">
      <div className="flex items-center gap-3">
        <button type="button" className="rounded-xl border border-white/10 bg-white/5 p-2 md:hidden" onClick={onOpenMenu} aria-label="Open sidebar">
          <Menu size={18} />
        </button>
        <div>
          <p className="text-lg font-semibold">{title}</p>
          <p className="text-xs text-slate-400">Keep shipping with confident AI-assisted workflows.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 md:max-w-xl">
        <div className="relative hidden w-full md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <Input className="pl-9" placeholder="Search projects, bugs, docs..." />
        </div>
        <button type="button" className="relative rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-400" />
        </button>
        <div className="relative">
          <button type="button" className="flex max-w-[240px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm" onClick={() => setProjectOpen((value) => !value)}>
            <FolderGit2 size={16} className="shrink-0 text-purple-300" />
            <span className="min-w-0 flex-1 truncate">{selectedProject?.name ?? (loading ? "Loading projects..." : "Connect project")}</span>
            <ChevronDown size={14} className="shrink-0 text-slate-400" />
          </button>
          {projectOpen ? (
            <div className="glass-strong absolute right-0 mt-2 w-[320px] rounded-2xl p-3 text-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Project workspace</p>
                  <p className="text-xs text-slate-400">All AI tools save into the selected repo.</p>
                </div>
                <button type="button" className="rounded-xl border border-white/10 p-2" onClick={() => setNewProjectOpen((value) => !value)} aria-label="Create project">
                  <Plus size={14} />
                </button>
              </div>
              {newProjectOpen ? (
                <div className="mb-3 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project name" />
                  <Input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/org/repo" />
                  <button type="button" className="w-full rounded-xl bg-[var(--purple)] px-3 py-2 text-xs font-semibold text-white" onClick={handleCreateProject}>Connect Project</button>
                </div>
              ) : null}
              <div className="max-h-64 space-y-1 overflow-auto">
                {projects.length ? projects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    className={`w-full rounded-xl px-3 py-2 text-left ${selectedProjectId === project.id ? "bg-white text-slate-900" : "hover:bg-white/5"}`}
                    onClick={() => { setSelectedProjectId(project.id); setProjectOpen(false); }}
                  >
                    <span className="block truncate font-medium">{project.name}</span>
                    <span className={`block truncate text-xs ${selectedProjectId === project.id ? "text-slate-600" : "text-slate-500"}`}>{project.repoUrl ?? "No repo URL yet"}</span>
                  </button>
                )) : (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-slate-400">Create your first project to connect review, bugs, docs, tests, tasks, and analytics.</div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div className="relative">
          <button type="button" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2" onClick={() => setOpen((value) => !value)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">{initials}</span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {open ? (
            <div className="glass-strong absolute right-0 mt-2 w-48 rounded-2xl p-2 text-sm">
              <Link href="/dashboard/settings" className="block rounded-xl px-3 py-2 hover:bg-white/5" onClick={() => setOpen(false)}>Profile</Link>
              <Link href="/dashboard/settings?tab=billing" className="block rounded-xl px-3 py-2 hover:bg-white/5" onClick={() => setOpen(false)}>Billing</Link>
              <button type="button" className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/5" onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
