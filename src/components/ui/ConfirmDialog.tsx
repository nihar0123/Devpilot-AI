"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({ open, onConfirm, onCancel, title, description, confirmLabel = "Confirm", destructive = false }: { open: boolean; onConfirm: () => void; onCancel: () => void; title: string; description: string; confirmLabel?: string; destructive?: boolean }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="glass-strong w-full max-w-md rounded-3xl p-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="button" variant={destructive ? "danger" : "default"} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
