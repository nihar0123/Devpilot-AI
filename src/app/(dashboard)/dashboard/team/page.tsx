"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

type Member = { id: string; name: string; email: string; role: string; status: string };
type Invite = { id: string; email: string; role: string; sentAt: string; expiresAt: string; inviteUrl: string; status: string };
type Activity = { id: string; description: string; time: string };
type Task = { id: string; title: string; status: string; assignee: { name: string | null; email: string | null } | null; completedBy: { name: string | null; email: string | null } | null; projectId: string };
type LeaderboardPerson = { id: string; name: string; role: string; score: number };
type TeamData = { members: Member[]; invites: Invite[]; context: { organization: { id: string; name: string } }; activity: Activity[]; leaderboard: LeaderboardPerson[] };

export default function TeamPage() {
  const [data, setData] = useState<TeamData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [openModal, setOpenModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/team/overview");
      if (!res.ok) throw new Error(await res.text());
      const payload = (await res.json()) as TeamData & { tasks: Task[] };

      setData({ members: payload.members, invites: payload.invites, context: payload.context, activity: payload.activity, leaderboard: payload.leaderboard });
      setTasks(payload.tasks);
    } finally {
      setLoading(false);
    }
  }

  async function sendInvite() {
    try {
      const res = await fetch("/api/team/invites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: inviteEmail, role: inviteRole }) });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Invite sent");
      setInviteEmail("");
      setInviteRole("MEMBER");
      setOpenModal(false);
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    }
  }

  async function resendInvite(inviteId: string) {
    try {
      const res = await fetch(`/api/team/invites/${inviteId}`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Reminder sent");
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    }
  }

  async function revokeInvite(inviteId: string) {
    try {
      const res = await fetch(`/api/team/invites/${inviteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Invite revoked");
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    }
  }

  async function changeRole(memberId: string, role: string) {
    try {
      const res = await fetch(`/api/team/members/${memberId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Role updated");
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    }
  }

  async function removeMember() {
    if (!removeTarget) return;
    try {
      const res = await fetch(`/api/team/members/${removeTarget}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Member removed");
      setRemoveTarget(null);
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    }
  }

  const completedCount = tasks.filter((task) => task.status === "DONE").length;
  const totalCount = tasks.length;
  const progressWidth = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);
  const leaderboard = data?.leaderboard ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <LoadingSkeleton lines={4} height="h-5" />
        </Card>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card><LoadingSkeleton lines={5} height="h-8" /></Card>
          <Card><LoadingSkeleton lines={5} height="h-8" /></Card>
        </div>
        <Card><LoadingSkeleton lines={4} height="h-6" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Team Members</h1>
          <button type="button" className="rounded-2xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white" onClick={() => setOpenModal(true)}>Invite Member</button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="pb-3">Member</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.members?.map((member) => (
                <tr key={member.id} className="border-t border-white/10">
                  <td className="py-4 font-medium">{member.name}</td>
                  <td>{member.email}</td>
                  <td>
                    <span className={`rounded-full px-3 py-1 text-xs ${member.role === "OWNER" ? "bg-purple-500/15 text-purple-300" : member.role === "ADMIN" ? "bg-blue-500/15 text-blue-300" : member.role === "MEMBER" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-300"}`}>
                      {member.role}
                    </span>
                  </td>
                  <td>{member.status}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <select value={member.role} onChange={(event) => changeRole(member.id, event.target.value)} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-100">
                        <option>OWNER</option>
                        <option>ADMIN</option>
                        <option>MEMBER</option>
                        <option>VIEWER</option>
                      </select>
                      <button type="button" className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300" onClick={() => setRemoveTarget(member.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Pending Invites</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Sent</th>
                <th className="pb-3">Expires</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.invites?.map((invite) => (
                <tr key={invite.id} className="border-t border-white/10">
                  <td className="py-4">{invite.email}</td>
                  <td>{invite.role}</td>
                  <td>{invite.sentAt}</td>
                  <td>{invite.expiresAt}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-100" onClick={async () => { await navigator.clipboard.writeText(invite.inviteUrl); toast.success("Invite link copied"); }}>
                        <Copy size={12} className="mr-1 inline" />Copy link
                      </button>
                      <button type="button" className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-100" onClick={() => resendInvite(invite.id)}>Resend</button>
                      <button type="button" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300" onClick={() => revokeInvite(invite.id)}>Revoke</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Developer Leaderboard</h2>
          <div className="mt-6 space-y-4">
            {leaderboard.map((person, index) => (
              <div key={person.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">#{index + 1} {person.name}</p>
                    <p className="text-sm text-slate-400">{person.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">{person.score}</p>
                    <div className="mt-2 h-2 w-32 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-[var(--purple)]" style={{ width: `${person.score}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Sprint Progress</h2>
          <p className="mt-3 text-sm text-slate-400">Active team tasks for {data?.context.organization.name}</p>
          <div className="mt-6 h-3 rounded-full bg-white/10">
            <div className="h-3 rounded-full bg-[var(--purple)]" style={{ width: `${progressWidth}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-300">{totalCount ? `${completedCount} of ${totalCount} tasks complete` : "No tasks have been created yet."}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Todo</p>
              <p className="mt-3 text-2xl font-semibold">{tasks.filter((task) => task.status === "TODO").length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">In progress</p>
              <p className="mt-3 text-2xl font-semibold">{tasks.filter((task) => task.status === "IN_PROGRESS").length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Done</p>
              <p className="mt-3 text-2xl font-semibold">{completedCount}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            {recentTasks.length ? recentTasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{task.assignee?.name ?? "Unassigned"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${task.status === "DONE" ? "bg-emerald-500/15 text-emerald-300" : task.status === "IN_PROGRESS" ? "bg-sky-500/15 text-sky-300" : "bg-slate-500/15 text-slate-300"}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            )) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">No active tasks to display. Create task cards from code review or bug findings to track your team.</div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold">Team Activity</h2>
        <div className="mt-6 space-y-3">
          {data?.activity?.slice(0, 10).map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm font-medium">{item.description}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDistanceToNow(new Date(item.time), { addSuffix: true })}</p>
            </div>
          ))}
        </div>
      </Card>

      {openModal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className="glass-strong w-full max-w-md rounded-3xl p-6">
            <h3 className="text-2xl font-semibold">Invite Team Member</h3>
            <div className="mt-5 space-y-4">
              <Input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@company.com" />
              <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100">
                <option>MEMBER</option>
                <option>ADMIN</option>
                <option>VIEWER</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" className="rounded-2xl border border-white/10 px-4 py-3 text-sm" onClick={() => setOpenModal(false)}>Close</button>
                <button type="button" className="rounded-2xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white" onClick={sendInvite}>Send Invite</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog open={Boolean(removeTarget)} onConfirm={removeMember} onCancel={() => setRemoveTarget(null)} title="Remove team member" description="This removes the member from the workspace. You can invite them back later if needed." confirmLabel="Remove member" destructive />
    </div>
  );
}
