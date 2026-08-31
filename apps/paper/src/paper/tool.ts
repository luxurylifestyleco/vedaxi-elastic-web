import type { WebMcpTool } from "@vedaxi/contracts";

import type { PaperEvidenceService } from "./service";

const MAX_QUERY_LENGTH = 160;

export interface PaperToolMetadata {
  name: string;
  title: string;
}

const defaultMetadata: PaperToolMetadata = {
  name: "search_paper_evidence",
  title: "Search paper evidence"
};

function validateInput(input: unknown): string {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("input must contain only query");
  }

  const fields = input as Record<string, unknown>;
  if (Object.keys(fields).length !== 1 || !("query" in fields)) {
    throw new Error("input must contain only query");
  }

  const query = fields.query;
  if (typeof query !== "string" || query.trim().length === 0) {
    throw new Error("query must be a non-blank string");
  }

  if (query.length > MAX_QUERY_LENGTH) {
    throw new Error("query is too long");
  }

  return query;
}

export function createPaperEvidenceTool(
  service: PaperEvidenceService,
  metadata: PaperToolMetadata = defaultMetadata
): WebMcpTool {
  return {
    name: metadata.name,
    title: metadata.title,
    description:
      "Search this publisher's paper for exact evidence passages. Returns paper-owned evidence and provenance only.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", maxLength: MAX_QUERY_LENGTH, pattern: "\\S" } },
      required: ["query"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async (input) => service.search(validateInput(input))
  };
}
