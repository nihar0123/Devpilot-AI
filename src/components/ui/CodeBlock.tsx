"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CodeBlock({ code, language, filename }: { code: string; language: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#07101d]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 uppercase">{language}</span>
          {filename ? <span className="text-slate-400">{filename}</span> : null}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy Code"}
        </Button>
      </div>
      <pre className="max-h-[520px] overflow-auto p-4 text-sm text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
