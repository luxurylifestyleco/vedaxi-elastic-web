import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { FocusRequest, PublisherState } from "@vedaxi/state";

import { createPaperEvidenceService, createPaperFixture } from "./index";
import { PaperApp, probeVideoOrigin } from "./PaperApp";

const fixture = createPaperFixture("https://paper.example.test/workspace");
const service = createPaperEvidenceService(fixture.evidence);
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
const initialPublisherState: PublisherState = {
  citationStatus: "unblocked",
  discrepancyNote: null,
  focusProposal: null,
  auditEvents: []
};

function renderStage(state: PublisherState, publisherError: string | null = null) {
  return renderToStaticMarkup(
    <PaperApp
      fixture={fixture}
      service={service}
      protocol={{ status: "unsupported", enable: () => undefined, disable: () => undefined }}
      publisherState={state}
      dispatchPublisher={() => ({ ok: true, state })}
      publisherError={publisherError}
      videoOrigin="https://video.example.test"
    />
  );
}

describe("M1 Paper Integrity Desk", () => {
  it.each([
    ["checking", "Checking native agent capabilities"],
    ["active", "Native paper evidence tool active"],
    ["disabled", "Agent tools off"],
    ["unsupported", "This browser does not expose native agent tools"],
    ["error", "Native agent tool unavailable"]
  ] as const)("keeps the full human paper in the %s protocol state", (status, copy) => {
    const markup = renderToStaticMarkup(
      <PaperApp
        fixture={fixture}
        service={service}
        protocol={{ status, enable: () => undefined, disable: () => undefined }}
      />
    );

    expect(markup).toContain(copy);
    expect(markup).toContain(fixture.document.title);
    expect(markup).toContain(fixture.evidence.excerpt);
    expect(markup).toContain(fixture.evidence.locator);
    expect(markup).toContain(fixture.evidence.sourceOrigin);
    expect(markup).toContain("Search this paper");
    expect(markup).toContain("This is a fictional controlled fixture");
  });

  it("renders semantic reading landmarks and keeps provenance next to the exact passage", () => {
    const markup = renderToStaticMarkup(
      <PaperApp
        fixture={fixture}
        service={service}
        protocol={{ status: "unsupported", enable: () => undefined, disable: () => undefined }}
      />
    );

    expect(markup).toMatch(/<header[ >]/);
    expect(markup).toMatch(/<nav[^>]+aria-label="Paper outline"/);
    expect(markup).toMatch(/<main[ >]/);
    expect(markup).toMatch(/<article[ >]/);
    expect(markup).toMatch(/<aside[^>]+aria-label="Evidence provenance"/);
    expect(markup).toMatch(/id="methods-participants" tabindex="-1"/);
    expect(markup).toMatch(/<footer[ >]/);
    expect(markup.indexOf(fixture.evidence.excerpt)).toBeLessThan(
      markup.indexOf(fixture.evidence.provenance)
    );
  });

  it("gives the human search input an unambiguous agent-facing label", () => {
    const markup = renderToStaticMarkup(
      <PaperApp
        fixture={fixture}
        service={service}
        protocol={{ status: "active", enable: () => undefined, disable: () => undefined }}
      />
    );

    expect(markup).toContain('<label for="paper-query">Paper evidence query</label>');
    expect(markup).toContain('name="query"');
  });

  it("places publication search before the paper body and exposes a magnifying-glass action", () => {
    const markup = renderToStaticMarkup(
      <PaperApp
        fixture={fixture}
        service={service}
        protocol={{ status: "active", enable: () => undefined, disable: () => undefined }}
      />
    );

    expect(markup.indexOf('class="paper-search"')).toBeLessThan(
      markup.indexOf('class="paper-hero"')
    );
    expect(markup).toContain('class="search-icon"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('<span>Search</span>');
  });

  it("offers judge-friendly example searches that map to publisher evidence", () => {
    const markup = renderToStaticMarkup(
      <PaperApp
        fixture={fixture}
        service={service}
        protocol={{ status: "active", enable: () => undefined, disable: () => undefined }}
      />
    );

    expect(markup).toContain("Try one:");
    expect(markup).toContain("final analyzed sample");
    expect(markup).toContain("forty participants");
    expect(markup).toContain("included in the final analysis");
    expect(markup).toContain('type="button"');
    expect(markup).toContain('aria-pressed="false"');
  });
});

describe("M4 Semantic Focus Shift", () => {
  it("labels the controlled request as a deterministic preview and keeps every capability reachable", () => {
    const markup = renderStage(initialPublisherState);

    expect(markup).toContain("Run deterministic focus preview");
    expect(markup).toContain("Controlled preview — not live agent success");
    expect(markup).not.toContain('<iframe');
    expect(markup).toContain("Checking whether the independent Video publisher is available");
    expect(markup).toContain('aria-label="Capability drawer"');
    for (const target of ["#paper-top", "#chapter-video", "#chapter-evidence", "#chapter-decision"]) {
      expect(markup).toContain(`href="${target}"`);
    }
    expect(markup).not.toContain("40 - 6 = 34");
  });

  it("mounts video evidence only after its independent origin responds", async () => {
    const available = await probeVideoOrigin("https://video.example.test", async () => new Response());
    const unavailable = await probeVideoOrigin("https://video.example.test", async () => {
      throw new TypeError("fetch failed");
    });

    expect(available).toBe(true);
    expect(unavailable).toBe(false);
  });

  it("promotes accepted external evidence and requires an explicit human decision", () => {
    const markup = renderStage({
      ...initialPublisherState,
      focusProposal: focusRequest,
      auditEvents: [{ type: "focus-requested" }]
    });

    expect(markup).toContain(fixture.evidence.excerpt);
    expect(markup).toContain("40 - 6 = 34");
    expect(markup).toContain(focusRequest.provenance.paper);
    expect(markup).toContain(focusRequest.provenance.video);
    expect(markup).toContain("Confirm focus");
    expect(markup).toContain("Reject focus");
  });

  it("renders one persisted blocked discrepancy with linked evidence and reset recovery", () => {
    const discrepancyNote = {
      ...focusRequest,
      id: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
    };
    const markup = renderStage({
      citationStatus: "blocked",
      discrepancyNote,
      focusProposal: null,
      auditEvents: [
        { type: "focus-requested" },
        { type: "focus-confirmed", confirmedBy: "human" }
      ]
    });

    expect(markup).toContain("Citation status: blocked");
    expect(markup.match(/class="discrepancy-note"/g)).toHaveLength(1);
    expect(markup).toContain('href="#methods-participants"');
    expect(markup).toContain(focusRequest.paperEvidenceId);
    expect(markup).toContain(focusRequest.videoEvidenceId);
    expect(markup).toContain("Reset focus review");
  });

  it("shows a recoverable storage error without claiming the citation was saved or blocked", () => {
    const markup = renderStage(initialPublisherState, "Publisher state could not be saved. Retry the action or reset the review.");

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("could not be saved");
    expect(markup).toContain("Reset failed review");
    expect(markup).not.toContain("Citation status: blocked");
    expect(markup).not.toContain("Discrepancy saved");
  });

  it("labels the Decision chapter with the focus decision heading", () => {
    const markup = renderStage(initialPublisherState);

    expect(markup).toContain('id="chapter-decision" aria-labelledby="focus-decision-title"');
    expect(markup).toContain('<h2 id="focus-decision-title" tabindex="-1">Focus decision</h2>');
    expect(markup).toContain('<h2 id="limitations-title">Limitations</h2>');
  });
});
