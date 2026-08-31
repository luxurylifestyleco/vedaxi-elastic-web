import { describe, expect, it } from "vitest";
import { parseBoardStatus } from "./status";

const validStatus = {
  version: 1,
  updatedAt: "2026-08-31T05:30:00.000Z",
  release: { label: "R1", progress: 20, summary: "M1 active" },
  attention: [
    { id: "attention.video", eyebrow: "Now", title: "Choose video", detail: "Asset needed" },
  ],
  agents: [
    { id: "agent.master", name: "Master Agent", focus: "Remote board", state: "working" },
  ],
  watch: [],
  drawer: { done: [], milestones: [], evidence: [] },
} as const;

describe("parseBoardStatus", () => {
  it("accepts the attention-first board contract", () => {
    expect(parseBoardStatus(validStatus).attention).toHaveLength(1);
  });

  it("rejects duplicated entries across attention and the drawer", () => {
    expect(() =>
      parseBoardStatus({
        ...validStatus,
        drawer: { ...validStatus.drawer, done: [validStatus.attention[0]] },
      }),
    ).toThrow("unique id");
  });

  it("rejects invalid progress values", () => {
    expect(() =>
      parseBoardStatus({
        ...validStatus,
        release: { ...validStatus.release, progress: 101 },
      }),
    ).toThrow("failed validation");
  });

  it("rejects unsafe attention links", () => {
    expect(() =>
      parseBoardStatus({
        ...validStatus,
        attention: [{ ...validStatus.attention[0], href: "javascript:alert(1)" }],
      }),
    ).toThrow("failed validation");
  });
});
