"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "@/components/projects/project-provider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

type Member = { id: string; userId: string; name: string; email: string; role: string };
type TaskUser = { id: string; name: string | null; email: string | null };
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  projectId: string;
  assignee: TaskUser | null;
  createdBy: TaskUser;
  completedBy: TaskUser | null;
  completedAt: string | null;
  updatedAt: string;
};

type Activity = {
  id: string;
  action: string;
  user?: { name: string | null; email: string | null } | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

const groups: Array<{ status: Task["status"]; label: string }> = [
  { status: "TODO", label: "To do" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "DONE", label: "Done" },
];

function userLabel(user: TaskUser | null) {
  return user?.name || user?.email || "Unassigned";
}

function formatActivityDescription(action: string, user?: { name: string | null; email: string | null } | null): string {
  const who = user?.name || user?.email || "Someone";
  const actions: Record<string, string> = {
    PROJECT_CREATED: "created a project",
    PROJECT_UPDATED: "updated project settings",
    TASK_CREATED: "created a task",
    TASK_COMPLETED: "completed a task",
    TASK_UPDATED: "updated a task",
    TASK_DELETED: "deleted a task",
    AI_CODE_REVIEW_SAVED: "ran code review",
    AI_BUG_REPORT_SAVED: "ran bug finder",
    AI_DOCS_SAVED: "generated documentation",
    AI_TESTS_SAVED: "generated tests",
  };
  const verb = actions[action] || (typeof action === "string" ? action.toLowerCase().replace(/_/g, " ") : "performed an action");
  return `${who} ${verb}`;
}

export default function TasksPage() {
  const { selectedProject, projects } = useProjects();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const [tasksRes, membersRes] = await Promise.all([
        fetch(`/api/tasks?projectId=${selectedProject.id}`, { cache: "no-store" }),
        fetch("/api/team/members", { cache: "no-store" }),
      ]);
      if (!tasksRes.ok || !membersRes.ok) throw new Error("Failed to load tasks");
      setTasks((await tasksRes.json()) as Task[]);
      setMembers((await membersRes.json()) as Member[]);
    } catch (error) {
      console.error(error);
      toast.error("Could not load tasks");
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  const loadActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch("/api/activity?limit=10", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load activities");
      setActivities((await res.json()) as Activity[]);
    } catch (error) {
      console.error(error);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadTasks();
      void loadActivities();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadTasks, loadActivities]);


  async function createTask() {
    if (!selectedProject) {
      toast.error("Connect a project first");
      return;
    }
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedProject.id, title, description, priority, assigneeId: assigneeId || null }),
    });
    if (!res.ok) {
      toast.error("Could not create task");
      return;
    }
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setAssigneeId("");
    toast.success("Task created");
    await loadTasks();
  }

  async function updateTask(taskId: string, patch: Partial<Pick<Task, "status" | "priority">> & { assigneeId?: string | null }) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast.error("Could not update task");
      return;
    }
    await loadTasks();
  }

  async function deleteTask(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete task");
      return;
    }
    toast.success("Task deleted");
    await loadTasks();
  }

  const byStatus = useMemo(() => {
    return groups.map((group) => ({ ...group, tasks: tasks.filter((task) => task.status === group.status) }));
  }, [tasks]);

  if (!selectedProject && projects.length === 0) {
    return (
      <Card>
        <h1 className="text-2xl font-semibold">Create your first project</h1>
        <p className="mt-3 text-sm text-slate-400">Connect a project from the top bar before assigning team tasks.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">Team Tasks</h1>
              <p className="mt-2 text-sm text-slate-400">Track assignments for {selectedProject?.name ?? "the selected project"} and see who completed each item.</p>
            </div>
            <div className="grid flex-[2] gap-3 md:grid-cols-[1fr_1fr_130px_150px_auto]">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" />
              <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
              <select value={priority} onChange={(event) => setPriority(event.target.value as Task["priority"])} className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm">
                <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option>
              </select>
              <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm">
                <option value="">Unassigned</option>
                {members.map((member) => <option key={member.userId} value={member.userId}>{member.name}</option>)}
              </select>
              <button type="button" className="rounded-2xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white" onClick={createTask}>Add</button>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-3">
          {byStatus.map((group) => (
            <Card key={group.status}>
              <h2 className="text-lg font-semibold">{group.label} <span className="text-sm text-slate-500">({group.tasks.length})</span></h2>
              <div className="mt-5 space-y-3">
                {group.tasks.length ? group.tasks.map((task) => (
                  <div key={task.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" className="mt-1 text-slate-300" onClick={() => updateTask(task.id, { status: task.status === "DONE" ? "TODO" : "DONE" })} aria-label={task.status === "DONE" ? "Reopen task" : "Complete task"}>
                        {task.status === "DONE" ? <CheckCircle2 className="text-emerald-300" size={18} /> : <Circle size={18} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={task.status === "DONE" ? "font-semibold text-slate-500 line-through" : "font-semibold"}>{task.title}</p>
                        {task.description ? <p className="mt-2 text-sm text-slate-400">{task.description}</p> : null}
                      </div>
                      <button type="button" className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300" onClick={() => deleteTask(task.id)} aria-label="Delete task"><Trash2 size={14} /></button>
                    </div>
                    <div className="mt-4 grid gap-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Assignee</span>
                        <select value={task.assignee?.id ?? ""} onChange={(event) => updateTask(task.id, { assigneeId: event.target.value || null })} className="rounded-xl border border-white/10 bg-black/20 px-2 py-1">
                          <option value="">Unassigned</option>
                          {members.map((member) => <option key={member.userId} value={member.userId}>{member.name}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Status</span>
                        <select value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value as Task["status"] })} className="rounded-xl border border-white/10 bg-black/20 px-2 py-1">
                          <option value="TODO">TODO</option><option value="IN_PROGRESS">IN_PROGRESS</option><option value="DONE">DONE</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Priority</span>
                        <select value={task.priority} onChange={(event) => updateTask(task.id, { priority: event.target.value as Task["priority"] })} className="rounded-xl border border-white/10 bg-black/20 px-2 py-1">
                          <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option>
                        </select>
                      </div>
                      <p className="text-slate-500">Created by {userLabel(task.createdBy)}</p>
                      {task.completedBy ? <p className="text-emerald-300">Completed by {userLabel(task.completedBy)} {task.completedAt ? `on ${new Date(task.completedAt).toLocaleDateString()}` : ""}</p> : null}
                    </div>
                  </div>
                )) : <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500">{loading ? "Loading..." : "No tasks yet."}</div>}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="h-fit">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-slate-400" />
          <h2 className="text-lg font-semibold">Activity Feed</h2>
        </div>
        <div className="mt-4 space-y-3">
          {activitiesLoading ? (
            <LoadingSkeleton lines={4} height="h-8" />
          ) : activities.length ? (
            activities.map((activity) => (
              <div key={activity.id} className="border-l-2 border-white/10 pl-3 text-xs">
                <p className="text-slate-300">{formatActivityDescription(activity.action, activity.user)}</p>
                <p className="mt-1 text-slate-500">{new Date(activity.createdAt).toLocaleTimeString()}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No activity yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
