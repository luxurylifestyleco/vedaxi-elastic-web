import { describe, expect, it } from "vitest";
import { createPublisherStore, type Confirmation } from "@vedaxi/state";

import {
  confirmFocusAction,
  rejectFocusAction,
  requestFocusAction,
  resetPublisherAction
} from "../../../apps/paper/src/actions";
import { CONTROLLED_FOCUS_REQUEST } from "../../../apps/paper/src/paper/PaperApp";
import { createDiscrepancyFocusTool } from "../../../apps/paper/src/paper/focus-tool";

describe("shared publisher action adapter", () => {
  it("matches human-path requestFocusAction with a tool wrapping the same dispatch", async () => {
    const humanStore = createPublisherStore();
    const toolStore = createPublisherStore();
    const tool = createDiscrepancyFocusTool(toolStore.dispatch);

    const humanResult = humanStore.dispatch(requestFocusAction(CONTROLLED_FOCUS_REQUEST));
    const toolResult = await tool.execute({ ...CONTROLLED_FOCUS_REQUEST });

    expect(humanResult).toMatchObject({ ok: true });
    expect(toolResult).toEqual({
      status: "pending-human-confirmation",
      citationStatus: "unblocked"
    });
    expect(humanStore.getState()).toEqual(toolStore.getState());
    expect(humanStore.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: CONTROLLED_FOCUS_REQUEST,
      auditEvents: [{ type: "focus-requested" }]
    });
  });

  it("routes confirm, reject, and reset through the shared factories on a store", () => {
    const store = createPublisherStore();
    store.dispatch(requestFocusAction(CONTROLLED_FOCUS_REQUEST));

    expect(store.dispatch(rejectFocusAction())).toMatchObject({ ok: true });
    expect(store.getState()).toMatchObject({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: null,
      auditEvents: [{ type: "focus-requested" }, { type: "focus-rejected" }]
    });

    store.dispatch(requestFocusAction(CONTROLLED_FOCUS_REQUEST));
    expect(store.dispatch(confirmFocusAction({ confirmedBy: "human" }))).toMatchObject({ ok: true });
    expect(store.getState()).toMatchObject({
      citationStatus: "blocked",
      focusProposal: null,
      discrepancyNote: {
        ...CONTROLLED_FOCUS_REQUEST,
        id: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
      },
      auditEvents: [
        { type: "focus-requested" },
        { type: "focus-rejected" },
        { type: "focus-requested" },
        { type: "focus-confirmed", confirmedBy: "human" }
      ]
    });

    expect(store.dispatch(resetPublisherAction())).toMatchObject({ ok: true });
    expect(store.getState()).toEqual({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: null,
      auditEvents: []
    });
  });

  it("leaves citation mutation to human confirm, not the request tool", async () => {
    const store = createPublisherStore();
    await createDiscrepancyFocusTool(store.dispatch).execute({ ...CONTROLLED_FOCUS_REQUEST });

    expect(store.getState().citationStatus).toBe("unblocked");
    expect(store.getState().discrepancyNote).toBeNull();

    const rejected = store.dispatch(
      confirmFocusAction({ confirmedBy: "agent" } as unknown as Confirmation)
    );
    expect(rejected).toEqual({
      ok: false,
      code: "invalid-confirmation",
      recoverable: true
    });
    expect(store.getState().citationStatus).toBe("unblocked");

    expect(store.dispatch(confirmFocusAction({ confirmedBy: "human" }))).toMatchObject({ ok: true });
    expect(store.getState().citationStatus).toBe("blocked");
  });

  it("rolls back confirmation when persistence fails after a tool request", async () => {
    let writes = 0;
    const store = createPublisherStore({
      getItem: () => null,
      setItem: () => {
        writes += 1;
        if (writes === 2) throw new Error("disk full");
      }
    });
    await createDiscrepancyFocusTool(store.dispatch).execute({ ...CONTROLLED_FOCUS_REQUEST });
    const beforeConfirm = store.getState();

    expect(store.dispatch(confirmFocusAction({ confirmedBy: "human" }))).toEqual({
      ok: false,
      code: "persistence-failed",
      recoverable: true
    });
    expect(store.getState()).toEqual(beforeConfirm);
    expect(store.getState().citationStatus).toBe("unblocked");
    expect(store.getState().discrepancyNote).toBeNull();
  });
});
