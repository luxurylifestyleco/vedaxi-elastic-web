import { searchEvidence, type EvidenceObject, type EvidenceSearchResult } from "@vedaxi/contracts";

export interface PaperEvidenceService {
  search(query: string): EvidenceSearchResult[];
}

export function createPaperEvidenceService(evidence: EvidenceObject): PaperEvidenceService {
  return {
    search: (query) => searchEvidence(query, [evidence])
  };
}
