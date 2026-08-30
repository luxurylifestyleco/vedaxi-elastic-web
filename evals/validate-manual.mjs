import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const STATUSES = ["PASS", "FAIL", "BLOCKED"];
const REQUIRED_CASE_FIELDS = [
  "id",
  "eval_id",
  "module",
  "status",
  "input",
  "ideal",
  "observed",
  "assertions",
  "hard_gates",
  "evidence_kind",
  "evidence_path",
  "provenance",
];
const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifestArg = process.argv[2] ??
  "evals/registry/manifests/vedaxi-m0b-browser.manual.v1.json";

function fail(message) {
  throw new Error(message);
}

function repoPath(relativePath, label) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    fail(`${label} must be a non-empty repository-relative path`);
  }
  if (path.isAbsolute(relativePath)) fail(`${label} must be repository-relative`);

  const resolved = path.resolve(repoRoot, relativePath);
  if (resolved !== repoRoot && !resolved.startsWith(`${repoRoot}${path.sep}`)) {
    fail(`${label} escapes the repository`);
  }
  return resolved;
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error.message}`);
  }
}

function requireFields(value, fields, label) {
  for (const field of fields) {
    if (!Object.hasOwn(value, field)) fail(`${label} is missing ${field}`);
  }
}

function requireNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${label} must be a non-empty string`);
  }
}

function requireStatus(value, label) {
  if (!STATUSES.includes(value)) {
    fail(`${label} must be one of ${STATUSES.join(", ")}`);
  }
}

function aggregateStatus(assertions) {
  const statuses = assertions.map(({ status }) => status);
  if (statuses.includes("FAIL")) return "FAIL";
  if (statuses.includes("BLOCKED")) return "BLOCKED";
  return "PASS";
}

const manifestPath = repoPath(manifestArg, "manifest path");
const manifest = readJson(manifestPath, "manifest");
requireFields(
  manifest,
  ["id", "dataset", "allowed_statuses", "cases", "evidence"],
  "manifest",
);
requireNonEmptyString(manifest.id, "manifest.id");
if (JSON.stringify(manifest.allowed_statuses) !== JSON.stringify(STATUSES)) {
  fail(`manifest.allowed_statuses must equal ${JSON.stringify(STATUSES)}`);
}
if (!Array.isArray(manifest.cases)) fail("manifest.cases must be an array");
if (!Array.isArray(manifest.evidence)) fail("manifest.evidence must be an array");

const datasetPath = repoPath(manifest.dataset, "manifest.dataset");
if (!fs.existsSync(datasetPath)) fail(`dataset does not exist: ${manifest.dataset}`);
const source = fs.readFileSync(datasetPath, "utf8").trimEnd();
if (source.length === 0) fail("dataset must contain at least one case");

const records = source.split(/\r?\n/).map((line, index) => {
  if (line.trim().length === 0) fail(`dataset line ${index + 1} is blank`);
  try {
    return JSON.parse(line);
  } catch (error) {
    fail(`dataset line ${index + 1} is not valid JSON: ${error.message}`);
  }
});

const ids = new Set();
for (const [index, record] of records.entries()) {
  const label = `dataset line ${index + 1}`;
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    fail(`${label} must be a JSON object`);
  }
  requireFields(record, REQUIRED_CASE_FIELDS, label);
  for (const field of [
    "id",
    "eval_id",
    "module",
    "ideal",
    "observed",
    "evidence_kind",
    "evidence_path",
    "provenance",
  ]) {
    requireNonEmptyString(record[field], `${label}.${field}`);
  }
  if (ids.has(record.id)) fail(`duplicate case id: ${record.id}`);
  ids.add(record.id);
  if (record.eval_id !== manifest.id) {
    fail(`${record.id}.eval_id must equal manifest.id`);
  }
  requireStatus(record.status, `${record.id}.status`);
  if (!record.input || typeof record.input !== "object" || Array.isArray(record.input)) {
    fail(`${record.id}.input must be an object`);
  }
  if (!Array.isArray(record.assertions) || record.assertions.length === 0) {
    fail(`${record.id}.assertions must be a non-empty array`);
  }
  const assertionNames = new Set();
  for (const [assertionIndex, assertion] of record.assertions.entries()) {
    const assertionLabel = `${record.id}.assertions[${assertionIndex}]`;
    if (!assertion || typeof assertion !== "object" || Array.isArray(assertion)) {
      fail(`${assertionLabel} must be an object`);
    }
    requireFields(assertion, ["name", "status"], assertionLabel);
    requireNonEmptyString(assertion.name, `${assertionLabel}.name`);
    requireStatus(assertion.status, `${assertionLabel}.status`);
    if (assertionNames.has(assertion.name)) {
      fail(`${record.id} has duplicate assertion name: ${assertion.name}`);
    }
    assertionNames.add(assertion.name);
  }
  const expectedStatus = aggregateStatus(record.assertions);
  if (record.status !== expectedStatus) {
    fail(`${record.id}.status must be ${expectedStatus} from its assertions`);
  }
  if (!Array.isArray(record.hard_gates)) fail(`${record.id}.hard_gates must be an array`);
  const gates = new Set();
  for (const gate of record.hard_gates) {
    if (typeof gate !== "string" || !/^H[1-9]$/.test(gate)) {
      fail(`${record.id}.hard_gates contains invalid gate: ${JSON.stringify(gate)}`);
    }
    if (gates.has(gate)) fail(`${record.id} has duplicate hard gate: ${gate}`);
    gates.add(gate);
  }
  const evidencePath = repoPath(record.evidence_path, `${record.id}.evidence_path`);
  if (!fs.existsSync(evidencePath)) {
    fail(`${record.id}.evidence_path does not exist: ${record.evidence_path}`);
  }
}

const recordIds = records.map(({ id }) => id);
if (JSON.stringify(manifest.cases) !== JSON.stringify(recordIds)) {
  fail("manifest.cases must exactly match dataset case IDs in order");
}
if (new Set(manifest.cases).size !== manifest.cases.length) {
  fail("manifest.cases contains duplicate IDs");
}
for (const [index, evidence] of manifest.evidence.entries()) {
  const evidencePath = repoPath(evidence, `manifest.evidence[${index}]`);
  if (!fs.existsSync(evidencePath)) {
    fail(`manifest evidence does not exist: ${evidence}`);
  }
}

console.log(`M0B manual registry valid (${records.length} cases)`);
