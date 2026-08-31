# VEDAXI Module Architecture

**Status:** Governing build sequence  
**Scope:** Traceability, module boundaries, evaluation, and connection rules  
**Product authority:** `docs/superpowers/specs/2026-08-30-vedaxi-protocol-proof-design.md`  
**Evaluation authority:** `docs/evaluation/VEDAXI_RUBRIC.md` and the versioned eval registry

## Mental model

VEDAXI is one narrow proof assembled from independently reviewable modules. Each module must prove one claim before its output becomes an input to the next module. A passing unit test is not proof of native browser behavior, and a polished browser screen is not proof of a correct contract.

```text
M0 Protocol Foundation
  ├─ M0A typed contracts
  └─ M0B exact-browser feasibility
             |
             v
M1 Paper Origin -> M2 Video Origin -> M3 Shared Actions
                                           |
                                           v
                                  M4 Semantic Stage
                                           |
                                           v
                                   M5 Native Proof
                                           |
                                           v
                                     M6 Submission
```

The dependency arrow means “may consume the earlier module's public contract after its exit gate passes.” It never means permission to import an earlier module's internal files.

## Non-negotiable operating rules

### Sequential implementation

1. Only one module may be in implementation at a time. Later modules may be specified, but their product code does not start until the current module has a recorded exit decision.
2. Each module follows `failing test/eval -> minimum implementation -> passing evidence -> spec review -> code-quality review -> exit record`.
3. A failed gate moves the same module to `REPAIR`. It does not authorize work in the next module.
4. A later module may not “temporarily” bypass an earlier contract. If the contract is wrong, reopen its owning module, version the contract, rerun downstream contract and integration checks, and record the impact.
5. Integrations are new test surfaces. Passing M1 and passing M2 do not imply that the M1↔M2 connection passes.

### Public boundaries

- Cross-module imports use a package root or a documented module barrel only, for example `@vedaxi/contracts` or `@vedaxi/state`.
- Imports such as `@vedaxi/contracts/src/evidence`, `../../packages/state/src/store`, or another app's internal path are forbidden.
- Apps never import from each other. Cross-origin exchange occurs through WebMCP results, browser navigation/frame behavior, and shared typed wire contracts—not a source-code import.
- Tool handlers and human controls never mutate UI components. Both call the same typed action boundary.
- Publisher tools return evidence and action results only. They never return the contradiction label or the derived `34`.
- Any public contract change requires a versioned eval change and a downstream impact note before implementation continues.

No new lint dependency is required to enforce these rules initially. TypeScript, package exports, a focused import-boundary check, and module review are the smallest adequate controls. Ponytail is a reasoning ladder, not a linter or runtime dependency.

### Ponytail simplicity ladder

For every implementation choice, use the first rung that satisfies the module contract:

1. Delete or avoid the behavior if the approved slice does not require it.
2. Reuse an existing local public contract or already-installed capability.
3. Use the browser platform, TypeScript, or standard JavaScript.
4. Extend the smallest existing implementation.
5. Write a small local function with one runnable check for non-trivial logic.
6. Create an abstraction only when two concrete uses prove the shared shape.
7. Add a dependency only when the module evidence shows that local/platform code is materially worse.

The ladder may reduce boilerplate, speculative abstractions, dependencies, and unrequested features. It must never remove input validation, error handling, security boundaries, human confirmation, evidence provenance, keyboard access, reduced-motion behavior, or truthful unsupported/failure states.

### Inspiration firewall

- External documents, Shopify Editions, OpenAI Evals, Ponytail, and local reference repositories are method and principle references only.
- Runtime source, names, copy, layouts, assets, schemas, and distinctive compositions from inspiration sources do not enter product code.
- Every borrowed principle must be restated in `docs/evaluation/INSPIRATION_LEDGER.md` as a VEDAXI-specific rule before use.
- Review asks: “Could this implementation be derived from the VEDAXI spec without seeing the inspiration?” A “no” is a module failure.
- OpenAI Evals is evaluation-only inspiration unless a later explicit decision adds it outside both publisher bundles with its license retained.
- Ponytail is not installed into either application and does not appear in production dependencies.

### Evidence and status provenance

Allowed module statuses are `NOT STARTED`, `IN PROGRESS`, `REPAIR`, `PASS`, and `BLOCKED`.

Every exit record must include:

- module and contract version;
- status and UTC timestamp;
- commit SHA or the explicit label `uncommitted working tree`;
- exact command, browser product/build, URL/origin, flags or exposure policy, and clean/reset state;
- test/eval IDs and raw artifact paths;
- expected result, observed result, and pass/fail decision;
- reviewer identity/role;
- facts labeled `verified`, `provided`, `inferred`, or `unknown`;
- known failures, repair owner, and downstream modules invalidated by a later change.

Evidence is append-only. Targets are never backfilled after results are visible. Screenshots do not prove tool discovery, source tests do not prove browser support, model grades do not override deterministic failure, and a narrated demo does not prove behavior hidden by a cut.

Store evidence under `docs/evidence/M0/` through `docs/evidence/M6/`. Each module keeps a human-readable `exit-record.md`; machine cases remain in the eval registry. Secrets, private chain-of-thought, access tokens, and private user data never enter evidence artifacts.

## Evaluation model

### Devpost gates

The official submission requirements are represented explicitly so they cannot disappear inside a quality score:

| ID | Requirement |
| --- | --- |
| D1 | Working live URL with native WebMCP behavior accessible in the target in-app browser. |
| D2 | Public repository with complete source, reproduction instructions, and a visible open-source license. |
| D3 | Public demo video under three minutes with audio. |
| D4 | Text explanation of the project and its WebMCP use. |
| D5 | Named agents/clients in which the project was actually tested. |
| D6 | Free judge access through the end of judging, with working credentials/instructions if needed. |
| D7 | Recorded authorization or license basis for every third-party or protected component. |
| D8 | Live official rules and submission fields rechecked immediately before the Human Gate. |

`H1–H12` remain the product hard gates in `VEDAXI_RUBRIC.md`. `D1–D8` close the submission-package gaps that H11 and H12 do not fully express. The Human Gate remains separate and user-owned after these machine-tracked gates pass.

### Judge dimensions

Every module identifies its contribution to the official score:

- **W — WebMCP Leverage (25):** native discovery, schemas, origins, provenance, lifecycle, and indispensable protocol use.
- **E — Execution (25):** coherent runnable product, correctness, persistence, failure recovery, accessibility, and deployment.
- **I — Potential Impact (25):** a consequential research-integrity job whose value is visible in product behavior.
- **C — Creativity & Ambition (25):** an original Semantic Focus Shift that preserves context and is difficult to reduce to a generic dashboard.

These equal weights were verified on **2026-08-31** against the [WebMCP Challenge Official Rules](https://webmcp.devpost.com/rules). The Official Rules and current Hackathon Website prevail over this architecture if they change; recheck before each new Dual Delphi score.

Hard gates pass before scoring. Dual Delphi reviews the completed evidence at the declared cadence; it does not rescue a failed deterministic or browser gate. Official criteria and the seven recorded judge lenses form the arbiter rubric.

### Eval identities

- Machine source of truth: versioned JSONL under `evals/registry/data/vedaxi/`.
- Human projection: `docs/evaluation/VEDAXI_TEST_SET.md`.
- Identity format: `vedaxi.<module>.<split>.v<major>`.
- Changed fixture, assertion, evaluator, or hard-gate meaning requires a version bump.
- Deterministic assertions run locally first; ordered traces second; browser/accessibility evidence third; model grading only for irreducibly qualitative judgment.
- Model-graded output must include confidence and may return `N/E`. It cannot mark an unexecuted deterministic assertion as passed.

## Connection ledger

| ID | From -> to | Allowed connection | Separate proof |
| --- | --- | --- | --- |
| C01 | M0 -> M1 | `@vedaxi/contracts` package-root evidence and registration contracts. | Paper build/typecheck plus S1–S3; no deep imports. |
| C02 | M0 -> M2 | Same public contracts, with video-owned fixture and true video origin. | Video build/typecheck plus S4–S5; source origin differs from paper. |
| C03 | M1 + M2 -> M3 | Stable evidence IDs are passed as typed values into shared actions; neither app is imported by `@vedaxi/state`. | Action tests use injected evidence fixtures and parity tests. |
| C04 | M3 -> M4 | Semantic Stage consumes a read-only state/view model and invokes public actions. | M3 golden behavior rerun with stage attached; reduced-motion and reachability checks. |
| C05 | M1 + M2 + M3 -> M5 | Per-origin tool factories are registered through the M0 lifecycle; mutation handlers invoke M3 public actions. | Fresh browser inventory, ordered trace, two-origin/sequential topology evidence, kill-switch ablation. |
| C06 | M5 -> M6 | Only verified public URLs, traces, timings, and tested-client names flow into submission copy/video. | Clean reproduction by a reviewer who did not build the module. |

## Module specifications

### M0 — Protocol Foundation

M0 has two inseparable sub-gates. M0A proves source contracts. M0B proves the exact browser. M1 may not start until both pass, because the approved design names native browser feasibility as the highest-risk first gate.

| Field | Definition |
| --- | --- |
| Claim | VEDAXI has a minimal typed evidence/search/registration vocabulary, and the exact target browser can natively register, discover, invoke, attribute, and remove publisher tools without a silent fallback. Shared publisher actions and audit vocabulary are owned by M3. |
| Owned files | Root `package.json`, lockfile, and `tsconfig.json`; `packages/contracts/**`; minimal protocol probe under `apps/protocol-probe/**`; `evals/registry/data/vedaxi/m0-protocol.*.jsonl`; `docs/evidence/M0/**`. |
| Typed public contract | Package-root exports for `EvidenceObject`, `EvidenceSearchResult`, `WebMcpTool`, `WebMcpRegistration`, support/registration status including `registered | unsupported | empty | error | cancelled`, runtime result validation, lifecycle cancellation, and live UI status. Action/result envelopes and audit-event vocabulary are intentionally deferred to M3. |
| Allowed dependencies | Browser APIs, TypeScript/JavaScript, Vitest already present. No React, app import, storage library, WebMCP polyfill, OpenAI Evals runtime, or Ponytail runtime. |
| Devpost/hard gates | H1, H2 topology feasibility, H3 result boundary. M0 records an H9 removal-feasibility precursor only; full H9 remains not evaluated until M5 because no persisted note exists yet. D1 remains provisional until deployment. |
| Eval cases | `vedaxi.contracts.dev.v3` covers deterministic evidence/search/registration/cancellation contracts; `vedaxi.m0b-browser.manual.v1` indexes exact-browser observations. |
| Unit evidence | Contract typecheck; exact evidence-shape/search tests; unsupported/error/abort/cancellation lifecycle tests; import-boundary check. Action/audit tests begin in M3. |
| Integration evidence | Probe tool uses the public contract and native registration path; no direct handler fallback. |
| Browser evidence | Exact source commit and available environment identity, support state, same-origin discovery/invocation, second-origin/frame experiment, provenance observation, abort, fresh capability observation, and sequential fallback experiment only if simultaneous discovery fails. Unavailable exact client version and screenshots may remain explicitly `BLOCKED`. |
| Entry gate | Approved design, official API source recorded, exact target browser and host named. |
| Exit gate | M0A unit/type checks pass and source review finds no reasoning leak; M0B browser matrix is fully `pass/fail/blocked`; native viability is proven; final topology is `simultaneous` or evidence-backed `sequential`, never simulated. |
| Connection point | C01 and C02 through package-root exports; registration lifecycle reused by C05. |
| Rollback/repair boundary | Repair contracts/probe only. Failure of simultaneous cross-origin discovery may select the documented sequential topology. Failure of native WebMCP blocks product implementation; it does not authorize a polyfill or fake direct call. |
| Judge dimensions | W primary; E secondary. |

**Current evidence:** `[verified]` the current full suite passes `37/37` tests across contracts and the protocol probe. Contract eval `vedaxi.contracts.dev.v3` adds executable cancellation/lifecycle cases without mutating v2. The artifact-bound in-app-browser M0B run against immutable source commit `93bb80f` proved the paper top-level native path, exact paper and direct-video results, a clean-room one-agent sequential two-origin route, and abort-driven fresh zero inventories with human content intact. Simultaneous frame discovery was tested and `FAILED`: the secure video frame reported `unsupported` and only the paper tool was inventoried. The selected topology is therefore `sequential`. Full H9, exact client version/build, screenshots, and deployment parity remain not evaluated or `[blocked]` as stated in the matrix. Evidence: `docs/evidence/M0/M0B_BROWSER_MATRIX.md`, `docs/evidence/M0/raw/**`, `vedaxi.contracts.dev.v3`, and `vedaxi.m0b-browser.manual.v1`.

### M1 — Paper Origin

| Field | Definition |
| --- | --- |
| Claim | A complete human paper workspace remains useful in every protocol state and exposes exact paper evidence without performing cross-source reasoning. |
| Owned files | `apps/paper/src/paper/**`, paper fixture/content, paper-only tool definitions, paper app shell/config, paper-scoped foundation tokens, and the local same-origin evidence-tool registration bridge required by S1/S2; `evals/registry/data/vedaxi/m1-paper.*.jsonl`; `docs/evidence/M1/**`. M4 owns stage-specific tokens/components/motion under `apps/paper/src/stage/**`; M5 owns deployed two-origin, mutation, and end-to-end registration adapters under `apps/paper/src/webmcp/**`. |
| Typed public contract | Paper module barrel exports its fixture/service to its own app shell: stable evidence ID `paper.methods.final-analysis`, evidence search/read results conforming to `EvidenceObject`, and a tool factory that receives dependencies rather than importing UI. The app is not a package for other apps to import. |
| Allowed dependencies | M0 package-root contracts; React/Vite chosen for the app; browser DOM. No video-app import, shared-state internals, contradiction calculator, persistence implementation, 3D library, or copied reference assets. |
| Devpost/hard gates | H1 truthful support surface, H3 evidence only, H10 no false tool success. |
| Eval cases | S1, S2, S3. |
| Unit evidence | Exact fixture, stable ID, locator/origin/provenance, open-query search, unrelated-query empty result, schema validation, and explicit checks that outputs omit `34`, `contradiction`, and `discrepancy`. |
| Integration evidence | Human paper shell consumes the same fixture/service as the paper tool factory without invoking a tool handler directly. |
| Browser evidence | Readable exact methods passage; functional human navigation when active/disabled/unsupported/error; keyboard access; zero fallback executions. |
| Entry gate | M0 `PASS`, final browser topology recorded, C01 contract check passing. |
| Exit gate | S1–S3 pass; no-reasoning inspection passes; browser support state is truthful; paper remains useful with registrations absent. |
| Connection point | C03 passes the stable paper evidence ID into M3. M1 locally registers only its read-only evidence tool; C05 extends registration with deployed two-origin and mutation adapters without replacing the M1 fixture/service/tool contract. |
| Rollback/repair boundary | Repair paper fixture, paper UI, and paper tool factory only. Do not change the shared contract or video origin without reopening their owning module. |
| Judge dimensions | E and I primary; W secondary. |

### M2 — Video Origin

| Field | Definition |
| --- | --- |
| Claim | An independently served video publisher exposes the exact exclusion evidence and human seek path without deriving the analyzed sample or borrowing paper-owned state. |
| Owned files | `apps/video/src/video/**`, transcript/video fixture, video-only tool definitions, video app shell/config, `evals/registry/data/vedaxi/m2-video.*.jsonl`, `docs/evidence/M2/**`. M5 owns `apps/video/src/webmcp/**`. |
| Typed public contract | Video module barrel exposes stable evidence ID `video.transcript.calibration-drift`, exact timestamp/locator, transcript search/read result, and seek command/result conforming to M0 wire types. |
| Allowed dependencies | M0 package-root contracts; React/Vite; native media/DOM APIs. No paper-app import, state-package mutation, precomputed sample-size result, or copied video/content from inspiration sources. |
| Devpost/hard gates | H2 independent origin, H3 evidence only, H10 truthful seek/tool failure. |
| Eval cases | S4, S5. |
| Unit evidence | Exact “six”, calibration drift, “did not replace”, stable timestamp/origin/provenance; schema validation; outputs omit `34` and contradiction language. |
| Integration evidence | Video tool result and human seek consume the same video-owned fixture; origin configuration differs from M1. |
| Browser evidence | Independent origin URL, keyboard-operable exact seek/transcript focus, truthful unavailable-media state, provenance retained. |
| Entry gate | M1 `PASS`; M0 topology decision permits the intended connection; C02 passes. |
| Exit gate | S4–S5 pass; browser origin and keyboard evidence retained; no derived result in any publisher response. |
| Connection point | C03 supplies the stable video evidence ID to M3; C05 registers or sequentially discovers video-owned tools. |
| Rollback/repair boundary | Repair video fixture/player/tools only. A frame discovery failure reopens M0B topology; it is not repaired by copying video evidence into M1. |
| Judge dimensions | W and E primary; I secondary. |

### M3 — Shared Actions and Persistence

| Field | Definition |
| --- | --- |
| Claim | Human controls and WebMCP handlers share one typed, atomic publisher action boundary for focus, reject/confirm, block-and-note, persistence, audit, and reset; failures never display success. |
| Owned files | `packages/state/**`; paper-side action adapter under `apps/paper/src/actions/**`; `tests/integration/shared-actions/**`; `evals/registry/data/vedaxi/m3-actions.*.jsonl`; `docs/evidence/M3/**`. |
| Typed public contract | `@vedaxi/state` package-root exports `PublisherState`, `CitationStatus`, `DiscrepancyNote`, `FocusRequest`, `Confirmation`, `PublisherAction`, typed success/failure results, `PublisherStore` interface, audit events, and deterministic reset. Storage implementation stays behind `PublisherStore`. |
| Allowed dependencies | M0 contracts and browser-owned storage. M1/M2 evidence is injected by stable IDs/objects. No React component mutation, tool-name dependency, server/database, or animation library unless browser-owned persistence is proven insufficient. |
| Devpost/hard gates | H6, H7, H8, H10. |
| Eval cases | M4, M5, C1, C2, V4. M3 from the test set is a stage case and belongs to M4 despite its current registry label. |
| Unit evidence | Reject is zero mutation; confirm requires focused proposal; atomic block-and-note; exactly one linked note; evidence ID validation; audit event; deterministic reset; storage serialization/rehydration; write-failure rollback. |
| Integration evidence | Human and tool adapters call the same action reference and yield equivalent state/audit results; reload rehydrates without agent code; reset does not change WebMCP support. |
| Browser evidence | Confirm/reject paths, agent-free reload, reset, injected persistence failure, truthful recovery, no false blocked/saved state. |
| Entry gate | M1 and M2 independently `PASS`; C03 contract test prepared before integration. |
| Exit gate | All mapped evals pass; H6/H7/H8/H10 evidence retained; adapter parity and failure atomicity reviewed. |
| Connection point | C04 provides a read-only view model/actions to M4; C05 WebMCP mutation handlers invoke the same public actions. |
| Rollback/repair boundary | Replace storage adapter or action implementation behind the public interface. Never “repair” persistence by keeping success only in component or agent memory. |
| Judge dimensions | E primary; W and I secondary. |

### M4 — Semantic Stage

| Field | Definition |
| --- | --- |
| Claim | Real paper, video, transcript, arithmetic, and provenance objects visibly reorganize around the agent-derived discrepancy while demoted context remains reachable and the full meaning survives reduced motion. |
| Owned files | `apps/paper/src/stage/**`, design tokens and stage styles, chapter rail/drawer/focus components, stage-focused visual tests, `evals/registry/data/vedaxi/m4-stage.*.jsonl`, `docs/evidence/M4/**`. |
| Typed public contract | Stage barrel accepts the M3 read-only view model, selected evidence objects, external-agent derivation, and public action callbacks; emits semantic focus/restore events. It never owns persistence or computes the discrepancy. |
| Allowed dependencies | M0 contracts, M3 public state/actions, React and the smallest existing motion capability that proves the design. Prefer CSS/DOM; add 3D only if evidence objects and accessibility remain DOM-owned and the visual claim cannot be met more simply. |
| Devpost/hard gates | H3 reasoning boundary, H6 focused confirmation, H10 truthful UI. Accessibility/reduced-motion/reachability constrain Execution even though the current rubric does not assign them separate H IDs. |
| Eval cases | M3, V2, V3. Add a visual originality/reachability case tied to the inspiration firewall. |
| Unit evidence | State-to-layout mapping, drawer reachability, restore, provenance attachment, confirmation focus, reduced-motion semantic equivalence. |
| Integration evidence | C04 reruns M3 confirm/reject/persistence behavior with the stage attached; no stage component owns or fakes publisher state. |
| Browser evidence | Desktop/mobile/tablet; keyboard and focus order; reduced motion; no overflow/clipped controls; visual regression; every promoted object readable and every demoted object recoverable. |
| Entry gate | M3 `PASS`; functional vertical slice works without cinematic motion. |
| Exit gate | M3/V2/V3 and originality check pass; visual review finds no copied composition; accessibility and performance guardrails pass; no console errors. |
| Connection point | C05 observes the same real state changes when external tools/actions run. |
| Rollback/repair boundary | Disable or simplify motion/3D while preserving M3's functional DOM experience. Never repair a visual defect by hiding evidence, provenance, errors, or controls. |
| Judge dimensions | C primary; E and I secondary. |

### M5 — Native End-to-End Proof

| Field | Definition |
| --- | --- |
| Claim | In a clean deployed target-browser session, an external agent receives only the user job, dynamically discovers the publisher capabilities, retrieves both origins' evidence, derives `34`, requests focus, waits for human confirmation, commits through M3, proves agent-free persistence, and loses the agent route after the kill switch while the human site remains intact. |
| Owned files | `apps/paper/src/webmcp/**`, `apps/video/src/webmcp/**`, deployment/origin configuration, `tests/browser/**`, browser matrix/ordered traces under `docs/evidence/M5/**`, `evals/registry/data/vedaxi/m5-native.*.jsonl`. |
| Typed public contract | Per-origin registration adapters consume M0 `WebMcpTool`/lifecycle types and M1/M2 tool factories; mutation adapters consume M3 public actions. Captured trace schema records intent, origin, capability, call, result, concise rationale, confirmation, mutation, and audit result—never private chain-of-thought. |
| Allowed dependencies | Only passed public boundaries from M0–M4 plus target-browser/deployment tooling. No publisher code in the external agent, no hardcoded publisher tool names in its prompt, no direct-call fallback, no aggregator that erases origin, and no simulated success. |
| Devpost/hard gates | H1–H10 and D1; tested-client evidence is retained for downstream D5. H11/H12 and D2–D8 remain downstream of the M6 package. |
| Eval cases | M1, M2, C3, C4, C5, V1; rerun S1–S5, M3–M5, C1, and V4 as the full integration regression. |
| Unit evidence | Tool schemas/descriptions; result validation; renamed/reordered tool fixtures; corrupt/missing evidence behavior; lifecycle cleanup. |
| Integration evidence | Each connection C01–C05 passes in the selected topology; ordered trace proves evidence A and B precede derivation; human and agent are both indispensable. |
| Browser evidence | Clean deployed session, exact version/origins, tool inventory, prompt capture, calls/results/provenance, focus/confirm/persist/reload, before/after kill-switch inventory, human route survival, and console/network errors. |
| Entry gate | M4 `PASS`; deployed two-origin URLs exist; M0B browser assumptions are rechecked in the deployed environment. |
| Exit gate | All applicable H1–H10 and D1 pass; all mapped cases pass; WebMCP ablation fails the agent route but not the human route; Dual Delphi score is at least 85 with no dimension below 4/5. |
| Connection point | C06 supplies only verified evidence to the public submission package. |
| Rollback/repair boundary | Repair the failing adapter/connection and rerun downstream evidence. Simultaneous-to-sequential topology change is allowed only with the recorded M0/M5 failure and truthful copy. Native failure never falls back to direct internal calls. |
| Judge dimensions | W and E primary; I and C validated end to end. |

### M6 — Submission and Reproduction

| Field | Definition |
| --- | --- |
| Claim | A judge with no private project context can open the live URL, inspect/reproduce the source, understand the WebMCP contribution, see a real under-three-minute run with audio, and know exactly which agents/clients were tested. |
| Owned files | Public `README.md`, visible open-source `LICENSE`, reproduction/testing docs, `devpost-submission.md`, video shot/timing checklist, public URL/client matrix, `evals/registry/data/vedaxi/m6-submission.*.jsonl`, `docs/evidence/M6/**`. The public video file may live on its hosting service rather than in Git. |
| Typed public contract | No new product runtime contract. Submission facts consume the verified M5 evidence schema and expose immutable public URLs, commit SHA, environment/client names, and versioned reproduction steps. |
| Allowed dependencies | Documentation, repository host, deployment host, and public video host. Narration/caption tooling may polish an already-recorded real run. It may not create, replace, or conceal protocol evidence. |
| Devpost/hard gates | M6 produces the package-readiness evidence consumed by downstream H11, H12, and D2–D8. D1 belongs to M5. Submission itself still requires explicit user confirmation after the downstream gates pass. |
| Eval cases | V5 plus D1–D8 submission completeness, access, rights, and current-rules cases. |
| Unit evidence | Link/file/license/instruction checks; client matrix completeness; explanation cross-check against claims ledger. |
| Integration evidence | Fresh clone/install/test/build and fresh-session live reproduction by an independent reviewer; public URLs resolve without private credentials. |
| Browser evidence | Public live URL and video access; timed video under 180 seconds and target 154 seconds; audio present; no cuts conceal discovery, persistence, or kill switch. |
| Entry gate | M5 `PASS`; public source/deployment/video destinations available. |
| Exit gate | The public package inputs and reproducibility evidence are complete; clean reproduction passes at the candidate SHA; final Intended-vs-Implemented and Dual Delphi reviews pass. H11/H12 and D2–D8 then evaluate that frozen package. Rules acknowledgment and final submission authorization remain later, separate user-owned gates. |
| Connection point | Final Devpost fields point only to the evidence-backed public artifacts. |
| Rollback/repair boundary | Repair the failing document, link, recording, or deployment artifact and rerun its check. Never edit the product or video to claim unverified behavior, and never submit without user confirmation. |
| Judge dimensions | All four dimensions communicated; no new score is invented beyond M5 evidence. |

## Module review packet

Before a module can exit, its reviewer receives one packet containing:

1. governing claim and owned-file list;
2. public contract and allowed dependencies;
3. diff limited to owned files and any explicitly approved connection adapter;
4. tests/evals with raw output;
5. browser evidence where applicable;
6. Devpost/hard-gate mapping;
7. inspiration-ledger check;
8. Ponytail review: unnecessary code/dependency/abstraction removed without cutting safeguards;
9. Intended-vs-Implemented comparison;
10. failures, unknowns, and proposed exit status.

The implementation author cannot be the only exit reviewer. Dual Delphi is required at M0, M3/M4 vertical-slice connection, M5, and M6; other modules receive the ordinary adversarial review packet.

## Current document gaps and minimal patch recommendations

No files below are changed by this architecture task. These are the smallest follow-up edits needed to make the repository internally consistent.

| Priority | Gap or contradiction | Minimal patch |
| --- | --- | --- |
| Resolved 2026-08-31 | The approved spec requires exact-browser feasibility before product implementation. | `MODULE_GATES.md` now separates M0A contracts, M0B native preflight, and M5 deployed re-verification. M0B selected the evidence-backed sequential topology after simultaneous frame discovery failed. |
| Resolved 2026-08-31 | Build Scope and code/eval modules formerly reused ambiguous M labels. | Build Scope now uses R0–R4 release stages; M0–M6 are reserved for code/eval modules. |
| Resolved 2026-08-31 | The original aggregate eval registry routed cases through a model classifier. | M0 uses executable deterministic contract evals and a separately labeled non-executable browser-evidence registry. Later module registries must preserve this evaluator separation. |
| Resolved 2026-08-31 | M0 originally lacked versioned eval records and later added public cancellation semantics. | `vedaxi.contracts.dev.v2` remains immutable; `vedaxi.contracts.dev.v3` adds executable cancellation/lifecycle cases. M0B remains indexed by `vedaxi.m0b-browser.manual.v1`. |
| High | The legacy aggregate `evals/registry/data/vedaxi/module-gates.jsonl` still shares `vedaxi.module-gates.dev.v1`; M0 has already moved to module-specific v2/v3/manual identities. | Migrate each later module to its own versioned identity while retaining the aggregate only as an explicit suite index. |
| High | Eval ID `M3` is labeled `shared-actions` in JSONL but tests Semantic Stage behavior. `OPENAI_EVALS_ADAPTATION.md` also uses an `M2` example labeled shared actions while the live test set's M2 is native derivation. | Map test-set M3 to `m4-stage`; replace ambiguous example IDs with module-qualified IDs such as `M4-STAGE-FOCUS-001`. |
| Resolved 2026-08-31 | H11/H12 did not explicitly cover every Devpost package, access, rights, and current-rules requirement. | D1–D8 submission gates now separate those requirements from product scoring; M6 must add their concrete records before the separate Human Gate. |
| High | `.devpost-hackathon-state.json` still says `rules_acknowledged: false` while requirements are treated as verified in build docs. | Keep requirements recorded, but do not change acknowledgement on the user's behalf; pass D8 first, then require explicit user acknowledgement at the separate Human Gate before submission. |
| Resolved 2026-08-31 | M0 and M3 both claimed ownership of shared action/audit contracts; the older gap row also incorrectly said package exports, runtime validation, and truthful lifecycle status were absent. | M0 owns evidence/search/native-registration contracts and now exports/validates them; M3 exclusively owns shared action/result/audit contracts and tests. |
| Medium | `VEDAXI_TEST_SET.md` and JSONL duplicate case meaning and can drift. | Make versioned JSONL the machine source and generate/review the Markdown as its human projection; record one provenance link rather than manually redefining behavior twice. |
| Resolved for M0; required for later exits | Inspiration/firewall rules were repeated without a module exit artifact. | M0 now records one bounded inspiration/minimalism review in its exit record. M1–M6 must repeat that field rather than add another prose rule or lint dependency. |
| Medium | Accessibility, performance, import boundaries, and copied-content checks constrain Execution but lack explicit deterministic gate IDs. | Add module-scoped assertions and artifacts first; promote only genuinely release-blocking failures to new H IDs after the first real run. |
| Resolved 2026-08-31 | Source tests alone could be mistaken for native protocol proof. | The current `37/37` passing suite is labeled deterministic source evidence, while the strict-validated M0B registry points to raw browser artifacts, records `PASS`, `FAIL`, and `BLOCKED`, and selects the sequential topology. |

## Definition of architectural completion

This architecture is being followed only when a reviewer can answer, for every product behavior:

1. Which module owns it?
2. What typed public contract exposes it?
3. Which dependencies may it use?
4. Which exact test/eval and Devpost gate challenge it?
5. What unit, integration, and browser evidence proves it?
6. Which connection introduces integration risk?
7. Where can it be repaired or rolled back without contaminating another module?
8. Which judge dimension improves, and which hard gate prevents score inflation?
9. What is verified, provided, inferred, or still unknown?

If any answer is missing, the module has not exited.
