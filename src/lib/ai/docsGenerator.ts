import { docsTemplates } from "@/lib/demoData";
import { generateAiJson, hasAiKey } from "@/lib/ai/client";

export interface DocsGeneratorResult {
  readme?: string;
  setupGuide?: string;
  apiDocs?: string;
  moduleSummary?: string;
}

function getDemoDocs(projectName: string, docTypes: string[]): DocsGeneratorResult {
  return {
    ...(docTypes.includes("readme") ? { readme: docsTemplates.readme(projectName) } : {}),
    ...(docTypes.includes("setup") ? { setupGuide: docsTemplates.setupGuide(projectName) } : {}),
    ...(docTypes.includes("api") ? { apiDocs: docsTemplates.apiDocs(projectName) } : {}),
    ...(docTypes.includes("summary") ? { moduleSummary: docsTemplates.moduleSummary(projectName) } : {}),
  };
}

export async function generateDocs(code: string, projectName: string, docTypes: string[]) {
  if (hasAiKey()) {
    try {
      const prompt = `Generate ${docTypes.join(", ")} documentation for a project named ${projectName}. Return JSON using keys readme, setupGuide, apiDocs, moduleSummary only when relevant. Use the provided code as context.\n\nCode:\n${code}`;
      const result = (await generateAiJson(prompt)) as DocsGeneratorResult;
      return { ...getDemoDocs(projectName, docTypes), ...result };
    } catch {
      return getDemoDocs(projectName, docTypes);
    }
  }

  return getDemoDocs(projectName, docTypes);
}
