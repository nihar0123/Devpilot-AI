"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { DashboardTopBar } from "@/components/dashboard/TopBar";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <div className="glass hidden rounded-3xl p-4 md:block"><LoadingSkeleton lines={10} height="h-10" /></div>
        <div className="space-y-6"><LoadingSkeleton lines={1} height="h-20" /><LoadingSkeleton lines={8} height="h-24" /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-[1440px] gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
      <div className="hidden md:block">
        <DashboardSidebar user={data?.user} />
      </div>
      <div className="space-y-6">
        <DashboardTopBar onOpenMenu={() => setMobileOpen(true)} user={data?.user} />
        <main className="pb-10">{children}</main>
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-[90] bg-black/70 md:hidden">
          <button type="button" className="absolute inset-0" onClick={() => setMobileOpen(false)} aria-label="Close sidebar" />
          <div className="absolute left-0 top-0 h-full w-[280px]">
            <DashboardSidebar mobile onClose={() => setMobileOpen(false)} user={data?.user} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
