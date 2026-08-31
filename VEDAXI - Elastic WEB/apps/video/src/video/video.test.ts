import { describe, expect, it } from "vitest";
import { assertIndependentVideoOrigin, createVideoFixture, resolveVideoRuntimeConfig, VIDEO_EVIDENCE_ID } from "./fixture";
import { createVideoEvidenceService } from "./service";
import { createVideoSearchTool, createVideoTranscriptTool } from "./tool";
import { seekVideo } from "./seek";

const fixture = createVideoFixture("https://video.example.test/workspace");
describe("M2 video origin evidence boundary", () => {
  it("keeps exact timestamp, six removal and non-replacement wording", () => {
    expect(fixture.evidence.id).toBe(VIDEO_EVIDENCE_ID);
    expect(fixture.evidence.locator).toContain("00:03:12");
    expect(fixture.evidence.excerpt).toMatch(/Six/);
    expect(fixture.evidence.excerpt).toMatch(/did not replace/);
    expect(fixture.evidence.excerpt).toMatch(/calibration drift/);
    expect(JSON.stringify(fixture)).not.toMatch(/(?:\b34\b|contradiction|discrepancy)/i);
  });
  it("searches and reads only publisher-owned transcript", async () => {
    const service = createVideoEvidenceService(fixture);
    expect(service.search("six calibration drift")).toHaveLength(1);
    expect(service.search("calibration")).toEqual([
      { evidence: fixture.evidence, score: 1 }
    ]);
    expect(service.search("unrelated")).toEqual([]);
    expect(service.search("sample contradiction")).toEqual([]);
    expect(service.readTranscript().cues[0].start).toBe(184);
    expect(service.readTranscript().evidence.id).toBe(VIDEO_EVIDENCE_ID);
    const search = createVideoSearchTool(service); const read = createVideoTranscriptTool(service);
    expect(search.annotations?.readOnlyHint).toBe(true); expect(read.annotations?.readOnlyHint).toBe(true);
    await expect(search.execute({ query: "six calibration drift" })).resolves.toHaveLength(1);
    await expect(read.execute({})).resolves.toMatchObject({ evidence: { id: VIDEO_EVIDENCE_ID }, cues: [{ start: 184 }] });
    await expect(read.execute({ query: "x" })).rejects.toThrow();
  });
  it("requires a distinct configured video origin", () => {
    expect(() => assertIndependentVideoOrigin("https://video.example.test", "https://paper.example.test")).not.toThrow();
    expect(() => assertIndependentVideoOrigin("https://paper.example.test/video", "https://paper.example.test")).toThrow("video origin must differ");
  });
  it("fails closed for missing, invalid, or equal runtime Paper origin", () => {
    expect(() => resolveVideoRuntimeConfig("https://video.example.test", undefined)).toThrow("missing");
    expect(() => resolveVideoRuntimeConfig("https://video.example.test", "not a URL")).toThrow("valid URL");
    expect(() => resolveVideoRuntimeConfig("https://video.example.test", "https://video.example.test")).toThrow("differ");
    expect(resolveVideoRuntimeConfig("https://video.example.test/path", "https://paper.example.test")).toEqual({ videoOrigin: "https://video.example.test", paperOrigin: "https://paper.example.test" });
  });
  it("never reports seek success without loaded media", async () => {
    await expect(seekVideo(null, { seconds: 192 })).resolves.toMatchObject({ ok: false, reason: "media-unavailable" });
    await expect(seekVideo(null, { seconds: -1 })).resolves.toMatchObject({ ok: false, reason: "invalid-time" });
  });
});
