import { failure, success } from "@/lib/api/response";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return failure("No file uploaded.", 400);
    }

    const maxBytes = 1024 * 1024;
    if (file.size > maxBytes) {
      return failure("File too large. Max size is 1MB.", 400);
    }

    const content = await file.text();
    if (!content.trim()) {
      return failure("Uploaded file is empty.", 400);
    }

    return success({
      fileName: file.name,
      content,
    });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Upload failed", 500);
  }
}
