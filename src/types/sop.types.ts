export type ParsedDocument = {
  fileName: string;
  rawText: string;
};

export type SopChunk = {
  id: string;
  text: string;
  metadata: {
    docId: string;
    docName: string;
    version: string;
    module: string;
    system: string;
    process: string;
    sectionTitle: string;
    chunkType: "overview" | "procedure" | "issue" | "decision_logic" | "metadata";
    issueTitle?: string;
    keywords?: string[];
    sourceFileName: string;
    isActive: boolean;
    createdAt: string;
  };
};