import type { EvidenceObject } from "@vedaxi/contracts";

export const VIDEO_EVIDENCE_ID = "video.transcript.calibration-drift" as const;
export const VIDEO_EVIDENCE_SECONDS = 192 as const;
export const VIDEO_EVIDENCE_TIMESTAMP = "00:03:12" as const;
export function assertIndependentVideoOrigin(videoOrigin: string, paperOrigin: string): void {
  if (originOf(videoOrigin) === originOf(paperOrigin)) throw new Error("video origin must differ from paper origin");
}

export interface VideoRuntimeConfig { videoOrigin: string; paperOrigin: string; }
export function resolveVideoRuntimeConfig(videoOrigin: string, paperOrigin: unknown): VideoRuntimeConfig {
  if (typeof paperOrigin !== "string" || !paperOrigin.trim()) throw new Error("Paper origin configuration is missing");
  const video = originOf(videoOrigin);
  const paper = originOf(paperOrigin);
  assertIndependentVideoOrigin(video, paper);
  return { videoOrigin: video, paperOrigin: paper };
}

export interface VideoTranscriptCue { start: number; end: number; text: string; }
export interface VideoFixture { evidence: EvidenceObject; transcript: VideoTranscriptCue[]; mediaSrc: string; captionsSrc: string; }

function originOf(value: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("sourceOrigin must be a valid URL"); }
  if (!/^https?:$/.test(url.protocol)) throw new Error("sourceOrigin must use an http or https origin");
  return url.origin;
}

export function createVideoFixture(sourceOrigin: string, mediaSrc = "/media/vedaxi-controlled-evidence.mp4", captionsSrc = "/media/vedaxi-controlled-evidence.vtt"): VideoFixture {
  const origin = originOf(sourceOrigin);
  const transcript: VideoTranscriptCue[] = [
    { start: 184, end: 198, text: "We recruited forty participants. Six sessions had calibration drift, so we removed them before modeling and did not replace them." }
  ];
  return {
    evidence: { id: VIDEO_EVIDENCE_ID, assetType: "video-transcript", sourceOrigin: origin, locator: "Transcript 00:03:12 (192 seconds)", title: "Calibration drift exclusion", excerpt: transcript[0].text, keywords: ["six", "calibration", "drift", "exclusion", "transcript", "replace"], provenance: "VEDAXI controlled video fixture — transcript cue at 00:03:12" },
    transcript, mediaSrc, captionsSrc
  };
}
