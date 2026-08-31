import { describe, expect, it } from "vitest";
import {
  createPublisherStore,
  type FocusRequest,
  type PublisherAction
} from "@vedaxi/state";

import {
  confirmFocusAction,
  requestFocusAction
} from "../../../apps/paper/src/actions";
import { createDiscrepancyFocusTool } from "../../../apps/paper/src/paper/focus-tool";

const CONTROLLED_FOCUS_REQUEST: FocusRequest = {
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

describe("shared PublisherStore.dispatch", () => {
  it("sends the same request-focus action through PublisherStore.dispatch from human and tool paths", async () => {
    const humanStore = createPublisherStore();
    const toolStore = createPublisherStore();
    const toolActions: PublisherAction[] = [];
    const tool = createDiscrepancyFocusTool((action) => {
      toolActions.push(action);
      return toolStore.dispatch(action);
    });

    const humanResult = humanStore.dispatch(requestFocusAction(CONTROLLED_FOCUS_REQUEST));
    const toolResult = await tool.execute(
      CONTROLLED_FOCUS_REQUEST as unknown as Record<string, unknown>
    );

    expect(humanResult).toMatchObject({ ok: true });
    expect(toolResult).toEqual({
      status: "pending-human-confirmation",
      citationStatus: "unblocked"
    });
    expect(toolActions).toEqual([requestFocusAction(CONTROLLED_FOCUS_REQUEST)]);
    expect(humanStore.getState()).toEqual(toolStore.getState());
  });

  it("shares one store.dispatch between the tool request and human confirm", async () => {
    const store = createPublisherStore();
    const tool = createDiscrepancyFocusTool(store.dispatch);

    await tool.execute(CONTROLLED_FOCUS_REQUEST as unknown as Record<string, unknown>);
    expect(store.getState().citationStatus).toBe("unblocked");
    expect(store.getState().discrepancyNote).toBeNull();

    expect(store.dispatch(confirmFocusAction({ confirmedBy: "human" }))).toMatchObject({
      ok: true
    });
    expect(store.getState()).toMatchObject({
      citationStatus: "blocked",
      focusProposal: null,
      discrepancyNote: {
        ...CONTROLLED_FOCUS_REQUEST,
        id: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
      }
    });
  });
});
