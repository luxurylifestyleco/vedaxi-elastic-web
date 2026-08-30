# M0 Dual Delphi — Node A Frozen Board

**Node:** Sub Agent 8 // Protocol Delphi  
**Question:** How can the M0 proof become easier to reproduce, harder to fake, safer to operate, and faster for a judge to understand?  
**Frozen:** 2026-08-31  
**Recommendation:** **REPAIR — do not approve M0 exit or begin M1 product implementation yet.**

## Isolation statement

This board was produced from `DELPHI_PROTOCOL.md`, `VEDAXI_RUBRIC.md`, `MODULE_ARCHITECTURE.md`, the M0 evidence folder, M0 eval manifests/data, current M0 source/tests, and the live [WebMCP Challenge Official Rules](https://webmcp.devpost.com/rules). I did not read an M0 Node B output or a future arbiter output. Frozen baseline Delphi files were not used as current evidence.

The official source was rechecked on 2026-08-31. It still states that WebMCP Leverage, Execution, Potential Impact, and Creativity & Ambition are equally weighted. It also requires a working live URL accessible in the ChatGPT in-app browser or enabled Chrome, a public licensed repository, and a public under-three-minute demo with audio.

## Executive finding

M0 has a credible deterministic contract foundation and a plausible native sequential topology, but the retained evidence cannot yet support an irreversible exit decision.

- **Verified:** the allowed test command passes `35/35`; the paper and video probe production builds succeed; source directly reads `document.modelContext`; unsupported/empty/error/cancelled/disabled states exist; registration uses a shared abort signal; query input is bounded and rejects extra properties; results retain evidence ID, locator, origin string, excerpt, and provenance; publisher results omit contradiction/discrepancy/`34`; package-root exports work.
- **Verified:** the official rules still use equal `25/25/25/25` criteria. The local rubric is current on this point.
- **Verified:** the retained M0B record explicitly marks simultaneous cross-origin-frame discovery `FAIL`, selects sequential navigation, marks exact client version/build `BLOCKED`, marks screenshots `BLOCKED`, and says the run was local and does not prove deployment parity.
- **Verified:** the browser manifest is deliberately non-executable (`command: null`) and identifies the tested tree only as an uncommitted tree at base commit `d31ca363...`. The current repository is still based on that commit but has modified and untracked M0 files. No patch hash, source bundle hash, built-asset hash, or raw trace hash binds the retained observations to today's files.
- **Inferred, not independently verified:** a clean-room external agent really discovered and invoked both native tools in sequence, and fresh observations really showed abort-driven removal. The repository contains a careful narrative and matrix, but not the underlying DOM snapshots/browser notifications or a replayable trace.
- **Unknown:** whether the same behavior holds in the exact current client build, after a clean restart, from a clean checkout, or on two deployed HTTPS origins.
- **Unknown:** whether a full external agent can retain trustworthy evidence across navigation, return to the paper origin, derive `34` only after both calls, and then participate in the required human confirmation/mutation workflow.

The strongest technical concern is not that sequential navigation is inherently invalid. It is that sequential navigation makes **carry-forward state** load-bearing. The protocol currently proves source-owned objects at each page, but it does not define a durable, verifiable receipt that survives origin changes without being confused with agent memory, stale content, or a self-asserted `sourceOrigin` string.

## Current M0 score under the official criteria

This is a score of the artifact that exists now, not a forecast of the planned product.

| Official dimension | Score | Weighted | Confidence | Basis |
| --- | ---: | ---: | --- | --- |
| WebMCP Leverage | 3.0/5 | 15.0/25 | medium | Native source path and documented two-origin sequential discovery are material. Simultaneous discovery failed; raw native evidence and deployed parity are absent. |
| Execution | 2.5/5 | 12.5/25 | medium | Tests and builds pass, but the browser run is manual/non-replayable and the final workflow, persistence, recovery, and deployment do not exist. The evidence cap prevents more than 3/5. |
| Potential Impact | 2.0/5 | 10.0/25 | medium | The research-integrity job is specific, but M0 only shows two evidence lookups, not the consequential discrepancy workflow. |
| Creativity & Ambition | 1.5/5 | 7.5/25 | medium | Independent publisher evidence and lifecycle control are promising, but no Semantic Focus Shift or distinctive product behavior exists yet. |
| **Subtotal** |  | **45.0/100** |  |  |
| Collaboration deduction |  | **−10** | high | The retained run separates agent retrieval from human lifecycle controls; it does not show one workflow in which both are indispensable. |
| WebMCP ablation deduction |  | **0** | medium | If the documented native observations are trusted, removing WebMCP breaks the agent route while the human route survives. Because the raw trace is unavailable, this remains less auditable than it should be. |
| **Provisional total** |  | **35/100** | medium | Plausible interval `30–50`; well below the `85` release threshold and with dimensions below `4/5`. |

This low official score is expected for a foundation module, but it exposes a governance contradiction: the architecture forbids M1 work before M0 exits, while the rubric requires every milestone to score at least `85/100` with no dimension below `4/5`. M0 cannot demonstrate a complete experience or Semantic Focus Shift without implementing later modules. Either “M0 exit” means a module-local gate with the official score recorded but not release-blocking, or the current build sequence deadlocks. That interpretation must be resolved explicitly; it must not be silently waived.

## Applicable hard-gate board

| Gate | Status | Confidence | Finding |
| --- | --- | --- | --- |
| H1 native `document.modelContext` | **PROVISIONAL PASS** | medium | Direct native source path is verified and no fallback exists. Browser activation is documented, but the raw observation is not retained/replayable and deployment is untested. |
| H2 two origins or exact-browser sequential fallback | **PROVISIONAL PASS** | medium | Separate localhost origins and the sequential decision are explicit. The browser result is narrative evidence from an unidentified build; carry-forward provenance is not yet defined. |
| H3 publisher evidence only | **PASS for M0 fixtures** | high | Source/tests and recorded results omit contradiction, discrepancy, and `34`. This does not yet prove future M1/M2 factories. |
| H4 prompt contains job, not tool names | **PROVISIONAL PASS** | medium | Exact clean-room prompt is retained and contains no names; original agent trace is not retained. |
| H9 lifecycle removal | **PROVISIONAL PASS** | medium | Abort behavior is strongly unit-tested and browser removal is documented. Exact client/build replay remains missing. |
| H10 truthful failure state | **PASS at contract/probe level** | high | Unsupported, empty, rejection, cancellation, idempotent disable, and sanitized error paths are tested. Persistence/tool-execution failure behavior belongs to later modules and is unknown. |
| H11 live deployment/public repository | **NOT APPLICABLE TO M0 EXIT under architecture; UNKNOWN for product** | high | The official rules require it eventually. No deployment parity exists, so M0 observations must not be generalized to a submitted system. |

## Security, provenance, lifecycle, and drift challenges

1. **Runtime-origin binding is missing.** `EvidenceObject.sourceOrigin` is an unconstrained string, and probe fixtures hardcode `http://localhost:4173`/`:4174`. A deployed build can therefore report localhost or another incorrect origin unless each later module replaces the constant correctly. The runtime page displays declared and actual origins, but tool output does not enforce equality.
2. **`exposedTo` is pass-through authority.** The shared registration function accepts arbitrary strings and forwards them to the native API without normalization, scheme validation, or an allowlist invariant. Current callers use constants, but the public contract does not prevent a later module from widening exposure accidentally.
3. **Output provenance is shape-only.** Input is validated at runtime; evidence output is not. There is no canonical serialization, contract version, digest, or runtime assertion binding `id + origin + locator + excerpt + provenance` as one receipt.
4. **Sequential state is underspecified.** The retained agent report shows navigation from paper to video, but not the return trip, stale-result handling, duplicate calls, origin change mid-run, tool removal between calls, or evidence invalidation.
5. **Lifecycle naming can mislead consumers.** After disable, `registrationStatus` remains the historical value `registered` while `uiStatus` becomes `disabled`. This can be sound, but the contract does not state that one is historical and the other current; downstream code could display the wrong field.
6. **Evidence/source drift is possible.** The browser run names a base commit plus “uncommitted M0B tree.” The M0 files are still uncommitted and no patch/artifact hash was captured. A later reviewer cannot prove that the observed JavaScript equals the current JavaScript.
7. **The manual registry validates formatting, not truth.** Its validation command checks JSON parsing and allowed status labels. It cannot replay or falsify a claimed browser `PASS`.
8. **Deployment parity is absent.** Local HTTP loopback can be a secure context and behave differently from independently deployed HTTPS origins, CSP/Permissions Policy, redirects, caches, service workers, and target-client origin exposure.

## Three mechanically distinct strategies

### A — Replay Capsule

| Field | Board entry |
| --- | --- |
| ID/name | A / Replay Capsule |
| Judge problem | A judge cannot independently replay the current native claims or bind them to an exact artifact/client. |
| Protocol promise | Every native `PASS` can be reproduced from one immutable source state and one explicit client/environment record. |
| Implementation mechanism | Freeze a clean commit or content-addressed patch; record lockfile hash and built-asset hashes; add a step-by-step two-origin runbook; retain raw browser observations, tool inventories, prompt/call/results, console/network summary, and screenshots; use explicit `PASS/FAIL/BLOCKED`. |
| Proof/risk control | Raw evidence is additive and content-addressed. A failed replay replaces no earlier result; it opens a new run record. No missing version is guessed. |
| Golden path | Clean checkout → install/build → launch both origins → fresh client → paper discover/call → navigate video → discover/call → disable/fresh inventory → re-enable → retain artifacts. |
| Primary metric | Independent clean-session replay succeeds once with all artifact hashes matching. |
| Guardrail metric | Zero unbound `PASS` claims; zero screenshots or logs presented as coming from another build. |
| Decisive assumption | The target client can expose enough stable identity/observation metadata to make a run meaningfully reproducible even if an exact semantic version remains unavailable. |
| Cost | Low–medium; mostly evidence harness and one fresh browser run. |
| Failure mode | Produces a polished dossier that still cannot be rerun by another operator or identify the client sufficiently. |
| Projected official score | `45/100` after collaboration deduction; it hardens Execution but does not create the later product experience. |

### B — Origin-Bound Evidence Receipt

| Field | Board entry |
| --- | --- |
| ID/name | B / Evidence Receipt |
| Judge problem | In a sequential topology, agent memory is the only visible bridge between two origins; self-asserted origin strings can drift from runtime truth. |
| Protocol promise | Every carried evidence object is runtime-validated and bound to the publisher origin, locator, content, and contract version before it can participate in derivation. |
| Implementation mechanism | Add a minimal runtime validator and canonical receipt containing contract version, stable ID, `window.location.origin`, locator, excerpt, provenance, and deterministic digest. Reject declared/runtime origin mismatch. Treat the digest as integrity evidence, not publisher identity or cryptographic authentication. |
| Proof/risk control | Cross-origin tests mutate origin, locator, excerpt, version, and digest independently; each mutation must fail before comparison. No server, signing service, or fake cryptographic trust claim. |
| Golden path | Publisher creates validated origin-bound receipt → external agent retains it across navigation → second publisher returns its own receipt → derivation consumes two valid receipts only. |
| Primary metric | `100%` of origin/content mutation corpus rejected before derivation. |
| Guardrail metric | Receipt adds no contradiction label, derived `34`, user data, secret, or cross-origin shared application state. |
| Decisive assumption | A deterministic integrity receipt is sufficient for the demo's provenance claim; authenticated publisher identity is not being claimed. |
| Cost | Medium; contract versioning plus downstream impact note before M1. |
| Failure mode | Digest theater: judges infer authentication that a client-side digest cannot provide, or the receipt becomes needless schema weight. |
| Projected official score | `50/100` after collaboration deduction; strongest on provenance/WebMCP rigor, still not a complete experience. |

### C — Sequential Protocol State Machine

| Field | Board entry |
| --- | --- |
| ID/name | C / Sequential State |
| Judge problem | “Navigate to the other page and remember the result” is easy to demo once but hard to reason about under reload, abort, duplicate call, stale evidence, and return navigation. |
| Protocol promise | The sequential fallback has an explicit observable state model and fails closed when provenance or lifecycle changes. |
| Implementation mechanism | Define the smallest state trace: `paper-discovered → paper-received → video-navigation → video-discovered → video-received → paper-return → ready-to-derive`; attach origin/evidence receipt at receive states; invalidate downstream states on origin mismatch, reload without retained receipt, tool removal, changed evidence ID, or call failure. Keep simultaneous discovery as a recorded failed capability, not a hidden retry path. |
| Proof/risk control | Deterministic transition tests cover duplicate calls, reordered calls, navigation failure, abort between evidence calls, stale receipts, and clean restart. Browser replay proves the same trace without hardcoded tool names. |
| Golden path | Generic job → dynamic paper discovery/call → visible navigation → dynamic video discovery/call → return → external derivation → later human confirmation. |
| Primary metric | Ordered trace passes with both exact results before derivation and zero illegal transitions. |
| Guardrail metric | Zero publisher-side comparison, zero copied cross-origin evidence, zero silent simultaneous/direct-call fallback. |
| Decisive assumption | The target external agent retains structured results and task intent across top-level navigation reliably enough for the full workflow. |
| Cost | Medium; state contract/test work plus exact-client replay. |
| Failure mode | The protocol becomes a publisher-orchestrated workflow that hardcodes the agent path and weakens dynamic WebMCP discovery. |
| Projected official score | `55/100` after collaboration deduction; best mechanics finalist, but still below release quality until later modules supply the product. |

## Frozen Node A finalist

**Finalist: C — Sequential Protocol State Machine (`WEAK FINALIST`, projected `55/100`).**

It addresses the most load-bearing architectural choice rather than merely documenting it. Strategy A is the required evidence repair that must accompany any selected mechanism; it is not, by itself, a safer protocol. Strategy B is valuable only if kept to runtime binding and deterministic integrity—cryptographic or server-backed identity would be overbuilt for this deadline.

- **Strongest evidence:** the simultaneous topology was actually recorded as a failure while a single clean-room agent reportedly discovered exact, origin-owned evidence at both top-level origins in sequence; source/tests also prove no direct-call fallback and abort-driven removal.
- **Decisive assumption:** a supported external agent can preserve both structured evidence receipts and intent across navigation and return without hidden DOM extraction or publisher orchestration.
- **Most important second-order downside:** normalizing sequential navigation may produce a brittle, demo-specific ritual. Every added navigation is a point where tool inventory, page state, evidence freshness, or agent context can diverge, and it may feel less collaborative than simultaneous workspace behavior.
- **Evidence that would reverse the score:** a clean exact-client run showing loss/corruption of the first receipt after navigation; inability to return and derive from two source-owned results; a browser/API change that enables robust simultaneous discovery; or evidence that the state machine requires hardcoded tool names/publisher-side orchestration.
- **Cheapest discriminating experiment:** from a frozen current artifact, run one fresh exact-client session with a generic prompt that (1) discovers paper evidence, (2) navigates to video, (3) discovers video evidence, (4) returns to paper, and (5) outputs the two unmodified receipts plus `40 - 6 = 34`; then abort the current registration between steps 2 and 3 in a second run and verify a closed, truthful failure. Capture raw prompt/call/result/inventory artifacts, screenshots, console/network summary, client identity evidence, and artifact hashes.

## Seven judge lenses

| Judge lens | Current M0 | Confidence | Decisive observation |
| --- | ---: | --- | --- |
| Alex Nahas | 3.2/5 | medium | Clear native types, schemas, lifecycle, and no fallback; sequential protocol and runtime provenance contract remain underspecified. |
| Jude Gao | 2.3/5 | medium | Tests/builds are strong, but browser evidence is non-replayable and deployment readiness is absent. |
| Sean Roberts | 2.7/5 | medium | Generic discovery and truthful states are promising; authority of `exposedTo` and origin strings is not enforced at the public boundary. |
| Justin Rushing | 2.0/5 | medium | Reported native two-origin success exists, but no complete collaborative confirmation/persistence run exists. |
| Sarah Drasner | 1.8/5 | high | Human content and status controls exist, but no meaningful human–agent product experience, visual proof, or accessibility evidence beyond native controls. |
| Andrew Galloni | 2.3/5 | medium | Independent publisher ownership is an open-web strength; deployment, security invariants, and publisher-operable parity are unknown. |
| Ilya Grigorik | 2.4/5 | medium | Provenance fields and small payloads are sound starts; attribution is self-asserted and scalability/performance are unmeasured. |

**Lens spread:** `1.4/5` (Alex `3.2` vs Sarah `1.8`). The disagreement is load-bearing: protocol mechanics are materially ahead of judgeable human experience.

## Required repair before M0 exit

1. Resolve the governance deadlock: explicitly distinguish the M0 module-local exit gate from the final official `85/100` release threshold, or accept that M1 is not authorized.
2. Freeze the exact M0 source state with a commit or content-addressed patch and hashes for lockfile/build artifacts.
3. Repeat the browser experiment against that frozen state and retain raw evidence, including the full sequential **return-and-derive** path and one fail-closed interruption path.
4. Capture the exact client version/build if available; if unavailable, retain the strongest stable app/runtime identity and keep the field `BLOCKED` rather than inferring it.
5. Capture screenshots as corroboration, while keeping tool inventories/call results as the protocol evidence.
6. Bind evidence `sourceOrigin` to runtime origin and add runtime output validation; constrain `exposedTo` to normalized allowed origins.
7. State explicitly that `registrationStatus` is historical and `uiStatus` is current, or replace the ambiguous split before downstream consumers depend on it.
8. Record deployment parity as an explicit unresolved M5 risk; do not let localhost evidence imply HTTPS/CSP/Permissions Policy parity.

## Decision

**REPAIR.** The deterministic M0A work is strong enough to preserve. The selected sequential direction is plausible, honest about simultaneous-frame failure, and likely the cheapest route under the deadline. It is not yet safe to freeze as the foundation for M1 because the native observation is not artifact-bound or replayable, sequential carry-forward provenance is underspecified, and the current release rule conflicts with the sequential module gate.

**Reversal condition for approval:** approve M0 exit only after the frozen-artifact replay passes the return-and-derive and fail-closed experiments, runtime origin binding is enforced, and the authority clarifies how the official `85/100` threshold applies to a foundation module.

**FROZEN**
