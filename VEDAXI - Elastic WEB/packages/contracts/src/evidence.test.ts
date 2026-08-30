import { describe, expect, it } from "vitest";

import { searchEvidence } from "./evidence";
import {
  controlledPaperEvidence as paperEvidence,
  controlledVideoEvidence as videoEvidence
} from "./test-fixtures";

describe("searchEvidence", () => {
  it("returns the paper final-analysis evidence with its stable provenance", () => {
    const results = searchEvidence("final analysis participants", paperEvidence);

    expect(results).toEqual([
      {
        evidence: paperEvidence[0],
        score: 3
      }
    ]);
  });

  it("returns paper evidence for the exact v2 controlled publisher query", () => {
    expect(searchEvidence("Find evidence for the final analyzed sample.", paperEvidence)).toEqual([
      { evidence: paperEvidence[0], score: 3 }
    ]);
  });

  it("returns the video calibration-drift evidence without inferring an analyzed sample", () => {
    const results = searchEvidence("calibration drift replace", videoEvidence);

    expect(results).toEqual([
      {
        evidence: videoEvidence[0],
        score: 3
      }
    ]);
  });

  it("returns paper evidence when two intended meaningful terms match", () => {
    expect(searchEvidence("final participants", paperEvidence)).toEqual([
      { evidence: paperEvidence[0], score: 2 }
    ]);
  });

  it("returns video evidence when two intended meaningful terms match", () => {
    expect(searchEvidence("calibration drift", videoEvidence)).toEqual([
      { evidence: videoEvidence[0], score: 2 }
    ]);
  });

  it("returns no evidence for an unrelated query", () => {
    expect(searchEvidence("randomized placebo dosage", [...paperEvidence, ...videoEvidence])).toEqual([]);
  });

  it("rejects an unrelated natural-language question instead of matching its stopwords", () => {
    expect(searchEvidence("What is the placebo dosage?", paperEvidence)).toEqual([]);
  });

  it("rejects a query made only of stopwords", () => {
    expect(searchEvidence("What is the and of?", paperEvidence)).toEqual([]);
  });

  it("rejects a natural question with only one generic paper term", () => {
    expect(searchEvidence("What is the final dosage?", paperEvidence)).toEqual([]);
  });

  it("rejects a natural question with only one generic paper body term", () => {
    expect(searchEvidence("What was the placebo dosage in the study?", paperEvidence)).toEqual([]);
  });
});
