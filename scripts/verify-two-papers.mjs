import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function run() {
  const server = spawn("npx", ["vite", "preview", "apps/paper", "--port", "4173", "--strictPort"], {
    shell: true,
    stdio: "pipe"
  });

  await new Promise((r) => setTimeout(r, 2500));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const screenshotsDir = path.resolve("audit-screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("http://localhost:4173", { waitUntil: "networkidle" });

  await page.waitForSelector(".benchmark-suite-card");

  // 1. CLEAN PAPER
  const cleanChip = page.locator(".benchmark-chip").nth(1);
  await cleanChip.scrollIntoViewIfNeeded();
  await cleanChip.click();
  await page.waitForTimeout(300);

  await page.click(".sim-run-btn--success");
  await page.waitForTimeout(1600);

  const copilotSection = page.locator(".agent-copilot");
  await copilotSection.screenshot({ path: path.join(screenshotsDir, "clean-paper-concordant.png") });
  console.log("Saved clean-paper-concordant.png");

  // 2. DISCREPANT PAPER 3 (fMRI)
  const fmriChip = page.locator(".benchmark-chip").nth(2);
  await fmriChip.scrollIntoViewIfNeeded();
  await fmriChip.click();
  await page.waitForTimeout(300);

  await page.click(".sim-run-btn--success");
  await page.waitForTimeout(1600);

  await copilotSection.screenshot({ path: path.join(screenshotsDir, "discrepant-paper3-caught.png") });
  console.log("Saved discrepant-paper3-caught.png");

  // 3. DISCREPANT PAPER 1 (Attention)
  const paper1Chip = page.locator(".benchmark-chip").nth(0);
  await paper1Chip.scrollIntoViewIfNeeded();
  await paper1Chip.click();
  await page.waitForTimeout(300);

  await page.click(".sim-run-btn--success");
  await page.waitForTimeout(1600);

  await copilotSection.screenshot({ path: path.join(screenshotsDir, "discrepant-paper1-caught.png") });
  console.log("Saved discrepant-paper1-caught.png");

  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
