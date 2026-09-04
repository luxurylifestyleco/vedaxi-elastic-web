import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function run() {
  console.log("================================================================================");
  console.log("MOBILE & VIEWPORT RESPONSIVENESS AUTOMATED VERIFICATION SUITE");
  console.log("================================================================================");

  const server = spawn("npx", ["vite", "preview", "apps/paper", "--port", "4182", "--strictPort"], {
    shell: true,
    stdio: "pipe"
  });

  await new Promise((r) => setTimeout(r, 2500));

  const screenshotsDir = path.resolve("audit-screenshots", "viewports");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("PAGE CONSOLE ERROR:", msg.text());
  });
  page.on("pageerror", (err) => console.error("PAGE ERROR:", err.message));

  const viewports = [
    { name: "Mobile", width: 390, height: 844, expectedRightMargin: 10, minVerticalGap: 10 },
    { name: "Tablet", width: 768, height: 1024, expectedRightMargin: 12, minVerticalGap: 12 },
    { name: "Laptop", width: 1280, height: 900, expectedRightMargin: 12, minVerticalGap: 12 },
    { name: "Desktop", width: 1440, height: 900, expectedRightMargin: 12, minVerticalGap: 12 }
  ];

  const report = [];

  try {
    for (const vp of viewports) {
      console.log(`\n--------------------------------------------------------------------------------`);
      console.log(`TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
      console.log(`--------------------------------------------------------------------------------`);

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("http://localhost:4182", { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForSelector(".capability-drawer");
      await page.waitForSelector(".story-index-return");

      // 1. Check Horizontal Overflow at Initial Load (Top of Page)
      const topOverflow = await page.evaluate(() => {
        const docScrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const innerWidth = window.innerWidth;
        return {
          innerWidth,
          docScrollWidth,
          bodyScrollWidth,
          isZeroOverflow: docScrollWidth === innerWidth && bodyScrollWidth === innerWidth
        };
      });

      console.log(`[Top of Page Overflow] innerWidth: ${topOverflow.innerWidth}, docScrollWidth: ${topOverflow.docScrollWidth}, bodyScrollWidth: ${topOverflow.bodyScrollWidth}`);
      if (!topOverflow.isZeroOverflow) {
        throw new Error(`Horizontal scroll overflow detected at ${vp.name} (Top): docScrollWidth=${topOverflow.docScrollWidth}, innerWidth=${topOverflow.innerWidth}`);
      }

      // 2. Check Horizontal Overflow Scrolled Down (Multiple scroll positions)
      const scrollPositions = [800, 2000, 4000];
      for (const pos of scrollPositions) {
        await page.evaluate((y) => window.scrollTo(0, y), pos);
        await page.waitForTimeout(150);

        const scrolledOverflow = await page.evaluate(() => {
          const docScrollWidth = document.documentElement.scrollWidth;
          const bodyScrollWidth = document.body.scrollWidth;
          const innerWidth = window.innerWidth;
          return {
            innerWidth,
            docScrollWidth,
            bodyScrollWidth,
            isZeroOverflow: docScrollWidth === innerWidth && bodyScrollWidth === innerWidth
          };
        });

        if (!scrolledOverflow.isZeroOverflow) {
          throw new Error(`Horizontal scroll overflow detected at ${vp.name} (Scrolled to ${pos}px): docScrollWidth=${scrolledOverflow.docScrollWidth}, innerWidth=${scrolledOverflow.innerWidth}`);
        }
      }
      console.log(`✓ Horizontal Overflow Check: PASSED (scrollWidth === innerWidth === ${vp.width} at all scroll depths)`);

      // 3. Verify Floating Controls Spacing & Zero Overlap in Collapsed State
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(100);

      const collapsedControls = await page.evaluate(() => {
        const returnBtn = document.querySelector(".story-index-return");
        const drawer = document.querySelector(".capability-drawer");

        const rRect = returnBtn.getBoundingClientRect();
        const dRect = drawer.getBoundingClientRect();

        const returnComputed = window.getComputedStyle(returnBtn);
        const drawerComputed = window.getComputedStyle(drawer);

        const returnRightMargin = window.innerWidth - rRect.right;
        const drawerRightMargin = window.innerWidth - dRect.right;
        const verticalGap = dRect.top - rRect.bottom;

        // Bounding box collision
        const intersects = !(
          rRect.right <= dRect.left ||
          rRect.left >= dRect.right ||
          rRect.bottom <= dRect.top ||
          rRect.top >= dRect.bottom
        );

        return {
          returnRect: {
            top: Math.round(rRect.top),
            bottom: Math.round(rRect.bottom),
            left: Math.round(rRect.left),
            right: Math.round(rRect.right),
            width: Math.round(rRect.width),
            height: Math.round(rRect.height)
          },
          drawerRect: {
            top: Math.round(dRect.top),
            bottom: Math.round(dRect.bottom),
            left: Math.round(dRect.left),
            right: Math.round(dRect.right),
            width: Math.round(dRect.width),
            height: Math.round(dRect.height)
          },
          returnRightMargin: Math.round(returnRightMargin),
          drawerRightMargin: Math.round(drawerRightMargin),
          verticalGap: Math.round(verticalGap),
          intersects,
          returnVisible: returnComputed.display !== "none" && returnComputed.visibility !== "hidden",
          drawerVisible: drawerComputed.display !== "none" && drawerComputed.visibility !== "hidden"
        };
      });

      console.log(`[Collapsed Floating Controls]`);
      console.log(`  .story-index-return: ${JSON.stringify(collapsedControls.returnRect)} (right margin: ${collapsedControls.returnRightMargin}px)`);
      console.log(`  .capability-drawer:  ${JSON.stringify(collapsedControls.drawerRect)} (right margin: ${collapsedControls.drawerRightMargin}px)`);
      console.log(`  Vertical Clean Gap:  ${collapsedControls.verticalGap}px`);
      console.log(`  Bounding Intersect:  ${collapsedControls.intersects}`);

      if (collapsedControls.intersects) {
        throw new Error(`Controls overlap detected at ${vp.name} (collapsed)!`);
      }
      if (collapsedControls.verticalGap < vp.minVerticalGap) {
        throw new Error(`Vertical gap too small at ${vp.name}: ${collapsedControls.verticalGap}px < ${vp.minVerticalGap}px`);
      }
      if (collapsedControls.returnRightMargin !== vp.expectedRightMargin || collapsedControls.drawerRightMargin !== vp.expectedRightMargin) {
        throw new Error(`Horizontal alignment mismatch at ${vp.name}: return=${collapsedControls.returnRightMargin}px, drawer=${collapsedControls.drawerRightMargin}px, expected=${vp.expectedRightMargin}px`);
      }
      console.log(`✓ Collapsed Controls Check: PASSED (Clean ${collapsedControls.verticalGap}px gap, matching ${collapsedControls.returnRightMargin}px right margin, ZERO overlap)`);

      // 4. Verify Open Drawer State (Return button hides, ZERO overlap with open drawer)
      await page.click(".capability-drawer summary");
      await page.waitForTimeout(200);

      const openControls = await page.evaluate(() => {
        const returnBtn = document.querySelector(".story-index-return");
        const drawer = document.querySelector(".capability-drawer");

        const rRect = returnBtn.getBoundingClientRect();
        const dRect = drawer.getBoundingClientRect();
        const returnComputed = window.getComputedStyle(returnBtn);

        const isReturnHidden = returnComputed.display === "none" || returnComputed.visibility === "hidden" || (rRect.width === 0 && rRect.height === 0);

        const intersects = isReturnHidden ? false : !(
          rRect.right <= dRect.left ||
          rRect.left >= dRect.right ||
          rRect.bottom <= dRect.top ||
          rRect.top >= dRect.bottom
        );

        return {
          drawerIsOpen: drawer.hasAttribute("open"),
          isReturnHidden,
          returnDisplay: returnComputed.display,
          drawerRect: {
            top: Math.round(dRect.top),
            bottom: Math.round(dRect.bottom),
            left: Math.round(dRect.left),
            right: Math.round(dRect.right),
            width: Math.round(dRect.width),
            height: Math.round(dRect.height)
          },
          intersects
        };
      });

      console.log(`[Open Drawer Controls]`);
      console.log(`  Drawer Open:        ${openControls.drawerIsOpen}`);
      console.log(`  Return Hidden:      ${openControls.isReturnHidden} (display: ${openControls.returnDisplay})`);
      console.log(`  Drawer Bounding:    ${JSON.stringify(openControls.drawerRect)}`);
      console.log(`  Intersecting:       ${openControls.intersects}`);

      if (!openControls.drawerIsOpen) {
        throw new Error(`Drawer did not open at ${vp.name}`);
      }
      if (!openControls.isReturnHidden || openControls.intersects) {
        throw new Error(`Overlap occurred while drawer is open at ${vp.name}`);
      }
      console.log(`✓ Open Drawer Controls Check: PASSED (.story-index-return cleanly hides, ZERO overlap)`);

      // 5. Close Drawer and Verify Clean Restoration
      await page.click(".capability-drawer summary");
      await page.waitForTimeout(200);

      const closedAgain = await page.evaluate(() => {
        const returnBtn = document.querySelector(".story-index-return");
        const drawer = document.querySelector(".capability-drawer");
        const rRect = returnBtn.getBoundingClientRect();
        const dRect = drawer.getBoundingClientRect();
        const returnComputed = window.getComputedStyle(returnBtn);

        return {
          drawerIsOpen: drawer.hasAttribute("open"),
          returnRestored: returnComputed.display !== "none" && rRect.width > 0,
          verticalGap: Math.round(dRect.top - rRect.bottom)
        };
      });

      if (closedAgain.drawerIsOpen || !closedAgain.returnRestored) {
        throw new Error(`Controls failed to restore cleanly after drawer closed at ${vp.name}`);
      }
      console.log(`✓ Restoration Check: PASSED (Drawer closed, .story-index-return restored with ${closedAgain.verticalGap}px gap)`);

      // 6. Capture Visual Screenshot
      const screenshotPath = path.join(screenshotsDir, `${vp.name.toLowerCase()}-${vp.width}x${vp.height}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`✓ Screenshot captured: ${screenshotPath}`);

      report.push({
        viewport: `${vp.name} (${vp.width}x${vp.height})`,
        scrollWidth: topOverflow.docScrollWidth,
        innerWidth: topOverflow.innerWidth,
        horizontalOverflow: 0,
        collapsedVerticalGap: `${collapsedControls.verticalGap}px`,
        rightMargin: `${collapsedControls.returnRightMargin}px`,
        collapsedOverlap: "ZERO",
        openDrawerOverlap: "ZERO (return button cleanly hidden)"
      });
    }

    console.log(`\n================================================================================`);
    console.log("ALL VIEWPORTS AND RESPONSIVENESS CHECKS PASSED WITH ZERO VIOLATIONS!");
    console.log("================================================================================");
    console.table(report);

  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch((err) => {
  console.error("\nTEST SUITE FAILED WITH ERROR:\n", err);
  process.exit(1);
});
