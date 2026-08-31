import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

export const CLAIM_STATUSES = Object.freeze([
  "VERIFIED",
  "INFERRED",
  "ASSUMED",
  "UNKNOWN",
  "UNSUPPORTED",
  "STALE",
  "CONTRADICTED",
]);

const SOURCE_TYPES = new Set([
  "repository_file",
  "command_evidence",
  "media_file",
  "external_url",
]);
const REPRESENTATIONS = new Set(["quoted", "paraphrased"]);
const COMMAND_CLAIM_KINDS = new Set(["test_result", "build_result"]);
const MEDIA_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".vtt", ".srt"]);

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function readGitHead(repoRoot) {
  const gitPath = resolve(repoRoot, ".git");
  if (!existsSync(gitPath) || !statSync(gitPath).isDirectory()) return null;
  const headPath = resolve(gitPath, "HEAD");
  if (!existsSync(headPath)) return null;
  const head = readFileSync(headPath, "utf8").trim();
  if (!head.startsWith("ref: ")) return /^[a-f0-9]{40}$/i.test(head) ? head.toLowerCase() : null;
  const ref = head.slice(5);
  const looseRef = resolve(gitPath, ref);
  if (existsSync(looseRef)) return readFileSync(looseRef, "utf8").trim().toLowerCase();
  const packedRefs = resolve(gitPath, "packed-refs");
  if (!existsSync(packedRefs)) return null;
  const entry = readFileSync(packedRefs, "utf8").split(/\r?\n/).find((line) => line.endsWith(` ${ref}`));
  return entry?.split(" ")[0]?.toLowerCase() ?? null;
}

function isoMillis(value) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function locationFor(source) {
  return source?.type === "external_url" ? source.snapshot_path : source?.path;
}

const INVISIBLE_FORMAT = /[\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/gu;
const UNSAFE_PATH_CODEPOINT = /[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u;

function isInside(root, target) {
  const rel = relative(root, target);
  return !isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..\\`) && !rel.startsWith("../");
}

function isCanonicalRelativePath(candidate) {
  return candidate === candidate.trim()
    && candidate === candidate.normalize("NFKC")
    && !UNSAFE_PATH_CODEPOINT.test(candidate);
}

function resolveInsideRepo(repoRoot, candidate, code, vetoes) {
  if (typeof candidate !== "string" || candidate.trim() === "") {
    vetoes.push({ code: `${code}_MISSING`, detail: "Evidence path is required." });
    return null;
  }
  if (isAbsolute(candidate)) {
    vetoes.push({ code: "ABSOLUTE_EVIDENCE_PATH", detail: candidate });
    return null;
  }
  if (!isCanonicalRelativePath(candidate)) {
    vetoes.push({ code: "NON_CANONICAL_EVIDENCE_PATH", detail: candidate });
    return null;
  }
  const root = realpathSync(repoRoot);
  const target = resolve(root, candidate);
  if (!isInside(root, target)) {
    vetoes.push({ code: "OUT_OF_REPO_EVIDENCE", detail: candidate });
    return null;
  }
  if (!existsSync(target)) {
    vetoes.push({ code: "EVIDENCE_NOT_FOUND", detail: candidate });
    return null;
  }
  const canonical = realpathSync(target);
  if (!isInside(root, canonical)) {
    vetoes.push({ code: "EVIDENCE_ESCAPES_REPO", detail: candidate });
    return null;
  }
  if (!statSync(canonical).isFile()) {
    vetoes.push({ code: "EVIDENCE_NOT_FILE", detail: candidate });
    return null;
  }
  return canonical;
}

function canonicalActorId(value, field, vetoes) {
  if (typeof value !== "string") return "";
  const canonical = value.normalize("NFKC").replace(INVISIBLE_FORMAT, "").trim().toLowerCase();
  if (canonical && !/^[a-z0-9]+(?:[._:/-][a-z0-9]+)*$/.test(canonical)) {
    vetoes.push({ code: "UNSAFE_ACTOR_ID", detail: field });
  }
  return canonical;
}

function sameFile(left, right) {
  const leftStat = statSync(left, { bigint: true });
  const rightStat = statSync(right, { bigint: true });
  if (leftStat.dev < 0n || rightStat.dev < 0n || leftStat.ino <= 0n || rightStat.ino <= 0n) return true;
  return leftStat.dev === rightStat.dev && leftStat.ino === rightStat.ino;
}

function validateShape(claim, vetoes) {
  if (!claim || typeof claim !== "object" || Array.isArray(claim)) {
    vetoes.push({ code: "INVALID_CLAIM", detail: "Claim must be an object." });
    return;
  }
  for (const field of ["claim_id", "text", "claim_kind", "status", "produced_by", "source", "independent_check"]) {
    if (claim[field] === undefined || claim[field] === null || claim[field] === "") {
      vetoes.push({ code: "MISSING_FIELD", detail: field });
    }
  }
  if (typeof claim.decision_bearing !== "boolean") {
    vetoes.push({ code: "MISSING_FIELD", detail: "decision_bearing must be boolean" });
  }
  if (!CLAIM_STATUSES.includes(claim.status)) {
    vetoes.push({ code: "INVALID_STATUS", detail: String(claim.status) });
  }
  if (!SOURCE_TYPES.has(claim.source?.type)) {
    vetoes.push({ code: "INVALID_SOURCE_TYPE", detail: String(claim.source?.type) });
  }
  if (!REPRESENTATIONS.has(claim.source?.representation)) {
    vetoes.push({ code: "MISSING_REPRESENTATION_MARKER", detail: "Use quoted or paraphrased." });
  }
  if (typeof claim.source?.scope !== "string" || claim.source.scope.trim() === "") {
    vetoes.push({ code: "MISSING_APPLICABILITY_SCOPE", detail: "source.scope" });
  }
  if (typeof claim.source?.identity?.kind !== "string" || typeof claim.source?.identity?.value !== "string") {
    vetoes.push({ code: "MISSING_SOURCE_IDENTITY", detail: "source.identity.kind/value" });
  }
}

function validateFreshness(claim, nowMs, vetoes) {
  const observed = isoMillis(claim.source?.observed_at);
  const maxAge = claim.source?.max_age_seconds;
  if (observed === null || !Number.isFinite(maxAge) || maxAge < 0) {
    vetoes.push({ code: "MISSING_FRESHNESS", detail: "Valid observed_at and max_age_seconds are required." });
    return;
  }
  if (observed > nowMs + 60_000 || nowMs - observed > maxAge * 1000) {
    vetoes.push({ code: "STALE_EVIDENCE", detail: claim.source.observed_at });
  }
}

function validateIdentity(claim, sourcePath, repoRoot, vetoes) {
  if (!sourcePath) return;
  const identity = claim.source?.identity;
  if (identity?.kind === "sha256") {
    const actual = sha256(sourcePath);
    if (!/^[a-f0-9]{64}$/i.test(identity.value) || actual !== identity.value.toLowerCase()) {
      vetoes.push({ code: "STALE_SOURCE_IDENTITY", detail: `expected ${identity.value}; actual ${actual}` });
    }
  } else if (identity?.kind === "git_commit") {
    vetoes.push({ code: "FILE_IDENTITY_REQUIRES_SHA256", detail: "A repository HEAD does not bind the cited file contents." });
    const actualHead = readGitHead(repoRoot);
    if (!/^[a-f0-9]{7,40}$/i.test(identity.value)) {
      vetoes.push({ code: "INVALID_COMMIT_IDENTITY", detail: identity.value });
    } else if (!actualHead || !actualHead.startsWith(identity.value.toLowerCase())) {
      vetoes.push({ code: "STALE_SOURCE_IDENTITY", detail: `expected HEAD ${identity.value}; actual ${actualHead ?? "unavailable"}` });
    }
  } else {
    vetoes.push({ code: "UNSUPPORTED_IDENTITY_KIND", detail: String(identity?.kind) });
  }
}

function validateIndependentCheck(claim, sourcePath, repoRoot, nowMs, vetoes) {
  const check = claim.independent_check;
  for (const field of ["checker_id", "checked_at", "method", "evidence_path", "evidence_sha256"]) {
    if (typeof check?.[field] !== "string" || check[field].trim() === "") {
      vetoes.push({ code: "MISSING_INDEPENDENT_CHECK", detail: field });
    }
  }
  const checkerId = canonicalActorId(check?.checker_id, "independent_check.checker_id", vetoes);
  const producerId = canonicalActorId(claim.produced_by, "produced_by", vetoes);
  const method = typeof check?.method === "string"
    ? check.method.normalize("NFKC").trim().toLowerCase().replace(/[^a-z0-9]/g, "")
    : "";
  if ((checkerId && checkerId === producerId) || method === "agentselfreport") {
    vetoes.push({ code: "CIRCULAR_SELF_REPORT", detail: String(check?.checker_id) });
  }
  const checkedAt = isoMillis(check?.checked_at);
  if (checkedAt === null || checkedAt > nowMs + 60_000) {
    vetoes.push({ code: "INVALID_CHECK_TIME", detail: String(check?.checked_at) });
  }
  const observedAt = isoMillis(claim.source?.observed_at);
  if (checkedAt !== null && observedAt !== null && checkedAt < observedAt) {
    vetoes.push({ code: "CHECK_PREDATES_SOURCE", detail: String(check?.checked_at) });
  }
  const checkPath = resolveInsideRepo(repoRoot, check?.evidence_path, "CHECK_EVIDENCE_PATH", vetoes);
  if (checkPath && sourcePath && (checkPath === sourcePath || sameFile(checkPath, sourcePath))) {
    vetoes.push({ code: "CIRCULAR_EVIDENCE_ARTIFACT", detail: check.evidence_path });
  }
  if (checkPath && sha256(checkPath) !== String(check.evidence_sha256).toLowerCase()) {
    vetoes.push({ code: "CHECK_EVIDENCE_HASH_MISMATCH", detail: check.evidence_path });
  }
}

function validateClaimSpecifics(claim, sourcePath, repoRoot, nowMs, vetoes) {
  if (COMMAND_CLAIM_KINDS.has(claim.claim_kind)) {
    if (claim.source?.type !== "command_evidence") {
      vetoes.push({ code: "CURRENT_COMMAND_EVIDENCE_REQUIRED", detail: claim.claim_kind });
    }
    const run = claim.source?.command_run;
    const runAt = isoMillis(run?.run_at);
    if (!run || typeof run.command !== "string" || run.command.trim() === "" || run.exit_code !== 0 || typeof run.cwd !== "string" || runAt === null) {
      vetoes.push({ code: "INVALID_COMMAND_EVIDENCE", detail: "command, run_at, cwd, and exit_code=0 are required." });
    } else {
      const root = realpathSync(repoRoot);
      if (isAbsolute(run.cwd)) {
        vetoes.push({ code: "COMMAND_CWD_ABSOLUTE", detail: run.cwd });
      } else if (!isCanonicalRelativePath(run.cwd)) {
        vetoes.push({ code: "COMMAND_CWD_NON_CANONICAL", detail: run.cwd });
      }
      const cwd = resolve(root, run.cwd);
      if (!isInside(root, cwd)) {
        vetoes.push({ code: "COMMAND_CWD_OUT_OF_REPO", detail: run.cwd });
      } else if (!existsSync(cwd)) {
        vetoes.push({ code: "COMMAND_CWD_NOT_FOUND", detail: run.cwd });
      } else {
        const canonicalCwd = realpathSync(cwd);
        if (!isInside(root, canonicalCwd)) {
          vetoes.push({ code: "COMMAND_CWD_ESCAPES_REPO", detail: run.cwd });
        } else if (!statSync(canonicalCwd).isDirectory()) {
          vetoes.push({ code: "COMMAND_CWD_NOT_DIRECTORY", detail: run.cwd });
        }
      }
      if (runAt > nowMs + 60_000 || nowMs - runAt > claim.source.max_age_seconds * 1000) {
        vetoes.push({ code: "STALE_COMMAND_EVIDENCE", detail: run.run_at });
      }
    }
  }
  if (claim.claim_kind === "metric") {
    if (!Number.isFinite(claim.metric?.value) || typeof claim.metric?.unit !== "string" || !sourcePath) {
      vetoes.push({ code: "UNSUPPORTED_METRIC", detail: "Metric value, unit, and evidence are required." });
    }
  }
  if (claim.claim_kind === "media_presence") {
    if (claim.source?.type !== "media_file" || !sourcePath || statSync(sourcePath).size === 0) {
      vetoes.push({ code: "ABSENT_MEDIA_CLAIM", detail: String(claim.source?.path) });
    } else {
      const ext = sourcePath.slice(sourcePath.lastIndexOf(".")).toLowerCase();
      if (!MEDIA_EXTENSIONS.has(ext)) vetoes.push({ code: "UNRECOGNIZED_MEDIA_EVIDENCE", detail: ext });
    }
  }
  if (claim.ground_truth?.expected_sha256 && sourcePath && sha256(sourcePath) !== claim.ground_truth.expected_sha256.toLowerCase()) {
    vetoes.push({ code: "CONTRADICTED_BY_GROUND_TRUTH", detail: claim.source.path ?? claim.source.snapshot_path });
  }
  if (claim.status === "CONTRADICTED") {
    vetoes.push({ code: "CONTRADICTED_STATUS", detail: claim.claim_id });
  }
}

export function evaluateClaim(claim, { repoRoot, now = new Date() } = {}) {
  if (!repoRoot || !existsSync(repoRoot)) throw new Error("A valid repoRoot is required.");
  const vetoes = [];
  validateShape(claim, vetoes);
  const nowMs = now instanceof Date ? now.getTime() : Date.parse(now);
  if (!Number.isFinite(nowMs)) throw new Error("now must be a valid date.");

  if (claim?.decision_bearing && claim.status !== "VERIFIED") {
    vetoes.push({ code: "DECISION_CLAIM_NOT_VERIFIED", detail: String(claim.status) });
  }
  validateFreshness(claim, nowMs, vetoes);
  const source = claim?.source;
  if (source?.type === "external_url" && !/^https:\/\//.test(source.url ?? "")) {
    vetoes.push({ code: "INVALID_SOURCE_URL", detail: String(source.url) });
  }
  const sourcePath = resolveInsideRepo(repoRoot, locationFor(source), "SOURCE_PATH", vetoes);
  validateIdentity(claim, sourcePath, repoRoot, vetoes);
  validateIndependentCheck(claim, sourcePath, repoRoot, nowMs, vetoes);
  validateClaimSpecifics(claim, sourcePath, repoRoot, nowMs, vetoes);

  return {
    claim_id: claim?.claim_id ?? null,
    passed: vetoes.length === 0,
    release_eligible: vetoes.length === 0 && claim?.decision_bearing === true && claim?.status === "VERIFIED",
    deterministic_veto: vetoes.length > 0,
    vetoes,
  };
}

export function evaluateClaimSet(claims, options) {
  if (!Array.isArray(claims) || claims.length === 0) throw new Error("claims must be a non-empty array.");
  const results = claims.map((claim) => evaluateClaim(claim, options));
  return {
    passed: results.every((result) => result.passed),
    deterministic_veto: results.some((result) => result.deterministic_veto),
    sample_size: results.length,
    release_eligible_claim_ids: results.filter((result) => result.release_eligible).map((result) => result.claim_id),
    results,
  };
}
