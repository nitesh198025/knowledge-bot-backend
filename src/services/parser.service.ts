import mammoth from "mammoth";
import path from "path";
import type { ParsedDocument } from "../types/sop.types";

export async function parseDocument(
  filePath: string,
  originalFileName: string
): Promise<ParsedDocument> {
  const ext = path.extname(originalFileName).toLowerCase();
  const fileName = path.basename(originalFileName);

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return { fileName, rawText: result.value };
  }

  throw new Error(`Unsupported file type for now: ${ext}. Please upload a .docx file.`);
}