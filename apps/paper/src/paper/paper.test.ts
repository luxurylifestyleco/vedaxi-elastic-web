import { describe, expect, it } from "vitest";

import {
  PAPER_EVIDENCE_ID,
  createPaperEvidenceService,
  createPaperEvidenceTool,
  createPaperFixture,
  protocolStatusCopy
} from "./index";

const origin = "http://localhost:4173";

describe("M1 paper fixture and evidence boundary", () => {
  it("creates stable publisher evidence from the injected runtime origin", () => {
    const fixture = createPaperFixture(`${origin}/paper?view=methods`);

    expect(fixture.evidence).toEqual({
      id: PAPER_EVIDENCE_ID,
      assetType: "paper-passage",
      sourceOrigin: origin,
      locator: "Methods, participants",
      title: "Final analysis cohort",
      excerpt: "Forty participants completed the study and were included in the final analysis.",
      keywords: ["participants", "final", "analysis", "analyzed", "sample"],
      provenance: "VEDAXI controlled paper fixture — Methods, participants"
    });
    expect(fixture.document.methodsEvidenceId).toBe(PAPER_EVIDENCE_ID);
    expect(fixture.document.isFictional).toBe(true);
  });

  it("normalizes two configured publisher origins and rejects non-web origins", () => {
    expect(createPaperFixture("https://paper.example.test/research").evidence.sourceOrigin).toBe(
      "https://paper.example.test"
    );
    expect(createPaperFixture("http://127.0.0.1:5173/").evidence.sourceOrigin).toBe(
      "http://127.0.0.1:5173"
    );
    expect(() => createPaperFixture("file:///paper.html")).toThrow("http or https origin");
    expect(() => createPaperFixture("not a url")).toThrow("valid URL");
  });

  it("searches the exact fixture and returns nothing for unrelated or stopword-only queries", () => {
    const fixture = createPaperFixture(origin);
    const service = createPaperEvidenceService(fixture.evidence);

    expect(service.search("final analyzed sample")).toEqual([
      { evidence: fixture.evidence, score: 3 }
    ]);
    expect(service.search("calibration exclusion")).toEqual([]);
    expect(service.search("the and of")).toEqual([]);
  });

  it("never changes its allowed publisher-owned output for a reasoning-coaxing query", () => {
    const fixture = createPaperFixture(origin);
    const service = createPaperEvidenceService(fixture.evidence);
    const result = service.search("compute analyzed sample contradiction");

    expect(result).toEqual([{ evidence: fixture.evidence, score: 2 }]);
    expect(Object.keys(result[0].evidence).sort()).toEqual([
      "assetType",
      "excerpt",
      "id",
      "keywords",
      "locator",
      "provenance",
      "sourceOrigin",
      "title"
    ]);
    expect(JSON.stringify(result)).not.toMatch(
      /(?:\b34\b|difference|recommendation|assessment|validParticipants|expectedSample|video\.transcript)/i
    );
  });
});

describe("M1 paper evidence tool", () => {
  const fixture = createPaperFixture(origin);
  const service = createPaperEvidenceService(fixture.evidence);
  const tool = createPaperEvidenceTool(service);
  const executeUnknown = tool.execute as (input: unknown) => Promise<unknown>;

  it("declares a strict read-only query schema and returns the shared fixture", async () => {
    expect(tool.annotations).toEqual({ readOnlyHint: true, untrustedContentHint: true });
    expect(tool.inputSchema).toEqual({
      type: "object",
      properties: { query: { type: "string", maxLength: 160, pattern: "\\S" } },
      required: ["query"],
      additionalProperties: false
    });
    await expect(tool.execute({ query: "final analyzed sample" })).resolves.toEqual([
      { evidence: fixture.evidence, score: 3 }
    ]);
  });

  it.each([
    undefined,
    null,
    [],
    {},
    { query: "" },
    { query: "   " },
    { query: 40 },
    { query: "final analyzed sample", extra: true },
    { query: "x".repeat(161) }
  ])("rejects malformed input without a success result: %j", async (input) => {
    await expect(executeUnknown(input)).rejects.toThrow();
  });

  it("keeps tool metadata replaceable without changing evidence semantics", async () => {
    const renamed = createPaperEvidenceTool(service, {
      name: "lookup_methods_passage",
      title: "Locate methods passage"
    });

    expect(renamed.name).toBe("lookup_methods_passage");
    await expect(renamed.execute({ query: "final analyzed sample" })).resolves.toEqual(
      await tool.execute({ query: "final analyzed sample" })
    );
  });
});

describe("M1 protocol status truthfulness", () => {
  it("has distinct non-success copy for every non-active state", () => {
    expect(protocolStatusCopy("checking")).toContain("Checking");
    expect(protocolStatusCopy("active")).toBe("Native paper evidence tool active");
    expect(protocolStatusCopy("disabled")).toBe("Agent tools off");
    expect(protocolStatusCopy("unsupported")).toContain("does not expose native agent tools");
    expect(protocolStatusCopy("error")).toBe("Native agent tool unavailable");
  });
});
