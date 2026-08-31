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
    expect(store.getState()).toMatchObject({
      citationStatus: "blocked",
      focusProposal: null,
      discrepancyNote: {
        paperEvidenceId: "paper.methods.final-analysis",
        videoEvidenceId: "video.transcript.calibration-drift",
        analyzedSample: 34,
        reasoning: validFocus.reasoning,
        provenance: validFocus.provenance
      }
    });
    expect(store.getState().auditEvents.map((event) => event.type)).toEqual([
      "focus-requested",
      "focus-confirmed"
    ]);
  });

  it("rejects malformed focus input at the action boundary", () => {
    const store = createPublisherStore();

    const malformedRequests: unknown[] = [
      { ...validFocus, paperEvidenceId: "paper.other" },
      { ...validFocus, videoEvidenceId: "video.other" },
      { ...validFocus, reasoning: "   " },
      { ...validFocus, reasoning: "x".repeat(281) },
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

  it("rolls back citation, note, and audit when persistence fails during confirmation", () => {
    let writes = 0;
    const storage: PublisherStorage = {
      getItem: () => null,
      setItem: () => {
        writes += 1;
        if (writes === 2) throw new Error("disk full");
      },
    };
    const store = createPublisherStore(storage);
    store.dispatch({ type: "request-focus", request: validFocus });
    const beforeConfirm = store.getState();

    expect(store.dispatch({ type: "confirm-focus", confirmation: { confirmedBy: "human" } })).toEqual({
      ok: false,
      code: "persistence-failed",
      recoverable: true
    });
    expect(store.getState()).toEqual(beforeConfirm);
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
});
