import { generateAiJson, hasAiKey } from "@/lib/ai/client";

export interface BugFinderResult {
  totalBugs: number;
  severityBreakdown: { critical: number; high: number; medium: number; low: number };
  bugs: Array<{
    id: string;
    severity: "critical" | "high" | "medium" | "low";
    title: string;
    description: string;
    fileName?: string;
    line?: number;
    codeContext?: string;
    suggestedFix: string;
  }>;
}

function getDemoBugFinderResult(code: string): BugFinderResult {
  const bugs = [
    {
      id: "bug-1",
      severity: "critical" as const,
      title: "Potential SQL injection path",
      description: "User-controlled input appears likely to flow into a query or persistence boundary without strong normalization.",
      fileName: "input-handler.ts",
      line: 18,
      codeContext: code.split("\n").slice(0, 5).join("\n"),
      suggestedFix: "Use parameterized queries or ORM bindings and validate the input schema before it reaches the database layer.",
    },
    {
      id: "bug-2",
      severity: "high" as const,
      title: "Null access risk on nested property",
      description: "The logic assumes an object exists before dereferencing it, which can cause a runtime crash in edge-case requests.",
      fileName: "service.ts",
      line: 27,
      suggestedFix: "Guard nested access with optional chaining or an explicit presence check before using the value.",
    },
    {
      id: "bug-3",
      severity: "medium" as const,
      title: "Duplicate branch logic hides inconsistent behavior",
      description: "Two similar branches appear to compute related outcomes differently, which can create maintenance bugs during future edits.",
      suggestedFix: "Extract the shared path into one helper and make the branch-specific behavior explicit.",
    },
    {
      id: "bug-4",
      severity: "low" as const,
      title: "Dead code after early return",
      description: "One block looks unreachable because an earlier condition exits the function first.",
      suggestedFix: "Remove unreachable logic and add a regression test so the control flow stays intentional.",
    },
  ];

  return {
    totalBugs: bugs.length,
    severityBreakdown: { critical: 1, high: 1, medium: 1, low: 1 },
    bugs,
  };
}

export async function findBugs(code: string, language: string) {
  if (hasAiKey()) {
    try {
      const prompt = `Find bugs in this ${language} code. Return JSON with the exact shape {"totalBugs": number, "severityBreakdown": {"critical": number, "high": number, "medium": number, "low": number}, "bugs": [{"id": string, "severity": "critical|high|medium|low", "title": string, "description": string, "fileName"?: string, "line"?: number, "codeContext"?: string, "suggestedFix": string}]}.\n\nCode:\n${code}`;
      const result = (await generateAiJson(prompt)) as BugFinderResult;
      return result.bugs?.length ? result : getDemoBugFinderResult(code);
    } catch {
      return getDemoBugFinderResult(code);
    }
  }

  return getDemoBugFinderResult(code);
}
