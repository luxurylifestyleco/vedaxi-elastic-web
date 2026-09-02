import type { EvidenceObject } from "@vedaxi/contracts";

export const PAPER_EVIDENCE_ID = "paper.methods.final-analysis" as const;

export interface PaperDocument {
  title: string;
  dek: string;
  authors: string[];
  journal: string;
  published: string;
  identifier: string;
  abstract: string;
  methodsIntroduction: string;
  methodsEvidenceId: typeof PAPER_EVIDENCE_ID;
  limitations: string;
  references: Array<{ id: string; citation: string }>;
  isFictional: true;
}

export interface PaperFixture {
  document: PaperDocument;
  evidence: EvidenceObject;
}

export interface PaperRuntimeConfig {
  paperOrigin: string;
  videoOrigin: string;
}

export function resolveConfiguredVideoOrigin(value: unknown, isDevelopment: boolean): unknown {
  return value ?? (isDevelopment ? "http://localhost:4174" : undefined);
}

export function resolvePaperRuntimeConfig(paperOrigin: string, videoOrigin: unknown): PaperRuntimeConfig {
  if (typeof videoOrigin !== "string" || !videoOrigin.trim()) {
    throw new Error("Video origin configuration is missing");
  }
  const paper = normalizeRuntimeOrigin(paperOrigin, "Paper");
  const video = normalizeRuntimeOrigin(videoOrigin, "Video");
  if (paper === video) throw new Error("Video origin must differ from Paper origin");
  return { paperOrigin: paper, videoOrigin: video };
}

function normalizeRuntimeOrigin(value: string, label: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} origin must be a valid URL`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${label} origin must use http or https`);
  }
  return url.origin;
}

function normalizeWebOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("sourceOrigin must be a valid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("sourceOrigin must use an http or https origin");
  }

  return url.origin;
}

export function createPaperFixture(sourceOrigin: string): PaperFixture {
  const normalizedOrigin = normalizeWebOrigin(sourceOrigin);
  const evidence: EvidenceObject = {
    id: PAPER_EVIDENCE_ID,
    assetType: "paper-passage",
    sourceOrigin: normalizedOrigin,
    locator: "Methods, participants",
    title: "Final analysis cohort",
    excerpt: "Forty participants completed the study and were included in the final analysis.",
    keywords: ["participants", "final", "analysis", "analyzed", "sample"],
    provenance: "VEDAXI controlled paper fixture — Methods, participants"
  };

  return {
    document: {
      title: "Attention recovery after interrupted analytical work",
      dek: "A controlled study of how researchers regain context after a high-friction interruption.",
      authors: ["Mira Sen", "Jon Bell", "Ada Kline"],
      journal: "Journal of Applied Research Systems",
      published: "August 2026",
      identifier: "VEDAXI-FIXTURE-2026-014",
      abstract:
        "Research workflows are often measured by task completion while the cost of reconstructing context remains invisible. This controlled fixture examines how analysts resume a structured evidence review after an interruption.",
      methodsIntroduction:
        "Participants completed a document-coding task in two sessions. The analysis plan, eligibility rule, and stopping criterion were fixed before the controlled run.",
      methodsEvidenceId: PAPER_EVIDENCE_ID,
      limitations:
        "This fictional fixture is intentionally narrow. It supports a deterministic protocol demonstration and must not be interpreted as a real clinical or behavioral finding.",
      references: [
        {
          id: "R1",
          citation: "Sen M, Bell J, Kline A. Controlled interruption protocol. Fixture appendix A. 2026."
        },
        {
          id: "R2",
          citation: "VEDAXI Research Systems. Evidence provenance specification. Fixture edition. 2026."
        }
      ],
      isFictional: true
    },
    evidence
  };
}

export function createPaperCorpus(fixture: PaperFixture): EvidenceObject[] {
  const origin = fixture.evidence.sourceOrigin;
  return [
    fixture.evidence,
    {
      id: "paper.abstract",
      assetType: "paper-passage",
      sourceOrigin: origin,
      locator: "Abstract",
      title: "Abstract · Study overview",
      excerpt: fixture.document.abstract,
      keywords: ["abstract", "context", "interruption", "reconstructing", "workflows", "resuming", "analysts", "analytical"],
      provenance: "VEDAXI controlled paper fixture — Abstract"
    },
    {
      id: "paper.methods.intro",
      assetType: "paper-passage",
      sourceOrigin: origin,
      locator: "Methods",
      title: "Methods · Participant accounting",
      excerpt: fixture.document.methodsIntroduction,
      keywords: ["document", "coding", "task", "eligibility", "criterion", "stopping", "sessions", "methods"],
      provenance: "VEDAXI controlled paper fixture — Methods introduction"
    },
    {
      id: "paper.study-flow",
      assetType: "paper-passage",
      sourceOrigin: origin,
      locator: "Study flow",
      title: "Study flow · Participant progression",
      excerpt: "Three equal stages: enrolled forty, completed forty, and included in final analysis forty participants.",
      keywords: ["enrolled", "completed", "flow", "stages", "accounting", "study", "progression"],
      provenance: "VEDAXI controlled paper fixture — Study flow"
    },
    {
      id: "paper.limitations",
      assetType: "paper-passage",
      sourceOrigin: origin,
      locator: "Limitations",
      title: "Limitations · Scope note",
      excerpt: fixture.document.limitations,
      keywords: ["limitations", "narrow", "fixture", "clinical", "behavioral", "scope", "interpretation"],
      provenance: "VEDAXI controlled paper fixture — Limitations"
    },
    {
      id: "paper.references",
      assetType: "paper-passage",
      sourceOrigin: origin,
      locator: "References",
      title: "References · Source list",
      excerpt: fixture.document.references.map((r) => `${r.id}: ${r.citation}`).join(" "),
      keywords: ["references", "citations", "appendix", "specification", "sources"],
      provenance: "VEDAXI controlled paper fixture — References"
    }
  ];
}

