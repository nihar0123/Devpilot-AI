"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Bug, CheckSquare, Code2, FileText, LayoutDashboard, Settings, TestTube, Users, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Code Review", href: "/dashboard/code-review", icon: Code2 },
  { label: "Docs", href: "/dashboard/docs", icon: FileText },
  { label: "Bug Finder", href: "/dashboard/bugs", icon: Bug },
  { label: "Tests", href: "/dashboard/tests", icon: TestTube },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function AvatarFallback({ name }: { name?: string | null }) {
  const initials = (name ?? "DP").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">{initials}</div>;
}

export function DashboardSidebar({ mobile = false, onClose, user }: { mobile?: boolean; onClose?: () => void; user?: { name?: string | null; email?: string | null } | null }) {
  const pathname = usePathname();

  return (
    <aside className={cn("glass-strong flex h-full flex-col justify-between rounded-none border-r border-white/10 p-4 md:rounded-r-3xl", mobile ? "w-[280px]" : "w-full") }>
      <div>
        <div className="mb-8 flex items-center justify-between gap-3 px-2 pt-2">
          <Link href="/dashboard" className="text-lg font-semibold">DevPilot AI</Link>
          {mobile ? <button type="button" className="rounded-xl border border-white/10 p-2 text-slate-300" onClick={onClose}><X size={16} /></button> : null}
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-l-2 px-4 py-3 text-sm transition",
                  active ? "border-[var(--purple)] bg-[rgba(117,104,255,0.18)] text-[#c9c4ff]" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <AvatarFallback name={user?.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.name ?? "Developer"}</p>
            <p className="truncate text-xs text-slate-400">{user?.email ?? "demo@devpilot.ai"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
