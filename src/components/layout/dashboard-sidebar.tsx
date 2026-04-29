"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/code-review", label: "Code Review" },
  { href: "/dashboard/docs", label: "Docs" },
  { href: "/dashboard/bugs", label: "Bugs" },
  { href: "/dashboard/tests", label: "Tests" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/team", label: "Team" },
  { href: "/dashboard/settings", label: "Settings" },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition",
              active ? "bg-indigo-500/25 text-white" : "text-muted hover:bg-white/10 hover:text-white",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass fixed right-4 top-20 z-50 rounded-lg p-2 md:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      <aside className="glass sticky top-4 z-30 hidden h-fit rounded-2xl p-4 md:block">
        <h2 className="mb-4 text-lg font-semibold">DevPilot AI</h2>
        <SidebarNav />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-label="Close sidebar" />
          <aside className="glass absolute left-0 top-0 h-full w-72 p-4">
            <h2 className="mb-4 text-lg font-semibold">DevPilot AI</h2>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
