export interface EvidenceObject {
  id: string;
  assetType: string;
  sourceOrigin: string;
  locator: string;
  title: string;
  excerpt: string;
  keywords: string[];
  provenance: string;
}

export interface EvidenceSearchResult {
  evidence: EvidenceObject;
  score: number;
}

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "of",
  "on",
  "or",
  "the",
  "to",
  "was",
  "what",
  "were",
  "with"
]);

const tokenize = (value: string): string[] =>
  value.toLowerCase().match(/[a-z0-9]+/g) ?? [];

// A result needs two distinct exact, non-stopword matches; stopword-only queries return no evidence.
const meaningfulTokens = (value: string): string[] =>
  tokenize(value).filter((token) => !STOPWORDS.has(token));

export function searchEvidence(query: string, evidence: EvidenceObject[]): EvidenceSearchResult[] {
  const queryTokens = [...new Set(meaningfulTokens(query))];

  if (queryTokens.length === 0) {
    return [];
  }

  return evidence
    .map((item) => {
      const searchableTokens = new Set(
        tokenize([item.title, item.excerpt, ...item.keywords].join(" "))
      );
      const score = queryTokens.filter((token) => searchableTokens.has(token)).length;

      return { evidence: item, score };
    })
    .filter((result) => result.score >= 2)
    .sort((left, right) => right.score - left.score);
}
