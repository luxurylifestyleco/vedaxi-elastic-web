import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evaluateClaim } from "./claim-integrity-gate.mjs";

const matrix = JSON.parse(readFileSync(new URL("./seed-matrix.v1.json", import.meta.url), "utf8"));
assert.equal(matrix.sample_size, matrix.cases.length, "Declared sample size must match actual cases.");
const counted = matrix.cases.reduce((acc, item) => ({ ...acc, [item.complexity]: (acc[item.complexity] ?? 0) + 1 }), {});
assert.deepEqual(counted, matrix.complexity_distribution, "Complexity distribution must be honest.");

const root = mkdtempSync(join(tmpdir(), "vedaxi-claim-gate-"));
const evidenceDir = join(root, "evidence");
mkdirSync(evidenceDir);
mkdirSync(join(root, ".git"));
writeFileSync(join(root, ".git", "HEAD"), `${"b".repeat(40)}\n`);
const sourcePath = join(evidenceDir, "source.txt");
const checkPath = join(evidenceDir, "independent-check.txt");
writeFileSync(sourcePath, "repository ground truth\n");
writeFileSync(checkPath, "independent verification\n");
const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const now = new Date("2026-08-31T12:00:00.000Z");

function baseline() {
  return {
    claim_id: "release-claim",
    text: "The repository contains the verified source artifact.",
    claim_kind: "repository_state",
    decision_bearing: true,
    status: "VERIFIED",
    produced_by: "worker-1",
    source: {
      type: "repository_file",
      path: "evidence/source.txt",
      identity: { kind: "sha256", value: hash(sourcePath) },
      observed_at: "2026-08-31T11:59:00.000Z",
      max_age_seconds: 600,
      scope: "current synthetic repository fixture",
      representation: "paraphrased"
    },
    independent_check: {
      checker_id: "reviewer-2",
      checked_at: "2026-08-31T11:59:30.000Z",
      method: "deterministic_file_check",
      evidence_path: "evidence/independent-check.txt",
      evidence_sha256: hash(checkPath)
    }
  };
}

function mutate(claim, name) {
  if (name === "none") return;
  if (name === "inferred_nondecision") {
    claim.status = "INFERRED";
    claim.decision_bearing = false;
  }
  if (name === "status_unknown") claim.status = "UNKNOWN";
  if (name === "missing_source") claim.source.path = "evidence/missing.txt";
  if (name === "out_of_repo") claim.source.path = "../outside.txt";
  if (name === "stale") claim.source.observed_at = "2026-08-30T11:59:00.000Z";
  if (name === "bad_hash") claim.source.identity.value = "0".repeat(64);
  if (name === "self_report") {
    claim.independent_check.checker_id = claim.produced_by;
    claim.independent_check.method = "agent_self_report";
  }
  if (name === "unsupported_metric") {
    claim.claim_kind = "metric";
    claim.metric = { unit: "score" };
  }
  if (name === "valid_command") {
    claim.claim_kind = "test_result";
    claim.source.type = "command_evidence";
    claim.source.command_run = {
      command: "node synthetic-test.mjs",
      run_at: "2026-08-31T11:59:00.000Z",
      cwd: ".",
      exit_code: 0
    };
  }
  if (name === "absent_media") {
    claim.claim_kind = "media_presence";
    claim.source.type = "media_file";
    claim.source.path = "evidence/missing.mp4";
  }
  if (name === "test_without_command") claim.claim_kind = "test_result";
  if (name === "contradiction") claim.ground_truth = { expected_sha256: "f".repeat(64) };
  if (name === "bad_check_hash") claim.independent_check.evidence_sha256 = "a".repeat(64);
  if (name === "valid_external") {
    claim.source.type = "external_url";
    claim.source.url = "https://example.test/primary-source";
    claim.source.snapshot_path = claim.source.path;
    delete claim.source.path;
  }
  if (name === "missing_producer") delete claim.produced_by;
  if (name === "same_source_check") {
    claim.independent_check.evidence_path = claim.source.path;
    claim.independent_check.evidence_sha256 = claim.source.identity.value;
  }
  if (name === "check_predates_source") claim.independent_check.checked_at = "2026-08-31T11:58:00.000Z";
  if (name === "git_head_identity") claim.source.identity = { kind: "git_commit", value: "b".repeat(40) };
  if (name === "checker_alias") {
    claim.independent_check.checker_id = " WORKER-1 ";
    claim.independent_check.method = "Agent_Self_Report";
  }
}

try {
  for (const testCase of matrix.cases) {
    const claim = baseline();
    claim.claim_id = testCase.id;
    mutate(claim, testCase.mutation);
    const result = evaluateClaim(claim, { repoRoot: root, now });
    if (testCase.expect_pass) {
      assert.equal(result.passed, true, `${testCase.id}: ${JSON.stringify(result.vetoes)}`);
      assert.equal(result.release_eligible, testCase.expect_release ?? true, `${testCase.id}: unexpected release eligibility`);
    } else {
      assert.equal(result.passed, false, `${testCase.id}: expected deterministic failure`);
      assert.equal(result.deterministic_veto, true, `${testCase.id}: veto must be non-overridable`);
      assert.ok(result.vetoes.some(({ code }) => code === testCase.expect_veto), `${testCase.id}: missing ${testCase.expect_veto}`);
    }
  }
  console.log(`PASS claim-integrity seed matrix v${matrix.version}: ${matrix.sample_size}/${matrix.sample_size} cases`);
  console.log(`Complexity: ${JSON.stringify(matrix.complexity_distribution)}; maturity=${matrix.maturity}`);
} finally {
  rmSync(root, { recursive: true, force: true });
}
