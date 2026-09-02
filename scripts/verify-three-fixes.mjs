import { chromium } from "playwright";
import { spawn } from "child_process";

async function run() {
  console.log("Starting preview server for VEDAXI Paper Integrity Desk...");
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

  console.log("\n================================================================================");
  console.log("FIX 1: HONEST LABELLING OF FIXTURE SUITE (NO % CHARACTERS, EXACT COUNTS)");
  console.log("================================================================================");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:4173", { waitUntil: "networkidle" });
  await page.waitForSelector(".benchmark-suite-card");

  const headingText = await page.locator(".benchmark-suite-card .benchmark-title").innerText();
  console.log("Benchmark Section Heading:", headingText);
  if (!headingText.includes("Three deterministic demo fixtures")) {
    throw new Error("Heading expected Three deterministic demo fixtures, got: " + headingText);
  }

  const benchmarkCardText = await page.locator(".benchmark-suite-card").innerText();
  console.log("Benchmark Card Content Summary:\n", benchmarkCardText.trim());

  if (!benchmarkCardText.includes("1 of 1")) {
    throw new Error("Benchmark card missing 1 of 1 count display");
  }
  if (!benchmarkCardText.includes("2 of 2")) {
    throw new Error("Benchmark card missing 2 of 2 count display");
  }
  if (!benchmarkCardText.includes("These are fixed demo cases, not a measured accuracy rate.")) {
    throw new Error("Benchmark card missing disclaimer sentence: These are fixed demo cases, not a measured accuracy rate.");
  }

  const percentCount = (benchmarkCardText.match(/%/g) || []).length;
  console.log("Occurrences of % inside .benchmark-suite-card: " + percentCount);
  if (percentCount !== 0) {
    throw new Error("Expected zero % characters inside .benchmark-suite-card, found " + percentCount);
  }
  console.log("✓ FIX 1 PASSED: Honest labelling with exact counts and zero % characters in fixture suite.");

  console.log("\n================================================================================");
  console.log("FIX 2: UTILITY DRAWER OVERLAP PREVENTION (1440x900 AND 390x844)");
  console.log("================================================================================");

  for (const viewport of [
    { width: 1440, height: 900, label: "1440x900 Desktop" },
    { width: 390, height: 844, label: "390x844 Mobile" }
  ]) {
    console.log("\n--- Testing Viewport: " + viewport.label + " ---");
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(300);

    // 1. Test elementFromPoint for .sim-run-btn--success
    const simBtn = page.locator(".sim-run-btn--success");
    await simBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const hitBtnResult = await page.evaluate(() => {
      const btn = document.querySelector(".sim-run-btn--success");
      if (!btn) return { found: false, reason: "Button not found in DOM" };
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const topEl = document.elementFromPoint(cx, cy);
      const isDirectOrDescendant = topEl === btn || btn.contains(topEl);
      return {
        found: true,
        isDirectOrDescendant,
        topElTag: topEl?.tagName,
        topElClass: topEl?.className,
        coords: { cx, cy, innerHeight: window.innerHeight, innerWidth: window.innerWidth }
      };
    });
    console.log("elementFromPoint at center of .sim-run-btn--success (" + viewport.label + "):", hitBtnResult);
    if (!hitBtnResult.found || !hitBtnResult.isDirectOrDescendant) {
      throw new Error("Overlap failure on .sim-run-btn--success at " + viewport.label + ": element at center was <" + hitBtnResult.topElTag + " class=\"" + hitBtnResult.topElClass + "\">");
    }

    // 2. Test elementFromPoint for .provenance
    const provEl = page.locator(".provenance").first();
    await provEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const hitProvResult = await page.evaluate(() => {
      const prov = document.querySelector(".provenance");
      if (!prov) return { found: false, reason: "Provenance element not found in DOM" };
      const rect = prov.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const topEl = document.elementFromPoint(cx, cy);
      const isDirectOrDescendant = topEl === prov || prov.contains(topEl);
      return {
        found: true,
        isDirectOrDescendant,
        topElTag: topEl?.tagName,
        topElClass: topEl?.className,
        coords: { cx, cy, innerHeight: window.innerHeight, innerWidth: window.innerWidth }
      };
    });
    console.log("elementFromPoint at center of .provenance (" + viewport.label + "):", hitProvResult);
    if (!hitProvResult.found || !hitProvResult.isDirectOrDescendant) {
      throw new Error("Overlap failure on .provenance at " + viewport.label + ": element at center was <" + hitProvResult.topElTag + " class=\"" + hitProvResult.topElClass + "\">");
    }

    console.log("✓ " + viewport.label + ": Drawer does NOT occlude buttons or provenance cards.");
  }

  console.log("✓ FIX 2 PASSED: Capability drawer does not overlap critical interactive elements.");

  console.log("\n================================================================================");
  console.log("FIX 3: POST-DEMO FINAL PILOT CAPTURE SECTION (EMAIL INPUT & LOCALSTORAGE)");
  console.log("================================================================================");
  await page.setViewportSize({ width: 1440, height: 900 });

  // Clear localStorage to start fresh
  await page.evaluate(() => localStorage.removeItem("vedaxi-pilot-email"));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#pilot-email-input");

  const pilotSectionHeading = await page.locator(".post-demo-pilot .final-pilot-title").innerText();
  console.log("Pilot Section Heading:", pilotSectionHeading);
  if (!pilotSectionHeading.includes("Join the Research Pilot")) {
    throw new Error("Expected pilot heading Join the Research Pilot, got: " + pilotSectionHeading);
  }

  const pilotSubtitle = await page.locator(".post-demo-pilot .pilot-subtitle").innerText();
  console.log("Pilot Subtitle:", pilotSubtitle);
  if (!pilotSubtitle.includes("Get early access to autonomous cross-origin WebMCP verification for your research pipeline.")) {
    throw new Error("Unexpected pilot subtitle: " + pilotSubtitle);
  }

  // Type email and submit
  await page.fill("#pilot-email-input", "test@example.com");
  await page.click(".final-pilot-submit-btn");
  await page.waitForTimeout(300);

  // Assert confirmation is displayed
  await page.waitForSelector(".pilot-confirmation");
  const confirmationText = await page.locator(".pilot-confirmation").innerText();
  console.log("Pilot Confirmation UI:", confirmationText);
  if (!confirmationText.includes("pilot list") || !confirmationText.includes("test@example.com")) {
    throw new Error("Pilot confirmation missing expected text, got: " + confirmationText);
  }

  // Assert localStorage has the email
  const storedEmail = await page.evaluate(() => localStorage.getItem("vedaxi-pilot-email"));
  console.log("Stored localStorage vedaxi-pilot-email:", storedEmail);
  if (storedEmail !== "test@example.com") {
    throw new Error("Expected localStorage vedaxi-pilot-email to be test@example.com, got: " + storedEmail);
  }

  console.log("✓ FIX 3 PASSED: Post-demo pilot capture captures email, updates UI, and persists to localStorage.");

  console.log("\n================================================================================");
  console.log("ALL THREE FIXES VERIFIED SUCCESSFULLY!");
  console.log("================================================================================");

  await browser.close();
  server.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error("\nTEST SUITE FAILED WITH ERROR:\n", err);
  process.exit(1);
});
