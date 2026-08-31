import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import {
  createPublisherStore,
  type Confirmation,
  type FocusRequest,
  type PublisherAction,
  type PublisherStorage
} from "@vedaxi/state";

import {
  confirmFocusAction,
  rejectFocusAction,
  requestFocusAction,
  resetPublisherAction
} from "./index";
import { createDiscrepancyFocusTool } from "../paper/focus-tool";

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
const manifestPath = resolve(repoRoot, "evals/registry/manifests/vedaxi-m3-actions.dev.v1.json");
const browserLimitation = "Browser reload and rendered UI evidence are unproven.";

const focusRequest = (): FocusRequest => ({
  paperEvidenceId: "paper.methods.final-analysis",
  videoEvidenceId: "video.transcript.calibration-drift",
  analyzedSample: 34,
  reasoning: "External comparison: forty reported participants minus six excluded without replacement.",
  provenance: {
    paper: "paper.methods.final-analysis",
    video: "video.transcript.calibration-drift@00:03:12",
    derivation: "Externally supplied comparison"
  }
});

const initialState = {
  citationStatus: "unblocked",
  discrepancyNote: null,
  focusProposal: null,
  auditEvents: []
};

function memoryStorage(): PublisherStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); }
  };
}

function failingStorage(throwOnWrite: number): PublisherStorage {
  const values = new Map<string, string>();
  let writes = 0;
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      writes += 1;
      if (writes === throwOnWrite) throw new Error("storage unavailable");
      values.set(key, value);
    }
  };
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

const evaluators: Record<string, () => Promise<void> | void> = {
  "request-reject": () => {
    const store = createPublisherStore();
    const request = focusRequest();

    expect(store.dispatch(requestFocusAction(request))).toMatchObject({ ok: true });
    expect(store.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: request,
      auditEvents: [{ type: "focus-requested" }]
    });
    expect(store.dispatch(rejectFocusAction())).toMatchObject({ ok: true });
    expect(store.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: null,
      auditEvents: [{ type: "focus-requested" }, { type: "focus-rejected" }]
    });
  },
  "human-confirm": () => {
    const store = createPublisherStore();
    store.dispatch(requestFocusAction(focusRequest()));
    const before = store.getState();

    for (const confirmedBy of ["agent", "webmcp"]) {
      expect(store.dispatch(confirmFocusAction({ confirmedBy } as unknown as Confirmation))).toEqual({
        ok: false,
        code: "invalid-confirmation",
        recoverable: true
      });
      expect(store.getState()).toEqual(before);
    }
    expect(store.dispatch(confirmFocusAction({ confirmedBy: "human" }))).toMatchObject({ ok: true });
  },
  "atomic-note": () => {
    const store = createPublisherStore();
    const request = focusRequest();
    store.dispatch(requestFocusAction(request));
    expect(store.dispatch(confirmFocusAction({ confirmedBy: "human" }))).toMatchObject({ ok: true });

    const confirmed = store.getState();
    expect(confirmed).toEqual({
      citationStatus: "blocked",
      focusProposal: null,
      discrepancyNote: {
        ...request,
        id: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
      },
      auditEvents: [
        { type: "focus-requested" },
        { type: "focus-confirmed", confirmedBy: "human" }
      ]
    });
    expect(store.dispatch(confirmFocusAction({ confirmedBy: "human" }))).toEqual({
      ok: false,
      code: "no-focus-proposal",
      recoverable: true
    });
    expect(store.getState()).toEqual(confirmed);
  },
  "persistence-rollback": () => {
    const request = requestFocusAction(focusRequest());
    const confirm = confirmFocusAction({ confirmedBy: "human" });
    const cases: Array<{ setup: PublisherAction[]; action: PublisherAction; throwOnWrite: number }> = [
      { setup: [], action: request, throwOnWrite: 1 },
      { setup: [request], action: rejectFocusAction(), throwOnWrite: 2 },
      { setup: [request], action: confirm, throwOnWrite: 2 },
      { setup: [request, confirm], action: resetPublisherAction(), throwOnWrite: 3 }
    ];

    for (const testCase of cases) {
      const store = createPublisherStore(failingStorage(testCase.throwOnWrite));
      for (const setupAction of testCase.setup) {
        expect(store.dispatch(setupAction)).toMatchObject({ ok: true });
      }
      const before = store.getState();
      expect(store.dispatch(testCase.action)).toEqual({
        ok: false,
        code: "persistence-failed",
        recoverable: true
      });
      expect(store.getState()).toEqual(before);
    }
  },
  rehydration: () => {
    const storage = memoryStorage();
    const first = createPublisherStore(storage);
    first.dispatch(requestFocusAction(focusRequest()));

    const pending = createPublisherStore(storage);
    expect(pending.rehydrate()).toMatchObject({ ok: true });
    expect(pending.getState()).toEqual(first.getState());
    expect(pending.dispatch(confirmFocusAction({ confirmedBy: "human" }))).toMatchObject({ ok: true });
    const confirmed = pending.getState();
    expect(confirmed).toEqual({
      citationStatus: "blocked",
      focusProposal: null,
      discrepancyNote: {
        ...focusRequest(),
        id: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
      },
      auditEvents: [
        { type: "focus-requested" },
        { type: "focus-confirmed", confirmedBy: "human" }
      ]
    });

    const blocked = createPublisherStore(storage);
    expect(blocked.rehydrate()).toMatchObject({ ok: true });
    expect(blocked.getState()).toEqual(confirmed);

    const corruptValues = [
      "{not-json",
      JSON.stringify({
        citationStatus: "blocked",
        discrepancyNote: null,
        focusProposal: null,
        auditEvents: [{ type: "focus-confirmed", confirmedBy: "human" }]
      })
    ];
    for (const value of corruptValues) {
      const corrupt = createPublisherStore({ getItem: () => value, setItem: () => undefined });
      expect(corrupt.rehydrate()).toEqual({ ok: false, code: "rehydration-failed", recoverable: true });
      expect(corrupt.getState()).toEqual(initialState);
    }
  },
  reset: () => {
    const storage = memoryStorage();
    const store = createPublisherStore(storage);
    expect(store.dispatch(requestFocusAction(focusRequest()))).toMatchObject({ ok: true });
    expect(store.dispatch(confirmFocusAction({ confirmedBy: "human" }))).toMatchObject({ ok: true });
    expect(store.getState()).toMatchObject({
      citationStatus: "blocked",
      focusProposal: null,
      discrepancyNote: {
        id: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
      }
    });
    expect(store.dispatch(resetPublisherAction())).toMatchObject({ ok: true });
    expect(store.getState()).toEqual(initialState);

    const reloaded = createPublisherStore(storage);
    expect(reloaded.rehydrate()).toMatchObject({ ok: true });
    expect(reloaded.getState()).toEqual(initialState);
  },
  "defensive-cloning": () => {
    const request = focusRequest();
    const store = createPublisherStore();
    const result = store.dispatch(requestFocusAction(request));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("request unexpectedly failed");

    request.reasoning = "mutated-input";
    request.provenance.paper = "mutated-input";
    result.state.focusProposal!.reasoning = "mutated-result";
    result.state.auditEvents.push({ type: "focus-rejected" });
    const snapshot = store.getState();
    snapshot.focusProposal!.provenance.video = "mutated-snapshot";
    snapshot.auditEvents.push({ type: "focus-rejected" });

    expect(store.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: focusRequest(),
      auditEvents: [{ type: "focus-requested" }]
    });

    const confirmed = store.dispatch(confirmFocusAction({ confirmedBy: "human" }));
    expect(confirmed.ok).toBe(true);
    if (!confirmed.ok) throw new Error("confirmation unexpectedly failed");
    confirmed.state.discrepancyNote!.reasoning = "mutated-confirm-result";
    confirmed.state.discrepancyNote!.provenance.derivation = "mutated-confirm-result";
    const blockedSnapshot = store.getState();
    blockedSnapshot.discrepancyNote!.reasoning = "mutated-blocked-snapshot";
    blockedSnapshot.discrepancyNote!.provenance.paper = "mutated-blocked-snapshot";

    expect(store.getState().discrepancyNote).toEqual({
      ...focusRequest(),
      id: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
    });
  },
  "request-parity": async () => {
    const request = focusRequest();
    const humanStore = createPublisherStore();
    const toolStore = createPublisherStore();
    const toolActions: PublisherAction[] = [];
    const tool = createDiscrepancyFocusTool((action) => {
      toolActions.push(action);
      return toolStore.dispatch(action);
    });

    const expectedAction = requestFocusAction(request);
    expect(humanStore.dispatch(expectedAction)).toMatchObject({ ok: true });
    await expect(tool.execute({ ...request })).resolves.toEqual({
      status: "pending-human-confirmation",
      citationStatus: "unblocked"
    });
    expect(toolActions).toEqual([expectedAction]);
    expect(humanStore.getState()).toEqual(toolStore.getState());
    expect(toolStore.getState().citationStatus).toBe("unblocked");
    expect(toolStore.getState().discrepancyNote).toBeNull();
  }
};

describe("vedaxi.m3-shared-actions.dev.v1", () => {
  it("binds every module-qualified dataset case exactly once and preserves the browser boundary", () => {
    const manifest = readManifest();
    const records = readRecords(manifest);

    expect(manifest.id).toBe("vedaxi.m3-shared-actions.dev.v1");
    expect(manifest.runner).toEqual({
      kind: "vitest",
      command: "npm test -- apps/paper/src/actions/m3-evals.test.ts"
    });
    expect(manifest.unproven).toEqual([browserLimitation]);
    expect(manifest.bindings).toEqual([
      { case_id: "m3-actions-request-reject", evaluator: "request-reject" },
      { case_id: "m3-actions-human-confirm", evaluator: "human-confirm" },
      { case_id: "m3-actions-atomic-note", evaluator: "atomic-note" },
      { case_id: "m3-actions-persistence-rollback", evaluator: "persistence-rollback" },
      { case_id: "m3-actions-rehydration", evaluator: "rehydration" },
      { case_id: "m3-actions-reset", evaluator: "reset" },
      { case_id: "m3-actions-defensive-cloning", evaluator: "defensive-cloning" },
      { case_id: "m3-actions-request-parity", evaluator: "request-parity" }
    ]);
    expect(manifest.bindings.map(({ case_id }) => case_id)).toEqual(records.map(({ id }) => id));
    expect(new Set(records.map(({ id }) => id))).toHaveLength(records.length);

    for (const record of records) {
      expect(record.eval_id).toBe(manifest.id);
      expect(record.module).toBe("m3-shared-actions");
      expect(record.assertions.length).toBeGreaterThan(0);
      expect(record.hard_gates.length).toBeGreaterThan(0);
      expect(record.limitations).toContain(browserLimitation);
      expect(evaluators[manifest.bindings.find(({ case_id }) => case_id === record.id)!.evaluator]).toBeTypeOf("function");
    }
  });

  it("replays every M3 source case through the public action and state boundaries", async () => {
    const manifest = readManifest();
    for (const binding of manifest.bindings) await evaluators[binding.evaluator]();
  });
});
