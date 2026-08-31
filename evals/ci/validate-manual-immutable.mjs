import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const manifestRoot = path.join(repoRoot, "evals", "registry", "manifests");
const validator = path.join(repoRoot, "evals", "validate-manual.mjs");
const manifests = fs.readdirSync(manifestRoot)
  .filter((name) => /^vedaxi-.*\.manual\.v\d+\.json$/.test(name))
  .sort()
  .map((name) => path.join(manifestRoot, name));

if (manifests.length === 0) throw new Error("No versioned manual registry manifests found");

function digest(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function repoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

const tracked = new Set();
for (const manifestPath of manifests) {
  tracked.add(manifestPath);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const relative of [manifest.dataset, ...(manifest.evidence ?? [])]) {
    if (typeof relative !== "string") throw new Error(`${repoRelative(manifestPath)} contains a non-string registry path`);
    const resolved = path.resolve(repoRoot, relative);
    if (!resolved.startsWith(`${repoRoot}${path.sep}`) || !fs.existsSync(resolved)) {
      throw new Error(`${repoRelative(manifestPath)} references a missing or escaping path: ${relative}`);
    }
    tracked.add(resolved);
  }
}

const before = new Map([...tracked].map((filePath) => [filePath, digest(filePath)]));
for (const manifestPath of manifests) {
  const result = spawnSync(process.execPath, [validator, repoRelative(manifestPath)], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const [filePath, expected] of before) {
  if (digest(filePath) !== expected) {
    throw new Error(`Manual registry input changed during validation: ${repoRelative(filePath)}`);
  }
}
console.log(`immutable manual registries valid (${manifests.length} manifests; inputs unchanged)`);
