"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";

const tabs = ["Profile", "Organization", "Billing", "API Keys", "Notifications"] as const;



export default function SettingsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Profile");
  const [profile, setProfile] = useState({ name: "", email: "", bio: "" });
  const [org, setOrg] = useState({ name: "", slug: "", website: "" });

  // Load real user and org data on mount
  useEffect(() => {
    if (session?.user) {
      setProfile((prev) => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || "",
      }));
    }
    void fetch("/api/team/context")
      .then((r) => r.json())
      .then((data) => {
        if (data?.organization) {
          setOrg({
            name: data.organization.name || "",
            slug: data.organization.slug || "",
            website: data.organization.website || "",
          });
        }
      })
      .catch(() => null);
  }, [session]);
  const [apiKey, setApiKey] = useState("dp_••••••••••••••••3f9a");
  const [revealed, setRevealed] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notifications, setNotifications] = useState({ emailAlerts: true, criticalAlerts: true, weeklyDigest: true, teamActivity: false, reviewAlerts: true, inviteAccepted: true });

  const usage = useMemo(() => 32 / 50 * 100, []);

  async function saveProfile() {
    try {
      const res = await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Profile saved");
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    }
  }

  async function saveOrganization() {
    try {
      const res = await fetch("/api/org/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(org) });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Organization settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    }
  }

  async function regenerateKey() {
    try {
      const res = await fetch("/api/keys/regenerate", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setApiKey(data.key);
      setRevealed(true);
      toast.success("API key regenerated");
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    }
  }

  async function startTrial() {
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">{tabs.map((item) => <button key={item} type="button" className={`rounded-2xl px-4 py-3 text-sm ${tab === item ? "bg-white text-slate-900" : "border border-white/10 bg-white/5 text-slate-300"}`} onClick={() => setTab(item)}>{item}</button>)}</div>

      {tab === "Profile" ? <Card><div className="flex items-center gap-5"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold">NS</div><div><p className="text-sm text-slate-400">Change Avatar</p></div></div><div className="mt-6 grid gap-4"><Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="Full Name" /><Input value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} placeholder="Email" /><textarea value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} className="min-h-[120px] rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm" placeholder="Bio" /><button type="button" className="rounded-2xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white" onClick={saveProfile}>Save Changes</button></div></Card> : null}

      {tab === "Organization" ? <Card><div className="grid gap-4"><Input value={org.name} onChange={(event) => setOrg({ ...org, name: event.target.value })} placeholder="Organization Name" /><Input value={org.slug} onChange={(event) => setOrg({ ...org, slug: event.target.value })} placeholder="Slug" /><Input value={org.website} onChange={(event) => setOrg({ ...org, website: event.target.value })} placeholder="Website URL" /><button type="button" className="rounded-2xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white" onClick={saveOrganization}>Save Changes</button></div><div className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/10 p-5"><h2 className="text-xl font-semibold text-red-300">Danger Zone</h2><p className="mt-2 text-sm text-red-200">Delete Organization</p><button type="button" className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-200" onClick={() => setDeleteOpen(true)}>Delete Organization</button></div></Card> : null}

      {tab === "Billing" ? <div className="grid gap-6 xl:grid-cols-2"><Card><h2 className="text-xl font-semibold">Current Plan</h2><p className="mt-3 text-sm text-slate-400">Free</p><p className="mt-4 text-sm text-slate-300">32 of 50 analyses used this month</p><div className="mt-4 h-3 rounded-full bg-white/10"><div className="h-3 rounded-full bg-[var(--purple)]" style={{ width: `${usage}%` }} /></div></Card><Card><h2 className="text-xl font-semibold">Upgrade to Pro</h2><p className="mt-3 text-3xl font-semibold">$29/mo</p><div className="mt-4 space-y-2 text-sm text-slate-300"><div>? Unlimited projects</div><div>? All AI tools</div><div>? GitHub integration</div><div>? Team up to 10 members</div></div><button type="button" className="mt-6 rounded-2xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white" onClick={startTrial}>Start Free Trial</button></Card></div> : null}

      {tab === "API Keys" ? <Card><div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">Keep your API keys secure. Never share them.</div><div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-slate-400">DevPilot API Key</p><p className="mt-3 font-mono text-lg">{revealed ? apiKey : "dp_••••••••••••••••3f9a"}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold" onClick={() => setRevealed((value) => !value)}>{revealed ? "Hide" : "Show"}</button><button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold" onClick={async () => { await navigator.clipboard.writeText(apiKey); toast.success("API key copied"); }}>Copy</button><button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold" onClick={regenerateKey}>Regenerate</button></div><p className="mt-4 text-xs text-slate-500">Created Apr 24, 2026</p></div></Card> : null}

      {tab === "Notifications" ? <Card><div className="space-y-4 text-sm">{[{ key: "emailAlerts", label: "Email alerts for new bugs found" }, { key: "criticalAlerts", label: "Critical severity bug alerts" }, { key: "weeklyDigest", label: "Weekly digest email" }, { key: "teamActivity", label: "Team member activity notifications" }, { key: "reviewAlerts", label: "Code review completion alerts" }, { key: "inviteAccepted", label: "Invite accepted notifications" }].map((item) => <label key={item.key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"><span>{item.label}</span><input type="checkbox" checked={notifications[item.key as keyof typeof notifications]} onChange={(event) => setNotifications({ ...notifications, [item.key]: event.target.checked })} /></label>)}</div><button type="button" className="mt-6 rounded-2xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white" onClick={() => toast.success("Notification preferences saved")}>Save Preferences</button></Card> : null}

      <ConfirmDialog open={deleteOpen} onConfirm={() => { setDeleteOpen(false); toast.success("Organization deletion flow acknowledged"); }} onCancel={() => setDeleteOpen(false)} title="Delete Organization" description="This would remove your workspace and all related resources. In this demo build, the action is blocked after confirmation." confirmLabel="Delete Organization" destructive />
    </div>
  );
}

