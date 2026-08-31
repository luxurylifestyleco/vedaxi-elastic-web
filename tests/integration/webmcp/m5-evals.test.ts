import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { WebMcpTool } from "@vedaxi/contracts";
import { createPublisherStore } from "@vedaxi/state";
import { describe, expect, it, vi } from "vitest";

import {
  createDiscrepancyFocusTool,
  createPaperEvidenceService,
  createPaperEvidenceTool,
  createPaperFixture
} from "../../../apps/paper/src/paper";
import {
  PaperRegistrationController,
  type PaperToolRegistrar,
  type PaperTools
} from "../../../apps/paper/src/paper/use-paper-registration";
import {
  createVideoEvidenceService,
  createVideoFixture,
  createVideoSearchTool,
  createVideoTranscriptTool
} from "../../../apps/video/src/video";
import { VideoRegistrationController } from "../../../apps/video/src/video/use-video-registration";
import { validateOrderedTrace, type TraceEvent } from "./ordered-trace";

type EvalRecord = {
  id: string;
  eval_id: string;
  module: string;
  assertions: string[];
  hard_gates: string[];
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
const manifestPath = resolve(repoRoot, "evals/registry/manifests/vedaxi-m5-webmcp-local.dev.v1.json");
const paperOrigin = "https://paper.example.test";
const videoOrigin = "https://video.example.test";
const limitations = [
  "Native WebMCP discovery and the complete workflow across public Paper and Video deployments are unproven.",
  "Target-browser persistence, network, console, and post-disable fresh-session evidence are unproven."
];

function readManifest(): Manifest {
  return JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
}

function readRecords(manifest: Manifest): EvalRecord[] {
  return readFileSync(resolve(repoRoot, manifest.dataset), "utf8")
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line) as EvalRecord);
}

function orderedTrace(): TraceEvent[] {
  return [
    { step: 1, type: "external-intent", timestamp: "2026-08-31T12:00:00Z", intent: "Audit the cohort" },
    { step: 2, type: "origin-discovery", timestamp: "2026-08-31T12:00:01Z", origin: paperOrigin, expectedOriginKind: "paper" },
    { step: 3, type: "discovered-capability", timestamp: "2026-08-31T12:00:02Z", origin: paperOrigin, toolName: "search_paper_evidence", readOnly: true },
    { step: 4, type: "tool-call", timestamp: "2026-08-31T12:00:03Z", origin: paperOrigin, toolName: "search_paper_evidence", input: { query: "final analysis" } },
    { step: 5, type: "validated-result", timestamp: "2026-08-31T12:00:04Z", origin: paperOrigin, toolName: "search_paper_evidence", evidenceId: "paper.methods.final-analysis", excerpt: "Forty participants completed the study and were included in the final analysis." },
    { step: 6, type: "origin-discovery", timestamp: "2026-08-31T12:00:05Z", origin: videoOrigin, expectedOriginKind: "video" },
    { step: 7, type: "discovered-capability", timestamp: "2026-08-31T12:00:06Z", origin: videoOrigin, toolName: "search_video_evidence", readOnly: true },
    { step: 8, type: "tool-call", timestamp: "2026-08-31T12:00:07Z", origin: videoOrigin, toolName: "search_video_evidence", input: { query: "calibration drift" } },
    { step: 9, type: "validated-result", timestamp: "2026-08-31T12:00:08Z", origin: videoOrigin, toolName: "search_video_evidence", evidenceId: "video.transcript.calibration-drift", excerpt: "Six sessions had calibration drift, so we removed them before modeling and did not replace them." },
    { step: 10, type: "rationale-derivation", timestamp: "2026-08-31T12:00:09Z", derivedBy: "external-agent", sampleClaim: 34, derivationSummary: "40 reported minus 6 excluded equals 34" },
    { step: 11, type: "focus-request", timestamp: "2026-08-31T12:00:10Z", origin: paperOrigin, paperEvidenceId: "paper.methods.final-analysis", videoEvidenceId: "video.transcript.calibration-drift", analyzedSample: 34, reasoning: "The video excludes six of forty." },
    { step: 12, type: "human-decision", timestamp: "2026-08-31T12:00:11Z", decision: "confirm", decidedBy: "human" },
    { step: 13, type: "mutation-result", timestamp: "2026-08-31T12:00:12Z", ok: true, citationStatus: "blocked", hasDiscrepancyNote: true, noteId: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift" },
    { step: 14, type: "audit-result", timestamp: "2026-08-31T12:00:13Z", auditCount: 2, latestEvent: "focus-confirmed", persisted: true },
    { step: 15, type: "lifecycle-disable", timestamp: "2026-08-31T12:00:14Z", disabledOrigins: [paperOrigin, videoOrigin] },
    { step: 16, type: "fresh-inventory", timestamp: "2026-08-31T12:00:15Z", observedToolCount: 0 }
  ];
}

async function settleRegistration(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

const evaluators: Record<string, () => Promise<void> | void> = {
  "ordered-trace": () => {
    expect(validateOrderedTrace(orderedTrace())).toEqual({ valid: true, errors: [], reasons: [] });
  },
  "production-controllers": async () => {
    const activeTools = new Set<string>();
    const lifecycleSignals: AbortSignal[] = [];
    const register = vi.fn(async (tools: WebMcpTool[], _prompts: unknown[], options?: { lifecycleSignal?: AbortSignal }) => {
      if (options?.lifecycleSignal) lifecycleSignals.push(options.lifecycleSignal);
      tools.forEach(({ name }) => activeTools.add(name));
      return {
        registrationStatus: "registered" as const,
        uiStatus: "active" as const,
        disable: () => {
          tools.forEach(({ name }) => activeTools.delete(name));
          return "disabled" as const;
        }
      };
    });
    const store = createPublisherStore();
    const paperService = createPaperEvidenceService(createPaperFixture(paperOrigin).evidence);
    const paperTools = [
      createPaperEvidenceTool(paperService),
      createDiscrepancyFocusTool(store.dispatch)
    ] as const satisfies PaperTools;
    const videoService = createVideoEvidenceService(createVideoFixture(videoOrigin));
    const videoTools = [createVideoSearchTool(videoService), createVideoTranscriptTool(videoService)];
    const paper = new PaperRegistrationController(paperTools, vi.fn(), register as unknown as PaperToolRegistrar);
    const video = new VideoRegistrationController(videoTools, vi.fn(), register);

    paper.enable();
    video.enable();
    await settleRegistration();
    expect(paper.status).toBe("active");
    expect(video.status).toBe("active");
    expect([...activeTools].sort()).toEqual([
      "read_video_transcript",
      "request_discrepancy_focus",
      "search_paper_evidence",
      "search_video_evidence"
    ]);
    expect(lifecycleSignals).toHaveLength(2);

    paper.disable();
    video.disable();
    expect(lifecycleSignals.every(({ aborted }) => aborted)).toBe(true);
    expect(activeTools.size).toBe(0);
    expect(paper.status).toBe("disabled");
    expect(video.status).toBe("disabled");
  }
};

describe("vedaxi.m5-webmcp-local.dev.v1", () => {
  it("binds every local precursor and preserves public browser boundaries", () => {
    const manifest = readManifest();
    const records = readRecords(manifest);

    expect(manifest.id).toBe("vedaxi.m5-webmcp-local.dev.v1");
    expect(manifest.runner).toEqual({
      kind: "vitest",
      command: "npm test -- tests/integration/webmcp/m5-evals.test.ts"
    });
    expect(manifest.unproven).toEqual(limitations);
    expect(manifest.bindings.map(({ case_id }) => case_id)).toEqual(records.map(({ id }) => id));
    expect(new Set(records.map(({ id }) => id))).toHaveLength(records.length);
    for (const record of records) {
      expect(record.eval_id).toBe(manifest.id);
      expect(record.module).toBe("m5-webmcp-local");
      expect(record.assertions.length).toBeGreaterThan(0);
      expect(record.hard_gates.length).toBeGreaterThan(0);
      expect(record.limitations).toEqual(limitations);
      expect(evaluators[manifest.bindings.find(({ case_id }) => case_id === record.id)!.evaluator]).toBeTypeOf("function");
    }
  });

  it("replays every M5 precursor through the ordered validator and production controllers", async () => {
    const manifest = readManifest();
    for (const binding of manifest.bindings) await evaluators[binding.evaluator]();
  });
});
