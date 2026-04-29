"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { CodeInput } from "@/components/ui/CodeInput";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const options = [
  { label: "README.md", value: "readme", responseKey: "readme" },
  { label: "Setup Guide", value: "setup", responseKey: "setupGuide" },
  { label: "API Documentation", value: "api", responseKey: "apiDocs" },
  { label: "Module Summary", value: "summary", responseKey: "moduleSummary" },
] as const;

export default function DocsGeneratorPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [projectName, setProjectName] = useState("my-awesome-project");
  const [docTypes, setDocTypes] = useState<string[]>(["readme", "setup", "api", "summary"]);
  const [activeDoc, setActiveDoc] = useState<(typeof options)[number]["responseKey"]>("readme");
  const [mode, setMode] = useState<"preview" | "raw">("preview");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, string> | null>(null);

  const visibleTabs = useMemo(() => options.filter((option) => docTypes.includes(option.value)), [docTypes]);

  async function generate() {
    try {
      setLoading(true);
      const res = await fetch("/api/docs-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, projectName, docTypes }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      toast.success("Documentation generated");
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentText = result?.[activeDoc] ?? "";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h1 className="mb-5 text-2xl font-semibold">Documentation Generator</h1>
        <div className="mb-5 space-y-2">
          <label className="text-sm font-medium">Project Name</label>
          <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="my-awesome-project" />
        </div>
        <CodeInput value={code} onChange={setCode} language={language} onLanguageChange={setLanguage} onAnalyze={generate} isLoading={loading} analyzeLabel="Generate Docs">
          <div>
            <label className="mb-3 block text-sm font-medium">Generate:</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((option) => (
                <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <input type="checkbox" checked={docTypes.includes(option.value)} onChange={() => setDocTypes((current) => current.includes(option.value) ? current.filter((item) => item !== option.value) : [...current, option.value])} />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </CodeInput>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2">
          {visibleTabs.map((tab) => (
            <button key={tab.value} type="button" className={`rounded-xl px-4 py-2 text-sm ${activeDoc === tab.responseKey ? "bg-white text-slate-900" : "border border-white/10 bg-white/5 text-slate-300"}`} onClick={() => setActiveDoc(tab.responseKey)}>{tab.label}</button>
          ))}
        </div>
        <div className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/5 p-1 text-sm">
          <button type="button" className={`rounded-lg px-3 py-2 ${mode === "preview" ? "bg-white text-slate-900" : "text-slate-300"}`} onClick={() => setMode("preview")}>Preview</button>
          <button type="button" className={`rounded-lg px-3 py-2 ${mode === "raw" ? "bg-white text-slate-900" : "text-slate-300"}`} onClick={() => setMode("raw")}>Raw Markdown</button>
        </div>

        <div className="mt-6 min-h-[420px] rounded-3xl border border-white/10 bg-black/20 p-5">
          {loading ? <LoadingSkeleton lines={10} height="h-6" /> : result ? (mode === "preview" ? <article className="prose prose-invert max-w-none"><ReactMarkdown>{currentText}</ReactMarkdown></article> : <textarea readOnly value={currentText} className="min-h-[380px] w-full resize-none bg-transparent font-mono text-sm text-slate-200" />) : <div className="flex min-h-[380px] items-center justify-center text-sm text-slate-400">Generate docs to preview markdown output.</div>}
        </div>

        {result ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold" onClick={async () => { await navigator.clipboard.writeText(currentText); setCopied(true); toast.success("Markdown copied"); window.setTimeout(() => setCopied(false), 1200); }}>{copied ? <span className="inline-flex items-center gap-2"><Check size={14} /> Copied</span> : "Copy Markdown"}</button>
            <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold" onClick={() => { const blob = new Blob([currentText], { type: "text/markdown" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${activeDoc}.md`; link.click(); URL.revokeObjectURL(url); }}>Download .md</button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
