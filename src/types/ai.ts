export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface CodeReviewResult {
  score: number;
  summary: string;
  recommendations: Array<{
    title: string;
    detail: string;
    severity: Severity;
    lineHint?: string;
  }>;
  optimizedCode?: string;
}

export interface DocsResult {
  readme: string;
  setupGuide: string;
  apiDocs: string;
  moduleSummary: string;
}

export interface BugFindingResult {
  findings: Array<{
    severity: Severity;
    issue: string;
    fileName: string;
    suggestion: string;
  }>;
}

export interface TestGenerationResult {
  tests: string;
  coverageSuggestions: string[];
}

