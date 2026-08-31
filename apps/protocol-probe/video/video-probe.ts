import { type EvidenceObject, type WebMcpTool } from "@vedaxi/contracts";

import { createReadOnlyEvidenceTool } from "../shared/evidence-tool";
import { PAPER_ORIGIN, VIDEO_ORIGIN } from "../shared/origins";

export const videoRegistrationOrigins = [PAPER_ORIGIN];

export const VIDEO_EVIDENCE: EvidenceObject = {
  id: "probe.video.transcript.calibration-drift",
  assetType: "video-transcript",
  sourceOrigin: VIDEO_ORIGIN,
  locator: "00:03:12",
  title: "Calibration-drift exclusion",
  excerpt: "We recruited forty participants. Six sessions had calibration drift, so we removed them before modeling and did not replace them.",
  keywords: ["calibration", "drift", "removed", "replace"],
  provenance: "Protocol probe video transcript at 00:03:12"
};

export function createVideoEvidenceTool(): WebMcpTool {
  return createReadOnlyEvidenceTool(
    "read_video_probe_evidence",
    "Read video evidence",
    "Search the video publisher's transcript evidence by query. Returns publisher evidence only.",
    VIDEO_EVIDENCE
  );
}
