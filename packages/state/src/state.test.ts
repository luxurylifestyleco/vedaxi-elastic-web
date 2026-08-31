import { describe, expect, it } from "vitest";

import {
  createPublisherStore,
  type Confirmation,
  type FocusRequest,
  type PublisherAction,
  type PublisherStorage
} from "./index";

const validFocus: FocusRequest = {
  paperEvidenceId: "paper.methods.final-analysis",
  videoEvidenceId: "video.transcript.calibration-drift",
  analyzedSample: 34,
  reasoning: "The externally derived analyzed sample differs from the publisher citation.",
  provenance: {
    paper: "VEDAXI controlled paper fixture — Methods, participants",
    video: "VEDAXI controlled video fixture — transcript cue at 00:03:12",
    derivation: "External agent derived 34 from the two evidence sources."
  }
};

function createMemoryStorage(): PublisherStorage {
  const entries = new Map<string, string>();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value)
  };
}

describe("publisher state", () => {
  it("starts deterministically unblocked without a note or focus proposal", () => {
    const store = createPublisherStore();

    expect(store.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: null,
      auditEvents: []
    });
  });

  it("rejects a focus proposal without mutating the citation or note", () => {
    const store = createPublisherStore();
    store.dispatch({ type: "request-focus", request: validFocus });

    expect(store.dispatch({ type: "reject-focus" })).toMatchObject({ ok: true });
    expect(store.getState()).toMatchObject({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: null
    });
  });

  it("rejects a second focus request while a proposal is pending", () => {
    const store = createPublisherStore();
    store.dispatch({ type: "request-focus", request: validFocus });
    const beforeSecondRequest = store.getState();

    expect(store.dispatch({ type: "request-focus", request: validFocus })).toEqual({
      ok: false,
      code: "focus-already-proposed",
      recoverable: true
    });
    expect(store.getState()).toEqual(beforeSecondRequest);
  });

  it("requires a focused proposal before confirmation", () => {
    const store = createPublisherStore();

    expect(store.dispatch({ type: "confirm-focus", confirmation: { confirmedBy: "human" } })).toEqual({
      ok: false,
      code: "no-focus-proposal",
      recoverable: true
    });
    expect(store.getState().citationStatus).toBe("unblocked");
    expect(store.getState().discrepancyNote).toBeNull();
  });

  it("atomically blocks the citation and creates one linked note for a valid focus", () => {
    const store = createPublisherStore();
    store.dispatch({ type: "request-focus", request: validFocus });

    expect(
      store.dispatch({ type: "confirm-focus", confirmation: { confirmedBy: "human" } })
    ).toMatchObject({ ok: true });
    const confirmed = store.getState();
    expect(confirmed).toMatchObject({
      citationStatus: "blocked",
      focusProposal: null,
      discrepancyNote: {
        id: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift",
        paperEvidenceId: "paper.methods.final-analysis",
        videoEvidenceId: "video.transcript.calibration-drift",
        analyzedSample: 34,
        reasoning: validFocus.reasoning,
        provenance: validFocus.provenance
      }
    });
    expect(confirmed.auditEvents).toEqual([
      { type: "focus-requested" },
      { type: "focus-confirmed", confirmedBy: "human" }
    ]);
  });

  it("rejects malformed focus input at the action boundary", () => {
    const store = createPublisherStore();

    const malformedRequests: unknown[] = [
      { ...validFocus, paperEvidenceId: "paper.other" },
      { ...validFocus, videoEvidenceId: "video.other" },
      { ...validFocus, analyzedSample: 33 },
      { ...validFocus, analyzedSample: 35 },
      { ...validFocus, analyzedSample: "34" },
      { ...validFocus, reasoning: "   " },
      { ...validFocus, reasoning: "x".repeat(281) },
      { ...validFocus, provenance: undefined },
      { ...validFocus, provenance: { ...validFocus.provenance, paper: "" } },
      { ...validFocus, provenance: { ...validFocus.provenance, video: "  " } },
      { ...validFocus, provenance: { ...validFocus.provenance, derivation: "" } }
    ];

    for (const request of malformedRequests) {
      expect(
        store.dispatch({ type: "request-focus", request: request as FocusRequest })
      ).toEqual({ ok: false, code: "invalid-focus-request", recoverable: true });
    }
    expect(store.getState().focusProposal).toBeNull();
  });

  it("rejects unknown actions without resetting state", () => {
    const store = createPublisherStore();
    store.dispatch({ type: "request-focus", request: validFocus });
    const beforeUnknownAction = store.getState();

    expect(store.dispatch({ type: "unexpected" } as unknown as PublisherAction)).toEqual({
      ok: false,
      code: "invalid-action",
      recoverable: true
    });
    expect(store.getState()).toEqual(beforeUnknownAction);
  });

  it("rejects non-human confirmation before committing a focused proposal", () => {
    const store = createPublisherStore();
    store.dispatch({ type: "request-focus", request: validFocus });
    const beforeConfirmation = store.getState();

    for (const confirmedBy of ["agent", "webmcp"]) {
      expect(
        store.dispatch({ type: "confirm-focus", confirmation: { confirmedBy } as unknown as Confirmation })
      ).toEqual({ ok: false, code: "invalid-confirmation", recoverable: true });
    }
    expect(store.getState()).toEqual(beforeConfirmation);
  });

  it("rehydrates persisted successful state and resets it to the exact initial state", () => {
    const storage = createMemoryStorage();
    const firstStore = createPublisherStore(storage);
    firstStore.dispatch({ type: "request-focus", request: validFocus });
    firstStore.dispatch({ type: "confirm-focus", confirmation: { confirmedBy: "human" } });

    const rehydratedStore = createPublisherStore(storage);
    expect(rehydratedStore.rehydrate()).toMatchObject({ ok: true });
    expect(rehydratedStore.getState().citationStatus).toBe("blocked");

    expect(rehydratedStore.dispatch({ type: "reset" })).toMatchObject({ ok: true });
    expect(rehydratedStore.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: null,
      auditEvents: []
    });
  });

  it("rolls back in-memory state when persistence fails at each action boundary", () => {
    const request: PublisherAction = { type: "request-focus", request: validFocus };
    const reject: PublisherAction = { type: "reject-focus" };
    const confirm: PublisherAction = { type: "confirm-focus", confirmation: { confirmedBy: "human" } };
    const reset: PublisherAction = { type: "reset" };
    const cases: { setup: PublisherAction[]; action: PublisherAction; throwOnWrite: number }[] = [
      { setup: [], action: request, throwOnWrite: 1 },
      { setup: [request], action: reject, throwOnWrite: 2 },
      { setup: [request], action: confirm, throwOnWrite: 2 },
      { setup: [request, confirm], action: reset, throwOnWrite: 3 }
    ];

    for (const { setup, action, throwOnWrite } of cases) {
      let writes = 0;
      const store = createPublisherStore({
        getItem: () => null,
        setItem: () => {
          writes += 1;
          if (writes === throwOnWrite) throw new Error("disk full");
        }
      });
      for (const step of setup) {
        expect(store.dispatch(step)).toMatchObject({ ok: true });
      }
      const before = store.getState();
      expect(store.dispatch(action)).toEqual({
        ok: false,
        code: "persistence-failed",
        recoverable: true
      });
      expect(store.getState()).toEqual(before);
    }
  });

  it("rejects corrupt audit histories during rehydration", () => {
    const note = {
      ...validFocus,
      id: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
    };
    const corruptStates = [
      { citationStatus: "blocked", discrepancyNote: note, focusProposal: null, auditEvents: [{ type: "focus-requested" }] },
      { citationStatus: "unblocked", discrepancyNote: null, focusProposal: null, auditEvents: [{ type: "focus-confirmed", confirmedBy: "human" }] },
      { citationStatus: "unblocked", discrepancyNote: null, focusProposal: validFocus, auditEvents: [] },
      { citationStatus: "blocked", discrepancyNote: note, focusProposal: null, auditEvents: [{ type: "focus-confirmed", confirmedBy: "human" }, { type: "focus-requested" }] },
      { citationStatus: "blocked", discrepancyNote: note, focusProposal: null, auditEvents: [{ type: "focus-requested" }, { type: "focus-confirmed", confirmedBy: "human" }, { type: "focus-confirmed", confirmedBy: "webmcp" }] }
    ];

    for (const corruptState of corruptStates) {
      const store = createPublisherStore({
        getItem: () => JSON.stringify(corruptState),
        setItem: () => undefined
      });
      expect(store.rehydrate()).toEqual({ ok: false, code: "rehydration-failed", recoverable: true });
      expect(store.getState().citationStatus).toBe("unblocked");
    }
  });

  it("rehydrates repeated focus-reject cycles", () => {
    const storage: PublisherStorage = {
      getItem: () => JSON.stringify({
        citationStatus: "unblocked",
        discrepancyNote: null,
        focusProposal: null,
        auditEvents: [
          { type: "focus-requested" },
          { type: "focus-rejected" },
          { type: "focus-requested" },
          { type: "focus-rejected" }
        ]
      }),
      setItem: () => undefined
    };

    const store = createPublisherStore(storage);
    expect(store.rehydrate()).toMatchObject({ ok: true });
    expect(store.getState().auditEvents).toHaveLength(4);
  });

  it("rejects a focus request after the citation is already blocked", () => {
    const store = createPublisherStore();
    store.dispatch({ type: "request-focus", request: validFocus });
    store.dispatch({ type: "confirm-focus", confirmation: { confirmedBy: "human" } });
    const beforeSecondRequest = store.getState();

    expect(store.dispatch({ type: "request-focus", request: validFocus })).toEqual({
      ok: false,
      code: "citation-already-blocked",
      recoverable: true
    });
    expect(store.getState()).toEqual(beforeSecondRequest);
  });

  it("rejects with no proposal without mutating citation, note, or audit", () => {
    const store = createPublisherStore();
    const beforeReject = store.getState();

    expect(store.dispatch({ type: "reject-focus" })).toMatchObject({ ok: true });
    expect(store.getState()).toEqual(beforeReject);
    expect(store.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: null,
      auditEvents: []
    });
  });

  it("rehydrates a valid pending focus proposal", () => {
    const storage = createMemoryStorage();
    const firstStore = createPublisherStore(storage);
    firstStore.dispatch({ type: "request-focus", request: validFocus });

    const rehydratedStore = createPublisherStore(storage);
    expect(rehydratedStore.rehydrate()).toMatchObject({ ok: true });
    expect(rehydratedStore.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: validFocus,
      auditEvents: [{ type: "focus-requested" }]
    });
  });

  it("fails closed when stored JSON is malformed or getItem throws", () => {
    const malformedStore = createPublisherStore({
      getItem: () => "{not-json",
      setItem: () => undefined
    });
    expect(malformedStore.rehydrate()).toEqual({
      ok: false,
      code: "rehydration-failed",
      recoverable: true
    });
    expect(malformedStore.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: null,
      auditEvents: []
    });

    const throwingStore = createPublisherStore({
      getItem: () => {
        throw new Error("unavailable");
      },
      setItem: () => undefined
    });
    expect(throwingStore.rehydrate()).toEqual({
      ok: false,
      code: "rehydration-failed",
      recoverable: true
    });
    expect(throwingStore.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: null,
      auditEvents: []
    });
  });

  it("clones getState and success.state so callers cannot mutate store internals", () => {
    const store = createPublisherStore();
    const requested = store.dispatch({ type: "request-focus", request: validFocus });
    expect(requested.ok).toBe(true);
    if (!requested.ok) return;

    requested.state.focusProposal!.reasoning = "mutated-success";
    requested.state.focusProposal!.provenance.paper = "mutated-success";
    requested.state.auditEvents.push({ type: "focus-rejected" });

    const snapshot = store.getState();
    snapshot.focusProposal!.reasoning = "mutated-getState";
    snapshot.focusProposal!.provenance.video = "mutated-getState";
    snapshot.auditEvents.push({ type: "focus-confirmed", confirmedBy: "human" });

    expect(store.getState().focusProposal).toEqual(validFocus);
    expect(store.getState().auditEvents).toEqual([{ type: "focus-requested" }]);

    store.dispatch({ type: "confirm-focus", confirmation: { confirmedBy: "human" } });
    const blocked = store.getState();
    blocked.discrepancyNote!.reasoning = "mutated-note";
    blocked.discrepancyNote!.provenance.derivation = "mutated-note";
    blocked.citationStatus = "unblocked";

    expect(store.getState().citationStatus).toBe("blocked");
    expect(store.getState().discrepancyNote?.reasoning).toBe(validFocus.reasoning);
    expect(store.getState().discrepancyNote?.provenance).toEqual(validFocus.provenance);
  });

  it("creates exactly one deterministic note and refuses a second confirmation", () => {
    const store = createPublisherStore();
    store.dispatch({ type: "request-focus", request: validFocus });
    store.dispatch({ type: "confirm-focus", confirmation: { confirmedBy: "human" } });
    const blocked = store.getState();

    expect(blocked.discrepancyNote?.id).toBe(
      "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
    );
    expect(blocked.auditEvents.filter((event) => event.type === "focus-confirmed")).toHaveLength(1);

    expect(store.dispatch({ type: "confirm-focus", confirmation: { confirmedBy: "human" } })).toEqual({
      ok: false,
      code: "no-focus-proposal",
      recoverable: true
    });
    expect(store.getState()).toEqual(blocked);
  });
});
