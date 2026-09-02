import { chromium } from "playwright";
import { spawn } from "child_process";

async function run() {
  console.log("Starting preview server on port 4173 for overlap testing...");
  const server = spawn("npx", ["vite", "preview", "apps/paper", "--port", "4173", "--strictPort"], {
    shell: true,
    stdio: "pipe"
  });

  await new Promise((r) => setTimeout(r, 2000));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const viewports = [
    { name: "390px Mobile", width: 390, height: 844 },
    { name: "1280px Desktop", width: 1280, height: 900 }
  ];

  for (const vp of viewports) {
    console.log(`\n================================================================================`);
    console.log(`TESTING DRAWER OVERLAP AT VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`================================================================================`);

    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("http://localhost:4173", { waitUntil: "networkidle" });
    await page.waitForSelector(".capability-drawer");

    const overlapResults = await page.evaluate(() => {
      const drawer = document.querySelector(".capability-drawer");
      if (!drawer) return { error: "Drawer not found" };

      const drawerRect = drawer.getBoundingClientRect();
      const violations = [];

      // Query every visible interactive element and text label
      const candidates = Array.from(
        document.querySelectorAll(
          "button, a, input, select, textarea, [role='button'], label, .eyebrow, .section-kicker, dt, dd, summary, h1, h2, h3, p"
        )
      );

      for (const el of candidates) {
        // Skip drawer and its children
        if (drawer.contains(el) || el === drawer) continue;

        // Check if element is visible
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
          continue;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        // Check if element is within the current viewport window
        if (
          rect.bottom <= 0 ||
          rect.top >= window.innerHeight ||
          rect.right <= 0 ||
          rect.left >= window.innerWidth
        ) {
          continue;
        }

        // Check bounding box intersection
        const intersects = !(
          rect.right <= drawerRect.left ||
          rect.left >= drawerRect.right ||
          rect.bottom <= drawerRect.top ||
          rect.top >= drawerRect.bottom
        );

        if (intersects) {
          const selector =
            el.tagName.toLowerCase() +
            (el.id ? "#" + el.id : "") +
            (el.className && typeof el.className === "string" ? "." + el.className.trim().replace(/\s+/g, ".") : "");
          const text = (el.innerText || el.textContent || "").slice(0, 40).trim();

          violations.push({
            selector,
            text,
            elementRect: {
              top: rect.top,
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
              width: rect.width,
              height: rect.height
            },
            drawerRect: {
              top: drawerRect.top,
              bottom: drawerRect.bottom,
              left: drawerRect.left,
              right: drawerRect.right,
              width: drawerRect.width,
              height: drawerRect.height
            }
          });
        }
      }

      return {
        drawerRect: {
          top: drawerRect.top,
          bottom: drawerRect.bottom,
          left: drawerRect.left,
          right: drawerRect.right,
          width: drawerRect.width,
          height: drawerRect.height
        },
        violationsCount: violations.length,
        violations
      };
    });

    console.log("Collapsed Drawer Bounding Box:", overlapResults.drawerRect);
    if (overlapResults.violationsCount > 0) {
      console.error(`❌ FAILED: ${overlapResults.violationsCount} elements intersect the collapsed drawer:`);
      for (const v of overlapResults.violations) {
        console.error(
          `Violation on: <${v.selector}> ("${v.text}")\n  Element Rect: ${JSON.stringify(v.elementRect)}\n  Drawer Rect:  ${JSON.stringify(v.drawerRect)}`
        );
      }
      throw new Error(`Drawer overlap detected at ${vp.name}`);
    }

    console.log(`✓ ZERO overlap detected on all visible interactive elements & text labels at ${vp.name}!`);
  }

  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
