import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { searchEvidence, type WebMcpTool, registerWebMcpTools } from "./index";
import { controlledPaperEvidence, controlledVideoEvidence } from "./test-fixtures";
import { FakeModelContext } from "./webmcp-test-harness";

const v2EvalId = "vedaxi.contracts.dev.v2";
const v3EvalId = "vedaxi.contracts.dev.v3";
const repoRoot = resolve(process.cwd());
const v2ManifestPath = resolve(repoRoot, "evals/registry/manifests/vedaxi-contracts.dev.v2.json");
const v3ManifestPath = resolve(repoRoot, "evals/registry/manifests/vedaxi-contracts.dev.v3.json");
const v2RequiredCaseIds = [
  "m0-evidence-paper",
  "m0-evidence-video",
  "m0-evidence-unrelated-question",
  "m0-evidence-no-publisher-reasoning",
  "m0-webmcp-unsupported",
  "m0-webmcp-empty",
  "m0-webmcp-rejection-cleanup",
  "m0-webmcp-abort-removal"
];
const v3RequiredCaseIds = [
  ...v2RequiredCaseIds,
  "m0-webmcp-lifecycle-already-aborted",
  "m0-webmcp-lifecycle-pending-cancellation",
  "m0-webmcp-lifecycle-active-cancellation",
  "m0-webmcp-lifecycle-idempotent-cleanup"
];

type M0EvalRecord = {
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

type LocalEvalManifest = {
  id: string;
  runner: { kind: string; command: string };
  dataset: string;
  bindings: Array<{ case_id: string; evaluator: string }>;
};

type Evaluator = (record: M0EvalRecord) => Promise<void>;

function readManifest(path: string): LocalEvalManifest {
  return JSON.parse(readFileSync(path, "utf8")) as LocalEvalManifest;
}

function readM0EvalRecords(manifest: LocalEvalManifest): M0EvalRecord[] {
  return readFileSync(resolve(repoRoot, manifest.dataset), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as M0EvalRecord);
}

function inputText(record: M0EvalRecord): string[] {
  return record.input.map((message) => message.content);
}

async function withDocument<T>(value: unknown, run: () => Promise<T>): Promise<T> {
  const originalDocument = globalThis.document;
  Object.defineProperty(globalThis, "document", { configurable: true, value });
  try {
    return await run();
  } finally {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument
    });
  }
}

const evidenceTool = (name: string): WebMcpTool => ({
  name,
  description: "Search publisher evidence.",
  execute: async () => []
});

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

const evaluators: Record<string, Evaluator> = {
  "paper-evidence": async (record) => {
    expect(searchEvidence(inputText(record)[0], controlledPaperEvidence)).toEqual([
      { evidence: controlledPaperEvidence[0], score: 3 }
    ]);
  },
  "video-evidence": async (record) => {
    expect(searchEvidence(inputText(record)[0], controlledVideoEvidence)).toEqual([
      { evidence: controlledVideoEvidence[0], score: 2 }
    ]);
  },
  "unrelated-evidence": async (record) => {
    for (const query of inputText(record)) {
      expect(searchEvidence(query, controlledPaperEvidence)).toEqual([]);
    }
  },
  "no-publisher-reasoning": async (record) => {
    const [paperQuery, videoQuery] = inputText(record);
    const results = [
      ...searchEvidence(paperQuery, controlledPaperEvidence),
      ...searchEvidence(videoQuery, controlledVideoEvidence)
    ];

    expect(results).toHaveLength(2);
    for (const result of results) {
      expect(Object.keys(result).sort()).toEqual(["evidence", "score"]);
      expect(JSON.stringify(result)).not.toMatch(/34|contradiction|discrepancy/i);
    }
  },
  unsupported: async () => {
    let calls = 0;
    await withDocument({}, async () => {
      const registration = await registerWebMcpTools(
        [
          {
            name: "search_paper_evidence",
            description: "Search publisher evidence.",
            execute: async () => {
              calls += 1;
              return [];
            }
          }
        ],
        []
      );

      expect(registration.registrationStatus).toBe("unsupported");
      expect(registration.uiStatus).toBe("unsupported");
    });
    expect(calls).toBe(0);
  },
  empty: async () => {
    const modelContext = new FakeModelContext();
    await withDocument({ modelContext }, async () => {
      const registration = await registerWebMcpTools([], []);

      expect(registration.registrationStatus).toBe("empty");
      expect(registration.uiStatus).toBe("error");
    });
    expect(modelContext.attempted).toEqual([]);
  },
  "rejection-cleanup": async () => {
    const modelContext = new FakeModelContext("search_video_transcript");
    await withDocument({ modelContext }, async () => {
      const registration = await registerWebMcpTools(
        [evidenceTool("search_paper_evidence"), evidenceTool("search_video_transcript")],
        []
      );

      expect(registration.registrationStatus).toBe("error");
      expect(registration.uiStatus).toBe("error");
    });
    expect(modelContext.attempted).toHaveLength(2);
    expect(modelContext.attempted[0].options.signal).toBe(modelContext.attempted[1].options.signal);
    expect(modelContext.attempted[0].options.signal?.aborted).toBe(true);
    expect(modelContext.registered).toEqual([]);
  },
  "abort-removal": async () => {
    const modelContext = new FakeModelContext();
    await withDocument({ modelContext }, async () => {
      const registration = await registerWebMcpTools(
        [evidenceTool("search_paper_evidence"), evidenceTool("search_video_transcript")],
        []
      );

      expect(registration.disable()).toBe("disabled");
      expect(registration.disable()).toBe("disabled");
      expect(registration.uiStatus).toBe("disabled");
    });
    expect(modelContext.registered).toEqual([]);
  },
  "lifecycle-already-aborted": async () => {
    const modelContext = new FakeModelContext();
    const lifecycle = new AbortController();
    lifecycle.abort();

    await withDocument({ modelContext }, async () => {
      const registration = await registerWebMcpTools(
        [evidenceTool("search_paper_evidence")],
        [],
        { lifecycleSignal: lifecycle.signal }
      );

      expect(registration.registrationStatus).toBe("cancelled");
      expect(registration.uiStatus).toBe("disabled");
      expect(registration.disable()).toBe("disabled");
    });
    expect(modelContext.attempted).toEqual([]);
    expect(modelContext.registered).toEqual([]);
  },
  "lifecycle-pending-cancellation": async () => {
    const nativeRegistration = deferred<void>();
    const attemptedSignals: AbortSignal[] = [];
    const registered: AbortSignal[] = [];
    const lifecycle = new AbortController();
    const modelContext = {
      registerTool: (_tool: WebMcpTool, options: { signal?: AbortSignal }) => {
        const signal = options.signal!;
        attemptedSignals.push(signal);
        registered.push(signal);
        signal.addEventListener("abort", () => registered.splice(0), { once: true });
        return nativeRegistration.promise;
      }
    };

    await withDocument({ modelContext }, async () => {
      const pending = registerWebMcpTools(
        [evidenceTool("search_paper_evidence")],
        [],
        { lifecycleSignal: lifecycle.signal }
      );

      expect(attemptedSignals).toHaveLength(1);
      lifecycle.abort();
      expect(attemptedSignals[0].aborted).toBe(true);
      expect(registered).toEqual([]);
      nativeRegistration.resolve();
      await expect(pending).resolves.toMatchObject({
        registrationStatus: "cancelled",
        uiStatus: "disabled"
      });
    });
  },
  "lifecycle-active-cancellation": async () => {
    const modelContext = new FakeModelContext();
    const lifecycle = new AbortController();

    await withDocument({ modelContext }, async () => {
      const registration = await registerWebMcpTools(
        [evidenceTool("search_paper_evidence"), evidenceTool("search_video_transcript")],
        [],
        { lifecycleSignal: lifecycle.signal }
      );

      expect(registration.registrationStatus).toBe("registered");
      expect(registration.uiStatus).toBe("active");
      lifecycle.abort();
      expect(registration.uiStatus).toBe("disabled");
    });
    expect(modelContext.attempted[0].options.signal?.aborted).toBe(true);
    expect(modelContext.registered).toEqual([]);
  },
  "lifecycle-idempotent-cleanup": async () => {
    const modelContext = new FakeModelContext();
    const lifecycle = new AbortController();

    await withDocument({ modelContext }, async () => {
      const registration = await registerWebMcpTools(
        [evidenceTool("search_paper_evidence")],
        [],
        { lifecycleSignal: lifecycle.signal }
      );

      lifecycle.abort();
      lifecycle.abort();
      expect(registration.disable()).toBe("disabled");
      expect(registration.disable()).toBe("disabled");
      expect(registration.uiStatus).toBe("disabled");
    });
    expect(modelContext.registered).toEqual([]);
  }
};

describe("vedaxi.contracts.dev.v2 local deterministic eval manifest", () => {
  it("defines one executable local evaluator for every unique v2 JSONL case", () => {
    const manifest = readManifest(v2ManifestPath);
    const records = readM0EvalRecords(manifest);
    const boundCaseIds = manifest.bindings.map((binding) => binding.case_id);

    expect(Object.keys(manifest).sort()).toEqual(["bindings", "dataset", "id", "runner"]);
    expect(Object.keys(manifest.runner).sort()).toEqual(["command", "kind"]);
    expect(manifest.id).toBe(v2EvalId);
    expect(manifest.runner).toEqual({
      kind: "vitest",
      command: "npm test -- packages/contracts/src/m0-evals.test.ts"
    });
    expect(manifest.dataset).toBe("evals/registry/data/vedaxi/contracts-dev-v2.jsonl");
    expect(records.map((record) => record.id)).toEqual(v2RequiredCaseIds);
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
    expect(new Set(boundCaseIds).size).toBe(boundCaseIds.length);
    expect(boundCaseIds).toEqual(records.map((record) => record.id));

    for (const record of records) {
      expect(record.eval_id).toBe(v2EvalId);
      expect(record.module).toBe("contracts");
      expect(record.input.length).toBeGreaterThan(0);
      expect(record.ideal).not.toBe("");
      expect(record.criteria).not.toBe("");
      expect(record.assertions.length).toBeGreaterThan(0);
      expect(record.hard_gates.length).toBeGreaterThan(0);
      expect(record.evidence_kind).toBe("deterministic");
      expect(record.provenance).toBe("VEDAXI_TEST_SET.md");
    }

    for (const binding of manifest.bindings) {
      expect(evaluators[binding.evaluator]).toBeTypeOf("function");
    }
  });

  it("replays every v2 JSONL record against its executable local evaluator", async () => {
    const manifest = readManifest(v2ManifestPath);
    const recordsById = new Map(readM0EvalRecords(manifest).map((record) => [record.id, record]));

    for (const binding of manifest.bindings) {
      const record = recordsById.get(binding.case_id);
      expect(record).toBeDefined();
      await evaluators[binding.evaluator](record!);
    }
  });
});

describe("vedaxi.contracts.dev.v3 local deterministic eval manifest", () => {
  it("retains every v2 case and binds the public lifecycle cancellation contract", () => {
    const manifest = readManifest(v3ManifestPath);
    const records = readM0EvalRecords(manifest);
    const boundCaseIds = manifest.bindings.map((binding) => binding.case_id);

    expect(Object.keys(manifest).sort()).toEqual(["bindings", "dataset", "id", "runner"]);
    expect(manifest.id).toBe(v3EvalId);
    expect(manifest.runner).toEqual({
      kind: "vitest",
      command: "npm test -- packages/contracts/src/m0-evals.test.ts"
    });
    expect(manifest.dataset).toBe("evals/registry/data/vedaxi/contracts-dev-v3.jsonl");
    expect(records.map((record) => record.id)).toEqual(v3RequiredCaseIds);
    expect(records.slice(0, v2RequiredCaseIds.length).map((record) => record.id)).toEqual(
      v2RequiredCaseIds
    );
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
    expect(new Set(boundCaseIds).size).toBe(boundCaseIds.length);
    expect(boundCaseIds).toEqual(records.map((record) => record.id));

    for (const record of records) {
      expect(record.eval_id).toBe(v3EvalId);
      expect(record.module).toBe("contracts");
      expect(record.input.length).toBeGreaterThan(0);
      expect(record.ideal).not.toBe("");
      expect(record.criteria).not.toBe("");
      expect(record.assertions.length).toBeGreaterThan(0);
      expect(record.hard_gates.length).toBeGreaterThan(0);
      expect(record.evidence_kind).toBe("deterministic");
      expect(record.provenance).toBe("VEDAXI_TEST_SET.md");
    }

    for (const binding of manifest.bindings) {
      expect(evaluators[binding.evaluator]).toBeTypeOf("function");
    }
  });

  it("replays every v3 JSONL record against its executable local evaluator", async () => {
    const manifest = readManifest(v3ManifestPath);
    const recordsById = new Map(readM0EvalRecords(manifest).map((record) => [record.id, record]));

    for (const binding of manifest.bindings) {
      const record = recordsById.get(binding.case_id);
      expect(record).toBeDefined();
      await evaluators[binding.evaluator](record!);
    }
  });
});
