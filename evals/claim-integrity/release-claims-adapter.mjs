import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateClaimSet } from "./claim-integrity-gate.mjs";

function fail(message) {
  throw new Error(`Release claims inventory rejected: ${message}`);
}

function repoPath(repoRoot, candidate) {
  const root = realpathSync(repoRoot);
  const target = resolve(root, candidate);
  const rel = relative(root, target);
  if (isAbsolute(rel) || rel === ".." || rel.startsWith("../") || rel.startsWith("..\\")) fail(`path escapes repository: ${candidate}`);
  if (!existsSync(target)) return target;
  const canonical = realpathSync(target);
  const canonicalRel = relative(root, canonical);
  if (isAbsolute(canonicalRel) || canonicalRel === ".." || canonicalRel.startsWith("../") || canonicalRel.startsWith("..\\")) fail(`path escapes repository: ${candidate}`);
  return canonical;
}

function atPointer(value, pointer) {
  if (typeof pointer !== "string" || !pointer.startsWith("/")) fail(`invalid JSON pointer: ${pointer}`);
  return pointer.slice(1).split("/").reduce((node, token) => node?.[token.replaceAll("~1", "/").replaceAll("~0", "~")], value);
}

export function evaluateReleaseClaimsInventory(inventory, { repoRoot, now = new Date() } = {}) {
  if (!inventory || typeof inventory !== "object" || Array.isArray(inventory)) fail("inventory must be an object");
  if (inventory.schema_version !== 1 || typeof inventory.dataset_id !== "string" || !inventory.dataset_id.trim()) fail("schema_version=1 and dataset_id are required");
  if (!Array.isArray(inventory.claims) || inventory.claims.length === 0) fail("claim inventory is missing or empty");
  const ids = inventory.claims.map(({ claim_id }) => claim_id);
  if (new Set(ids).size !== ids.length) fail("claim_id values must be unique");
  if (inventory.release_authority !== "HUMAN_REQUIRED") fail("release_authority must remain HUMAN_REQUIRED");
  if (inventory.requested_action !== "NONE") fail("requested_action must remain NONE");

  const semanticVetoes = [];
  for (const claim of inventory.claims) {
    if (claim.status !== "VERIFIED") semanticVetoes.push({ claim_id: claim.claim_id, code: "RELEASE_INVENTORY_CLAIM_NOT_VERIFIED", actual: claim.status });
    if (claim.decision_bearing !== true) semanticVetoes.push({ claim_id: claim.claim_id, code: "RELEASE_INVENTORY_CLAIM_NOT_DECISION_BEARING", actual: claim.decision_bearing });
    const location = claim.source?.type === "external_url" ? claim.source.snapshot_path : claim.source?.path;
    if (!location || !claim.assertion) {
      semanticVetoes.push({ claim_id: claim.claim_id, code: "MISSING_SOURCE_ASSERTION" });
      continue;
    }
    try {
      const document = JSON.parse(readFileSync(repoPath(repoRoot, location), "utf8"));
      const actual = atPointer(document, claim.assertion.json_pointer);
      if (JSON.stringify(actual) !== JSON.stringify(claim.assertion.equals)) {
        semanticVetoes.push({ claim_id: claim.claim_id, code: "SOURCE_ASSERTION_MISMATCH", actual });
      }
    } catch (error) {
      semanticVetoes.push({ claim_id: claim.claim_id, code: "SOURCE_ASSERTION_UNREADABLE", detail: error.message });
    }
  }

  const devpost = inventory.devpost_copy;
  if (!devpost || devpost.status !== "ABSENT" || typeof devpost.expected_path !== "string") fail("Devpost copy must be explicitly represented as ABSENT");
  if (existsSync(repoPath(repoRoot, devpost.expected_path))) semanticVetoes.push({ claim_id: "devpost-copy", code: "DEVPOST_ABSENCE_CONTRADICTED" });

  const gate = evaluateClaimSet(inventory.claims, { repoRoot, now });
  const passed = gate.passed && semanticVetoes.length === 0;
  return {
    passed,
    deterministic_veto: !passed,
    decision: "HOLD",
    release_action: "NONE",
    release_authority: "HUMAN_REQUIRED",
    devpost_copy_status: "ABSENT",
    semantic_vetoes: semanticVetoes,
    claim_gate: gate,
  };
}

export function loadAndEvaluateReleaseClaims(path, options) {
  if (!path || !existsSync(path)) fail("inventory file is required and must exist");
  return evaluateReleaseClaimsInventory(JSON.parse(readFileSync(path, "utf8")), options);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const inventoryPath = process.argv[2];
  const repoRoot = process.argv[3] ? resolve(process.argv[3]) : resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  try {
    const result = loadAndEvaluateReleaseClaims(inventoryPath && resolve(inventoryPath), { repoRoot });
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.passed ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
