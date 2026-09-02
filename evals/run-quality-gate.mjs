import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { evaluateReleaseStatus, formatConsoleSummary } from "./release-status/generate-release-status.mjs";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const npm = "npm";
const cleanInstall = process.argv.includes("--clean-install");

function run(label, command, args, cwd = repoRoot) {
  console.log(`\n==> ${label}`);
  const windowsNpm = process.platform === "win32" && command === npm;
  const executable = windowsNpm ? (process.env.ComSpec ?? "cmd.exe") : command;
  const executableArgs = windowsNpm ? ["/d", "/s", "/c", [npm, ...args].join(" ")] : args;
  const result = spawnSync(executable, executableArgs, { cwd, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}`);
}

function hardQualityExit(status, result) {
  if (status === 0 && result.passed === true && result.gate_status === "PASS" && result.decision === "HOLD"
    && result.eligible_for_human_gate === true && result.release_action === "NONE" && result.release_authority === "HUMAN_REQUIRED") return 0;
  if (status === 1 && result.passed === false && result.gate_status === "FAIL" && result.decision === "HOLD"
    && result.eligible_for_human_gate === false && result.release_action === "NONE" && result.release_authority === "HUMAN_REQUIRED") return 1;
  throw new Error(`Inconsistent hard-quality result with exit code ${status}`);
}

function mediaExit(status, output) {
  if (status === 0 && /^PASS:/m.test(output)) return 0;
  if (status === 2 && /^BLOCKED:/m.test(output)) return 2;
  throw new Error(`Inconsistent media readiness result with exit code ${status}`);
}

if (process.argv.includes("--self-test")) {
  const humanHeld = { decision: "HOLD", release_action: "NONE", release_authority: "HUMAN_REQUIRED" };
  assert.equal(hardQualityExit(1, { ...humanHeld, passed: false, gate_status: "FAIL", eligible_for_human_gate: false }), 1);
  assert.equal(hardQualityExit(0, { ...humanHeld, passed: true, gate_status: "PASS", eligible_for_human_gate: true }), 0);
  assert.equal(mediaExit(2, "BLOCKED: media missing\n"), 2);
  assert.equal(mediaExit(0, "PASS: media valid\n"), 0);
  assert.throws(() => mediaExit(0, "BLOCKED: contradictory status\n"));
  console.log("quality runner self-test valid (hard-quality and media fail closed)");
  process.exit(0);
}

if (cleanInstall) run("Install locked dependencies", npm, ["ci"]);
run("TypeScript (no emit)", npm, ["exec", "tsc", "--", "--noEmit", "-p", "tsconfig.json"]);
run("Full test suite", npm, ["test"]);
run("Build Paper app shell", npm, ["run", "build:paper"]);
run("Build Video app shell", npm, ["run", "build:video"]);
run("Build protocol probes", npm, ["run", "build:probe"]);
run("Pipeline validator self-test", process.execPath, ["evals/validate-pipeline.mjs", "--self-test"]);
run("Current pipeline registry", process.execPath, ["evals/validate-pipeline.mjs"]);
run("Immutable manual registries", process.execPath, ["evals/ci/validate-manual-immutable.mjs"]);
run("Claim integrity self-test", process.execPath, ["evals/claim-integrity/self-test.mjs"]);
run("Release claims adapter test", process.execPath, ["evals/claim-integrity/release-claims-adapter.test.mjs"]);
run("Release claims mutation test", process.execPath, ["evals/claim-integrity/release-claims-adapter.mutation.test.mjs"]);
console.log("\n==> Current release claims");
const releaseClaims = spawnSync(process.execPath, ["evals/claim-integrity/release-claims-adapter.mjs", "evals/claim-integrity/current-release-claims.v1.json", "."], {
  cwd: repoRoot,
  encoding: "utf8"
});
process.stdout.write(`${releaseClaims.stdout ?? ""}${releaseClaims.stderr ?? ""}`);
if (releaseClaims.error) throw releaseClaims.error;
run("Hard-quality self-test", process.execPath, ["evals/hard-quality/validate-hard-quality.mjs", "--self-test"]);
console.log("\n==> Current hard-quality assessment");
const hardQuality = spawnSync(process.execPath, ["evals/hard-quality/validate-hard-quality.mjs", "evals/hard-quality/current-release.assessment.json"], {
  cwd: repoRoot,
  encoding: "utf8"
});
const hardQualityOutput = `${hardQuality.stdout ?? ""}${hardQuality.stderr ?? ""}`;
process.stdout.write(hardQualityOutput);
if (hardQuality.error) throw hardQuality.error;
let hardQualityResult;
try {
  hardQualityResult = JSON.parse(hardQuality.stdout);
} catch {
  throw new Error(`Expected current hard-quality assessment to return JSON with HOLD/FAIL markers; got exit code ${hardQuality.status}`);
}
const hardQualityStatus = hardQualityExit(hardQuality.status, hardQualityResult);
if (hardQualityStatus !== 0) {
  console.log("BLOCKED: current hard-quality assessment remains HOLD/FAIL and is not eligible for the Human Gate");
} else {
  console.log("PASS: current hard-quality assessment");
}

console.log("\n==> Media readiness contract");
const media = spawnSync(process.execPath, ["evals/validate-m2-media-slot.mjs"], {
  cwd: repoRoot,
  encoding: "utf8"
});
const mediaOutput = `${media.stdout ?? ""}${media.stderr ?? ""}`;
process.stdout.write(mediaOutput);
if (media.error) throw media.error;
const mediaStatus = mediaExit(media.status, mediaOutput);
if (mediaStatus !== 0) {
  console.log("BLOCKED: media readiness awaits the human-supplied video and captions");
} else {
  console.log("PASS: media readiness");
}

console.log("\nPASS: code quality gate");

console.log("\n==> Release readiness snapshot");
const releaseStatus = evaluateReleaseStatus(repoRoot, {
  verification: { typecheck: "PASS", tests: "PASS", builds: "PASS" }
});
console.log(formatConsoleSummary(releaseStatus));
if (releaseStatus.overall_status === "FAIL") throw new Error("Release readiness evaluation failed");
if (hardQualityStatus !== 0 || mediaStatus !== 0 || releaseStatus.overall_status === "BLOCKED") process.exit(2);
