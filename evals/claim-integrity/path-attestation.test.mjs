import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative } from "node:path";
import { evaluateClaim } from "./claim-integrity-gate.mjs";
import { evaluateReleaseClaimsInventory } from "./release-claims-adapter.mjs";

const fixtureParent = mkdtempSync(join(tmpdir(), "vedaxi-path-attestation-"));
const repoRoot = join(fixtureParent, "repo");
const outsideRoot = join(fixtureParent, "outside");
mkdirSync(join(repoRoot, "evidence"), { recursive: true });
mkdirSync(outsideRoot, { recursive: true });

const sourcePath = join(repoRoot, "evidence", "source.txt");
const checkPath = join(repoRoot, "evidence", "check.txt");
const outsidePath = join(outsideRoot, "outside.txt");
const outsideJsonPath = join(outsideRoot, "outside.json");
writeFileSync(sourcePath, "source\n");
writeFileSync(checkPath, "independent check\n");
writeFileSync(outsidePath, "outside\n");
writeFileSync(outsideJsonPath, JSON.stringify({ secret: "must-not-echo" }));

const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const now = new Date("2026-08-31T13:30:00.000Z");

function baseline() {
  return {
    claim_id: "path-attestation",
    text: "The repository contains a source-bound claim.",
    claim_kind: "repository_state",
    decision_bearing: true,
    status: "VERIFIED",
    produced_by: "worker-1",
    source: {
      type: "repository_file",
      path: "evidence/source.txt",
      identity: { kind: "sha256", value: hash(sourcePath) },
      observed_at: "2026-08-31T13:29:00.000Z",
      max_age_seconds: 600,
      scope: "synthetic path-attestation fixture",
      representation: "paraphrased",
    },
    independent_check: {
      checker_id: "reviewer-2",
      checked_at: "2026-08-31T13:29:30.000Z",
      method: "deterministic_file_check",
      evidence_path: "evidence/check.txt",
      evidence_sha256: hash(checkPath),
    },
  };
}

function codes(claim) {
  const result = evaluateClaim(claim, { repoRoot, now });
  assert.equal(result.passed, false, `mutation unexpectedly passed: ${JSON.stringify(claim)}`);
  return result.vetoes.map(({ code }) => code);
}

function expectCode(claim, code) {
  assert.ok(codes(claim).includes(code), `expected ${code}`);
}

try {
  assert.equal(evaluateClaim(baseline(), { repoRoot, now }).passed, true);

  const lexicalEscape = baseline();
  lexicalEscape.source.path = "../outside/outside.txt";
  expectCode(lexicalEscape, "OUT_OF_REPO_EVIDENCE");

  // Evidence paths are repository-relative contracts, not machine-specific absolute paths.
  const absoluteSource = baseline();
  absoluteSource.source.path = sourcePath;
  expectCode(absoluteSource, "ABSOLUTE_EVIDENCE_PATH");

  const caseWhitespaceAlias = baseline();
  caseWhitespaceAlias.independent_check.checker_id = "  WORKER-1  ";
  expectCode(caseWhitespaceAlias, "CIRCULAR_SELF_REPORT");

  // NFKC-equivalent identities must not produce fake independence.
  const unicodeAlias = baseline();
  unicodeAlias.independent_check.checker_id = "ｗｏｒｋｅｒ－１";
  expectCode(unicodeAlias, "CIRCULAR_SELF_REPORT");

  // Invisible format characters are not legitimate identity distinctions.
  const invisibleAlias = baseline();
  invisibleAlias.independent_check.checker_id = "worker\u200b-1";
  expectCode(invisibleAlias, "CIRCULAR_SELF_REPORT");

  // A check artifact reached by another hard-link name is still the source artifact.
  const hardlinkPath = join(repoRoot, "evidence", "source-hardlink.txt");
  linkSync(sourcePath, hardlinkPath);
  const hardlinkCircular = baseline();
  hardlinkCircular.independent_check.evidence_path = "evidence/source-hardlink.txt";
  hardlinkCircular.independent_check.evidence_sha256 = hash(hardlinkPath);
  expectCode(hardlinkCircular, "CIRCULAR_EVIDENCE_ARTIFACT");

  // Windows file IDs commonly exceed Number.MAX_SAFE_INTEGER. Find two files
  // whose exact IDs differ but whose legacy numeric IDs collide, when the host
  // filesystem exposes that condition, and prove they remain independent.
  const numericIds = new Map();
  let unsafeCollision = null;
  for (let index = 0; index < 512 && !unsafeCollision; index += 1) {
    const path = join(repoRoot, "evidence", `unsafe-inode-${index}.txt`);
    writeFileSync(path, `${index}\n`);
    const numeric = statSync(path);
    const exact = statSync(path, { bigint: true });
    const key = `${numeric.dev}:${numeric.ino}`;
    const prior = numericIds.get(key);
    if (prior && (prior.dev !== exact.dev || prior.ino !== exact.ino)) unsafeCollision = [prior.path, path];
    numericIds.set(key, { path, dev: exact.dev, ino: exact.ino });
  }
  if (unsafeCollision) {
    const [distinctSource, distinctCheck] = unsafeCollision;
    const distinctUnsafeIdentity = baseline();
    distinctUnsafeIdentity.source.path = relative(repoRoot, distinctSource);
    distinctUnsafeIdentity.source.identity.value = hash(distinctSource);
    distinctUnsafeIdentity.independent_check.evidence_path = relative(repoRoot, distinctCheck);
    distinctUnsafeIdentity.independent_check.evidence_sha256 = hash(distinctCheck);
    assert.equal(evaluateClaim(distinctUnsafeIdentity, { repoRoot, now }).passed, true);
  }

  // Directory links are created only inside the disposable fixture. If the host
  // disallows them, the rest of the cross-platform path suite still runs.
  let junctionSupported = false;
  try {
    symlinkSync(outsideRoot, join(repoRoot, "evidence", "outside-link"), "junction");
    junctionSupported = true;
  } catch (error) {
    if (!["EPERM", "EACCES", "UNKNOWN"].includes(error?.code)) throw error;
  }

  if (junctionSupported) {
    const linkedSource = baseline();
    linkedSource.source.path = "evidence/outside-link/outside.txt";
    linkedSource.source.identity.value = hash(outsidePath);
    expectCode(linkedSource, "EVIDENCE_ESCAPES_REPO");

    const commandCwdEscape = baseline();
    commandCwdEscape.claim_kind = "test_result";
    commandCwdEscape.source.type = "command_evidence";
    commandCwdEscape.source.command_run = {
      command: "node test.mjs",
      cwd: "evidence/outside-link",
      run_at: "2026-08-31T13:29:00.000Z",
      exit_code: 0,
    };
    expectCode(commandCwdEscape, "COMMAND_CWD_ESCAPES_REPO");

    const assertionEscape = baseline();
    assertionEscape.source.path = "evidence/outside-link/outside.json";
    assertionEscape.source.identity.value = hash(outsideJsonPath);
    assertionEscape.assertion = { json_pointer: "/secret", equals: "public" };
    const adapterResult = evaluateReleaseClaimsInventory({
      schema_version: 1,
      dataset_id: "path-attestation",
      claims: [assertionEscape],
      release_authority: "HUMAN_REQUIRED",
      requested_action: "NONE",
      devpost_copy: { status: "ABSENT", expected_path: "missing-devpost.json" },
    }, { repoRoot, now });
    assert.ok(adapterResult.semantic_vetoes.some(({ code }) => code === "SOURCE_ASSERTION_UNREADABLE"));
    assert.doesNotMatch(JSON.stringify(adapterResult), /must-not-echo/);
  }

  const unicodePath = baseline();
  unicodePath.source.path = "evidence/\uff0e\uff0e/outside.txt";
  expectCode(unicodePath, "NON_CANONICAL_EVIDENCE_PATH");

  console.log(`PASS path attestation: 8 mandatory classes + unsafe-inode=${unsafeCollision ? "verified" : "not-observed"} + junction=${junctionSupported ? "verified" : "unsupported"}`);
} finally {
  const relToTemp = relative(tmpdir(), fixtureParent);
  assert.equal(isAbsolute(relToTemp), false);
  assert.ok(relToTemp.startsWith("vedaxi-path-attestation-"));
  rmSync(fixtureParent, { recursive: true, force: true });
}
