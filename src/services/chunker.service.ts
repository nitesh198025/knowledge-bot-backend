import crypto from "crypto";
import type { SopChunk } from "../types/sop.types";

type ChunkBaseMeta = {
  docId: string;
  docName: string;
  version: string;
  module: string;
  system: string;
  process: string;
  sourceFileName: string;
};

function makeId(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 24);
}

function detectChunkType(sectionTitle: string): {
  chunkType: SopChunk["metadata"]["chunkType"];
  issueTitle?: string;
} {
  if (/^overview$/i.test(sectionTitle)) {
    return { chunkType: "overview" };
  }

  if (/^issue\s*[:\-]/i.test(sectionTitle) || /^issue\s+\d+/i.test(sectionTitle)) {
    return { chunkType: "issue", issueTitle: sectionTitle };
  }

  if (/decision logic/i.test(sectionTitle)) {
    return { chunkType: "decision_logic" };
  }

  if (/metadata/i.test(sectionTitle)) {
    return { chunkType: "metadata" };
  }

  return { chunkType: "procedure" };
}

function splitByKnownHeadings(rawText: string): Array<{ title: string; body: string }> {
  const headingPatterns = [
    "Document Header",
    "Overview",
    "When to Use This SOP",
    "Key Concepts",
    "Setup Procedure",
    "Creating Permissions",
    "Assigning Permissions",
    "Apply Permissions (Mandatory)",
    "Apply Permissions",
    "Decision Logic",
    "Metadata"
  ];

  const issueRegex = /Issue\s*:\s*[^\n]+/gi;

  const dynamicHeadings: string[] = [];
  for (const match of rawText.matchAll(issueRegex)) {
    if (match[0]) dynamicHeadings.push(match[0].trim());
  }

  const allHeadings = [...headingPatterns, ...dynamicHeadings]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (allHeadings.length === 0) {
    return [];
  }

  const escaped = allHeadings.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const combinedRegex = new RegExp(`(?:^|\\n)(${escaped.join("|")})(?=\\n|$)`, "g");

  const matches = [...rawText.matchAll(combinedRegex)];

  if (matches.length === 0) {
    return [];
  }

  const sections: Array<{ title: string; body: string }> = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];

    const title = current[1].trim();
    const start = (current.index ?? 0) + current[0].length;
    const end = next ? (next.index ?? rawText.length) : rawText.length;

    const body = rawText.slice(start, end).trim();

    if (body) {
      sections.push({ title, body });
    }
  }

  return sections;
}

function fallbackParagraphChunks(rawText: string): Array<{ title: string; body: string }> {
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => ({
    title: `Section ${i + 1}`,
    body: p
  }));
}

export function chunkSopText(rawText: string, meta: ChunkBaseMeta): SopChunk[] {
  const createdAt = new Date().toISOString();

  let sections = splitByKnownHeadings(rawText);

  if (sections.length === 0) {
    sections = fallbackParagraphChunks(rawText);
  }

  const chunks: SopChunk[] = [];

  for (const section of sections) {
    const { chunkType, issueTitle } = detectChunkType(section.title);
    const text = `${section.title}\n${section.body}`.trim();
    const id = makeId(`${meta.docId}:${section.title}:${text}`);

    chunks.push({
      id,
      text,
      metadata: {
        ...meta,
        sectionTitle: section.title,
        chunkType,
        issueTitle,
        sourceFileName: meta.sourceFileName,
        isActive: true,
        createdAt
      }
    });
  }

  return chunks;
}