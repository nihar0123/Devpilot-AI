"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Layers, Lightbulb, TestTube } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CodeInput } from "@/components/ui/CodeInput";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useProjects } from "@/components/projects/project-provider";

type TestResult = {
  testCode: string;
  testCount: number;
  edgeCaseCount: number;
  mockCount: number;
  coverageSuggestions: string[];
  savedTestSuiteId?: string | null;
};

export default function TestGeneratorPage() {
  const { selectedProject } = useProjects();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [framework, setFramework] = useState("jest");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const frameworkOptions = useMemo(() => language === "python" ? ["pytest", "unittest"] : ["jest", "vitest", "mocha"], [language]);

  async function generate() {
    try {
      setLoading(true);
      const res = await fetch("/api/test-generator", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, language, framework, projectId: selectedProject?.id }) });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as TestResult;
      setResult(data);
      toast.success(data.savedTestSuiteId ? `Tests saved to ${selectedProject?.name}` : "Tests generated");
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="mb-5 text-2xl font-semibold">Test Generator</h1>
        <p className="mb-4 text-sm text-slate-400">Saving into: {selectedProject?.name ?? "connect a project in the top bar"}</p>
        <CodeInput value={code} onChange={setCode} language={language} onLanguageChange={(nextLanguage) => { setLanguage(nextLanguage); setFramework(nextLanguage === "python" ? "pytest" : "jest"); }} onAnalyze={generate} isLoading={loading} analyzeLabel="Generate Tests">
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={language} onChange={(event) => { setLanguage(event.target.value); setFramework(event.target.value === "python" ? "pytest" : "jest"); }} className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-slate-100">
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>
            <select value={framework} onChange={(event) => setFramework(event.target.value)} className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-slate-100">
              {frameworkOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </CodeInput>
      </Card>

      <Card>
        {loading ? <LoadingSkeleton lines={10} height="h-8" /> : null}
        {!loading && !result ? <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-400">Generate tests to inspect coverage, edge cases, and download-ready code.</div> : null}
        {result ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-3"><TestTube className="text-purple-300" size={18} /> <span className="text-sm text-slate-400">Test Cases</span></div><p className="mt-4 text-3xl font-semibold">{result.testCount}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-3"><AlertTriangle className="text-amber-300" size={18} /> <span className="text-sm text-slate-400">Edge Cases</span></div><p className="mt-4 text-3xl font-semibold">{result.edgeCaseCount}</p></div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-3"><Layers className="text-emerald-300" size={18} /> <span className="text-sm text-slate-400">Mock Examples</span></div><p className="mt-4 text-3xl font-semibold">{result.mockCount}</p></div>
            </div>
            <CodeBlock code={result.testCode} language={language} filename={language === "python" ? "test_original.py" : "originalFile.test.js"} />
            <div className="flex flex-wrap gap-3">
              <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold" onClick={async () => { await navigator.clipboard.writeText(result.testCode); toast.success("Code copied"); }}>Copy Code</button>
              <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold" onClick={() => { const blob = new Blob([result.testCode], { type: "text/plain" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = language === "python" ? "test_original.py" : "originalFile.test.js"; link.click(); URL.revokeObjectURL(url); }}>Download Test File</button>
            </div>
            <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5">
              <h2 className="text-lg font-semibold">Additional Test Scenarios to Consider</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                {result.coverageSuggestions.map((item) => <div key={item} className="flex items-start gap-3"><Lightbulb className="mt-0.5 text-purple-300" size={16} /> <span>{item}</span></div>)}
              </div>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
