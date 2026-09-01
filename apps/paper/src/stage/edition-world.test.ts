import { describe, expect, it } from "vitest";

import { skatePose } from "./edition-world";

describe("edition-world skate pose", () => {
  it("keeps the reversed rider in the upper third and the upright rider in the lower third", () => {
    for (const time of [0, 0.7, 1.4, 2.8, 5]) {
      expect(skatePose(time, true).y).toBeLessThan(0.34);
      expect(skatePose(time, false).y).toBeGreaterThan(0.66);
    }
    expect(skatePose(0, false).x).toBeGreaterThan(0.1);
    expect(skatePose(0, false).x).toBeLessThan(0.9);
  });
});
