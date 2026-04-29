"use client";

import { useMemo, useRef, useState } from "react";
import { FileCode2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  analyzeLabel?: string;
  children?: React.ReactNode;
}

const languageOptions = ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "Other"];
const languageMap: Record<string, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Python: "python",
  Java: "java",
  Go: "go",
  Rust: "rust",
  "C++": "cpp",
  Other: "other",
};

export function CodeInput({ value, onChange, language, onLanguageChange, onAnalyze, isLoading, analyzeLabel = "Analyze Code", children }: CodeInputProps) {
  const [tab, setTab] = useState<"paste" | "upload">("paste");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedLanguage = useMemo(() => {
    const match = Object.entries(languageMap).find(([, mapped]) => mapped === language);
    return match?.[0] ?? "TypeScript";
  }, [language]);

  async function loadFile(file: File) {
    const text = await file.text();
    onChange(text);
    setFileName(file.name);
  }

  const lineNumbers = useMemo(() => {
    const count = Math.max(value.split("\n").length, 12);
    return Array.from({ length: count }, (_, index) => index + 1).join("\n");
  }, [value]);

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 text-sm">
        <button type="button" className={`rounded-xl px-4 py-2 ${tab === "paste" ? "bg-white/10 text-white" : "text-slate-400"}`} onClick={() => setTab("paste")}>Paste Code</button>
        <button type="button" className={`rounded-xl px-4 py-2 ${tab === "upload" ? "bg-white/10 text-white" : "text-slate-400"}`} onClick={() => setTab("upload")}>Upload File</button>
      </div>

      {tab === "paste" ? (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
          <div className="grid min-h-[300px] grid-cols-[56px_1fr]">
            <pre className="border-r border-white/8 bg-black/20 px-3 py-4 text-right text-xs leading-6 text-slate-500">{lineNumbers}</pre>
            <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="// Paste your code here..." className="min-h-[300px] resize-y bg-transparent px-4 py-4 font-mono text-sm leading-6 text-slate-100 placeholder:text-slate-500" />
          </div>
        </div>
      ) : (
        <div
          className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-black/20 px-6 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={async (event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            if (file) await loadFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mb-4 text-slate-300" />
          <p className="text-sm font-medium text-slate-100">Drop your file here or click to browse</p>
          <p className="mt-2 text-xs text-slate-400">Accepted: .js .ts .tsx .jsx .py .java .go .rs .cpp .c</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".js,.ts,.tsx,.jsx,.py,.java,.go,.rs,.cpp,.c"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) await loadFile(file);
            }}
          />
          {fileName ? (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
              <FileCode2 size={14} />
              {fileName}
              <button
                type="button"
                className="rounded-full bg-white/5 p-1 text-slate-400 hover:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  setFileName(null);
                  onChange("");
                }}
              >
                <X size={12} />
              </button>
            </div>
          ) : null}
        </div>
      )}

      {children}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <select value={selectedLanguage} onChange={(event) => onLanguageChange(languageMap[event.target.value] ?? "typescript")} className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-slate-100">
          {languageOptions.map((option) => (
            <option key={option} value={option} className="bg-slate-900">{option}</option>
          ))}
        </select>
        <Button type="button" size="lg" className="w-full sm:w-[220px]" onClick={onAnalyze} disabled={isLoading || !value.trim()}>
          {isLoading ? "Working..." : analyzeLabel}
        </Button>
      </div>
    </div>
  );
}
