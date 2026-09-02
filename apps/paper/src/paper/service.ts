import { searchEvidence, type EvidenceObject, type EvidenceSearchResult } from "@vedaxi/contracts";

export interface PaperEvidenceService {
  search(query: string): EvidenceSearchResult[];
}

export function createPaperEvidenceService(
  evidence: EvidenceObject | readonly EvidenceObject[]
): PaperEvidenceService {
  const items: EvidenceObject[] = Array.isArray(evidence)
    ? [...(evidence as EvidenceObject[])]
    : [evidence as EvidenceObject];
  return {
    search: (query) => searchEvidence(query, items)
  };
}
