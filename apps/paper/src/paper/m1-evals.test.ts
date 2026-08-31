import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { createPublisherStore } from "@vedaxi/state";

import { PaperApp } from "./PaperApp";
import {
  PAPER_EVIDENCE_ID,
  createDiscrepancyFocusTool,
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

const repoRoot = resolve(process.cwd());
const manifestPath = resolve(repoRoot, "evals/registry/manifests/vedaxi-m1-paper.dev.v1.json");
const v2ManifestPath = resolve(repoRoot, "evals/registry/manifests/vedaxi-m1-paper.dev.v2.json");
const frozenM1Commit = "06a9512";
const frozenV1ManifestSha256 = "86b276b43ac0e8888fd79f66302ef3bc4d642f72bbb51d2e5dc2a1103712ec00";
const frozenV1DatasetSha256 = "c48a0d110e0a43b33b01ae11c244541ad5d55f87ab092237acaed63f87e167d4";

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function gitText(args: string[]): string {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", timeout: 20_000 });
}

function frozenM1File(path: string): string {
  return gitText(["show", `${frozenM1Commit}:${path}`]);
}

function frozenM1RuntimeSource(): string {
  const files = gitText([
    "ls-tree",
    "-r",
    "--name-only",
    frozenM1Commit,
    "--",
    "VEDAXI - Elastic WEB/apps/paper"
  ]).trim().split(/\r?\n/).filter((path) =>
    !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path)
    && /(?:\.css|\.html|\.[cm]?[jt]sx?)$/.test(path)
  );
  return files.map(frozenM1File).join("\n");
}

function currentPaperRuntimeSource(): string {
  const root = resolve(repoRoot, "apps/paper/src");
  const files: string[] = [];
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (!/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path) && /(?:\.css|\.html|\.[cm]?[jt]sx?)$/.test(path)) files.push(path);
    }
  };
  visit(root);
  return files.sort().map((path) => readFileSync(path, "utf8")).join("\n");
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
    const source = frozenM1RuntimeSource();
    const appManifest = JSON.parse(
      frozenM1File("VEDAXI - Elastic WEB/apps/paper/package.json")
    ) as { dependencies?: Record<string, string> };
    const rootManifest = JSON.parse(
      frozenM1File("VEDAXI - Elastic WEB/package.json")
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
  },
  "current-scope-boundary": () => {
    const source = currentPaperRuntimeSource();
    const main = readFileSync(resolve(repoRoot, "apps/paper/src/main.tsx"), "utf8");
    const paperEvidencePublisherSource = ["fixture.ts", "service.ts", "tool.ts"]
      .map((file) => readFileSync(resolve(repoRoot, "apps/paper/src/paper", file), "utf8"))
      .join("\n");
    const focusToolSource = readFileSync(resolve(repoRoot, "apps/paper/src/paper/focus-tool.ts"), "utf8");
    const appManifest = JSON.parse(readFileSync(resolve(repoRoot, "apps/paper/package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };

    expect(main).toMatch(/const tools = \[paperEvidenceTool, focusTool\] as const/);
    expect(main).toMatch(/usePaperRegistration\(tools\)/);
    expect(paperEvidencePublisherSource).not.toMatch(/video\.transcript|\b34\b|40\s*-\s*6|forty\s+minus\s+six/i);
    expect(focusToolSource).not.toMatch(/40\s*-\s*6|forty\s+minus\s+six/i);
    expect(source).not.toMatch(/@vedaxi\/contracts\//);
    expect(source).not.toMatch(/protocol-probe|navigator\.modelContext|executeTool|getTools/);
    expect(appManifest.dependencies).toEqual({
      "@vedaxi/contracts": "*",
      "@vedaxi/state": "*",
      react: "^19.2.8",
      "react-dom": "^19.2.8"
    });
  },
  "focus-request-boundary": async () => {
    const store = createPublisherStore();
    const focusTool = createDiscrepancyFocusTool(store.dispatch);
    const request = {
      paperEvidenceId: "paper.methods.final-analysis",
      videoEvidenceId: "video.transcript.calibration-drift",
      analyzedSample: 34,
      reasoning: "External comparison: 40 reported and 6 excluded without replacement.",
      provenance: {
        paper: "paper.methods.final-analysis",
        video: "video.transcript.calibration-drift",
        derivation: "Externally supplied comparison"
      }
    };

    expect([tool.name, focusTool.name]).toEqual(["search_paper_evidence", "request_discrepancy_focus"]);
    expect(tool.annotations?.readOnlyHint).toBe(true);
    expect(focusTool.annotations?.readOnlyHint).toBe(false);
    await expect(focusTool.execute(request)).resolves.toEqual({
      status: "pending-human-confirmation",
      citationStatus: "unblocked"
    });
    expect(store.getState()).toMatchObject({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: request,
      auditEvents: [{ type: "focus-requested" }]
    });
    await expect(focusTool.execute({ ...request, analyzedSample: 40 })).rejects.toThrow(
      "externally derived value 34"
    );
  }
};

describe("vedaxi.m1-paper.dev.v1", () => {
  it("binds each versioned case exactly once", () => {
    const manifest = readManifest();
    const records = readRecords(manifest);
    expect(sha256(manifestPath)).toBe(frozenV1ManifestSha256);
    expect(sha256(resolve(repoRoot, manifest.dataset))).toBe(frozenV1DatasetSha256);
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
  }, 60_000);
});

describe("vedaxi.m1-paper.dev.v2", () => {
  it("preserves v1 and binds the current integrated Paper boundary", () => {
    const v1 = readManifest();
    const v2 = JSON.parse(readFileSync(v2ManifestPath, "utf8")) as Manifest;
    const records = readRecords(v2);

    expect(v2.id).toBe("vedaxi.m1-paper.dev.v2");
    expect(v2.runner).toEqual({
      kind: "vitest",
      command: "npm test -- apps/paper/src/paper/m1-evals.test.ts"
    });
    expect(v2.bindings.slice(0, -1)).toEqual(v1.bindings.map((binding) =>
      binding.case_id === "m1-paper-scope-boundary"
        ? { ...binding, evaluator: "current-scope-boundary" }
        : binding
    ));
    expect(v2.bindings.at(-1)).toEqual({
      case_id: "m1-paper-focus-request-boundary",
      evaluator: "focus-request-boundary"
    });
    expect(v2.bindings.map(({ case_id }) => case_id)).toEqual(records.map(({ id }) => id));
    for (const record of records) {
      expect(record.eval_id).toBe(v2.id);
      expect(record.module).toBe("m1-paper");
    }
  });

  it("replays every v2 case through a deterministic evaluator", async () => {
    const manifest = JSON.parse(readFileSync(v2ManifestPath, "utf8")) as Manifest;
    for (const binding of manifest.bindings) await evaluators[binding.evaluator]();
  }, 20_000);
});
