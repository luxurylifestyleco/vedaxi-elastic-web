import assert from "node:assert/strict";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluateReleaseClaimsInventory,
  loadAndEvaluateReleaseClaims,
} from "./release-claims-adapter.mjs";

const sourceRepoRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const inventoryPath = resolve(sourceRepoRoot, "evals/claim-integrity/current-release-claims.v1.json");
const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
const now = new Date("2026-08-31T12:50:00.000Z");
const fixtureRoot = mkdtempSync(join(tmpdir(), "vedaxi-claim-mutation-"));

const boundPaths = [
  ...inventory.claims.flatMap((claim) => [
    claim.source.type === "external_url" ? claim.source.snapshot_path : claim.source.path,
    claim.independent_check.evidence_path,
  ]),
];

for (const rel of new Set(boundPaths)) {
  const destination = resolve(fixtureRoot, rel);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(resolve(sourceRepoRoot, rel), destination);
}

function clone() {
  return structuredClone(inventory);
}

function allCodes(result) {
  return [
    ...result.semantic_vetoes.map(({ code }) => code),
    ...result.claim_gate.results.flatMap(({ vetoes }) => vetoes.map(({ code }) => code)),
  ];
}

function expectVeto(candidate, code) {
  const result = evaluateReleaseClaimsInventory(candidate, { repoRoot: fixtureRoot, now });
  assert.equal(result.passed, false, `${code}: mutation was accepted`);
  assert.equal(result.decision, "HOLD");
  assert.equal(result.release_action, "NONE");
  assert.equal(result.release_authority, "HUMAN_REQUIRED");
  assert.ok(allCodes(result).includes(code), `${code}: observed ${allCodes(result).join(", ")}`);
}

try {
  const baseline = evaluateReleaseClaimsInventory(clone(), { repoRoot: fixtureRoot, now });
  assert.equal(baseline.passed, true, JSON.stringify(baseline, null, 2));

  // Mutate every bound source copy independently. A harmless JSON whitespace change
  // must still break the exact content identity and fail closed.
  for (const rel of new Set(boundPaths)) {
    const isolatedRoot = mkdtempSync(join(tmpdir(), "vedaxi-claim-mutation-"));
    try {
      for (const fixtureRel of new Set(boundPaths)) {
        const destination = resolve(isolatedRoot, fixtureRel);
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(resolve(sourceRepoRoot, fixtureRel), destination);
      }
      const mutatedPath = resolve(isolatedRoot, rel);
      writeFileSync(mutatedPath, `${readFileSync(mutatedPath, "utf8")}\n`, "utf8");
      const result = evaluateReleaseClaimsInventory(clone(), { repoRoot: isolatedRoot, now });
      assert.equal(result.passed, false, `hash mutation accepted for ${rel}`);
      assert.ok(
        allCodes(result).some((code) => code === "STALE_SOURCE_IDENTITY" || code === "CHECK_EVIDENCE_HASH_MISMATCH"),
        `hash mutation did not produce an identity veto for ${rel}`,
      );
    } finally {
      const relToTemp = relative(tmpdir(), isolatedRoot);
      assert.ok(relToTemp.startsWith("vedaxi-claim-mutation-"));
      rmSync(isolatedRoot, { recursive: true, force: true });
    }
  }

  const statusLaundered = clone();
  statusLaundered.claims[0].decision_bearing = false;
  expectVeto(statusLaundered, "RELEASE_INVENTORY_CLAIM_NOT_DECISION_BEARING");

  assert.throws(
    () => loadAndEvaluateReleaseClaims(resolve(fixtureRoot, "missing-inventory.json"), { repoRoot: fixtureRoot, now }),
    /must exist/,
  );
  assert.throws(() => evaluateReleaseClaimsInventory({ ...clone(), claims: [] }, { repoRoot: fixtureRoot, now }), /missing or empty/);

  const escapedSource = clone();
  escapedSource.claims[0].source.path = "../outside.json";
  expectVeto(escapedSource, "OUT_OF_REPO_EVIDENCE");

  const escapedCheck = clone();
  escapedCheck.claims[0].independent_check.evidence_path = "../outside-check.json";
  expectVeto(escapedCheck, "OUT_OF_REPO_EVIDENCE");

  const circular = clone();
  circular.claims[0].independent_check.checker_id = circular.claims[0].produced_by;
  expectVeto(circular, "CIRCULAR_SELF_REPORT");

  const predated = clone();
  predated.claims[0].independent_check.checked_at = "2026-08-31T12:44:59.000Z";
  expectVeto(predated, "CHECK_PREDATES_SOURCE");

  const unsupportedMetric = clone();
  unsupportedMetric.claims[0].claim_kind = "metric";
  unsupportedMetric.claims[0].metric = { unit: "score" };
  expectVeto(unsupportedMetric, "UNSUPPORTED_METRIC");

  const absentMedia = clone();
  absentMedia.claims[0].claim_kind = "media_presence";
  absentMedia.claims[0].source.type = "media_file";
  absentMedia.claims[0].source.path = "fixtures/absent.mp4";
  expectVeto(absentMedia, "ABSENT_MEDIA_CLAIM");

  console.log("PASS release adapter mutation suite: 8 adversarial classes + every bound source hash");
} finally {
  const relToTemp = relative(tmpdir(), fixtureRoot);
  assert.ok(relToTemp.startsWith("vedaxi-claim-mutation-"));
  rmSync(fixtureRoot, { recursive: true, force: true });
}
