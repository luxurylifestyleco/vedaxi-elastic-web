export {
  PAPER_EVIDENCE_ID,
  createPaperFixture,
  createPaperCorpus,
  resolveConfiguredVideoOrigin,
  resolvePaperRuntimeConfig
} from "./fixture";
export type { PaperDocument, PaperFixture, PaperRuntimeConfig } from "./fixture";
export { createPaperEvidenceService } from "./service";
export type { PaperEvidenceService } from "./service";
export { createPaperEvidenceTool } from "./tool";
export type { PaperToolMetadata } from "./tool";
export { createDiscrepancyFocusTool } from "./focus-tool";
export { protocolStatusCopy } from "./protocol-status";
export type { PaperProtocolStatus } from "./protocol-status";
