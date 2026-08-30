import { type EvidenceObject, type WebMcpTool } from "@vedaxi/contracts";

import { createReadOnlyEvidenceTool } from "../shared/evidence-tool";
import { PAPER_ORIGIN } from "../shared/origins";

export const PAPER_EVIDENCE: EvidenceObject = {
  id: "probe.paper.methods.final-analysis",
  assetType: "paper-passage",
  sourceOrigin: PAPER_ORIGIN,
  locator: "Methods, participants",
  title: "Final analysis cohort",
  excerpt: "Forty participants completed the study and were included in the final analysis.",
  keywords: ["participants", "final", "analysis", "analyzed", "sample"],
  provenance: "Protocol probe paper methods passage"
};

export function createPaperEvidenceTool(): WebMcpTool {
  return createReadOnlyEvidenceTool(
    "read_paper_probe_evidence",
    "Read paper evidence",
    "Search the paper publisher's methods evidence by query. Returns publisher evidence only.",
    PAPER_EVIDENCE
  );
}
