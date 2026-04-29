import { z } from "zod";

export const reviewInputSchema = z.object({
  code: z.string().min(10),
  language: z.string().default("typescript"),
});

export const docsInputSchema = z.object({
  code: z.string().min(10),
  projectName: z.string().min(2),
  docTypes: z.array(z.string()).default(["README.md"]),
});

export const bugInputSchema = z.object({
  code: z.string().min(10),
  language: z.string().default("typescript"),
});

export const testInputSchema = z.object({
  code: z.string().min(10),
  language: z.string().default("typescript"),
  framework: z.string().default("jest"),
});
