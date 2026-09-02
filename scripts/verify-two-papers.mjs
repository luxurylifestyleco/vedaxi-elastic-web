import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function run() {
  console.log("Starting preview server on port 4173...");
  const server = spawn("npx", ["vite", "preview", "apps/paper", "--port", "4173", "--strictPort"], {
    shell: true,
    stdio: "pipe"
  });

  await new Promise((r) => setTimeout(r, 2500));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("PAGE ERROR:", msg.text());
  });
  page.on("pageerror", (err) => console.log("PAGE CRASH:", err.message));

  const screenshotsDir = path.resolve("audit-screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:4173", { waitUntil: "networkidle" });

  console.log("Waiting for React client mount...");
  await page.waitForSelector(".benchmark-suite-card", { timeout: 10000 });
  console.log("React mounted successfully! Found .benchmark-suite-card.");

  console.log("\n==================================================");
  console.log("TEST 1: CLEAN PAPER REPLICATION (NEURAL LATENCY)");
  console.log("==================================================");

  // Click Paper 2 (Clean Paper) chip
  const cleanChip = page.locator(".benchmark-chip").nth(1);
  await cleanChip.scrollIntoViewIfNeeded();
  await cleanChip.click();
  await page.waitForTimeout(400);

  // Click Simulate VEDAXI Agent (WebMCP On)
  await page.click(".sim-run-btn--success");
  await page.waitForTimeout(2000);

  const cleanSynthesis = await page.textContent(".copilot-synthesis");
  console.log("CLEAN PAPER VERIFICATION RESULT:\n", cleanSynthesis?.trim());

  const cleanScreenshot = path.join(screenshotsDir, "clean-paper-concordant.png");
  await page.screenshot({ path: cleanScreenshot });
  console.log("Saved screenshot: clean-paper-concordant.png");

  console.log("\n==================================================");
  console.log("TEST 2: DISCREPANT PAPER (fMRI DECISION MAPPING)");
  console.log("==================================================");

  // Click Paper 3 (fMRI Decision Mapping) chip
  const fmriChip = page.locator(".benchmark-chip").nth(2);
  await fmriChip.scrollIntoViewIfNeeded();
  await fmriChip.click();
  await page.waitForTimeout(400);

  // Click Simulate VEDAXI Agent (WebMCP On)
  await page.click(".sim-run-btn--success");
  await page.waitForTimeout(2000);

  const discrepantSynthesis = await page.textContent(".copilot-synthesis");
  console.log("DISCREPANT PAPER VERIFICATION RESULT:\n", discrepantSynthesis?.trim());

  const discrepantScreenshot = path.join(screenshotsDir, "discrepant-paper-caught.png");
  await page.screenshot({ path: discrepantScreenshot });
  console.log("Saved screenshot: discrepant-paper-caught.png");

  console.log("\n==================================================");
  console.log("TEST 3: DISCREPANT PAPER 1 (ATTENTION RECOVERY)");
  console.log("==================================================");

  const paper1Chip = page.locator(".benchmark-chip").nth(0);
  await paper1Chip.scrollIntoViewIfNeeded();
  await paper1Chip.click();
  await page.waitForTimeout(400);

  await page.click(".sim-run-btn--success");
  await page.waitForTimeout(2000);

  const paper1Synthesis = await page.textContent(".copilot-synthesis");
  console.log("ATTENTION RECOVERY RESULT:\n", paper1Synthesis?.trim());

  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
