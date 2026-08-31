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
run("Claim path attestation test", process.execPath, ["evals/claim-integrity/path-attestation.test.mjs"]);
run("Current release claims", process.execPath, ["evals/claim-integrity/release-claims-adapter.mjs", "evals/claim-integrity/current-release-claims.v1.json", "."]);
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
const hardQualityPassed = hardQuality.status === 0
  && hardQualityResult.passed === true
  && hardQualityResult.gate_status === "PASS";
const hardQualityHeld = hardQuality.status === 1
  && hardQualityResult.passed === false
  && hardQualityResult.gate_status === "FAIL"
  && hardQualityResult.decision === "HOLD"
  && hardQualityResult.eligible_for_human_gate === false
  && hardQualityResult.release_action === "NONE"
  && hardQualityResult.release_authority === "HUMAN_REQUIRED";
if (!hardQualityPassed && !hardQualityHeld) {
  throw new Error(`Hard-quality assessment returned an invalid state; got exit code ${hardQuality.status}`);
}
console.log(hardQualityPassed
  ? "PASS: current hard-quality assessment"
  : "BLOCKED: current hard-quality assessment remains HOLD/FAIL and is not eligible for the Human Gate");

console.log("\n==> Media readiness contract");
const media = spawnSync(process.execPath, ["evals/validate-m2-media-slot.mjs"], {
  cwd: repoRoot,
  encoding: "utf8"
});
const mediaOutput = `${media.stdout ?? ""}${media.stderr ?? ""}`;
process.stdout.write(mediaOutput);
if (media.error) throw media.error;
const mediaPassed = media.status === 0 && /^PASS:/m.test(mediaOutput);
const mediaBlocked = media.status === 2 && /^BLOCKED:/m.test(mediaOutput);
if (!mediaPassed && !mediaBlocked) {
  throw new Error(`Media readiness returned an invalid state; got exit code ${media.status}`);
}

console.log("\nPASS: code quality gate");
console.log(mediaPassed
  ? "PASS: media readiness"
  : "BLOCKED: media readiness awaits the human-supplied video and captions");

console.log("\n==> Release readiness snapshot");
const releaseStatus = evaluateReleaseStatus(repoRoot, {
  verification: { typecheck: "PASS", tests: "PASS", builds: "PASS" }
});
console.log(formatConsoleSummary(releaseStatus));
if (releaseStatus.overall_status === "FAIL") {
  throw new Error("Release readiness evaluation failed");
}
