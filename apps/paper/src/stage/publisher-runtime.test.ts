import {
  createPublisherStore,
  type FocusRequest,
  type PublisherStorage
} from "@vedaxi/state";
import { describe, expect, it, vi } from "vitest";

import { createPublisherRuntime } from "./publisher-runtime";

const focusRequest: FocusRequest = {
  paperEvidenceId: "paper.methods.final-analysis",
  videoEvidenceId: "video.transcript.calibration-drift",
  analyzedSample: 34,
  reasoning: "The video excludes six of the paper's forty reported participants.",
  provenance: {
    paper: "VEDAXI controlled paper fixture — Methods, participants",
    video: "VEDAXI controlled video fixture — transcript cue at 00:03:12",
    derivation: "Externally supplied comparison: 40 - 6 = 34"
  }
};

function memoryStorage(): PublisherStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); }
  };
}

describe("Paper publisher runtime", () => {
  it("rehydrates a confirmed blocked state before the first browser view snapshot", () => {
    const storage = memoryStorage();
    const firstStore = createPublisherStore(storage);
    firstStore.dispatch({ type: "request-focus", request: focusRequest });
    firstStore.dispatch({ type: "confirm-focus", confirmation: { confirmedBy: "human" } });

    const runtime = createPublisherRuntime(storage);

    expect(runtime.getSnapshot().state.citationStatus).toBe("blocked");
    expect(runtime.getSnapshot().state.discrepancyNote?.analyzedSample).toBe(34);
    expect(runtime.getSnapshot().error).toBeNull();
  });

  it("uses one dispatch closure and notifies the React subscriber after each call", () => {
    const runtime = createPublisherRuntime(memoryStorage());
    const dispatch = runtime.dispatch;
    const listener = vi.fn();
    runtime.subscribe(listener);

    expect(dispatch({ type: "request-focus", request: focusRequest }).ok).toBe(true);
    expect(runtime.dispatch).toBe(dispatch);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(runtime.getSnapshot().state.focusProposal).toEqual(focusRequest);

    expect(dispatch({ type: "reject-focus" }).ok).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(runtime.getSnapshot().state.focusProposal).toBeNull();
  });

  it("reports rehydration and persistence failures without publishing a false state", () => {
    const brokenRead = createPublisherRuntime({
      getItem: () => { throw new Error("blocked storage"); },
      setItem: () => undefined
    });
    expect(brokenRead.getSnapshot().error).toContain("could not be restored");
    expect(brokenRead.getSnapshot().state.citationStatus).toBe("unblocked");

    const listener = vi.fn();
    const brokenWrite = createPublisherRuntime({
      getItem: () => null,
      setItem: () => { throw new Error("quota"); }
    });
    brokenWrite.subscribe(listener);
    const result = brokenWrite.dispatch({ type: "request-focus", request: focusRequest });

    expect(result).toMatchObject({ ok: false, code: "persistence-failed" });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(brokenWrite.getSnapshot().error).toContain("could not be saved");
    expect(brokenWrite.getSnapshot().state.focusProposal).toBeNull();
    expect(brokenWrite.getSnapshot().state.citationStatus).toBe("unblocked");
  });
});
