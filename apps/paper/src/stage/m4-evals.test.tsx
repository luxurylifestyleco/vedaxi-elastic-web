import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createPaperEvidenceService, createPaperFixture } from "../paper";
import { PaperApp } from "../paper/PaperApp";
import {
  STAGE_CHAPTERS,
  StageNavigation,
  handleStageChapterKeyDown
} from "./StageNavigation";

type EvalRecord = {
  id: string;
  eval_id: string;
  module: string;
  assertions: string[];
  hard_gates: string[];
  limitations: string[];
};

type Manifest = {
  id: string;
  dataset: string;
  runner: { kind: string; command: string };
  unproven: string[];
  bindings: Array<{ case_id: string; evaluator: string }>;
};

const repoRoot = resolve(process.cwd());
const manifestPath = resolve(repoRoot, "evals/registry/manifests/vedaxi-m4-semantic-stage.dev.v1.json");
const styles = readFileSync(resolve(repoRoot, "apps/paper/src/styles.css"), "utf8");
const browserLimitation =
  "Target-browser responsive layout, keyboard operation, reduced-motion behavior, and visual review are unproven.";

function readManifest(): Manifest {
  return JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
}

function readRecords(manifest: Manifest): EvalRecord[] {
  return readFileSync(resolve(repoRoot, manifest.dataset), "utf8")
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line) as EvalRecord);
}

const evaluators: Record<string, () => void> = {
  "semantic-ui": () => {
    const navigation = renderToStaticMarkup(
      <>
        <StageNavigation activeChapter="paper-top" announce onActiveChapterChange={() => undefined} variant="mobile" />
        <StageNavigation activeChapter="paper-top" announce={false} onActiveChapterChange={() => undefined} variant="desktop" />
      </>
    );
    expect(STAGE_CHAPTERS.map(({ label }) => label)).toEqual([
      "Paper", "Method", "Video", "Evidence", "Decision"
    ]);
    expect(navigation).toContain('aria-label="Semantic Stage chapters"');
    expect(navigation).toContain('aria-label="Semantic Stage chapters on small screens"');
    expect(navigation.match(/aria-live="polite"/g)).toHaveLength(1);
    expect(navigation.match(/href="#paper-top" aria-current="location"/g)).toHaveLength(2);

    const fixture = createPaperFixture("https://paper.example.test/workspace");
    const paper = renderToStaticMarkup(
      <PaperApp
        fixture={fixture}
        service={createPaperEvidenceService(fixture.evidence)}
        protocol={{ status: "unsupported", enable() {}, disable() {} }}
      />
    );
    for (const { id, focusTargetId } of STAGE_CHAPTERS) {
      expect(paper).toContain(`id="${id}"`);
      expect(paper).toContain(`id="${focusTargetId}" tabindex="-1"`);
    }
  },
  "keyboard-precursor": () => {
    let active = "paper-top";
    let prevented = false;
    let focused = false;
    let scrolled = false;
    let blur: (() => void) | undefined;
    const heading = {
      tabIndex: -1,
      addEventListener: (_type: "blur", listener: () => void) => { blur = listener; },
      focus: (options?: FocusOptions) => { focused = options?.preventScroll === true; },
      scrollIntoView: () => undefined
    };
    const section = {
      focus: () => undefined,
      scrollIntoView: (options?: ScrollIntoViewOptions) => { scrolled = options?.block === "start"; }
    };
    const documentRef = {
      getElementById: (id: string) => id === "methods-title" ? heading : id === "chapter-method" ? section : null
    };
    const locationRef = { hash: "" };

    handleStageChapterKeyDown(
      "chapter-method",
      { key: "Enter", preventDefault: () => { prevented = true; } },
      (next) => { active = next; },
      documentRef,
      locationRef
    );

    expect(active).toBe("chapter-method");
    expect(locationRef.hash).toBe("#chapter-method");
    expect(prevented).toBe(true);
    expect(scrolled).toBe(true);
    expect(focused).toBe(true);
    expect(heading.tabIndex).toBe(0);
    blur?.();
    expect(heading.tabIndex).toBe(-1);
  },
  "responsive-motion-precursor": () => {
    expect(styles).toMatch(/@media \(max-width: 900px\)[\s\S]*\.stage-navigation-mobile-shell\s*\{[\s\S]*display:\s*block/);
    expect(styles).toMatch(/@media \(max-width: 900px\)[\s\S]*\.stage-navigation-desktop-shell\s*\{\s*display:\s*none/);
    expect(styles).toMatch(/\.stage-navigation-mobile a\s*\{[\s\S]*?min-height:\s*2\.75rem/);
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*transition:\s*none !important/);
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation:\s*none !important/);
  }
};

describe("vedaxi.m4-semantic-stage.dev.v1", () => {
  it("binds every deterministic precursor and preserves the browser boundary", () => {
    const manifest = readManifest();
    const records = readRecords(manifest);

    expect(manifest.id).toBe("vedaxi.m4-semantic-stage.dev.v1");
    expect(manifest.runner).toEqual({
      kind: "vitest",
      command: "npm test -- apps/paper/src/stage/m4-evals.test.tsx"
    });
    expect(manifest.unproven).toEqual([browserLimitation]);
    expect(manifest.bindings.map(({ case_id }) => case_id)).toEqual(records.map(({ id }) => id));
    expect(new Set(records.map(({ id }) => id))).toHaveLength(records.length);
    for (const record of records) {
      expect(record.eval_id).toBe(manifest.id);
      expect(record.module).toBe("m4-semantic-stage");
      expect(record.assertions.length).toBeGreaterThan(0);
      expect(record.hard_gates.length).toBeGreaterThan(0);
      expect(record.limitations).toContain(browserLimitation);
      expect(evaluators[manifest.bindings.find(({ case_id }) => case_id === record.id)!.evaluator]).toBeTypeOf("function");
    }
  });

  it("replays every M4 precursor through shipped StageNavigation and Paper UI behavior", () => {
    const manifest = readManifest();
    for (const binding of manifest.bindings) evaluators[binding.evaluator]();
  });
});
