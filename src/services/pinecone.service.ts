import { Pinecone } from "@pinecone-database/pinecone";
import type { SopChunk } from "../types/sop.types";

export async function upsertChunks(chunks: SopChunk[]): Promise<number> {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string
  });

  const indexName = process.env.PINECONE_INDEX_NAME as string;
  const namespace = process.env.PINECONE_NAMESPACE || "__default__";

  const index: any = pc.index(indexName);

  const records = chunks.map((chunk) => ({
    _id: chunk.id,
    text: chunk.text,
    docId: chunk.metadata.docId,
    docName: chunk.metadata.docName,
    version: chunk.metadata.version,
    module: chunk.metadata.module,
    system: chunk.metadata.system,
    process: chunk.metadata.process,
    sectionTitle: chunk.metadata.sectionTitle,
    chunkType: chunk.metadata.chunkType,
    issueTitle: chunk.metadata.issueTitle || "",
    sourceFileName: chunk.metadata.sourceFileName,
    isActive: chunk.metadata.isActive,
    createdAt: chunk.metadata.createdAt
  }));

  await index.upsertRecords({
    namespace,
    records
  });

  return records.length;
}