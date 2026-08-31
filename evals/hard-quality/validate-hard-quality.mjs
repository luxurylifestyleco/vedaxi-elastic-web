import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const specPath = path.join(here, "hard-quality-gate.v1.json");
const matrixPath = path.join(here, "hard-quality-test-matrix.v1.json");
const epsilon = 1e-9;

function fail(message) { throw new Error(message); }
function loadJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
}
function exactKeys(actual, expected, label) {
  const a = [...actual].sort();
  const e = [...expected].sort();
  if (JSON.stringify(a) !== JSON.stringify(e)) fail(`${label} keys must be exactly: ${e.join(", ")}`);
}

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function evidencePath(entry) {
  if (entry && typeof entry === "object" && !Array.isArray(entry) && typeof entry.path === "string") return entry.path;
  if (typeof entry !== "string") return null;
  const candidate = entry.trim();
  if (!candidate || /\s/.test(candidate)) return null;
  return candidate.includes("/") || candidate.includes("\\") ? candidate : null;
}

function collectEvidencePaths(assessment) {
  const entries = [];
  for (const gate of assessment.module_gates ?? []) entries.push(...(gate.evidence ?? []));
  for (const result of Object.values(assessment.automatic_failures ?? {})) entries.push(...(result.evidence ?? []));
  for (const result of Object.values(assessment.dimensions ?? {})) entries.push(...(result.evidence ?? []));
  return [...new Set(entries.map(evidencePath).filter(Boolean))];
}

function requirePathEvidence(entries, label) {
  for (const entry of entries) {
    if (!evidencePath(entry)) fail(`${label} evidence entries must be repository-relative paths`);
  }
}

export function resolveSourceAndEvidence(assessment, repoRoot) {
  const root = fs.realpathSync(repoRoot);
  const repositoryHead = git(["rev-parse", "HEAD"], root);
  const sourceCommit = assessment.release_identity?.source_commit;
  const paths = collectEvidencePaths(assessment);
  const evidence = paths.map((reference) => {
    const absolute = path.resolve(root, reference);
    const insideRepository = absolute === root || absolute.startsWith(`${root}${path.sep}`);
    const exists = insideRepository && fs.existsSync(absolute) && fs.statSync(absolute).isFile();
    let presentAtSourceCommit = false;
    if (insideRepository && typeof sourceCommit === "string" && /^[0-9a-f]{40}$/.test(sourceCommit)) {
      const repositoryPath = path.relative(root, absolute).split(path.sep).join("/");
      try {
        git(["cat-file", "-e", `${sourceCommit}:${repositoryPath}`], root);
        presentAtSourceCommit = true;
      } catch {
        presentAtSourceCommit = false;
      }
    }
    return { path: reference, inside_repository: insideRepository, exists, present_at_source_commit: presentAtSourceCommit };
  });
  return {
    repository_head: repositoryHead,
    declared_source_commit: sourceCommit ?? null,
    source_matches_repository_head: sourceCommit === repositoryHead,
    checked_path_count: evidence.length,
    evidence
  };
}

export function validateSpec(spec) {
  object(spec, "spec");
  if (spec.schema_version !== 1) fail("spec.schema_version must be 1");
  if (!(spec.overall_floor >= 0.9 && spec.overall_floor <= 1)) fail("overall_floor must be in [0.90, 1]");
  object(spec.dimensions, "spec.dimensions");
  const required = ["protocol_truth", "evidence_integrity", "functional_completeness", "visual_direction", "interaction_motion_quality", "accessibility_responsiveness", "regression_safety", "release_reproducibility"];
  exactKeys(Object.keys(spec.dimensions), required, "spec.dimensions");
  let weight = 0;
  for (const [id, dimension] of Object.entries(spec.dimensions)) {
    if (dimension.critical !== true) fail(`${id}.critical must be true`);
    if (!(dimension.weight > 0 && dimension.weight <= 1)) fail(`${id}.weight must be in (0, 1]`);
    if (!(dimension.floor >= 0.88 && dimension.floor <= 1)) fail(`${id}.floor must be in [0.88, 1]`);
    if (!Number.isInteger(dimension.evidence_minimum) || dimension.evidence_minimum < 2) fail(`${id}.evidence_minimum must be an integer >= 2`);
    if (typeof dimension.release_grade !== "string" || !dimension.release_grade.trim()) fail(`${id}.release_grade is required`);
    weight += dimension.weight;
  }
  if (Math.abs(weight - 1) > epsilon) fail(`dimension weights must sum to 1; got ${weight}`);
  if (!Array.isArray(spec.deterministic_prerequisites) || spec.deterministic_prerequisites.length < 5) fail("at least five deterministic prerequisites are required");
  object(spec.automatic_failures, "spec.automatic_failures");
  for (const id of ["native_protocol_bypass", "false_or_stale_evidence", "incomplete_golden_workflow", "generic_html_dashboard_quality", "decorative_or_inaccessible_motion", "critical_accessibility_failure", "regression_or_build_failure", "non_reproducible_release", "unreviewed_high_stakes_judgment"]) {
    if (typeof spec.automatic_failures[id] !== "string" || !spec.automatic_failures[id].trim()) fail(`automatic failure ${id} is required`);
  }
  return spec;
}

export function validateMatrix(matrix, spec) {
  object(matrix, "matrix");
  if (matrix.schema_version !== 1) fail("matrix.schema_version must be 1");
  if (matrix.maturity !== "representative_seed_not_statistically_reliable") fail("seed matrix maturity must remain explicit");
  if (!Array.isArray(matrix.cases) || matrix.cases.length !== matrix.case_count) fail("matrix.case_count must match cases.length");
  if (!(matrix.target_case_count >= 50)) fail("matrix.target_case_count must be at least 50");
  const ids = new Set();
  const distribution = { simple: 0, medium: 0, complex: 0, very_complex: 0 };
  const covered = new Set();
  for (const test of matrix.cases) {
    if (typeof test.id !== "string" || ids.has(test.id)) fail(`invalid or duplicate case id: ${test.id}`);
    ids.add(test.id);
    if (!(test.complexity in distribution)) fail(`${test.id}.complexity is invalid`);
    distribution[test.complexity] += 1;
    if (!Array.isArray(test.dimensions) || test.dimensions.length === 0) fail(`${test.id}.dimensions must be non-empty`);
    for (const dimension of test.dimensions) {
      if (!(dimension in spec.dimensions)) fail(`${test.id} references unknown dimension ${dimension}`);
      covered.add(dimension);
    }
    if (typeof test.scenario !== "string" || !test.scenario.trim()) fail(`${test.id}.scenario is required`);
    if (!Array.isArray(test.assertions) || test.assertions.length < 2) fail(`${test.id} requires at least two assertions`);
  }
  exactKeys(covered, Object.keys(spec.dimensions), "matrix dimension coverage");
  for (const [stratum, count] of Object.entries(distribution)) {
    if (matrix.strata[stratum] !== count || count < 2) fail(`matrix stratum ${stratum} count is invalid`);
  }
  return matrix;
}

export function evaluateAssessment(assessment, spec, resolution = null) {
  object(assessment, "assessment");
  if (assessment.schema_version !== 1) fail("assessment.schema_version must be 1");
  object(assessment.release_identity, "assessment.release_identity");
  const { source_commit: sourceCommit, evaluated_source_commit: evaluatedSourceCommit, worktree_clean: worktreeClean } = assessment.release_identity;
  if (typeof sourceCommit !== "string" || !/^[0-9a-f]{40}$/.test(sourceCommit)) fail("release_identity.source_commit must be a lowercase 40-character git SHA");
  if (!(evaluatedSourceCommit === null || (typeof evaluatedSourceCommit === "string" && /^[0-9a-f]{40}$/.test(evaluatedSourceCommit)))) fail("release_identity.evaluated_source_commit must be null or a lowercase 40-character git SHA");
  if (typeof worktreeClean !== "boolean") fail("release_identity.worktree_clean must be boolean");
  if (!Array.isArray(assessment.module_gates)) fail("assessment.module_gates must be an array");
  const expectedModules = ["M0", "M1", "M2", "M3", "M4", "M5", "M6"];
  exactKeys(assessment.module_gates.map((gate) => gate.id), expectedModules, "assessment.module_gates ids");
  object(assessment.deterministic_prerequisites, "assessment.deterministic_prerequisites");
  exactKeys(Object.keys(assessment.deterministic_prerequisites), spec.deterministic_prerequisites, "assessment.deterministic_prerequisites");
  object(assessment.automatic_failures, "assessment.automatic_failures");
  exactKeys(Object.keys(assessment.automatic_failures), Object.keys(spec.automatic_failures), "assessment.automatic_failures");
  object(assessment.dimensions, "assessment.dimensions");
  exactKeys(Object.keys(assessment.dimensions), Object.keys(spec.dimensions), "assessment.dimensions");

  const reasons = [];
  if (!worktreeClean) reasons.push("release identity is not immutable: worktree is dirty");
  if (evaluatedSourceCommit !== sourceCommit) reasons.push("release identity is stale or not evaluated at the current source commit");
  if (resolution) {
    object(resolution, "resolution");
    const expectedEvidencePaths = collectEvidencePaths(assessment);
    if (!Array.isArray(resolution.evidence)) fail("resolution.evidence must be an array");
    exactKeys(resolution.evidence.map((item) => item.path), expectedEvidencePaths, "resolution.evidence paths");
    if (resolution.repository_head !== sourceCommit) reasons.push("declared source commit does not match repository HEAD");
    for (const item of resolution.evidence ?? []) {
      if (!item.inside_repository) reasons.push(`evidence path escapes repository: ${item.path}`);
      else if (!item.exists) reasons.push(`evidence path is missing: ${item.path}`);
      else if (!item.present_at_source_commit) reasons.push(`evidence path is not present at declared source commit: ${item.path}`);
    }
  }
  for (const gate of assessment.module_gates) {
    object(gate, `assessment.module_gates.${gate.id}`);
    if (!["PASS", "BLOCKED", "NOT_STARTED"].includes(gate.status)) fail(`${gate.id}.status must be PASS, BLOCKED, or NOT_STARTED`);
    if (!Array.isArray(gate.evidence)) fail(`${gate.id}.evidence must be an array`);
    if (gate.status === "PASS" && gate.evidence.length === 0) fail(`${gate.id} cannot PASS without evidence`);
    if (gate.status === "PASS") requirePathEvidence(gate.evidence, gate.id);
    if (gate.status !== "PASS") reasons.push(`module gate ${gate.id} is ${gate.status}`);
  }
  for (const [id, result] of Object.entries(assessment.deterministic_prerequisites)) {
    if (!["PASS", "BLOCKED", "NOT_EVALUATED"].includes(result)) fail(`deterministic prerequisite ${id} has invalid status ${result}`);
    if (result !== "PASS") reasons.push(`deterministic prerequisite ${id} is ${result}`);
  }
  for (const [id, result] of Object.entries(assessment.automatic_failures)) {
    object(result, `assessment.automatic_failures.${id}`);
    if (!["CLEAR", "TRIGGERED", "BLOCKED", "NOT_EVALUATED"].includes(result.status)) fail(`${id}.status is invalid`);
    if (!Array.isArray(result.evidence)) fail(`${id}.evidence must be an array`);
    if (["CLEAR", "TRIGGERED"].includes(result.status) && result.evidence.length === 0) fail(`${id} ${result.status} requires evidence`);
    if (["CLEAR", "TRIGGERED"].includes(result.status)) requirePathEvidence(result.evidence, id);
    if (result.status === "TRIGGERED") reasons.push(`automatic failure triggered: ${id}`);
    if (result.status === "BLOCKED" || result.status === "NOT_EVALUATED") reasons.push(`automatic failure ${id} is ${result.status}`);
  }

  let overall = 0;
  for (const [id, config] of Object.entries(spec.dimensions)) {
    const result = assessment.dimensions[id];
    object(result, `assessment.dimensions.${id}`);
    if (!["SCORED", "BLOCKED", "NOT_EVALUATED"].includes(result.status)) fail(`${id}.status is invalid`);
    if (!Array.isArray(result.evidence)) fail(`${id}.evidence must be an array`);
    if (result.status !== "SCORED") {
      if (result.score !== null) fail(`${id}.score must be null when status is ${result.status}`);
      reasons.push(`${id} is ${result.status}`);
      continue;
    }
    if (!(typeof result.score === "number" && result.score >= 0 && result.score <= 1)) fail(`${id}.score must be in [0, 1] when SCORED`);
    if (result.evidence.length < config.evidence_minimum) fail(`${id} requires at least ${config.evidence_minimum} evidence entries`);
    requirePathEvidence(result.evidence, id);
    overall += result.score * config.weight;
    if (result.score + epsilon < config.floor) reasons.push(`${id} score ${result.score.toFixed(3)} is below floor ${config.floor.toFixed(3)}`);
  }
  overall = Number(overall.toFixed(6));
  if (overall + epsilon < spec.overall_floor) reasons.push(`overall score ${overall.toFixed(3)} is below floor ${spec.overall_floor.toFixed(3)}`);
  const passed = reasons.length === 0;
  return {
    schema_version: 1,
    assessment_id: assessment.assessment_id ?? null,
    passed,
    gate_status: passed ? "PASS" : "FAIL",
    decision: "HOLD",
    eligible_for_human_gate: passed,
    release_authority: "HUMAN_REQUIRED",
    release_action: "NONE",
    overall,
    blockers: reasons,
    source_identity: resolution ? {
      declared_source_commit: sourceCommit,
      evaluated_source_commit: evaluatedSourceCommit,
      repository_head: resolution.repository_head,
      matches_repository_head: resolution.repository_head === sourceCommit,
      evaluated_matches_source: evaluatedSourceCommit === sourceCommit
    } : null,
    evidence_resolution: resolution ? {
      checked_path_count: resolution.checked_path_count,
      unresolved: resolution.evidence.filter((item) => !item.inside_repository || !item.exists || !item.present_at_source_commit)
    } : null,
    reasons
  };
}

function passingAssessment(spec) {
  return {
    schema_version: 1,
    release_identity: { source_commit: "a".repeat(40), evaluated_source_commit: "a".repeat(40), worktree_clean: true },
    module_gates: ["M0", "M1", "M2", "M3", "M4", "M5", "M6"].map((id) => ({ id, status: "PASS", evidence: [`evidence/modules/${id}.json`] })),
    deterministic_prerequisites: Object.fromEntries(spec.deterministic_prerequisites.map((id) => [id, "PASS"])),
    automatic_failures: Object.fromEntries(Object.keys(spec.automatic_failures).map((id) => [id, { status: "CLEAR", evidence: [`evidence/reviews/${id}.json`] }])),
    dimensions: Object.fromEntries(Object.entries(spec.dimensions).map(([id, config]) => [id, { status: "SCORED", score: 1, evidence: Array.from({ length: config.evidence_minimum }, (_, index) => `evidence/dimensions/${id}-${index + 1}.json`) }]))
  };
}

const spec = validateSpec(loadJson(specPath));
const matrix = validateMatrix(loadJson(matrixPath), spec);

if (process.argv.includes("--self-test")) {
  const good = passingAssessment(spec);
  if (!evaluateAssessment(good, spec).passed) fail("self-test rejected passing assessment");
  const laundering = structuredClone(good);
  laundering.dimensions.visual_direction.score = 0.89;
  const launderingResult = evaluateAssessment(laundering, spec);
  if (launderingResult.passed || launderingResult.overall < 0.9) fail("self-test did not reject a critical floor despite high aggregate");
  const generic = structuredClone(good);
  generic.automatic_failures.generic_html_dashboard_quality = { status: "TRIGGERED", evidence: ["evidence/reviews/desktop.json", "evidence/reviews/mobile.json"] };
  if (evaluateAssessment(generic, spec).passed) fail("self-test did not reject generic HTML/dashboard quality");
  const blocked = structuredClone(good);
  blocked.deterministic_prerequisites.applicable_module_and_release_gates_pass = "BLOCKED";
  if (evaluateAssessment(blocked, spec).passed) fail("self-test did not reject a blocked prerequisite");
  const noVisualEvidence = structuredClone(good);
  noVisualEvidence.dimensions.visual_direction.evidence = [];
  try { evaluateAssessment(noVisualEvidence, spec); fail("self-test accepted missing visual evidence"); } catch (error) { if (error.message === "self-test accepted missing visual evidence") throw error; }
  const staleSource = structuredClone(good);
  staleSource.release_identity.evaluated_source_commit = "b".repeat(40);
  if (evaluateAssessment(staleSource, spec).passed) fail("self-test accepted stale source identity");
  const incompleteModules = structuredClone(good);
  incompleteModules.module_gates.find((gate) => gate.id === "M2").status = "BLOCKED";
  if (evaluateAssessment(incompleteModules, spec).passed) fail("self-test accepted incomplete module gates");
  const notEvaluated = structuredClone(good);
  notEvaluated.dimensions.visual_direction = { status: "NOT_EVALUATED", score: null, evidence: [] };
  if (evaluateAssessment(notEvaluated, spec).passed) fail("self-test accepted a NOT_EVALUATED dimension");
  const goodPaths = collectEvidencePaths(good);
  const goodResolution = { repository_head: "a".repeat(40), checked_path_count: goodPaths.length, evidence: goodPaths.map((path) => ({ path, inside_repository: true, exists: true, present_at_source_commit: true })) };
  const resolvedGood = evaluateAssessment(good, spec, goodResolution);
  if (resolvedGood.gate_status !== "PASS" || resolvedGood.decision !== "HOLD" || !resolvedGood.eligible_for_human_gate || resolvedGood.release_action !== "NONE") fail("self-test did not preserve the human release gate");
  const missingEvidence = structuredClone(goodResolution);
  missingEvidence.evidence[0].exists = false;
  if (evaluateAssessment(good, spec, missingEvidence).passed) fail("self-test accepted a missing evidence path");
  const wrongEvidenceSource = structuredClone(goodResolution);
  wrongEvidenceSource.evidence[0].present_at_source_commit = false;
  if (evaluateAssessment(good, spec, wrongEvidenceSource).passed) fail("self-test accepted evidence absent from declared source");
  const wrongRepositoryHead = structuredClone(goodResolution);
  wrongRepositoryHead.repository_head = "b".repeat(40);
  if (evaluateAssessment(good, spec, wrongRepositoryHead).passed) fail("self-test accepted mismatched repository source identity");
  console.log("hard-quality self-test valid (pass + 11 release-veto checks; release action remains NONE)");
}

const assessmentArg = process.argv.find((argument) => argument.endsWith(".assessment.json"));
if (assessmentArg) {
  const assessment = loadJson(path.resolve(assessmentArg));
  const repoRoot = git(["rev-parse", "--show-toplevel"], process.cwd());
  const resolution = resolveSourceAndEvidence(assessment, repoRoot);
  const result = evaluateAssessment(assessment, spec, resolution);
  console.log(JSON.stringify(result, null, 2));
  if (result.gate_status !== "PASS") process.exitCode = 1;
} else {
  console.log(`hard-quality specification valid: ${path.relative(process.cwd(), specPath)}`);
  console.log(`hard-quality seed matrix valid: ${path.relative(process.cwd(), matrixPath)} (${matrix.case_count}/50+ cases)`);
}
