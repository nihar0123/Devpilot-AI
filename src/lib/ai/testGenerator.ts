import { generateAiJson, hasAiKey } from "@/lib/ai/client";

export interface TestGeneratorResult {
  testCode: string;
  testCount: number;
  edgeCaseCount: number;
  mockCount: number;
  coverageSuggestions: string[];
}

function getDemoTests(language: string, framework: string): TestGeneratorResult {
  const python = language === "python";
  return {
    testCode: python
      ? `import pytest\n\nfrom app import normalize_user\n\n\ndef test_normalize_user_trims_name():\n    assert normalize_user({"name": "  Nihar  "})["name"] == "Nihar"\n\n\ndef test_normalize_user_rejects_missing_email():\n    with pytest.raises(ValueError):\n        normalize_user({"name": "Nihar"})\n`
      : `import { describe, expect, it } from "${framework === "vitest" ? "vitest" : framework === "mocha" ? "chai" : "@jest/globals"}";\nimport { normalizeUser } from "./user";\n\ndescribe("normalizeUser", () => {\n  it("trims whitespace from the name", () => {\n    expect(normalizeUser({ name: "  Nihar  ", email: "nihar@devpilot.ai" }).name).toBe("Nihar");\n  });\n\n  it("throws when email is missing", () => {\n    expect(() => normalizeUser({ name: "Nihar" } as never)).toThrow();\n  });\n});\n`,
    testCount: 2,
    edgeCaseCount: 3,
    mockCount: 1,
    coverageSuggestions: [
      "Add a test for malformed input objects with empty strings.",
      "Verify the fallback path when upstream services time out.",
      "Cover permission-based branches so unauthorized requests fail predictably.",
    ],
  };
}

export async function generateUnitTests(code: string, language: string, framework: string) {
  if (hasAiKey()) {
    try {
      const prompt = `Generate ${language} unit tests using ${framework}. Return JSON with the exact shape {"testCode": string, "testCount": number, "edgeCaseCount": number, "mockCount": number, "coverageSuggestions": string[]}.\n\nCode:\n${code}`;
      const result = (await generateAiJson(prompt)) as TestGeneratorResult;
      return result.testCode ? result : getDemoTests(language, framework);
    } catch {
      return getDemoTests(language, framework);
    }
  }

  return getDemoTests(language, framework);
}
