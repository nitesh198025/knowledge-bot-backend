import { Pinecone } from "@pinecone-database/pinecone";

type RetrievedChunk = {
  id: string;
  score: number;
  text: string;
  sectionTitle?: string;
  docName?: string;
  chunkType?: string;
  adjustedScore: number;
};

function getChunkTypeBoost(chunkType?: string): number {
  if (chunkType === "issue") return 0.12;
  if (chunkType === "decision_logic") return 0.08;
  if (chunkType === "procedure") return 0.03;
  return 0;
}

function getSectionBoost(query: string, sectionTitle?: string): number {
  if (!sectionTitle) return 0;

  const q = query.toLowerCase();
  const s = sectionTitle.toLowerCase();

  let boost = 0;

  if (q.includes("cannot access") || q.includes("access")) {
    if (s.includes("user cannot access data")) boost += 0.18;
    if (s.includes("permission not working")) boost += 0.12;
    if (s.includes("changes not reflected")) boost += 0.08;
  }

  if (q.includes("permission")) {
    if (s.includes("permission not working")) boost += 0.12;
    if (s.includes("changes not reflected")) boost += 0.08;
  }

  return boost;
}

export async function retrieveRelevantChunks(query: string): Promise<RetrievedChunk[]> {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string
  });

  const indexName = process.env.PINECONE_INDEX_NAME as string;
  const namespace = process.env.PINECONE_NAMESPACE || "__default__";

  const index: any = pc.index({ name: indexName, namespace });

  const response = await index.searchRecords({
    query: {
      inputs: { text: query },
      topK: 8
    },
    fields: ["text", "sectionTitle", "docName", "chunkType"]
  });

  const matches = response?.matches || response?.result?.hits || [];

  const ranked = matches.map((hit: any) => {
    const record = hit.record || hit;

    const score = Number(hit.score || hit._score || 0);
    const chunkType = record.chunkType || record.fields?.chunkType;
    const sectionTitle = record.sectionTitle || record.fields?.sectionTitle;

    const adjustedScore =
      score +
      getChunkTypeBoost(chunkType) +
      getSectionBoost(query, sectionTitle);

    return {
      id: record._id || record.id,
      score,
      text: record.text || record.fields?.text || "",
      sectionTitle,
      docName: record.docName || record.fields?.docName,
      chunkType,
      adjustedScore
    };
  });

  return ranked
    .sort((a: RetrievedChunk, b: RetrievedChunk) => b.adjustedScore - a.adjustedScore)
    .slice(0, 5);
}