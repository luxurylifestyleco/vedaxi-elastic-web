import { searchEvidence, type EvidenceObject, type EvidenceSearchResult } from "@vedaxi/contracts";
import type { VideoFixture, VideoTranscriptCue } from "./fixture";
export interface TranscriptEvidence { evidence: EvidenceObject; cues: VideoTranscriptCue[]; }
export interface VideoEvidenceService { search(query: string): EvidenceSearchResult[]; readTranscript(): TranscriptEvidence; }

const singleTerm = (query: string): string | null => {
  const tokens = query.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return tokens.length === 1 ? tokens[0] : null;
};

export function createVideoEvidenceService(fixture: VideoFixture): VideoEvidenceService {
  return {
    search: (query) => {
      const ranked = searchEvidence(query, [fixture.evidence]);
      if (ranked.length) return ranked;

      const term = singleTerm(query);
      if (!term) return [];
      const searchable: string[] = [fixture.evidence.title, fixture.evidence.excerpt, ...fixture.evidence.keywords]
        .join(" ")
        .toLowerCase()
        .match(/[a-z0-9]+/g) ?? [];

      return searchable.includes(term) ? [{ evidence: fixture.evidence, score: 1 }] : [];
    },
    readTranscript: () => ({ evidence: fixture.evidence, cues: fixture.transcript.map((cue) => ({ ...cue })) })
  };
}
