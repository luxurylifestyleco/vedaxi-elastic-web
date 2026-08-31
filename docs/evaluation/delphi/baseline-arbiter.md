# VEDAXI Dual Delphi Baseline — Neutral Arbiter

**Round:** Baseline — scope and architecture  
**Arbiter status:** `COMPLETE`  
**Input status:** Node A and Node B read only after both declared `FROZEN`  
**Decision:** **Select A1 as the immediate implementation-local experiment; retain `INSUFFICIENT EVIDENCE` for topology and experience selection.**

> **Historical scoring notice — 2026-08-31:** This frozen arbiter used the superseded `30/30/20/20` project weighting. Current [Official Rules](https://webmcp.devpost.com/rules) define `WebMCP Leverage`, `Execution`, `Potential Impact`, and `Creativity & Ambition` as equally weighted. The frozen decision and board content remain historical evidence, but all numerical scores below are stale until recomputed under `25/25/25/25`. Official rules prevail.

## 1. Neutrality and no-rewrite attestation

The arbiter read the frozen artifacts:

- `docs/evaluation/delphi/baseline-node-a.md`
- `docs/evaluation/delphi/baseline-node-b.md`

No strategy card, mechanism, metric, sacrifice, assumption, or nomination was rewritten. The arbiter compares the frozen concepts, applies one consistent evidence standard, and records conflicts exposed by later current evidence.

The following artifacts were admitted only as current evidence, not as authority to revise the frozen concepts:

- `docs/evaluation/MODULE_GATES.md`
- `docs/evaluation/OPENAI_EVALS_ADAPTATION.md`
- `docs/evaluation/INSPIRATION_LEDGER.md`
- current contracts source/tests under `VEDAXI - Elastic WEB/packages/contracts`
- fresh `npm test` and `npx tsc --noEmit` results recorded by the red-team pass

At the time of this frozen run, the local project rubric incorrectly used `WebMCP Leverage 30 / Execution 30 / Potential Impact 20 / Creativity & Ambition 20`. Those historical calculations are preserved below for provenance, alongside the seven professional lenses, hard gates, 60-point ceiling, WebMCP ablation, collaboration deduction, and measurement cap used in that run. They are not the active official weighting.

## 2. Current evidence added after board freeze

### Verified positive evidence

1. The contract suite passes: 2 files, 7 tests; the TypeScript check passes. `[verified]`
2. The native adapter uses only `document.modelContext`, passes `signal` and `exposedTo`, returns truthful unsupported/error states, and aborts the shared signal on disable. `[verified]`
3. The evidence contract preserves ID, origin, locator, excerpt, and provenance and does not derive the contradiction. `[verified]`
4. `OPENAI_EVALS_ADAPTATION.md` specifies a sound hierarchy: deterministic assertions first, ordered trace assertions second, model grading only for semantic quality, and Dual Delphi only after evidence. It also keeps Python, API keys, and upstream Evals out of the runtime product. `[verified document architecture; unimplemented]`
5. `MODULE_GATES.md` defines predeclared claims, assertions, guardrails, evidence artifacts, failure rules, and versioned eval records. `[verified document architecture; unimplemented]`

### Critical conflict introduced by current evidence

`MODULE_GATES.md:28-29` places **M4 Semantic Stage before M5 Native Proof** and makes a deployable M4 the entry condition for the first clean-session two-origin discovery/kill-switch proof. That directly conflicts with:

- `docs/superpowers/specs/2026-08-30-vedaxi-protocol-proof-design.md:218-237`, which calls the exact-browser feasibility gate the first and highest-risk implementation activity and requires stopping before the full interface if native support is unavailable;
- `docs/archive/PROJECT_HANDOFF.md:73`, which records that the first execution phase must test native `document.modelContext`, unregister, fresh observation, and cross-origin discovery;
- frozen A1, which explicitly forbids full product work before the native matrix.

This is not a subtle sequencing preference. It converts the highest-risk precondition into a late acceptance test after most of the expensive build. `[verified contradiction; severity CRITICAL; confidence 0.99]`

The smallest repair does not alter any frozen concept: split native verification into an **early feasibility gate before M1** and retain M5 as the **final deployed clean-session re-verification**. This is implementation-local because it restores the already approved design rather than changing product scope.

## 3. Hard-fail screen

No frozen concept inherently requires fake native behavior, fabricated proof, publisher-side contradiction arithmetic, unsafe mutation, or inaccessible content. Therefore none is rejected on proposal alone.

However:

- A1 cannot be executed under the current module order without first repairing the M5 sequencing conflict.
- A2 is ineligible as the primary plan; its frozen mechanism explicitly activates only after the A1 frame experiment fails in the exact browser.
- A3 is not a substitute for A1; it assumes the native topology has already been decided.
- B1, B2, and B3 remain experience hypotheses. None can compensate for an H1/H2/H9 failure.

### Current hard-gate state

| Gate | Status | Arbiter evidence |
| --- | --- | --- |
| H1 | `PARTIAL / OPEN` | Native source path exists; exact-browser observation absent. |
| H2 | `OPEN` | No two-origin browser trace or documented failed-frame/sequential result. |
| H3 | `PARTIAL / OPEN` | Contract evidence contains no conclusion; publisher tool inventory/result inspection absent. |
| H4 | `OPEN` | No captured external-agent prompt. |
| H5 | `OPEN` | No ordered external-agent trace. |
| H6 | `OPEN` | No confirm/reject browser behavior. |
| H7 | `OPEN` | No shared action implementation or parity test. |
| H8 | `OPEN` | No agent-free reload evidence. |
| H9 | `PARTIAL / OPEN` | Abort behavior passes in a fake context; no fresh native observation or intact human product. |
| H10 | `PARTIAL / OPEN` | Registration error path exists; no persistence/tool-execution false-success test in a browser. |
| H11 | `OPEN` | No live URL, public repository, instructions, or license. |
| H12 | `OPEN` | No final video artifact. |

**Hard-gate verdict:** `0 PASS / 4 PARTIAL / 8 OPEN`. No concept is releasable.

## 4. Evidence-bounded concept scorecard

The arbiter preserves the boards' evidence-bounded dimension ratings. It applies the collaboration rule consistently across both boards: the required division of labor is specified, but no demonstrated loop exists. Therefore the current-evidence collaboration deduction is `-10` for every concept. Missing evidence is not evidence that the final design lacks collaboration; the deduction disappears when the indispensable agent and human actions are observed.

No additional `-15` ablation deduction is applied yet because the exact no-tools agent behavior is unknown. The risk is load-bearing and must be tested immediately: the human page remains usable, so the agent may complete through ordinary browser interaction even when publisher tools are absent.

| Frozen concept | Historical WebMCP /30 | Historical Execution /30 | Historical Impact /20 | Historical Creativity /20 | Historical raw | Ceiling | Ablation | Collaboration | Stale total | Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |
| A1 — Native Gate Ladder | `2/5 = 12` | `1/5 = 6` | `1/5 = 4` | `1/5 = 4` | 26 | Active; no effect | `0`, unknown | `-10` | **16** | low (`0.42`) |
| A2 — Sequential Provenance Relay | `1/5 = 6` | `1/5 = 6` | `1/5 = 4` | `1/5 = 4` | 20 | Active; no effect | `0`, unknown | `-10` | **10** | low (`0.35`) |
| A3 — Transaction Proof Ledger | `2/5 = 12` | `1/5 = 6` | `1/5 = 4` | `1/5 = 4` | 26 | Active; no effect | `0`, unknown | `-10` | **16** | low (`0.45`) |
| B1 — Evidence Hearing | `2/5 = 12` | `1/5 = 6` | `2/5 = 8` | `1/5 = 4` | 30 | Active; no effect | `0`, unknown | `-10` | **20** | low (`0.38`) |
| B2 — Reproducibility Receipt | `2/5 = 12` | `1/5 = 6` | `2/5 = 8` | `1/5 = 4` | 30 | Active; no effect | `0`, unknown | `-10` | **20** | low (`0.38`) |
| B3 — Reversible Lens | `2/5 = 12` | `1/5 = 6` | `2/5 = 8` | `1/5 = 4` | 30 | Active; no effect | `0`, unknown | `-10` | **20** | low (`0.38`) |

### Cap and adjustment findings

- **60-point ceiling:** active for every concept because no visible shared human interface or native run exists. No numerical effect because all raw scores are below 60.
- **Ablation:** unresolved, not passed. The current locked phrase that the agent “cannot complete” without WebMCP is stronger than the evidence supports. A successful ordinary-browser fallback would trigger `-15` and require a narrower public claim.
- **Collaboration:** `-10` applied to current evidence. The frozen designs describe indispensable roles; observation can remove the deduction.
- **Measurement cap:** active. Execution is `1/5`, already below the `3/5` cap. `OPENAI_EVALS_ADAPTATION.md` is an evaluation architecture, not measurement results.
- **Variance:** frozen evidence scores cannot distinguish B1/B2/B3 at all and cannot distinguish A1/A3 numerically. Ranking by score alone is invalid.

## 5. Seven-lens current-artifact review

Each lens scores the same current artifact package, not an imagined completed concept. Evidence references are shared: native contracts/tests (`C`), approved design/scope (`D`), absent runnable app/browser/deployment (`U`), and evaluation architecture without records (`V`).

| Lens | WebMCP /5 | Execution /5 | Impact /5 | Creativity /5 | Raw /100 | Current collaboration-adjusted /100 | Confidence | Decisive evidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Sarah Drasner — browser UX/platform | 1.5 `[C,U]` | 1.0 `[U,V]` | 2.0 `[D,U]` | 2.0 `[D,U]` | 31 | **21** | 0.86 | Distinct experience thesis, no observable interface/accessibility/motion. |
| Andrew Galloni — open web/publisher incentives | 2.0 `[C,D,U]` | 1.0 `[U,V]` | 1.5 `[D,U]` | 1.5 `[D,U]` | 30 | **20** | Origin/provenance intent is strong; deployability, trust, and incentives are unproven. |
| Alex Nahas — protocol correctness | 2.0 `[C,U]` | 1.0 `[U,V]` | 1.0 `[D,U]` | 1.0 `[D,U]` | 26 | **16** | Native adapter is real source; browser semantics, Permission Policy, topology, and lifecycle observation are absent. |
| Ilya Grigorik — value/performance/semantics | 1.5 `[C,U]` | 1.0 `[U,V]` | 1.5 `[D,U]` | 1.0 `[D,U]` | 25 | **15** | Specific semantics, zero before/after performance or task evidence. |
| Jude Gao — evals/implementation | 1.5 `[C,U]` | 1.0 `[C,U,V]` | 1.0 `[D,U]` | 1.0 `[D,U]` | 23 | **13** | Tests and eval architecture exist; no JSONL cases, browser evals, CI, build, deployment, or failure taxonomy. |
| Sean Roberts — AX/reliability | 1.5 `[C,U]` | 1.0 `[U,V]` | 1.5 `[D,U]` | 1.0 `[D,U]` | 25 | **15** | Discoverability/authority/recovery are specified, not observed. |
| Justin Rushing — browser task success/collaboration | 1.5 `[C,U]` | 1.0 `[U,V]` | 2.0 `[D,U]` | 1.5 `[D,U]` | 29 | **19** | Strong intended task and role split; no proof that WebMCP changes success or that the no-tools route fails. |

Median current artifact: `WebMCP 1.5 / Execution 1.0 / Impact 1.5 / Creativity 1.0`, raw **25/100**, collaboration-adjusted **15/100**. Lens totals range from 23–31 raw and 13–21 adjusted. The narrow spread reflects a shared evidence floor, not certainty about the finished product's quality.

## 6. Cross-board comparison without synthesis

### Node A

- **A1** is the only eligible immediate direction because it tests the highest-risk precondition before expensive build work.
- **A2** is a documented response to an observed A1 frame failure, not a peer architecture to choose speculatively.
- **A3** is a post-topology implementation discipline. It is valuable after A1 decides the browser route.

This is not a blend or rewrite. It respects the frozen entry conditions and sequencing already stated inside the cards.

### Node B

- **B1** best foregrounds publisher fact, agent inference, and human authority.
- **B2** best foregrounds reproducibility and the OpenAI-Evals-style evidence architecture.
- **B3** best foregrounds reversible adaptive presentation and the original VEDAXI interface thesis.

All three have identical evidence-bounded scores, no implemented experience, and plausible but different reputational/performance risks. The neutral arbiter cannot select among them from current evidence.

## 7. Finalist evidence discipline

### Node A weak finalist: A1 — Native Gate Ladder

- **Strongest evidence:** current native adapter and deterministic evidence contracts pass local unit/type checks.
- **Decisive assumption:** the exact target browser can expose, execute, attribute, and unregister the intended tools under a fresh agent observation.
- **Second-order downside:** a feasibility spike can consume schedule while leaving no finished human product, but deferring it is worse and violates the approved design.
- **Evidence that reverses selection:** native same-origin failure blocks the strategy; frame-origin failure activates A2 only if sequential evidence retention works.
- **Cheapest discriminating experiment:** one tool per origin, explicit cross-origin Permission Policy and `exposedTo`, generic prompt, captured inventory/results/origin, abort, fresh inventory, then fair no-tools browser fallback.
- **Arbiter confidence:** `0.91` that A1 is the correct immediate process direction; `0.35` that its simultaneous-frame hypothesis will pass.

### Node B weak finalist: B1 — Evidence Hearing

- **Strongest evidence:** the frozen evidence objects already separate publisher facts from the missing agent inference and human decision roles.
- **Decisive assumption:** the hearing frame clarifies authority without implying misconduct or hiding WebMCP.
- **Second-order downside:** it may make a deterministic fixture feel accusatory and reduce the broader adaptive-web story to a themed confirmation ritual.
- **Evidence that reverses nomination:** a blinded low-fidelity test shows B2 or B3 yields better authority attribution, WebMCP necessity, and lower misconduct inference.
- **Cheapest discriminating experiment:** the frozen Board B counterbalanced five-participant, 30-second, DOM-only storyboard test.
- **Arbiter confidence:** `0.38`; score ties and absent experience evidence prevent selection.

## 8. Decision

### Implementation-local direction selected

**Proceed only with A1's smallest exact-browser discriminating experiment.** Before doing so, repair the module gate ordering so native feasibility occurs before M1/M4; keep M5 as deployed final re-verification. This restores the approved architecture and does not need user selection.

If the simultaneous frame topology fails, record the failure and test A2 exactly as frozen. Do not choose A2 in advance. If native feasibility passes, use A3's shared transaction boundary as the next construction discipline; do not mistake it for a replacement for A1.

### `INSUFFICIENT EVIDENCE`

- Simultaneous frame topology versus sequential fallback remains evidence-dependent.
- B1 versus B2 versus B3 remains unresolved; do not lock or implement an experience frame beyond what the core functional vertical slice requires.
- The OpenAI-Evals architecture is directionally sound but has no versioned JSONL records or measurements yet; it earns no score increase.

### Choices requiring user selection

1. **Public counterfactual wording:** changing the locked claim from “the agent cannot complete the workflow” to the narrower “the agent loses the structured publisher capability route” changes a public product claim. The ablation experiment should produce evidence first; then the user must approve the final wording if the stronger claim fails.
2. **Experience frame:** selecting B1, B2, B3, or a synthesis changes public presentation and product meaning. Evidence is tied; user selection is required only if the project wants to lock a frame before the proposed comprehension test.

No other user selection is required for the immediate A1 feasibility test or for restoring the approved module order.

## 9. Arbiter verdict

**Current verdict: REJECT as a submission artifact; WEAK A1 implementation-local finalist; INSUFFICIENT EVIDENCE for topology and experience.**

Minimum evidence for the next verdict:

1. exact target browser identity and native same-origin lifecycle;
2. correct cross-origin delegation plus provenance, or a recorded failure and sequential trace;
3. fair WebMCP-off ablation with ordinary browser abilities retained;
4. prompt/tool-order evidence proving semantic discovery and independent derivation;
5. one clean DOM-only shared-action mutation/reload/failure loop;
6. first versioned eval records with deterministic results, not only the eval architecture.
