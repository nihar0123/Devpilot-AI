import Link from "next/link";
import { BriefcaseBusiness, Globe, Send } from "lucide-react";

const columns = [
  { title: "Product", links: [{ href: "/#features", label: "Features" }, { href: "/pricing", label: "Pricing" }, { href: "/dashboard", label: "Dashboard" }] },
  { title: "Company", links: [{ href: "/about", label: "About" }, { href: "/login", label: "Login" }, { href: "/invite/demo-member", label: "Invite Demo" }] },
  { title: "Resources", links: [{ href: "/docs", label: "Docs" }, { href: "/pricing", label: "Plans" }, { href: "/dashboard/analytics", label: "Analytics" }] },
  { title: "Legal", links: [{ href: "/terms", label: "Terms" }, { href: "/privacy", label: "Privacy" }, { href: "/login", label: "Security" }] },
];

export function MarketingFooter() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <h3 className="text-xl font-semibold">DevPilot AI</h3>
            <p className="mt-3 max-w-sm text-sm text-slate-400">Build Faster. Review Smarter. Ship Better.</p>
            <div className="mt-5 flex items-center gap-3 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 p-2 hover:text-white"><Globe size={16} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 p-2 hover:text-white"><Send size={16} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 p-2 hover:text-white"><BriefcaseBusiness size={16} /></a>
            </div>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-white">{column.title}</h4>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                {column.links.map((link) => (
                  <Link key={link.href + link.label} href={link.href} className="block transition hover:text-white">{link.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500">© 2026 DevPilot AI. All rights reserved.</div>
      </div>
    </footer>
  );
}

