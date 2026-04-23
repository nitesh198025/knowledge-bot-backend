import OpenAI from "openai";
import { retrieveRelevantChunks } from "./retrieval.service";
import { validateQueryAgainstDomain } from "./domain-validation.service";

function getNamespaceForDomain(domain: string): string {
  if (domain === "technical") {
    return process.env.TECHNICAL_NAMESPACE as string;
  }

  if (domain === "finance") {
    return process.env.FINANCE_NAMESPACE as string;
  }

  throw new Error("Invalid domain");
}

export async function answerQuestion(query: string, domain: string) {
  const selectedDomain = domain as "technical" | "finance";

  const validation = validateQueryAgainstDomain(query, selectedDomain);

  if (!validation.isMatch) {
    return {
      answer: `This query appears to belong to the ${validation.detectedDomain} domain, not ${selectedDomain}. Please select the correct domain and try again.`,
      sources: [],
      selectedDomain,
      selectedNamespace: null,
      domainValidation: validation,
    };
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  const namespace = getNamespaceForDomain(selectedDomain);
  const chunks = await retrieveRelevantChunks(query, namespace);

  if (!chunks.length) {
    return {
      answer: `No relevant SOP found in the ${selectedDomain} domain. Please refine your query or choose a different domain.`,
      sources: [],
      selectedDomain,
      selectedNamespace: namespace,
      domainValidation: validation,
    };
  }

  const context = chunks
    .map((c: any, i: number) => {
      return [
        `Source ${i + 1}`,
        `Document: ${c.docName || "Unknown"}`,
        `Section: ${c.sectionTitle || "Unknown"}`,
        `Type: ${c.chunkType || "Unknown"}`,
        `Content: ${c.text}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  const prompt = `
You are an enterprise SOP support assistant.

Answer ONLY from the provided context.
Do NOT guess.
Do NOT invent steps, screens, or transactions.
Prefer issue-specific sections over general sections.
If the context is incomplete, say so clearly.

Return the answer in this exact format:

Recommended Action:
- one short paragraph

Steps:
1. ...
2. ...
3. ...

Why this is likely:
- short bullet(s)

Escalate when:
- short bullet(s)

Confidence:
- High / Medium / Low

User Question:
${query}

Selected Domain:
${selectedDomain}

Context:
${context}
`;

  const response: any = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: prompt,
  });

  return {
    answer: response.output_text,
    sources: chunks.map((c: any) => ({
      id: c.id,
      score: c.score,
      adjustedScore: c.adjustedScore,
      sectionTitle: c.sectionTitle,
      docName: c.docName,
      chunkType: c.chunkType,
    })),
    selectedDomain,
    selectedNamespace: namespace,
    domainValidation: validation,
  };
}