import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createPaperEvidenceService, createPaperFixture } from "../paper";
import { PaperApp } from "../paper/PaperApp";
import {
  STAGE_CHAPTERS,
  StageNavigation,
  handleStageChapterActivation,
  handleStageChapterKeyDown,
  selectActiveChapter,
  stageChapterFromHash
} from "./StageNavigation";

const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const navigationPair = (activeChapter: "paper-top" | "chapter-method" = "paper-top") => (
  <>
    <StageNavigation activeChapter={activeChapter} announce onActiveChapterChange={() => undefined} variant="mobile" />
    <StageNavigation activeChapter={activeChapter} announce={false} onActiveChapterChange={() => undefined} variant="desktop" />
  </>
);

describe("Semantic Stage navigation", () => {
  it("exposes all five chapters in persistent and mobile navigation", () => {
    const markup = renderToStaticMarkup(navigationPair());

    expect(STAGE_CHAPTERS.map(({ label }) => label)).toEqual([
      "Paper",
      "Method",
      "Video",
      "Evidence",
      "Decision"
    ]);
    expect(markup).toContain('aria-label="Semantic Stage chapters"');
    expect(markup).toContain('aria-label="Semantic Stage chapters on small screens"');
    for (const { id, label } of STAGE_CHAPTERS) {
      expect(markup.match(new RegExp(`href="#${id}"`, "g"))).toHaveLength(2);
      expect(markup.match(new RegExp(`>${label}<`, "g"))).toHaveLength(2);
    }
  });

  it("announces Paper as the initial current chapter in both navigation views", () => {
    const markup = renderToStaticMarkup(navigationPair());

    expect(markup.match(/aria-current="location"/g)).toHaveLength(2);
    expect(markup.match(/href="#paper-top" aria-current="location"/g)).toHaveLength(2);
    expect(markup).toContain('aria-live="polite" aria-atomic="true">Chapter 1 of 5: Paper</span>');
  });

  it("renders separate navigation instances from one controlled chapter with one live region", () => {
    const markup = renderToStaticMarkup(
      <>
        <StageNavigation
          activeChapter="chapter-method"
          announce={false}
          onActiveChapterChange={() => undefined}
          variant="mobile"
        />
        <StageNavigation
          activeChapter="chapter-method"
          announce
          onActiveChapterChange={() => undefined}
          variant="desktop"
        />
      </>
    );

    expect(markup.match(/href="#chapter-method" aria-current="location"/g)).toHaveLength(2);
    expect(markup.match(/aria-live="polite"/g)).toHaveLength(1);
    expect(markup).toContain("Chapter 2 of 5: Method");
  });

  it("selects the chapter nearest the reading line while keeping a stable fallback", () => {
    expect(selectActiveChapter([], "chapter-video")).toBe("chapter-video");
    expect(selectActiveChapter([
      { id: "paper-top", top: -900 },
      { id: "chapter-method", top: -80 },
      { id: "chapter-video", top: 420 }
    ], "paper-top")).toBe("chapter-method");
    expect(selectActiveChapter([
      { id: "paper-top", top: 180 },
      { id: "chapter-method", top: 760 }
    ], "chapter-decision")).toBe("paper-top");
  });

  it("targets the Focus decision heading before its human controls", () => {
    expect(STAGE_CHAPTERS.find(({ id }) => id === "chapter-decision")?.focusTargetId)
      .toBe("focus-decision-title");
  });

  it("keeps every chapter destination programmatically focusable without joining the Tab order", () => {
    const fixture = createPaperFixture("https://paper.example.test/workspace");
    const markup = renderToStaticMarkup(
      <PaperApp
        fixture={fixture}
        service={createPaperEvidenceService(fixture.evidence)}
        protocol={{ status: "unsupported", enable: () => undefined, disable: () => undefined }}
      />
    );

    for (const { focusTargetId } of STAGE_CHAPTERS) {
      expect(markup).toMatch(new RegExp(`id="${focusTargetId}" tabindex="-1"`));
    }
  });

  it("uses instant chapter jumps and 44px mobile navigation targets", () => {
    expect(styles).toMatch(/html\s*\{\s*scroll-behavior:\s*auto/);
    expect(styles).toMatch(/\.stage-navigation-mobile a\s*\{[\s\S]*?min-height:\s*2\.75rem/);
    expect(styles).toMatch(/\.paper-outline-mobile a\s*\{[^}]*display:\s*flex;[^}]*min-height:\s*2\.75rem/);
    expect(styles).toMatch(/\.skip-link\s*\{[^}]*display:\s*flex;[^}]*min-height:\s*2\.75rem/);
    expect(styles).toMatch(/\.identity\s*\{[^}]*min-height:\s*2\.75rem/);
  });

  it("keeps the 390px mobile chapter rail outside the hidden desktop navigation column", () => {
    const fixture = createPaperFixture("https://paper.example.test/workspace");
    const markup = renderToStaticMarkup(
      <PaperApp
        fixture={fixture}
        service={createPaperEvidenceService(fixture.evidence)}
        protocol={{ status: "unsupported", enable: () => undefined, disable: () => undefined }}
      />
    );
    const mobileRail = markup.indexOf('class="stage-navigation-mobile-shell"');
    const desktopColumn = markup.indexOf('class="paper-navigation-column"');

    expect(mobileRail).toBeGreaterThan(-1);
    expect(mobileRail).toBeLessThan(desktopColumn);
    expect(styles).toMatch(/@media \(max-width: 900px\)[\s\S]*\.stage-navigation-mobile-shell\s*\{[\s\S]*display:\s*block/);
    expect(styles).toMatch(/@media \(max-width: 900px\)[\s\S]*\.stage-navigation-desktop-shell\s*\{\s*display:\s*none/);
  });

  it("temporarily joins the focused destination to the Tab order, then restores it on blur", () => {
    let focusedId = "mobile-chapter-link";
    let focusOptions: FocusOptions | undefined;
    let scrolledId = "";
    let blur: (() => void) | undefined;
    const methodTarget = {
      tabIndex: -1,
      addEventListener: (_type: string, listener: () => void) => { blur = listener; },
      focus: (options?: FocusOptions) => {
        focusedId = "methods-title";
        focusOptions = options;
      },
      scrollIntoView: () => {
        scrolledId = "chapter-method";
      }
    };
    const targets = new Map([
      ["methods-title", methodTarget],
      ["chapter-method", {
        tabIndex: -1,
        addEventListener: () => undefined,
        focus: () => undefined,
        scrollIntoView: () => {
          scrolledId = "chapter-method";
        }
      }]
    ]);
    const documentRef = {
      getElementById: (id: string) => targets.get(id) ?? null
    };

    handleStageChapterActivation("chapter-method", 0, documentRef);
    expect(focusedId).toBe("methods-title");
    expect(focusOptions).toEqual({ preventScroll: true });
    expect(scrolledId).toBe("chapter-method");
    expect(methodTarget.tabIndex).toBe(0);

    blur?.();
    expect(methodTarget.tabIndex).toBe(-1);

    focusedId = "mobile-chapter-link";
    handleStageChapterActivation("chapter-method", 1, documentRef);
    expect(focusedId).toBe("mobile-chapter-link");
  });

  it("derives the initial controlled chapter from a valid URL hash", () => {
    expect(stageChapterFromHash("#chapter-method")).toBe("chapter-method");
    expect(stageChapterFromHash("#chapter-video")).toBe("chapter-video");
    expect(stageChapterFromHash("#missing")).toBe("paper-top");
    expect(stageChapterFromHash("")).toBe("paper-top");
  });

  it("initializes both chapter views and the single announcement from the URL hash", () => {
    vi.stubGlobal("window", {
      location: { hash: "#chapter-method", origin: "https://paper.example.test" }
    });
    const fixture = createPaperFixture("https://paper.example.test/workspace");
    const markup = renderToStaticMarkup(
      <PaperApp
        fixture={fixture}
        service={createPaperEvidenceService(fixture.evidence)}
        protocol={{ status: "unsupported", enable: () => undefined, disable: () => undefined }}
      />
    );

    expect(markup.match(/href="#chapter-method" aria-current="location"/g)).toHaveLength(2);
    expect(markup.match(/Chapter 2 of 5: Method/g)).toHaveLength(1);
    expect(markup).not.toContain("Chapter 1 of 5: Paper");
  });

  it("commits the keyboard hash before handing focus to the destination", () => {
    let activeChapter: string | undefined;
    let focusedId = "mobile-chapter-link";
    let prevented = false;
    const order: string[] = [];
    const locationRef = {
      set hash(value: string) {
        order.push(`hash:${value}`);
      }
    };
    const documentRef = {
      getElementById: (id: string) => id === "chapter-method" ? {
        focus: () => undefined,
        scrollIntoView: () => order.push(`scroll:${id}`),
      } : id === "methods-title" ? {
        focus: () => {
          order.push(`focus:${id}`);
          focusedId = id;
        },
        scrollIntoView: () => undefined,
      } : null
    };

    const enterEvent = { key: "Enter", preventDefault: () => { prevented = true; } };
    handleStageChapterKeyDown(
      "chapter-method",
      enterEvent,
      (id) => {
        order.push(`state:${id}`);
        activeChapter = id;
      },
      documentRef,
      locationRef
    );

    expect(activeChapter).toBe("chapter-method");
    expect(focusedId).toBe("methods-title");
    expect(prevented).toBe(true);
    expect(order).toEqual([
      "state:chapter-method",
      "hash:#chapter-method",
      "scroll:chapter-method",
      "focus:methods-title"
    ]);

    focusedId = "mobile-chapter-link";
    const spaceEvent = { key: " ", preventDefault: () => { prevented = true; } };
    handleStageChapterKeyDown(
      "chapter-method",
      spaceEvent,
      (id) => { activeChapter = id; },
      documentRef,
      locationRef
    );
    expect(focusedId).toBe("mobile-chapter-link");
  });
});
