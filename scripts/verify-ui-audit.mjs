import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function run() {
  console.log("Starting preview server...");
  const server = spawn("npx", ["vite", "preview", "apps/paper", "--port", "4173", "--strictPort"], {
    shell: true,
    stdio: "pipe"
  });

  // Wait 3s for preview server
  await new Promise((r) => setTimeout(r, 3000));

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const screenshotsDir = path.resolve("audit-screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. 1440px Viewport
  console.log("\n--- Testing 1440px Viewport ---");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:4173", { waitUntil: "networkidle" });

  const screen1440First = path.join(screenshotsDir, "1440px-first-screen.png");
  await page.screenshot({ path: screen1440First });
  console.log("Saved screenshot: 1440px-first-screen.png");

  const evidenceEl = page.locator("#methods-participants");
  await evidenceEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const screen1440Evidence = path.join(screenshotsDir, "1440px-evidence-card.png");
  await page.screenshot({ path: screen1440Evidence });
  console.log("Saved screenshot: 1440px-evidence-card.png");

  // 2. 390px Viewport
  console.log("\n--- Testing 390px Viewport ---");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:4173", { waitUntil: "networkidle" });

  const screen390First = path.join(screenshotsDir, "390px-first-screen.png");
  await page.screenshot({ path: screen390First });
  console.log("Saved screenshot: 390px-first-screen.png");

  await evidenceEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const screen390Evidence = path.join(screenshotsDir, "390px-evidence-card.png");
  await page.screenshot({ path: screen390Evidence });
  console.log("Saved screenshot: 390px-evidence-card.png");

  // 3. Touch Target Check at 390px
  console.log("\n--- Touch Target Audit at 390px (Elements under 44px height) ---");
  await page.goto("http://localhost:4173", { waitUntil: "networkidle" });

  const under44 = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("button, a, input, summary, [role='button']"));
    const failures = [];
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || rect.width === 0 || rect.height === 0) {
        continue;
      }
      if (rect.height < 44) {
        failures.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").trim().slice(0, 40),
          className: el.className,
          height: Math.round(rect.height * 10) / 10,
          width: Math.round(rect.width * 10) / 10
        });
      }
    }
    return failures;
  });

  console.log("RAW OUTPUT: Elements under 44px height at 390px width:");
  if (under44.length === 0) {
    console.log("NONE (0 elements under 44px height - 100% compliant)");
  } else {
    console.log(JSON.stringify(under44, null, 2));
  }

  // 4. Search Result for "final analyzed sample"
  console.log('\n--- Search Result Markup for "final analyzed sample" ---');
  await page.fill("#paper-query", "final analyzed sample");
  await page.click('.search-form button[type="submit"]');
  await page.waitForTimeout(500);

  const searchResultMarkup = await page.evaluate(() => {
    const el = document.querySelector(".search-result");
    return el ? el.outerHTML : "Not found";
  });

  console.log("RAW SEARCH RESULT MARKUP:");
  console.log(searchResultMarkup);

  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
