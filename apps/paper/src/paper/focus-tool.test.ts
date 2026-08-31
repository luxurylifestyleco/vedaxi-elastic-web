import type { FocusRequest, PublisherStorage } from "@vedaxi/state";
import { describe, expect, it } from "vitest";

import { createPublisherRuntime } from "../stage/publisher-runtime";
import { CONTROLLED_FOCUS_REQUEST } from "./PaperApp";
import { createDiscrepancyFocusTool } from "./focus-tool";

const validInput = {
  paperEvidenceId: "paper.methods.final-analysis",
  videoEvidenceId: "video.transcript.calibration-drift",
  analyzedSample: 34,
  reasoning: "The video excludes six of the paper's forty reported participants.",
  provenance: {
    paper: "VEDAXI controlled paper fixture — Methods, participants",
    video: "VEDAXI controlled video fixture — transcript cue at 00:03:12",
    derivation: "Externally supplied comparison: 40 - 6 = 34"
  }
} satisfies FocusRequest;
const inheritedInput = Object.assign(
  Object.create({ paperEvidenceId: validInput.paperEvidenceId }) as object,
  {
    videoEvidenceId: validInput.videoEvidenceId,
    analyzedSample: validInput.analyzedSample,
    reasoning: validInput.reasoning,
    provenance: validInput.provenance,
    extra: true
  }
);

function memoryStorage(): PublisherStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); }
  };
}

describe("request_discrepancy_focus", () => {
  it("declares the controlled constants and bounded, described input", () => {
    const runtime = createPublisherRuntime(memoryStorage());
    const tool = createDiscrepancyFocusTool(runtime.dispatch);

    expect(tool.name).toBe("request_discrepancy_focus");
    expect(tool.annotations).toEqual({ readOnlyHint: false, untrustedContentHint: true });
    expect(tool.inputSchema).toEqual({
      type: "object",
      properties: {
        paperEvidenceId: {
          type: "string",
          const: "paper.methods.final-analysis",
          description: "Exact paper evidence ID to focus."
        },
        videoEvidenceId: {
          type: "string",
          const: "video.transcript.calibration-drift",
          description: "Exact video evidence ID to focus."
        },
        analyzedSample: {
          type: "integer",
          const: 34,
          description: "Externally derived analyzed sample; this tool does not compute it."
        },
        reasoning: {
          type: "string",
          minLength: 1,
          maxLength: 280,
          pattern: "\\S",
          description: "Concise external reasoning for human review."
        },
        provenance: {
          type: "object",
          description: "External provenance for the paper, video, and derivation.",
          properties: {
            paper: {
              type: "string",
              minLength: 1,
              maxLength: 280,
              pattern: "\\S",
              description: "Paper evidence provenance."
            },
            video: {
              type: "string",
              minLength: 1,
              maxLength: 280,
              pattern: "\\S",
              description: "Video evidence provenance."
            },
            derivation: {
              type: "string",
              minLength: 1,
              maxLength: 280,
              pattern: "\\S",
              description: "Provenance of the external derivation."
            }
          },
          required: ["paper", "video", "derivation"],
          additionalProperties: false
        }
      },
      required: [
        "paperEvidenceId",
        "videoEvidenceId",
        "analyzedSample",
        "reasoning",
        "provenance"
      ],
      additionalProperties: false
    });
  });

  it("persists only a pending proposal and reports the current citation status", async () => {
    const runtime = createPublisherRuntime(memoryStorage());
    const tool = createDiscrepancyFocusTool(runtime.dispatch);

    await expect(tool.execute(validInput)).resolves.toEqual({
      status: "pending-human-confirmation",
      citationStatus: "unblocked"
    });
    expect(runtime.getSnapshot().state).toMatchObject({
      citationStatus: "unblocked",
      discrepancyNote: null,
      focusProposal: validInput,
      auditEvents: [{ type: "focus-requested" }]
    });
  });

  it("matches direct human-path dispatch at the public state boundary", async () => {
    const nativeRuntime = createPublisherRuntime(memoryStorage());
    const humanRuntime = createPublisherRuntime(memoryStorage());

    await createDiscrepancyFocusTool(nativeRuntime.dispatch).execute(validInput);
    humanRuntime.dispatch({ type: "request-focus", request: CONTROLLED_FOCUS_REQUEST });

    expect(nativeRuntime.getSnapshot()).toEqual(humanRuntime.getSnapshot());
  });

  it.each([
    undefined,
    null,
    [],
    {},
    { ...validInput, analyzedSample: 35 },
    { ...validInput, reasoning: "   " },
    { ...validInput, reasoning: "x".repeat(281) },
    { ...validInput, extra: true },
    inheritedInput,
    { ...validInput, provenance: { ...validInput.provenance, derivation: "" } },
    { ...validInput, provenance: { ...validInput.provenance, extra: true } }
  ])("rejects malformed untrusted input without changing state: %j", async (input) => {
    const runtime = createPublisherRuntime(memoryStorage());
    const tool = createDiscrepancyFocusTool(runtime.dispatch);

    await expect(
      (tool.execute as (value: unknown) => Promise<unknown>)(input)
    ).rejects.toThrow(/focus request input/i);
    expect(runtime.getSnapshot().state.focusProposal).toBeNull();
  });

  it("throws an actionable error when state rejects the request", async () => {
    const runtime = createPublisherRuntime(memoryStorage());
    const tool = createDiscrepancyFocusTool(runtime.dispatch);
    await tool.execute(validInput);

    await expect(tool.execute(validInput)).rejects.toThrow(
      "Focus request failed: review or reject the existing pending proposal first."
    );
    expect(runtime.getSnapshot().state.discrepancyNote).toBeNull();
  });
});
