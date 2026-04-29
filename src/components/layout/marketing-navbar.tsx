"use client";

import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/login", label: "Login" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07101d]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="relative z-50 flex items-center gap-2 text-lg font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[rgba(117,104,255,0.2)] text-[var(--purple)]">
            <Sparkles size={18} />
          </span>
          DevPilot AI
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="https://github.com" target="_blank" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
            GitHub
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-[var(--purple)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(117,104,255,0.35)] transition hover:bg-[#8479ff]">
            Get Started
          </Link>
        </div>

        <button type="button" className="rounded-xl border border-white/10 bg-white/5 p-2 text-white md:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
          <Menu size={20} />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] bg-black/70 md:hidden">
          <button type="button" className="absolute inset-0" onClick={() => setOpen(false)} aria-label="Close navigation" />
          <div className="glass-strong absolute right-0 top-0 h-full w-[280px] p-6">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>
              <button type="button" className="rounded-xl border border-white/10 p-2" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <Link href="https://github.com" target="_blank" className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                GitHub
              </Link>
              <Link href="/login" className="flex items-center justify-center rounded-2xl bg-[var(--purple)] px-4 py-3 text-sm font-semibold text-white" onClick={() => setOpen(false)}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
