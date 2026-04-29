import { cn } from "@/lib/utils/cn";

export function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" | "critical" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold uppercase",
        severity === "low" && "border-blue-500/30 bg-blue-500/20 text-blue-400",
        severity === "medium" && "border-yellow-500/30 bg-yellow-500/20 text-yellow-400",
        severity === "high" && "border-orange-500/30 bg-orange-500/20 text-orange-400",
        severity === "critical" && "border-red-500/30 bg-red-500/20 text-red-400",
      )}
    >
      {severity}
    </span>
  );
}
