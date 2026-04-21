import { parseDocument } from "./parser.service";
import { normalizeText } from "./normalizer.service";
import { chunkSopText } from "./chunker.service";
import { upsertChunks } from "./pinecone.service";

export async function ingestSop(filePath: string, fileName: string) {
  const parsed = await parseDocument(filePath, fileName);
  const normalized = normalizeText(parsed.rawText);

  const docName = fileName.replace(/\.[^.]+$/, "");

  const chunks = chunkSopText(normalized, {
    docId: docName.toLowerCase().replace(/\s+/g, "-"),
    docName,
    version: "1.0",
    module: "Security",
    system: "ERP",
    process: "User Access Control",
    sourceFileName: fileName
  });

  const upserted = await upsertChunks(chunks);

  return {
    docName,
    chunkCount: chunks.length,
    upserted
  };
}