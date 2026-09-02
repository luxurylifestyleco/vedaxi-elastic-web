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

  // ==========================================
  // DESKTOP MULTI-PAPER DATA-SOURCE AUDIT
  // ==========================================
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("http://localhost:4173", { waitUntil: "networkidle" });
  await page.waitForSelector(".benchmark-suite-card");

  console.log("\n================================================================================");
  console.log("TEST 1: PAPER 1 · ATTENTION RECOVERY (CLAIM: 40, EXCLUDED: 6, COHORT: 34)");
  console.log("================================================================================");
  const chip1 = page.locator(".benchmark-chip").nth(0);
  await chip1.click();
  await page.waitForTimeout(300);

  const cardA_P1 = await page.locator(".simulation-mode-card").nth(0).innerText();
  const cardB_P1 = await page.locator(".simulation-mode-card").nth(1).innerText();
  console.log("CARD A (Mode A · Without WebMCP):\n", cardA_P1);
  console.log("CARD B (Mode B · With WebMCP):\n", cardB_P1);

  if (!cardA_P1.includes("N = 40") || !cardA_P1.includes("40 participants") || !cardA_P1.includes("6 dropped")) {
    throw new Error("Assertion failed on Card A for Paper 1");
  }
  if (!cardB_P1.includes("40 − 6 = 34") || !cardB_P1.includes("00:03:12") || !cardB_P1.includes("Derives 34") || !cardB_P1.includes("blocks citation")) {
    throw new Error("Assertion failed on Card B for Paper 1");
  }
  console.log("✓ Card A and Card B dynamic assertions PASSED for Paper 1");

  await page.click(".sim-run-btn--success");
  await page.waitForTimeout(1600);
  const synth1 = await page.textContent(".copilot-synthesis");
  console.log("Synthesis Output:\n", synth1?.trim());
  if (!synth1.includes("34") || !synth1.includes("40 reported − 6 exclusions")) {
    throw new Error("Synthesis assertion failed for Paper 1");
  }
  console.log("✓ Synthesis assertion PASSED for Paper 1");


  console.log("\n================================================================================");
  console.log("TEST 2: PAPER 2 · NEURAL LATENCY CLEAN REPLICATION (CLAIM: 48, EXCLUDED: 0, COHORT: 48)");
  console.log("================================================================================");
  const chip2 = page.locator(".benchmark-chip").nth(1);
  await chip2.click();
  await page.waitForTimeout(300);

  const cardA_P2 = await page.locator(".simulation-mode-card").nth(0).innerText();
  const cardB_P2 = await page.locator(".simulation-mode-card").nth(1).innerText();
  console.log("CARD A (Mode A · Without WebMCP):\n", cardA_P2);
  console.log("CARD B (Mode B · With WebMCP):\n", cardB_P2);

  if (!cardA_P2.includes("N = 48")) {
    throw new Error("Assertion failed on Card A for Paper 2");
  }
  if (!cardB_P2.includes("48 = 48") || !cardB_P2.includes("zero exclusions") || !cardB_P2.includes("authorizes citation")) {
    throw new Error("Assertion failed on Card B for Paper 2");
  }
  console.log("✓ Card A and Card B dynamic assertions PASSED for Paper 2 (Clean Paper)");

  await page.click(".sim-run-btn--success");
  await page.waitForTimeout(1600);
  const synth2 = await page.textContent(".copilot-synthesis");
  console.log("Synthesis Output:\n", synth2?.trim());
  if (!synth2.includes("48 participants analyzed (100% Concordant)") || !synth2.includes("authorized without blocking")) {
    throw new Error("Synthesis assertion failed for Paper 2");
  }
  console.log("✓ Synthesis assertion PASSED for Paper 2 (0% False Alarm)");


  console.log("\n================================================================================");
  console.log("TEST 3: PAPER 3 · fMRI DECISION MAPPING (CLAIM: 64, EXCLUDED: 8, COHORT: 56)");
  console.log("================================================================================");
  const chip3 = page.locator(".benchmark-chip").nth(2);
  await chip3.click();
  await page.waitForTimeout(300);

  const cardA_P3 = await page.locator(".simulation-mode-card").nth(0).innerText();
  const cardB_P3 = await page.locator(".simulation-mode-card").nth(1).innerText();
  console.log("CARD A (Mode A · Without WebMCP):\n", cardA_P3);
  console.log("CARD B (Mode B · With WebMCP):\n", cardB_P3);

  if (!cardA_P3.includes("N = 64") || !cardA_P3.includes("64 participants") || !cardA_P3.includes("8 dropped")) {
    throw new Error("Assertion failed on Card A for Paper 3");
  }
  if (!cardB_P3.includes("64 − 8 = 56") || !cardB_P3.includes("00:04:15") || !cardB_P3.includes("Derives 56") || !cardB_P3.includes("blocks citation")) {
    throw new Error("Assertion failed on Card B for Paper 3");
  }
  console.log("✓ Card A and Card B dynamic assertions PASSED for Paper 3 (fMRI Discrepancy)");

  await page.click(".sim-run-btn--success");
  await page.waitForTimeout(1600);
  const synth3 = await page.textContent(".copilot-synthesis");
  console.log("Synthesis Output:\n", synth3?.trim());
  if (!synth3.includes("56") || !synth3.includes("64 reported − 8 exclusions") || !synth3.includes("Citation blocked")) {
    throw new Error("Synthesis assertion failed for Paper 3");
  }
  console.log("✓ Synthesis assertion PASSED for Paper 3 (Discrepancy Caught: 64 - 8 = 56)");


  // ==========================================
  // PHONE 390px VIEWPORT OVERFLOW AUDIT
  // ==========================================
  console.log("\n================================================================================");
  console.log("TEST 4: PHONE (390px) VIEWPORT HORIZONTAL OVERFLOW AUDIT");
  console.log("================================================================================");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:4173", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Check initial scroll width
  const initialOverflow = await page.evaluate(() => {
    return {
      scrollWidth: document.scrollingElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflowing: document.scrollingElement.scrollWidth > window.innerWidth
    };
  });
  console.log("Initial 390px Scroll Check:", initialOverflow);
  if (initialOverflow.overflowing) {
    throw new Error(`Initial page has horizontal overflow at 390px: scrollWidth ${initialOverflow.scrollWidth} > innerWidth ${initialOverflow.innerWidth}`);
  }

  // Scroll to Chapter 04 (Evidence)
  const chapterEvidence = page.locator("#chapter-evidence");
  await chapterEvidence.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const evidenceOverflow = await page.evaluate(() => {
    return {
      scrollWidth: document.scrollingElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflowing: document.scrollingElement.scrollWidth > window.innerWidth
    };
  });
  console.log("Chapter 04 (Evidence) 390px Scroll Check:", evidenceOverflow);
  if (evidenceOverflow.overflowing) {
    throw new Error(`Chapter 04 has horizontal overflow at 390px: scrollWidth ${evidenceOverflow.scrollWidth} > innerWidth ${evidenceOverflow.innerWidth}`);
  }

  // Scroll to Chapter 05 (Decision)
  const chapterDecision = page.locator("#chapter-decision");
  await chapterDecision.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const decisionOverflow = await page.evaluate(() => {
    return {
      scrollWidth: document.scrollingElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflowing: document.scrollingElement.scrollWidth > window.innerWidth
    };
  });
  console.log("Chapter 05 (Decision) 390px Scroll Check:", decisionOverflow);
  if (decisionOverflow.overflowing) {
    throw new Error(`Chapter 05 has horizontal overflow at 390px: scrollWidth ${decisionOverflow.scrollWidth} > innerWidth ${decisionOverflow.innerWidth}`);
  }

  console.log("✓ 390px Phone Layout Audit: ZERO horizontal overflow across evidence & decision chapters!");

  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error("TEST FAILED WITH ERROR:\n", err);
  process.exit(1);
});
