import { describe, expect, it } from "vitest";

import {
  registerWebMcpTools,
  searchEvidence,
  type EvidenceObject,
  type WebMcpUiStatus
} from "@vedaxi/contracts";

describe("@vedaxi/contracts public API", () => {
  it("exposes evidence and native registration contracts to a consumer", () => {
    const status: WebMcpUiStatus = "checking";
    const evidence: EvidenceObject = {
      id: "paper.methods.final-analysis",
      assetType: "paper-passage",
      sourceOrigin: "http://localhost:4173",
      locator: "Methods, participants",
      title: "Final analysis cohort",
      excerpt: "Forty participants completed the study and were included in the final analysis.",
      keywords: ["final", "analysis"],
      provenance: "Paper publisher methods passage"
    };

    expect(status).toBe("checking");
    expect(searchEvidence("final analysis", [evidence])).toHaveLength(1);
    expect(registerWebMcpTools).toBeTypeOf("function");
  });
});
