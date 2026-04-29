import { cn } from "@/lib/utils/cn";

export function LoadingSkeleton({ lines = 3, height = "h-4", className }: { lines?: number; height?: string; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={cn("animate-pulse rounded-2xl bg-white/5", height)} />
      ))}
    </div>
  );
}
