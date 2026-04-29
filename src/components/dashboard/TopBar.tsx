"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/code-review": "AI Code Review",
  "/dashboard/docs": "Documentation Generator",
  "/dashboard/bugs": "Bug Finder",
  "/dashboard/tests": "Test Generator",
  "/dashboard/analytics": "Repo Analytics",
  "/dashboard/team": "Team Dashboard",
  "/dashboard/settings": "Settings",
};

export function DashboardTopBar({ onOpenMenu, user }: { onOpenMenu: () => void; user?: { name?: string | null } | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title = useMemo(() => titles[pathname] ?? "Dashboard", [pathname]);
  const initials = (user?.name ?? "DP").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

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
