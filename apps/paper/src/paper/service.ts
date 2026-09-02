import { searchEvidence, type EvidenceObject, type EvidenceSearchResult } from "@vedaxi/contracts";

export interface PaperEvidenceService {
  search(query: string): EvidenceSearchResult[];
}

export function createPaperEvidenceService(
  evidence: EvidenceObject | readonly EvidenceObject[] | EvidenceObject[]
): PaperEvidenceService {
  const items = Array.isArray(evidence) ? [...evidence] : [evidence];
  return {
    search: (query) => searchEvidence(query, items)
  };
}
