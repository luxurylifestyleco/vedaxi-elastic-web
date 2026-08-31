import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

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
run("Pipeline validator self-test", process.execPath, ["evals/validate-pipeline.mjs", "--self-test"]);
run("Current pipeline registry", process.execPath, ["evals/validate-pipeline.mjs"]);
run("Immutable manual registries", process.execPath, ["evals/ci/validate-manual-immutable.mjs"]);

console.log("\n==> Media readiness contract");
const media = spawnSync(process.execPath, ["evals/validate-m2-media-slot.mjs"], {
  cwd: repoRoot,
  encoding: "utf8"
});
const mediaOutput = `${media.stdout ?? ""}${media.stderr ?? ""}`;
process.stdout.write(mediaOutput);
if (media.error) throw media.error;
if (media.status !== 2 || !/^BLOCKED:/m.test(mediaOutput)) {
  throw new Error(`Expected missing human-supplied media to report BLOCKED with exit code 2; got ${media.status}`);
}

console.log("\nPASS: code quality gate");
console.log("BLOCKED: media readiness awaits the human-supplied video and captions");
