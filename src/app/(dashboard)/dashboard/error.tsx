"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-semibold">Something went wrong</h2>
      <p className="mt-3 max-w-lg text-sm text-slate-400">{error.message}</p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </div>
  );
}
