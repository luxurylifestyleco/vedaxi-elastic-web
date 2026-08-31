import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { VideoApp } from "./VideoApp";
import {
  VIDEO_EVIDENCE_ID,
  createVideoEvidenceService,
  createVideoFixture,
  createVideoSearchTool,
  createVideoTranscriptTool,
  resolveVideoRuntimeConfig,
  seekVideo
} from "./index";

type EvalRecord = {
  id: string;
  eval_id: string;
  module: string;
  input: Array<{ role: string; content: string }>;
  ideal: string;
  criteria: string;
  assertions: string[];
  hard_gates: string[];
  evidence_kind: string;
  provenance: string;
  limitations: string[];
};

type Manifest = {
  id: string;
  dataset: string;
  runner: { kind: string; command: string };
  unproven: string[];
  bindings: Array<{ case_id: string; evaluator: string }>;
};

const repoRoot = resolve(process.cwd());
const manifestPath = resolve(repoRoot, "evals/registry/manifests/vedaxi-m2-video.dev.v1.json");
const fixture = createVideoFixture("https://video.example.test/workspace");
const service = createVideoEvidenceService(fixture);
const searchTool = createVideoSearchTool(service);
const transcriptTool = createVideoTranscriptTool(service);

function readManifest(): Manifest {
  return JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
}

function readRecords(manifest: Manifest): EvalRecord[] {
  return readFileSync(resolve(repoRoot, manifest.dataset), "utf8")
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line) as EvalRecord);
}

class SeekableVideo extends EventTarget {
  readyState = 1;
  duration = 300;
  currentTime = 0;
  seekable = { length: 1, start: () => 0, end: () => 300 };
}

const evaluators: Record<string, () => Promise<void> | void> = {
  "s4-evidence": () => {
    expect(fixture.evidence).toEqual({
      id: VIDEO_EVIDENCE_ID,
      assetType: "video-transcript",
      sourceOrigin: "https://video.example.test",
      locator: "Transcript 00:03:12 (192 seconds)",
      title: "Calibration drift exclusion",
      excerpt: "We recruited forty participants. Six sessions had calibration drift, so we removed them before modeling and did not replace them.",
      keywords: ["six", "calibration", "drift", "exclusion", "transcript", "replace"],
      provenance: "VEDAXI controlled video fixture — transcript cue at 00:03:12"
    });
    expect(fixture.transcript).toEqual([{
      start: 184,
      end: 198,
      text: fixture.evidence.excerpt
    }]);
  },
  search: () => {
    expect(service.search("six calibration drift")).toEqual([{ evidence: fixture.evidence, score: 3 }]);
    expect(service.search("calibration")).toEqual([{ evidence: fixture.evidence, score: 1 }]);
    expect(service.search("unrelated evidence")).toEqual([]);
  },
  "tool-contract": async () => {
    expect(searchTool.name).toBe("search_video_evidence");
    expect(searchTool.description).toBe("Search this publisher's transcript for exact evidence and provenance only.");
    expect(transcriptTool.name).toBe("read_video_transcript");
    expect(transcriptTool.description).toBe("Read this publisher's transcript cues without analysis.");
    for (const tool of [searchTool, transcriptTool]) {
      expect(tool.description.trim()).not.toBe("");
    }
    expect(searchTool.inputSchema).toEqual({
      type: "object",
      properties: { query: { type: "string", maxLength: 160, pattern: "\\S" } },
      required: ["query"],
      additionalProperties: false
    });
    expect(transcriptTool.inputSchema).toEqual({ type: "object", properties: {}, additionalProperties: false });
    for (const tool of [searchTool, transcriptTool]) {
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, untrustedContentHint: true });
    }
    await expect(searchTool.execute({ query: "six calibration drift" })).resolves.toEqual([{ evidence: fixture.evidence, score: 3 }]);
    await expect(searchTool.execute({})).rejects.toThrow();
    await expect(searchTool.execute({ query: " " })).rejects.toThrow();
    await expect(searchTool.execute({ query: "six", extra: true })).rejects.toThrow();
    await expect(searchTool.execute({ query: "x".repeat(161) })).rejects.toThrow();
    await expect(transcriptTool.execute({})).resolves.toEqual({ evidence: fixture.evidence, cues: fixture.transcript });
    await expect(transcriptTool.execute({ query: "six" })).rejects.toThrow();
  },
  "independent-origin": () => {
    expect(resolveVideoRuntimeConfig("https://video.example.test/workspace", "https://paper.example.test/article"))
      .toEqual({ videoOrigin: "https://video.example.test", paperOrigin: "https://paper.example.test" });
    expect(() => resolveVideoRuntimeConfig("https://paper.example.test/video", "https://paper.example.test/article"))
      .toThrow("video origin must differ from paper origin");
  },
  "reasoning-boundary": () => {
    const outputs = [service.search("six calibration drift"), service.readTranscript()];
    expect(JSON.stringify(outputs)).not.toMatch(/(?:\b34\b|contradiction|discrepancy|40\s*-\s*6|forty\s+minus\s+six)/i);
    expect(service.search("derive 34 contradiction")).toEqual([]);
  },
  "media-unloaded-state": async () => {
    await expect(seekVideo(null, { seconds: 192 })).resolves.toEqual({
      ok: false,
      reason: "media-unavailable",
      message: "Video media is unavailable or shorter than this timestamp; seek was not performed."
    });
    const markup = renderToStaticMarkup(createElement(VideoApp, {
      fixture,
      service,
      protocol: { status: "unsupported", enable() {}, disable() {} }
    }));
    expect(markup).toContain("Video media has not loaded. Evidence seek is unavailable; the transcript remains readable below.");
    expect(markup).toContain("This browser does not expose native agent tools");
    expect(markup.match(/disabled=""/g)).toHaveLength(2);
  },
  "seek-precursor": async () => {
    (globalThis as unknown as { HTMLMediaElement: { HAVE_METADATA: number } }).HTMLMediaElement = { HAVE_METADATA: 1 };
    const video = new SeekableVideo();
    const pending = seekVideo(video as unknown as HTMLVideoElement, { seconds: 192 }, 100);
    video.currentTime = 192;
    video.dispatchEvent(new Event("seeked"));
    await expect(pending).resolves.toEqual({ ok: true, seconds: 192 });

    const markup = renderToStaticMarkup(createElement(VideoApp, {
      fixture,
      service,
      protocol: { status: "disabled", enable() {}, disable() {} }
    }));
    expect(markup).toContain("Seek to calibration drift evidence at 3 minutes 12 seconds");
    expect(markup).toContain(`ID: ${VIDEO_EVIDENCE_ID}`);
    expect(markup).toContain("Transcript 00:03:12 (192 seconds)");
  }
};

describe("vedaxi.m2-video.dev.v1", () => {
  it("binds every dataset case exactly once and preserves the S5 evidence boundary", () => {
    const manifest = readManifest();
    const records = readRecords(manifest);

    expect(manifest.id).toBe("vedaxi.m2-video.dev.v1");
    expect(manifest.runner).toEqual({
      kind: "vitest",
      command: "npm test -- apps/video/src/video/m2-evals.test.ts"
    });
    expect(manifest.unproven).toEqual([
      "S5 keyboard/browser proof is unproven; it requires fresh manual target-browser evidence.",
      "Real MP4/VTT media availability and alignment are unproven; validate them with evals/validate-m2-media-slot.mjs."
    ]);
    expect(manifest.bindings.map(({ case_id }) => case_id)).toEqual(records.map(({ id }) => id));
    expect(new Set(records.map(({ id }) => id)).size).toBe(records.length);

    for (const record of records) {
      expect(record.eval_id).toBe(manifest.id);
      expect(record.module).toBe("m2-video");
      expect(record.assertions.length).toBeGreaterThan(0);
      expect(record.hard_gates.length).toBeGreaterThan(0);
      expect(record.limitations).toContain("S5 keyboard/browser proof is unproven.");
      expect(record.limitations).toContain(
        "Real MP4/VTT media availability and alignment are unproven; delegated to evals/validate-m2-media-slot.mjs."
      );
      expect(evaluators[manifest.bindings.find(({ case_id }) => case_id === record.id)!.evaluator]).toBeTypeOf("function");
    }
  });

  it("replays every M2 source case through existing Video behavior", async () => {
    const manifest = readManifest();
    for (const binding of manifest.bindings) await evaluators[binding.evaluator]();
  });
});
