import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

describe("video interaction styling", () => {
  it("provides keyboard, hover, pressed, disabled, responsive, and reduced-motion states", () => {
    expect(css).toMatch(/:focus-visible/);
    expect(css).toMatch(/:hover/);
    expect(css).toMatch(/:active/);
    expect(css).toMatch(/:disabled/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/max-width:\s*44rem/);
  });

  it("keeps mobile form and button touch targets at least 44px tall", () => {
    expect(css).toMatch(
      /@media\s*\(max-width:\s*44rem\)[\s\S]*?:where\(button,\s*input\)\s*\{[^}]*min-height:\s*44px/
    );
  });
});
