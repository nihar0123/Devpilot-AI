"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";

type Member = { id: string; name: string; email: string; role: string; status: string };
type Invite = { id: string; email: string; role: string; sentAt: string; expiresAt: string; inviteUrl: string; status: string };
type Activity = { id: string; description: string; time: string };
type TeamData = { members: Member[]; invites: Invite[]; context: { organization: { id: string; name: string } }; activity: Activity[] };
type LeaderboardPerson = { id: string; name: string; role: string; score: number };

export default function TeamPage() {
  const [data, setData] = useState<TeamData | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [openModal, setOpenModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    const [membersRes, invitesRes, contextRes, activityRes] = await Promise.all([fetch("/api/team/members"), fetch("/api/team/invites"), fetch("/api/team/context"), fetch("/api/activity")]);
    const [members, invites, context, activity] = await Promise.all([
      membersRes.json() as Promise<Member[]>,
      invitesRes.json() as Promise<Invite[]>,
      contextRes.json() as Promise<{ organization: { id: string; name: string } }>,
      activityRes.json() as Promise<Activity[]>,
    ]);
    setData({ members, invites, context, activity });
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

  const leaderboard = useMemo<LeaderboardPerson[]>(() => data?.activity?.slice(0, 5).map((item, index) => ({ id: item.id, name: ["Nihar Sharma", "Aarav Mehta", "Sana Patel", "Ishaan Rao", "Maya Singh"][index], role: ["OWNER", "ADMIN", "MEMBER", "MEMBER", "VIEWER"][index], score: [96, 91, 88, 84, 77][index] })) ?? [], [data]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Team Members</h1>
          <button type="button" className="rounded-2xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white" onClick={() => setOpenModal(true)}>Invite Member</button>
        </div>
        <div className="mt-6 overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-slate-400"><tr><th className="pb-3">Member</th><th className="pb-3">Email</th><th className="pb-3">Role</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead><tbody>{data?.members?.map((member) => <tr key={member.id} className="border-t border-white/10"><td className="py-4 font-medium">{member.name}</td><td>{member.email}</td><td><span className={`rounded-full px-3 py-1 text-xs ${member.role === "OWNER" ? "bg-purple-500/15 text-purple-300" : member.role === "ADMIN" ? "bg-blue-500/15 text-blue-300" : member.role === "MEMBER" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-300"}`}>{member.role}</span></td><td>{member.status}</td><td><div className="flex items-center gap-2"><select value={member.role} onChange={(event) => changeRole(member.id, event.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs"><option>OWNER</option><option>ADMIN</option><option>MEMBER</option><option>VIEWER</option></select><button type="button" className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300" onClick={() => setRemoveTarget(member.id)}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Pending Invites</h2>
        <div className="mt-6 overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-slate-400"><tr><th className="pb-3">Email</th><th className="pb-3">Role</th><th className="pb-3">Sent</th><th className="pb-3">Expires</th><th className="pb-3">Actions</th></tr></thead><tbody>{data?.invites?.map((invite) => <tr key={invite.id} className="border-t border-white/10"><td className="py-4">{invite.email}</td><td>{invite.role}</td><td>{invite.sentAt}</td><td>{invite.expiresAt}</td><td><div className="flex flex-wrap gap-2"><button type="button" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs" onClick={async () => { await navigator.clipboard.writeText(invite.inviteUrl); toast.success("Invite link copied"); }}><Copy size={12} className="mr-1 inline" />Copy link</button><button type="button" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs" onClick={() => resendInvite(invite.id)}>Resend</button><button type="button" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300" onClick={() => revokeInvite(invite.id)}>Revoke</button></div></td></tr>)}</tbody></table></div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Developer Leaderboard</h2>
          <div className="mt-6 space-y-4">{leaderboard.map((person, index) => <div key={person.id} className="rounded-3xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold">#{index + 1} {person.name}</p><p className="text-sm text-slate-400">{person.role}</p></div><div className="text-right"><p className="text-2xl font-semibold">{person.score}</p><div className="mt-2 h-2 w-32 rounded-full bg-white/10"><div className="h-2 rounded-full bg-[var(--purple)]" style={{ width: `${person.score}%` }} /></div></div></div></div>)}</div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Sprint Progress</h2>
          <p className="mt-3 text-sm text-slate-400">Sprint 23 - Performance Improvements</p>
          <p className="text-sm text-slate-500">Apr 14 - Apr 28, 2025</p>
          <div className="mt-6 h-3 rounded-full bg-white/10"><div className="h-3 rounded-full bg-[var(--purple)]" style={{ width: "66%" }} /></div>
          <p className="mt-3 text-sm text-slate-300">12 of 18 tasks complete</p>
          <div className="mt-4 space-y-3 text-sm text-slate-200">{["Stabilize GitHub OAuth callback", "Ship responsive dashboard sidebar", "Improve AI route validation", "Finish analytics hotspot visualization", "Add billing usage card polish"].map((task, index) => <div key={task} className="flex items-center gap-3">{index < 3 ? "?" : "?"}<span className={index < 3 ? "line-through text-slate-500" : ""}>{task}</span></div>)}</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold">Team Activity</h2>
        <div className="mt-6 space-y-3">{data?.activity?.slice(0, 10).map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-sm font-medium">{item.description}</p><p className="mt-1 text-xs text-slate-400">{item.time}</p></div>)}</div>
      </Card>

      {openModal ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"><div className="glass-strong w-full max-w-md rounded-3xl p-6"><h3 className="text-2xl font-semibold">Invite Team Member</h3><div className="mt-5 space-y-4"><Input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@company.com" /><select value={inviteRole} onChange={(event) => setInviteRole(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"><option>MEMBER</option><option>ADMIN</option><option>VIEWER</option></select><div className="flex justify-end gap-3"><button type="button" className="rounded-2xl border border-white/10 px-4 py-3 text-sm" onClick={() => setOpenModal(false)}>Close</button><button type="button" className="rounded-2xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white" onClick={sendInvite}>Send Invite</button></div></div></div></div> : null}
      <ConfirmDialog open={Boolean(removeTarget)} onConfirm={removeMember} onCancel={() => setRemoveTarget(null)} title="Remove team member" description="This removes the member from the workspace. You can invite them back later if needed." confirmLabel="Remove member" destructive />
    </div>
  );
}
