import type { EvidenceObject } from "./evidence";

export const controlledPaperEvidence: EvidenceObject[] = [
  {
    id: "paper.methods.final-analysis",
    assetType: "paper-passage",
    sourceOrigin: "http://localhost:4173",
    locator: "Methods, participants",
    title: "Final analysis cohort",
    excerpt: "Forty participants completed the study and were included in the final analysis.",
    keywords: ["participants", "final", "analysis", "analyzed", "sample"],
    provenance: "Paper publisher methods passage"
  }
];

export const controlledVideoEvidence: EvidenceObject[] = [
  {
    id: "video.transcript.calibration-drift",
    assetType: "video-transcript",
    sourceOrigin: "http://localhost:4174",
    locator: "00:03:12",
    title: "Calibration-drift exclusion",
    excerpt: "We recruited forty participants. Six sessions had calibration drift, so we removed them before modeling and did not replace them.",
    keywords: ["calibration", "drift", "removed", "replace"],
    provenance: "Video publisher transcript, 00:03:12"
  }
];
