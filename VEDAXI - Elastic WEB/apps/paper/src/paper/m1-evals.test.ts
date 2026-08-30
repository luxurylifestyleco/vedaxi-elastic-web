import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { PaperApp } from "./PaperApp";
import {
  PAPER_EVIDENCE_ID,
  createPaperEvidenceService,
  createPaperEvidenceTool,
  createPaperFixture,
  protocolStatusCopy,
  type PaperProtocolStatus
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
};

type Manifest = {
  id: string;
  dataset: string;
  runner: { kind: string; command: string };
  bindings: Array<{ case_id: string; evaluator: string }>;
};

const repoRoot = resolve(process.cwd(), "..");
const manifestPath = resolve(repoRoot, "evals/registry/manifests/vedaxi-m1-paper.dev.v1.json");
const runtimeRoot = resolve(process.cwd(), "apps/paper/src");

function runtimeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return runtimeFiles(path);
    if (/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(entry.name)) return [];
    return /\.(?:css|html|[cm]?[jt]sx?)$/.test(entry.name) ? [path] : [];
  });
}

function readManifest(): Manifest {
  return JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
}

function readRecords(manifest: Manifest): EvalRecord[] {
  return readFileSync(resolve(repoRoot, manifest.dataset), "utf8")
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line) as EvalRecord);
}

const fixture = createPaperFixture("https://paper.example.test/workspace");
const service = createPaperEvidenceService(fixture.evidence);
const tool = createPaperEvidenceTool(service);

const evaluators: Record<string, () => Promise<void> | void> = {
  fixture: () => {
    expect(fixture.evidence.id).toBe(PAPER_EVIDENCE_ID);
    expect(fixture.evidence.excerpt).toContain("Forty participants");
    expect(fixture.evidence.sourceOrigin).toBe("https://paper.example.test");
    expect(fixture.document.isFictional).toBe(true);
  },
  search: () => {
    expect(service.search("final analyzed sample")).toEqual([
      { evidence: fixture.evidence, score: 3 }
    ]);
  },
  "empty-search": () => {
    expect(service.search("calibration exclusion")).toEqual([]);
    expect(service.search("the and of")).toEqual([]);
  },
  "tool-schema": async () => {
    expect(tool.inputSchema).toBeDefined();
    expect(tool.inputSchema!.additionalProperties).toBe(false);
    expect(tool.annotations?.readOnlyHint).toBe(true);
    await expect(tool.execute({ query: "final analyzed sample" })).resolves.toEqual([
      { evidence: fixture.evidence, score: 3 }
    ]);
    await expect(tool.execute({ query: "", extra: true })).rejects.toThrow();
  },
  "reasoning-boundary": () => {
    const output = service.search("compute analyzed sample contradiction");
    expect(Object.keys(output[0].evidence).sort()).toEqual([
      "assetType", "excerpt", "id", "keywords", "locator", "provenance", "sourceOrigin", "title"
    ]);
    expect(JSON.stringify(output)).not.toMatch(/(?:\b34\b|difference|recommendation|assessment|video\.transcript)/i);
  },
  "status-truth": () => {
    const states: PaperProtocolStatus[] = ["checking", "active", "disabled", "unsupported", "error"];
    const copy = states.map(protocolStatusCopy);
    expect(new Set(copy).size).toBe(states.length);
    expect(copy.filter((value) => value.includes("active"))).toEqual([
      "Native paper evidence tool active"
    ]);
  },
  "render-precursor": () => {
    const states: PaperProtocolStatus[] = ["checking", "active", "disabled", "unsupported", "error"];
    for (const status of states) {
      const markup = renderToStaticMarkup(createElement(PaperApp, {
        fixture,
        service,
        protocol: { status, enable() {}, disable() {} }
      }));
      expect(markup).toContain(fixture.evidence.excerpt);
      expect(markup).toContain("Search this paper");
      expect(markup).toContain("aria-label=\"Paper outline\"");
    }
  },
  "scope-boundary": () => {
    const runtimeAndShellFiles = [
      ...runtimeFiles(runtimeRoot),
      resolve(process.cwd(), "apps/paper/index.html")
    ];
    const source = runtimeAndShellFiles.map((file) => readFileSync(file, "utf8")).join("\n");
    const appManifest = JSON.parse(
      readFileSync(resolve(process.cwd(), "apps/paper/package.json"), "utf8")
    ) as { dependencies?: Record<string, string> };
    const rootManifest = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8")
    ) as { dependencies?: Record<string, string> };
    expect(source).not.toMatch(/(?:video\.transcript|40\s*-\s*6|\b34\b|localStorage|sessionStorage|from\s+["']three["']|@react-three|three\.js|shopify|navigator\.modelContext|executeTool|getTools)/i);
    expect(source).not.toMatch(/@vedaxi\/contracts\//);
    expect(source).not.toMatch(/protocol-probe/);
    expect(appManifest.dependencies).toEqual({
      "@vedaxi/contracts": "*",
      react: "^19.2.8",
      "react-dom": "^19.2.8"
    });
    expect(rootManifest.dependencies).toBeUndefined();
  }
};

describe("vedaxi.m1-paper.dev.v1", () => {
  it("binds each versioned case exactly once", () => {
    const manifest = readManifest();
    const records = readRecords(manifest);
    expect(manifest.id).toBe("vedaxi.m1-paper.dev.v1");
    expect(manifest.runner).toEqual({
      kind: "vitest",
      command: "npm test -- apps/paper/src/paper/m1-evals.test.ts"
    });
    expect(manifest.bindings.map(({ case_id }) => case_id)).toEqual(records.map(({ id }) => id));
    expect(new Set(records.map(({ id }) => id)).size).toBe(records.length);
    for (const record of records) {
      expect(record.eval_id).toBe(manifest.id);
      expect(record.module).toBe("m1-paper");
      expect(record.assertions.length).toBeGreaterThan(0);
      expect(record.hard_gates.length).toBeGreaterThan(0);
      expect(evaluators[manifest.bindings.find(({ case_id }) => case_id === record.id)!.evaluator]).toBeTypeOf("function");
    }
  });

  it("replays every case through a deterministic evaluator", async () => {
    const manifest = readManifest();
    for (const binding of manifest.bindings) await evaluators[binding.evaluator]();
  });
});
