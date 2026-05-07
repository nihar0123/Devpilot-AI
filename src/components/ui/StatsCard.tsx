"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { cn } from "@/lib/utils/cn";

export function StatsCard({ title, value, icon, iconColor = "text-[var(--purple)]", trend, trendUp = true, loading = false }: { title: string; value: string | number; icon?: React.ReactNode; iconColor?: string; trend?: string; trendUp?: boolean; loading?: boolean }) {
  return (
    <Card className="rounded-3xl p-5">
      {loading ? (
        <LoadingSkeleton lines={3} height="h-6" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{title}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
            {icon && <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-3", iconColor)}>{icon}</div>}
          </div>
          {trend ? (
            <div className={cn("inline-flex items-center gap-1 text-xs", trendUp ? "text-emerald-400" : "text-rose-400")}>
              {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend}
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
