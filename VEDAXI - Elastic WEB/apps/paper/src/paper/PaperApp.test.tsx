import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createPaperEvidenceService, createPaperFixture } from "./index";
import { PaperApp } from "./PaperApp";

const fixture = createPaperFixture("https://paper.example.test/workspace");
const service = createPaperEvidenceService(fixture.evidence);

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
});
