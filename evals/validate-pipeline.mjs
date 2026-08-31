import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const defaultRegistry = "docs/pipeline/release-registry.v1.json";
const itemStatuses = new Set(["PASS", "BLOCKED", "NOT_STARTED", "PENDING", "AT_RISK"]);
const gateStatuses = new Set(["PASS", "PARTIAL", "PENDING", "BLOCKED", "FAIL"]);
const classifications = new Set(["AGENT_EXECUTABLE", "USER_REQUIRED", "MIXED"]);

function fail(message) { throw new Error(message); }
function nonEmpty(value, label) { if (typeof value !== "string" || value.trim() === "") fail(`${label} must be a non-empty string`); }
function array(value, label) { if (!Array.isArray(value) || value.length === 0) fail(`${label} must be a non-empty array`); }
function localPath(relative, label) {
  nonEmpty(relative, label);
  if (path.isAbsolute(relative)) fail(`${label} must be repository-relative`);
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(`${root}${path.sep}`)) fail(`${label} escapes repository`);
  if (!fs.existsSync(resolved)) fail(`${label} does not exist: ${relative}`);
}
function uniqueIds(items, label) {
  const ids = new Set();
  for (const item of items) {
    nonEmpty(item?.id, `${label}.id`);
    if (ids.has(item.id)) fail(`${label} has duplicate id: ${item.id}`);
    ids.add(item.id);
  }
}
function validateWorkItem(item, label) {
  nonEmpty(item.owner, `${label}.owner`);
  if (!classifications.has(item.classification)) fail(`${label}.classification is invalid`);
  array(item.dependencies, `${label}.dependencies`);
  array(item.evidence_paths, `${label}.evidence_paths`);
  array(item.exit_criteria, `${label}.exit_criteria`);
  nonEmpty(item.risk, `${label}.risk`);
  for (const [index, evidence] of item.evidence_paths.entries()) localPath(evidence, `${label}.evidence_paths[${index}]`);
}
function validateRegistry(registry) {
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) fail("registry must be an object");
  if (registry.schema_version !== 1) fail("registry.schema_version must be 1");
  nonEmpty(registry.generated_at, "registry.generated_at");
  const date = new Date(registry.generated_at);
  if (Number.isNaN(date.valueOf())) fail("registry.generated_at must be ISO-parseable");
  validateWorkItem(registry.deadline, "deadline");
  if (!itemStatuses.has(registry.deadline.status)) fail("deadline.status is invalid");
  array(registry.critical_path, "critical_path");
  if (!Array.isArray(registry.modules) || registry.modules.length !== 7) fail("registry.modules must contain M0-M6");
  uniqueIds(registry.modules, "modules");
  for (let index = 0; index <= 6; index += 1) {
    const module = registry.modules[index];
    if (module.id !== `M${index}`) fail(`modules[${index}] must be M${index}`);
    if (!itemStatuses.has(module.status)) fail(`${module.id}.status is invalid`);
    validateWorkItem(module, module.id);
    if (module.status === "PASS" && index > 0 && registry.modules[index - 1].status !== "PASS") {
      fail(`${module.id} cannot PASS while ${registry.modules[index - 1].id} is not PASS`);
    }
  }
  if (!Array.isArray(registry.assets) || registry.assets.length === 0) fail("registry.assets must be non-empty");
  uniqueIds(registry.assets, "assets");
  for (const asset of registry.assets) {
    if (!itemStatuses.has(asset.status)) fail(`${asset.id}.status is invalid`);
    validateWorkItem(asset, asset.id);
    if (asset.classification === "USER_REQUIRED" && asset.owner !== "User") fail(`${asset.id} USER_REQUIRED asset must be owned by User`);
  }
  if (!Array.isArray(registry.gates) || registry.gates.length !== 17) fail("registry.gates must contain H1-H12 and D1-D5");
  uniqueIds(registry.gates, "gates");
  const expectedGateIds = [...Array.from({ length: 12 }, (_, i) => `H${i + 1}`), ...Array.from({ length: 5 }, (_, i) => `D${i + 1}`)];
  for (const [index, gate] of registry.gates.entries()) {
    if (gate.id !== expectedGateIds[index]) fail(`gates[${index}] must be ${expectedGateIds[index]}`);
    if (!gateStatuses.has(gate.status)) fail(`${gate.id}.status is invalid`);
    if (typeof gate.passed !== "boolean") fail(`${gate.id}.passed must be boolean`);
    if (gate.passed !== (gate.status === "PASS")) fail(`${gate.id} has contradictory status/passed values`);
    nonEmpty(gate.owner, `${gate.id}.owner`);
    array(gate.dependencies, `${gate.id}.dependencies`);
    array(gate.evidence_paths, `${gate.id}.evidence_paths`);
    for (const [pathIndex, evidence] of gate.evidence_paths.entries()) localPath(evidence, `${gate.id}.evidence_paths[${pathIndex}]`);
  }
  const blockedIds = new Set([...registry.modules, ...registry.assets].filter((item) => item.status === "BLOCKED").map((item) => item.id));
  for (const gate of registry.gates) {
    if (gate.passed && gate.dependencies.some((dependency) => blockedIds.has(dependency))) {
      fail(`${gate.id} is marked passed while blocked dependency remains: ${gate.dependencies.filter((dependency) => blockedIds.has(dependency)).join(", ")}`);
    }
  }
  for (const id of registry.critical_path) {
    if (!registry.modules.some((item) => item.id === id) && !registry.assets.some((item) => item.id === id)) fail(`critical_path references unknown item: ${id}`);
  }
}

const input = process.argv.slice(2).find((argument) => argument !== "--self-test") ?? defaultRegistry;
const registryPath = path.resolve(root, input);
if (!registryPath.startsWith(`${root}${path.sep}`)) fail("registry path escapes repository");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
validateRegistry(registry);

if (process.argv.includes("--self-test")) {
  const contradictoryGate = structuredClone(registry);
  contradictoryGate.gates[0].passed = true;
  const missingOwner = structuredClone(registry);
  delete missingOwner.modules[0].owner;
  const passedBlocked = structuredClone(registry);
  passedBlocked.modules[5].status = "BLOCKED";
  passedBlocked.gates[10].status = "PASS";
  passedBlocked.gates[10].passed = true;
  for (const [name, fixture] of [["contradictory gate", contradictoryGate], ["missing owner", missingOwner], ["passed blocked dependency", passedBlocked]]) {
    try {
      validateRegistry(fixture);
      fail(`self-test did not reject ${name}`);
    } catch (error) {
      if (String(error.message).startsWith("self-test did not reject")) throw error;
    }
  }
  console.log("pipeline validator self-test valid (3 rejection checks)");
}

console.log(`pipeline registry valid: ${path.relative(root, registryPath)}`);
