import { generateAiJson, hasAiKey } from "@/lib/ai/client";

export interface CodeReviewResult {
  score: number;
  summary: string;
  issues: Array<{
    id: string;
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    snippet?: string;
    suggestedFix: string;
  }>;
  refactoredCode: string;
  securityRisks: Array<{
    id: string;
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    cwe?: string;
  }>;
}

function getUnavailableResult(): CodeReviewResult {
  return {
    score: 0,
    summary: "AI analysis is unavailable. Please configure your AI API keys in the environment.",
    issues: [
      {
        id: "review-1",
        severity: "medium",
        title: "No AI provider configured",
        description: "Set GEMINI_API_KEY or GROQ_API_KEY in your .env file to enable code analysis.",
        suggestedFix: "Add your Gemini or Groq API key to the environment variables and restart the server.",
      },
    ],
    refactoredCode: "",
    securityRisks: [],
  };
}

async function analyzeWithProvider(code: string, language: string): Promise<CodeReviewResult> {
  const prompt = `You are an expert code reviewer. Analyze the following ${language} code and return ONLY valid JSON - no markdown, no explanation, no text before or after.

Required JSON structure:
{
  "score": number (0-100),
  "summary": string (2-3 sentence overview of the code quality),
  "issues": [
    {
      "id": string,
      "severity": "low|medium|high|critical",
      "title": string,
      "description": string,
      "snippet": string (optional - relevant code excerpt),
      "suggestedFix": string
    }
  ],
  "refactoredCode": string (improved version of the code),
  "securityRisks": [
    {
      "id": string,
      "severity": "low|medium|high|critical",
      "title": string,
      "description": string,
      "cwe": string (optional - CWE identifier)
    }
  ]
}

Guidelines:
- For C++/C code: check for compile errors, memory leaks, undefined behavior, proper includes
- For other languages: check for syntax errors, security issues, best practices
- If code is valid with no issues, return score 100 and empty issues array
- If code has critical errors (syntax, compile), mark severity as "critical"
- Provide a refactoredCode that fixes the issues found

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Return only valid JSON.`;

  const result = (await generateAiJson(prompt)) as CodeReviewResult;

  // Validate and normalize the response
  return {
    score: typeof result.score === "number" ? result.score : 0,
    summary: typeof result.summary === "string" ? result.summary : "Analysis completed.",
    issues: Array.isArray(result.issues) ? result.issues : [],
    refactoredCode: typeof result.refactoredCode === "string" ? result.refactoredCode : code,
    securityRisks: Array.isArray(result.securityRisks) ? result.securityRisks : [],
  };
}

export async function analyzeCode(code: string, language: string) {
  // Use AI when keys exist
  if (hasAiKey()) {
    try {
      return await analyzeWithProvider(code, language);
    } catch (error) {
      console.error("AI analysis failed:", error);
      // Return error state instead of falling back to local heuristics
      return {
        score: 0,
        summary: "AI analysis failed. Please check your API key configuration and try again.",
        issues: [
          {
            id: "review-1",
            severity: "high",
            title: "Analysis service unavailable",
            description: `The AI review service returned an error: ${error instanceof Error ? error.message : "Unknown error"}`,
            suggestedFix: "Verify your API keys are valid and have sufficient quota.",
          },
        ],
        refactoredCode: code,
        securityRisks: [],
      };
    }
  }

  // No API key configured
  return getUnavailableResult();
}
