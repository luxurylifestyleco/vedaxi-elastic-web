import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateReleaseClaimsInventory, loadAndEvaluateReleaseClaims } from "./release-claims-adapter.mjs";

const repoRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const inventoryPath = resolve(repoRoot, "evals/claim-integrity/current-release-claims.v1.json");
const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
const observedTimes = inventory.claims.map((claim) => Date.parse(claim.source.observed_at));
assert.ok(observedTimes.every(Number.isFinite), "inventory source timestamps must be valid");
const now = new Date(Math.max(...observedTimes));

const current = loadAndEvaluateReleaseClaims(inventoryPath, { repoRoot, now });
assert.equal(current.passed, true, JSON.stringify(current, null, 2));
assert.equal(current.decision, "HOLD");
assert.equal(current.release_action, "NONE");
assert.equal(current.release_authority, "HUMAN_REQUIRED");
assert.equal(current.devpost_copy_status, "ABSENT");

const expiries = inventory.claims.map((claim) => (
  Date.parse(claim.source.observed_at) + claim.source.max_age_seconds * 1000
));
assert.ok(expiries.every(Number.isFinite), "inventory source expiries must be valid");
const earliestExpiry = Math.min(...expiries);
const earliestClaimIndex = expiries.indexOf(earliestExpiry);
const boundary = evaluateReleaseClaimsInventory(inventory, { repoRoot, now: new Date(earliestExpiry) });
assert.ok(!boundary.claim_gate.results[earliestClaimIndex].vetoes.some(({ code }) => code === "STALE_EVIDENCE"));
const justExpired = evaluateReleaseClaimsInventory(inventory, { repoRoot, now: new Date(earliestExpiry + 1) });
assert.ok(justExpired.claim_gate.results[earliestClaimIndex].vetoes.some(({ code }) => code === "STALE_EVIDENCE"));

const staleAt = new Date(Math.max(...inventory.claims.map((claim) => (
  Date.parse(claim.source.observed_at) + claim.source.max_age_seconds * 1000
))) + 1);
const stale = evaluateReleaseClaimsInventory(inventory, { repoRoot, now: staleAt });
assert.equal(stale.passed, false);
assert.ok(stale.claim_gate.results.every(({ vetoes }) => vetoes.some(({ code }) => code === "STALE_EVIDENCE")));

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

console.log("PASS release-claims adapter: current HOLD inventory + deterministic later-clock stale case + 5 fail-closed cases");
