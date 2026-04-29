import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendValue }: StatsCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <Icon className="text-indigo-300" size={18} />
      </div>
      {trend && trendValue && (
        <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted">
          {trend === "up" ? <TrendingUp size={14} className="text-emerald-300" /> : <TrendingDown size={14} className="text-red-300" />}
          <span>{trendValue}</span>
        </div>
      )}
    </Card>
  );
}
