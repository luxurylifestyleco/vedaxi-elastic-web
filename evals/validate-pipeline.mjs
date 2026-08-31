import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const defaultRegistry = "docs/pipeline/release-registry.v1.json";
const moduleGatesPath = "evals/registry/data/vedaxi/module-gates.jsonl";
const testSetPath = "docs/evaluation/VEDAXI_TEST_SET.md";
const itemStatuses = new Set(["PASS", "BLOCKED", "NOT_STARTED", "PENDING", "AT_RISK"]);
const gateStatuses = new Set(["PASS", "PARTIAL", "PENDING", "BLOCKED", "FAIL"]);
const classifications = new Set(["AGENT_EXECUTABLE", "USER_REQUIRED", "MIXED"]);
const trackedPaths = new Set(execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean));

function fail(message) { throw new Error(message); }
function nonEmpty(value, label) { if (typeof value !== "string" || value.trim() === "") fail(`${label} must be a non-empty string`); }
function array(value, label) { if (!Array.isArray(value) || value.length === 0) fail(`${label} must be a non-empty array`); }
function localPath(relative, label) {
  nonEmpty(relative, label);
  if (path.isAbsolute(relative)) fail(`${label} must be repository-relative`);
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(`${root}${path.sep}`)) fail(`${label} escapes repository`);
  if (!fs.existsSync(resolved)) fail(`${label} does not exist: ${relative}`);
  if (!trackedPaths.has(relative.replaceAll("\\", "/"))) fail(`${label} is not tracked by git: ${relative}`);
}
function uniqueIds(items, label) {
  const ids = new Set();
  for (const item of items) {
    nonEmpty(item?.id, `${label}.id`);
    if (ids.has(item.id)) fail(`${label} has duplicate id: ${item.id}`);
    ids.add(item.id);
  }
}
function sameIds(actual, expected, label) {
  const unique = new Set(actual);
  if (unique.size !== actual.length) fail(`${label} has duplicate ids`);
  if (actual.length !== expected.length || expected.some((id) => !unique.has(id))) {
    fail(`${label} must match ${expected.join(", ")}`);
  }
}
function moduleGateIds(text) {
  return text.trim().split(/\r?\n/).map((line) => JSON.parse(line).id).filter((id) => /^D\d+$/.test(id));
}
function testSetGateIds(text) {
  return [...text.matchAll(/^\|\s*(D\d+)\s*\|/gm)].map((match) => match[1]);
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
function validateDependencies(registry) {
  array(registry.external_dependencies, "external_dependencies");
  const external = new Set();
  for (const dependency of registry.external_dependencies) {
    nonEmpty(dependency, "external_dependencies[]");
    if (external.has(dependency)) fail(`external_dependencies has duplicate id: ${dependency}`);
    external.add(dependency);
  }
  const nodes = [registry.deadline, ...registry.modules, ...registry.assets, ...registry.gates];
  uniqueIds(nodes, "dependency graph");
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const node of nodes) {
    for (const dependency of node.dependencies) {
      nonEmpty(dependency, `${node.id}.dependencies[]`);
      if (!byId.has(dependency) && !external.has(dependency)) fail(`${node.id} references unknown dependency: ${dependency}`);
    }
  }
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) fail(`dependency cycle includes: ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id).dependencies) if (byId.has(dependency)) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of byId.keys()) visit(id);
}
function validateRegistry(registry, moduleGatesText, testSetText) {
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
  if (!Array.isArray(registry.gates) || registry.gates.length !== 20) fail("registry.gates must contain H1-H12 and D1-D8");
  uniqueIds(registry.gates, "gates");
  const expectedGateIds = [...Array.from({ length: 12 }, (_, i) => `H${i + 1}`), ...Array.from({ length: 8 }, (_, i) => `D${i + 1}`)];
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
  const expectedSubmissionIds = expectedGateIds.slice(12);
  sameIds(moduleGateIds(moduleGatesText), expectedSubmissionIds, "module-gates submission ids");
  sameIds(testSetGateIds(testSetText), expectedSubmissionIds, "test-set submission ids");
  if (!registry.gates.find((gate) => gate.id === "D1").dependencies.includes("M5")) fail("D1 must depend on M5");
  for (const id of expectedSubmissionIds.slice(1)) {
    if (!registry.gates.find((gate) => gate.id === id).dependencies.includes("M6")) fail(`${id} must depend on M6`);
  }
  const m5Exit = registry.modules.find((module) => module.id === "M5").exit_criteria.join(" ");
  if (/\b(?:H11|H12|D[2-8])\b/.test(m5Exit)) fail("M5 exit criteria must not require M6 release gates");
  const m6Exit = registry.modules.find((module) => module.id === "M6").exit_criteria.join(" ");
  if (/\b(?:H11|H12|D[1-8])\b/.test(m6Exit)) fail("M6 exit criteria must not require downstream release gates");
  const blockedIds = new Set([...registry.modules, ...registry.assets].filter((item) => item.status === "BLOCKED").map((item) => item.id));
  for (const gate of registry.gates) {
    if (gate.passed && gate.dependencies.some((dependency) => blockedIds.has(dependency))) {
      fail(`${gate.id} is marked passed while blocked dependency remains: ${gate.dependencies.filter((dependency) => blockedIds.has(dependency)).join(", ")}`);
    }
  }
  for (const id of registry.critical_path) {
    if (!registry.modules.some((item) => item.id === id) && !registry.assets.some((item) => item.id === id)) fail(`critical_path references unknown item: ${id}`);
  }
  if (!registry.assets.find((item) => item.id === "rules-acknowledgment")?.dependencies.includes("D8")) fail("rules-acknowledgment must depend on D8");
  validateDependencies(registry);
}

const input = process.argv.slice(2).find((argument) => argument !== "--self-test") ?? defaultRegistry;
const registryPath = path.resolve(root, input);
if (!registryPath.startsWith(`${root}${path.sep}`)) fail("registry path escapes repository");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const moduleGatesText = fs.readFileSync(path.join(root, moduleGatesPath), "utf8");
const testSetText = fs.readFileSync(path.join(root, testSetPath), "utf8");
validateRegistry(registry, moduleGatesText, testSetText);

if (process.argv.includes("--self-test")) {
  const contradictoryGate = structuredClone(registry);
  contradictoryGate.gates[0].passed = true;
  const missingOwner = structuredClone(registry);
  delete missingOwner.modules[0].owner;
  const passedBlocked = structuredClone(registry);
  passedBlocked.modules[5].status = "BLOCKED";
  passedBlocked.gates[10].status = "PASS";
  passedBlocked.gates[10].passed = true;
  const untrackedEvidence = structuredClone(registry);
  untrackedEvidence.deadline.evidence_paths = [".devpost-hackathon-state.json"];
  const unknownDependency = structuredClone(registry);
  unknownDependency.modules[1].dependencies.push("missing-gate");
  const dependencyCycle = structuredClone(registry);
  dependencyCycle.modules[0].dependencies.push("M1");
  const staleRulesAcknowledgment = structuredClone(registry);
  staleRulesAcknowledgment.assets.find((item) => item.id === "rules-acknowledgment").dependencies = ["current-official-rules"];
  const missingD6Binding = structuredClone(registry);
  missingD6Binding.gates.find((gate) => gate.id === "D6").dependencies = ["live-url"];
  const missingD1Binding = structuredClone(registry);
  missingD1Binding.gates.find((gate) => gate.id === "D1").dependencies = ["M4"];
  const missingD8Binding = structuredClone(registry);
  missingD8Binding.gates.find((gate) => gate.id === "D8").dependencies = ["current-official-rules"];
  const missingD7Binding = structuredClone(registry);
  missingD7Binding.gates.find((gate) => gate.id === "D7").dependencies = ["M5"];
  const semanticM5Cycle = structuredClone(registry);
  semanticM5Cycle.modules.find((module) => module.id === "M5").exit_criteria = ["H1-H11 pass."];
  const semanticM6Cycle = structuredClone(registry);
  semanticM6Cycle.modules.find((module) => module.id === "M6").exit_criteria = ["H11-H12 and D1-D8 pass."];
  const jsonlMissingD8 = moduleGatesText.split(/\r?\n/).filter((line) => !line.includes('"id":"D8"')).join("\n");
  const testSetParityMismatch = testSetText.replace(/^\|\s*D8\s*\|.*$/m, "");
  const rejectionCases = [
    ["contradictory gate", contradictoryGate], ["missing owner", missingOwner],
    ["passed blocked dependency", passedBlocked], ["untracked evidence", untrackedEvidence],
    ["unknown dependency", unknownDependency], ["dependency cycle", dependencyCycle],
    ["stale rules acknowledgment", staleRulesAcknowledgment], ["missing D1 M5 binding", missingD1Binding],
    ["missing D6 M6 binding", missingD6Binding],
    ["missing D7 M6 binding", missingD7Binding], ["missing D8 M6 binding", missingD8Binding],
    ["JSONL missing D8", registry, jsonlMissingD8],
    ["test-set parity mismatch", registry, moduleGatesText, testSetParityMismatch],
    ["semantic M5 cycle", semanticM5Cycle], ["semantic M6 cycle", semanticM6Cycle]
  ];
  for (const [name, fixture, gatesText = moduleGatesText, casesText = testSetText] of rejectionCases) {
    try {
      validateRegistry(fixture, gatesText, casesText);
      fail(`self-test did not reject ${name}`);
    } catch (error) {
      if (String(error.message).startsWith("self-test did not reject")) throw error;
    }
  }
  console.log(`pipeline validator self-test valid (${rejectionCases.length} rejection checks)`);
}

console.log(`pipeline registry valid: ${path.relative(root, registryPath)}`);
