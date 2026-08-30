# M0 Dual Delphi — Neutral Arbiter

**Arbiter:** Sub Agent 10 // Delphi Arbiter  
**Date:** 2026-08-31  
**Boards reviewed:** `m0-node-a.md` and `m0-node-b.md` (`FROZEN`; neither board was revised)  
**Decision:** **REPAIR**  
**Confidence:** `high` (`0.90`) on the exit decision; `medium` (`0.68`) on the M1 experience ordering

## Bounded decision

M0 is a technically healthy source foundation, but it does not yet have an honest, reproducible exit package. The source suite, type check, probe builds, and deterministic evaluator replay pass. The checked-in browser bundle, however, contains summaries that claim raw DOM snapshots, browser notifications, and a clean-room trace are retained when those underlying artifacts are absent. Under the project evidence hierarchy, those browser events are **provided**, not independently **verified**.

The sequential topology remains the correct working selection because simultaneous frame discovery is explicitly recorded as a failure and no competing supported topology is evidenced. It is not yet an exit-quality native-browser PASS. A fresh, artifact-bound rerun is required before M0 may exit.

This decision does **not** move full return navigation, derivation, shared actions, persistence, a populated cross-origin passport, or the final kill-switch proof into M0. Those are later-module contracts and experiments. M0 repair must remain small.

## Authority and evidence basis

The [Official Rules](https://webmcp.devpost.com/rules) were rechecked on 2026-08-31. Stage Two still uses four equally weighted criteria: WebMCP Leverage, Execution, Potential Impact, and Creativity & Ambition. The rules also distinguish a complete, coherent product experience from a technical proof of concept.

Evidence was ranked as follows:

1. Current executable source/test/eval result.
2. Retained raw browser observation bound to an exact artifact/environment.
3. Checked-in structured record or contemporaneous trace.
4. Reconstructed narrative or reviewer report (`provided`).
5. Inference or forecast.

On the current working tree, the arbiter reran:

| Check | Result |
| --- | --- |
| `npm test` | PASS — 5 files, 35/35 tests |
| `npx tsc --noEmit` | PASS — no diagnostics |
| `npm run build:probe` | PASS — paper and video production builds |
| `npm test -- packages/contracts/src/m0-evals.test.ts` | PASS — 2/2 tests; all eight v2 cases dispatched |
| Git identity | Base `d31ca363f35e537aedc9a8c1528bf3bc618dcfcd`; materially uncommitted tree |

## Hard-gate arbitration

| Gate | Current M0 decision | Arbitration |
| --- | --- | --- |
| H1 native `document.modelContext` | **BLOCKED for M0 exit; source precursor PASS** | The native-only source path and absence of a production fallback are verified. Native browser activation is only provided because the referenced raw observations are absent. |
| H2 two origins / sequential fallback | **BLOCKED for M0 exit** | Simultaneous discovery remains a recorded FAIL. Sequential is the selected topology, but its clean-room browser execution needs a retained, bound rerun. It does not need the final return-and-derive journey in M0. |
| H3 publisher evidence only | **PASS for M0 contracts/probes** | Source, tests, fixtures, and deterministic evals omit contradiction/discrepancy reasoning and `34`. |
| H4 generic job prompt | **PASS for prompt text; execution provenance BLOCKED** | The checked-in prompt contains no tool names. The claim that the agent received only that prompt and used native calls rather than DOM extraction is not independently retained. |
| H9 kill switch | **NOT YET APPLICABLE as a full hard gate; removal precursor PASS at source level** | M0 can prove registration-removal feasibility and human probe survival. It cannot pass H9 until M5 also proves the persisted note remains usable under a fresh observation. |
| H10 truthful failures | **PASS for M0 source scope; full product N/E** | Unsupported, empty, registration rejection, cancellation, disable, and sanitized probe failure behavior are tested. Persistence/action failure truth belongs to M3/M5. |
| H5–H8, H11–H12 | **N/E for M0** | These require derivation, confirmation, shared action/persistence, deployment, or submission evidence owned by later modules. |

Node B's browser observations labeled `[verified]` are therefore downgraded to `[provided]`. Node A correctly identified the evidence problem, but its return-and-derive, receipt, and state-machine proposals are not all M0 exit requirements.

## Official score of the artifact that exists now

This is a diagnostic score, not a forecast and not an M0 module gate.

| Official dimension | Score | Weighted | Confidence | Evidence-bounded basis |
| --- | ---: | ---: | --- | --- |
| WebMCP Leverage | 2.5/5 | 12.5/25 | medium | Native-only contracts and meaningful two-origin intent exist; the decisive browser route is not retained as raw proof. |
| Execution | 2.2/5 | 11.0/25 | medium | Tests/builds are strong, but the visible artifact is a probe and the browser record is non-replayable. The measurement cap applies. |
| Potential Impact | 1.8/5 | 9.0/25 | high | The integrity job is specific, but no consequential human decision is demonstrated. |
| Creativity & Ambition | 1.0/5 | 5.0/25 | high | The Semantic Focus Shift is a written intention, not implemented behavior. |
| **Raw total** |  | **37.5/100** |  |  |
| Collaboration deduction |  | **−10** | high | No observed workflow yet makes the external agent and human decision-maker jointly indispensable. |
| WebMCP ablation deduction |  | **0** | medium | Removing WebMCP breaks the implemented agent capability in source; the exact-browser ablation still needs later proof. |
| **Adjusted current score** |  | **27.5/100** | medium | Plausible interval `24–40`; below the 60-point ceiling regardless. |

### Seven judge lenses

Lens totals below are sensitivities on the same 100-point frame **before** the common `−10` collaboration deduction.

| Lens | Total | Decisive concern |
| --- | ---: | --- |
| Alex Nahas | 48 | Good native contract mechanics; missing raw native proof and versioned cancellation eval coverage. |
| Jude Gao | 39 | Strong local determinism; weak replayability, environment binding, and exit evidence. |
| Sean Roberts | 41 | Clear evidence-only authority; lifecycle meaning and production recovery remain incomplete. |
| Justin Rushing | 32 | Sequential success is plausible but not retained as a complete collaborative run. |
| Sarah Drasner | 23 | Diagnostic UI exists; human–agent clarity, accessibility proof, and semantic transition do not. |
| Andrew Galloni | 28 | Independent publishers are promising; deployability and publisher incentive are not demonstrated. |
| Ilya Grigorik | 31 | Provenance shape is useful; continuity, runtime binding, performance, and user value are unproven. |

**Variance:** `25` points (`48 − 23`). The load-bearing disagreement is mechanics versus judgeable human experience; it must not be hidden by the average.

## Exact repairs required before honest M0 exit

These are exit-critical. Completion of all seven permits a new exit review; it does not automatically grant PASS.

1. **Repair the browser evidence truth and rerun.** Rename the current file from “Raw Run Narrative” or clearly mark it reconstructed; remove every unsupported `retained`, `verified`, clean-room, and no-DOM-substitution assertion until backed. Run one fresh target-client M0B session and retain sanitized raw/exported artifacts for paper active/inventory/call/result, framed-video unsupported and one-tool inventory, direct-video active/inventory/call/result, disable followed by fresh zero inventory, and the clean-room dispatch/final response. Private chain-of-thought, secrets, and ephemeral session IDs remain excluded.
2. **Bind the rerun to one immutable artifact state.** Prefer a clean commit SHA. If the run must use an uncommitted tree, retain a content-addressed patch/source archive plus SHA-256, lockfile hash, built-asset hashes, exact commands, origins, and clean/reset state. A base commit plus the phrase “uncommitted tree” is not enough to prove which JavaScript was observed.
3. **Correct H9 mappings.** Remove full H9 PASS credit from M0 manual cases and the matrix. Name the assertions `H9 removal-feasibility precursor`; keep full H9 `N/E` until M5 proves fresh zero inventory while the human page and persisted note both remain usable.
4. **Version cancellation coverage.** Preserve `vedaxi.contracts.dev.v2` unchanged. Add the next versioned contract manifest/dataset and deterministic dispatch for the public `cancelled` status and `lifecycleSignal` behavior: already-aborted short circuit, pending registration cancellation, active external abort, cleanup/idempotence, and truthful current UI state. Record downstream impact on C01/C02/C05.
5. **Install a real checked-in manual-registry validator.** It must check schema/required fields, unique IDs, manifest/case parity and order, `eval_id`, allowed top-level and nested statuses, evidence-path existence, and gate/status consistency. Point `validation_command` to it. It validates registry integrity, not the truth of browser behavior.
6. **Resolve architecture/governance drift.** Narrow M0 to evidence/search/native-registration contracts and assign shared action/result/audit vocabulary to M3, which already owns shared actions, mutation, persistence, reset, and audit behavior. Update the stale gap ledger to mark resolved package-root exports, runtime input validation, disabled state, R0–R4 naming, and deterministic/manual evaluator routing as resolved. Explicitly state that official scoring is diagnostic for internal foundation modules; the `85/100`, every-dimension-`4/5` product-quality release gate applies at the judgeable M5 product exit (and final submission review), while each earlier module exits on its scoped hard gates and evidence. This removes the current circular deadlock without weakening final release.
7. **Create `docs/evidence/M0/exit-record.md` last.** Include contract/eval versions, UTC status, immutable artifact binding, commands/environment/origins/reset state, exact evidence paths, expected/observed decisions, reviewer roles, verified/provided/inferred/unknown labels, simultaneous FAIL, sequential selection, exact-client/screenshot blocks, repair ownership, and downstream invalidation/reverification obligations. It must not call M0 PASS until repairs 1–6 have been independently checked.

## Items that must not block M0

| Request or gap | Owner | M0 boundary decision |
| --- | --- | --- |
| Paper → video → paper return and agent derivation `40 − 6 = 34` | M5, with product surfaces from M1–M4 | Do not require for M0. M0 proves retrieval/topology feasibility only. H5 remains future evidence. |
| Full sequential protocol state machine, stale receipt handling, reordered calls, navigation failure | M5 ordered trace; M1 may define UI-facing departure/return labels | Do not put an external-agent orchestrator in the publisher contract. Pre-register the trace cases later. |
| Origin-bound receipt/digest or canonical serialization | M1/M2 contract experiment, validated end to end in M5 | Current M0 needs provenance fields, not a cryptographic-looking receipt. Derive each publisher's `sourceOrigin` from its runtime origin when the real origin modules are built; test mismatch then. A client-side digest must never be described as publisher authentication. |
| `exposedTo` normalization/allowlist policy | M1/M2/M5 adapter review | Current constant probe use is adequate for M0. Validate real deployment origins at the owning adapters. |
| Shared action/result envelopes and audit-event vocabulary | M3 | Explicitly move out of M0; do not widen the protocol foundation. |
| Human confirmation/rejection, persistence/reload, reset, write-failure rollback | M3, integrated in M5 | H6–H8 and product H10 are later gates. |
| Populated Evidence Passport across two real origins | M2/M5 experiment | M1 may show an empty/departure state, but must not preload or fake video-owned evidence. |
| Exact client version/build | M0 record as `BLOCKED` if genuinely unavailable; reattempt in M5 | Do not invent a value and do not block M0 if the product does not expose one and the client identity plus artifact-bound raw observation are otherwise adequate. |
| Screenshots | Optional corroboration in M0; required visual proof later where mapped | Absence alone does not block M0 if exported DOM/tool inventory/call-result artifacts prove the scoped behavior. Capture them if cheaply available. |
| Deployed HTTPS parity, full collaboration/ablation, persisted-note kill switch | M5 | These are release-critical, not M0-critical. |

## M1 direction

**Protocol direction:** retain **sequential** as the selected topology, subject to the bound M0 rerun. Adopt Node A's **Replay Capsule** as the M0 evidence repair, not as product scope. Do not implement Node A's full Sequential Protocol State Machine in M0.

**Experience direction:** build **B2 — Paper Integrity Desk** as the M1 implementation priority. Use **B1 — Evidence Passport** only as a thin continuity hypothesis and pre-registered experiment: Paper may show the mission, Paper-owned evidence, an empty Video slot, departure intent, and a future return state, but it must not claim carried Video evidence before M2/M5 actually supplies it.

This reverses Node B's finalist ordering for implementation sequence, not its core insight. B1 spans multiple origins and risks producing a scripted progress rail before the underlying route exists. B2 fits M1's actual module claim, strengthens tools-off usefulness, and gives the later Passport something credible to connect.

### Cheapest M1 discriminating experiment

Create low-fidelity DOM-only first-view variants for:

- Paper Integrity Desk alone; and
- Paper Integrity Desk plus a minimal empty/departure Passport.

Show each in counterbalanced order to five unbriefed judge proxies for 30 seconds. Require at least 4/5 to identify the Paper claim and provenance, the missing Video evidence, the current owner of each fact, and why WebMCP adds value. Reject the Passport treatment if it causes any participant to believe Video evidence is preloaded, copied into Paper, signed/authenticated, or already verified.

## Reversal evidence

- A newly located, intact raw trace that is hash-bound to the recorded M0B artifact could remove the need to repeat the corresponding browser steps, after independent validation.
- A fresh exact-client run that cannot retain the first structured result across top-level navigation would reverse the sequential topology selection and block M1 implementation pending a new supported topology decision.
- Robust simultaneous two-origin discovery in the target client would reopen the topology choice; it must not silently overwrite the recorded simultaneous failure.
- Evidence that moving action/audit contracts to M3 creates an unavoidable M1/M2 public-contract dependency would reopen the boundary decision. No such dependency exists in the current architecture.
- A blinded M1 comprehension test in which the minimal Passport materially outperforms the Desk without creating false ownership would promote B1 from experiment to primary experience frame.
- A change to the Official Rules would require rescoring; it would not retroactively turn missing artifacts into evidence.

## Final ruling

**REPAIR.** The ranking uncertainty between B1 and B2 does not require returning `INSUFFICIENT EVIDENCE` for the M0 exit decision: the exit defects and their bounded repairs are known. The M1 experience choice is provisional and explicitly falsifiable. Do not begin M1 product implementation until the seven M0 repairs are completed and an independent exit record changes the module status to PASS.

**FROZEN ARBITRATION — neither node board was rewritten.**
