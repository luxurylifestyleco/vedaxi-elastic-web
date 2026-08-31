import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateReleaseClaimsInventory, loadAndEvaluateReleaseClaims } from "./release-claims-adapter.mjs";

const repoRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const inventoryPath = resolve(repoRoot, "evals/claim-integrity/current-release-claims.v1.json");
const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
const now = new Date("2026-08-31T12:50:00.000Z");

const current = loadAndEvaluateReleaseClaims(inventoryPath, { repoRoot, now });
assert.equal(current.passed, true, JSON.stringify(current, null, 2));
assert.equal(current.decision, "HOLD");
assert.equal(current.release_action, "NONE");
assert.equal(current.release_authority, "HUMAN_REQUIRED");
assert.equal(current.devpost_copy_status, "ABSENT");

assert.throws(() => evaluateReleaseClaimsInventory({ ...inventory, claims: [] }, { repoRoot, now }), /missing or empty/);
assert.throws(() => evaluateReleaseClaimsInventory({ ...inventory, claims: [inventory.claims[0], inventory.claims[0]] }, { repoRoot, now }), /unique/);
assert.throws(() => evaluateReleaseClaimsInventory({ ...inventory, requested_action: "SUBMIT" }, { repoRoot, now }), /requested_action/);

const laundered = structuredClone(inventory);
laundered.claims[0].assertion.equals = "PASS";
const mismatch = evaluateReleaseClaimsInventory(laundered, { repoRoot, now });
assert.equal(mismatch.passed, false);
assert.ok(mismatch.semantic_vetoes.some(({ code }) => code === "SOURCE_ASSERTION_MISMATCH"));

const statusLaundered = structuredClone(inventory);
statusLaundered.claims[0].status = "INFERRED";
statusLaundered.claims[0].decision_bearing = false;
const statusResult = evaluateReleaseClaimsInventory(statusLaundered, { repoRoot, now });
assert.equal(statusResult.passed, false);
assert.ok(statusResult.semantic_vetoes.some(({ code }) => code === "RELEASE_INVENTORY_CLAIM_NOT_VERIFIED"));

console.log("PASS release-claims adapter: current HOLD inventory + 5 fail-closed cases");
