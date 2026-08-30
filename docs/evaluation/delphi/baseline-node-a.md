# VEDAXI Dual Delphi Baseline — Node A

**Round:** Baseline: scope and architecture  
**Node:** A — Protocol Mechanics  
**Freeze status:** `FROZEN`  
**Question:** How can the proof become easier to reproduce, harder to fake, safer to operate, and faster for a judge to understand?

## Goal Command

| Field | Value | Provenance |
| --- | --- | --- |
| Product | VEDAXI, a publisher-side WebMCP research-integrity proof across paper and video origins. | provided |
| Audience | Elastic Web hackathon judges first; researchers, reviewers, and research publishers as the demonstrated ecosystem. | provided / inferred |
| Evaluation job | Select or reject an implementation strategy and identify the cheapest evidence that could falsify its claims. | provided |
| Desired outcome | A reproducible, browser-native golden workflow that is useful to humans, meaningfully better with WebMCP, and strong enough to be a finalist. | provided |
| Stage | Pre-launch build. | verified from the authorized repository artifacts |
| Channel | Deployed website, native WebMCP agent run, public repository, and sub-three-minute demo video. | provided |
| Current bottleneck | Native two-origin proof and a coherent end-to-end vertical slice do not yet exist. | verified from the authorized repository artifacts |
| Proof available | Approved design, challenge rubric, typed evidence and registration contracts, and contract tests. The tests were inspected but not executed in this isolated pass. | verified |
| Constraints | No publisher-side contradiction arithmetic; no fake fallback; human confirmation for consequential mutation; persistence; kill switch; accessibility; submission deadline. | provided / verified |

**Starting confidence:** `medium` for the intended product and rubric; `low` for native-browser and deployed behavior.

## Authorized evidence boundary

- `[verified]` `packages/contracts/src/webmcp.ts` reads `document.modelContext`, reports `unsupported` when absent, awaits native registration, shares an `AbortController` across registrations, and aborts registrations on disable or registration error.
- `[verified]` `packages/contracts/src/webmcp.test.ts` contains tests for unsupported behavior, awaited registration, origin exposure, JSON execution, and abort-driven removal. This pass did not execute them, so passing runtime status is `[unknown]`.
- `[verified]` `packages/contracts/src/evidence.ts` defines stable evidence fields including ID, source origin, locator, excerpt, keywords, and provenance, plus deterministic token-overlap search.
- `[verified]` `packages/contracts/src/evidence.test.ts` fixtures contain the exact paper `40` statement and video `six removed and did not replace` statement, and explicitly avoid inferring the analyzed sample in the video publisher result. This pass did not execute the test.
- `[unknown]` Exact-browser native WebMCP availability; cross-origin frame discovery; trustworthy origin display; one-agent use of two origins; fresh-observation removal; shared human/tool actions; focused confirmation; durable persistence; reset; failure UI; accessibility; deployed URL; public repository; and real demo recording.
- `[provided]` The approved design and build scope require a Semantic Focus Shift, but no implementation evidence for it exists in the authorized contracts package.

## Frozen strategy A1 — Native Gate Ladder

- **ID/name:** `A1 — Native Gate Ladder` `[inferred]`
- **Judge problem:** The highest-load-bearing claim—native discovery and execution across two origins in the exact judging browser—has no runtime evidence, so a polished interface could still conceal a non-native or single-origin route. `[verified / inferred]`
- **One protocol promise:** No full product claim advances past M0 until the exact browser records native registration, discovery, invocation, provenance, and abort-driven removal for the paper origin and the video origin; a failed simultaneous-frame check triggers only the documented sequential experiment, never a simulated substitute. `[provided / inferred]`
- **Implementation mechanism:** First build the smallest top-level paper page and cross-origin video frame around the existing `registerWebMcpTools` and `EvidenceObject` contracts. Register one open-query evidence tool per origin, use a prompt containing the user job but no tool names, record the tool inventory and ordered calls, abort the registrations, and request a fresh observation. Only after the matrix passes, build the shared actions, persistence, Semantic Stage, confirmation, negative paths, and submission surface in hard-gate order. `[inferred]`
- **Proof/risk control:** A versioned browser matrix records product, build, flags, origins, exposure policy, prompt, discovered capabilities, calls, results, provenance, and before/after kill-switch inventory. Every cell is pass, fail, or blocked; absence of support is shown as unsupported, not routed through direct calls. `[provided / inferred]`
- **Golden path:** Clean session → open paper origin with the independent video frame → give the generic methodology-comparison request → dynamically discover both origins → search/read exact paper and video evidence → agent derives `40 - 6 = 34` → compose by stable IDs → focused human confirmation → shared publisher mutations → agent-free reload proves the note and block → abort registrations → fresh observation finds no publisher tools while the human page remains usable. `[provided]`
- **Primary metric:** `8/8` exact-browser Phase 0 feasibility checks recorded as pass before M1 product claims are accepted. `[provided]`
- **Guardrail metric:** `0` simulated/native-confused calls, `0` publisher tool results containing a contradiction conclusion or `n=34`, and `0` prompt references to publisher tool names. `[provided]`
- **Decisive assumption:** The exact judging browser can surface and execute tools from the top-level paper origin and the cross-origin video frame in one task, with trustworthy origin provenance. `[unknown]`
- **Cost:** Medium relative build cost: one early browser spike plus the full scoped vertical slice; likely cheaper than discovering protocol incompatibility after the interface is built. Calendar duration and available delivery capacity are `[unknown]`; the relative cost judgment is `[inferred]`.
- **Failure mode:** Native WebMCP is unavailable, the frame cannot expose its tools, provenance is not trustworthy, or fresh observation retains removed registrations. Any of these blocks the simultaneous two-origin promise and prevents A1 from proceeding as written. `[unknown]`

## Frozen strategy A2 — Sequential Provenance Relay

- **ID/name:** `A2 — Sequential Provenance Relay` `[inferred]`
- **Judge problem:** A browser may support native WebMCP on the active page but not simultaneous discovery from a cross-origin frame; pretending otherwise would hard-fail, while abandoning the second origin would weaken the central proof. `[provided / inferred]`
- **One protocol promise:** If and only if the exact-browser frame experiment fails, the same external agent will visit each independent origin sequentially, dynamically discover each origin's tools, retain both exact evidence objects with origin provenance, return to the paper origin, and complete the human-controlled mutation without claiming simultaneous discovery. `[provided]`
- **Implementation mechanism:** Give the paper and video publishers separate native pages and registrations using the shared contracts. The agent begins at the paper, retrieves the paper object, navigates to the video, discovers and retrieves the transcript object, returns to the paper, derives the arithmetic outside publisher tools, requests composition, and invokes confirmed mutations. Each origin has its own registration lifecycle and before/after capability inventory. `[inferred]`
- **Proof/risk control:** The Phase 0 frame failure is retained as the explicit reason for fallback. The ordered trace includes visited URL/origin, fresh capability inventory, evidence ID, locator, excerpt, and provenance at each hop. The demo and documentation say `sequential`, never `simultaneous`; an aggregator or copied video result at the paper origin is forbidden. `[provided / inferred]`
- **Golden path:** Clean session → paper discovery/read → navigate to independent video origin → video discovery/read → return to paper → agent derives `34` → stable-ID focus → focused human confirmation → shared mutation → agent-free reload → disable paper registrations and show a fresh no-tools observation while the paper remains usable. `[provided / inferred]`
- **Primary metric:** `2/2` independent origins dynamically discovered and their exact evidence objects retrieved by one external-agent task before any discrepancy conclusion. `[provided / inferred]`
- **Guardrail metric:** `0` simultaneous-discovery claims, `0` evidence copied into the wrong publisher's tool result, `0` publisher-derived `34`, and `0` consequential mutation before focused confirmation. `[provided]`
- **Decisive assumption:** The exact agent session preserves the first origin's evidence and reasoning context through navigation and can return to the paper origin without losing the task state needed for composition and mutation. `[unknown]`
- **Cost:** Medium relative build cost. It reduces cross-frame exposure work but adds navigation choreography, per-origin inventory capture, and a harder sub-three-minute demonstration. Exact duration is `[unknown]`; the relative trade-off is `[inferred]`.
- **Failure mode:** Navigation clears the relevant agent context, the agent cannot rediscover tools reliably after an origin change, or the origin-hop choreography makes the proof too slow or confusing for judges. `[unknown / inferred]`

## Frozen strategy A3 — Transaction Proof Ledger

- **ID/name:** `A3 — Transaction Proof Ledger` `[inferred]`
- **Judge problem:** Even if native retrieval works, separate UI and tool code paths, optimistic success states, or transient state could make confirmation, persistence, reload, and recovery look real without proving that they are real. `[provided / inferred]`
- **One protocol promise:** Every consequential judge-visible state change will be produced by one typed publisher transaction boundary shared by human controls and WebMCP handlers, persisted before success is displayed, and represented by a provenance-bearing audit event that can be checked after an agent-free reload. `[provided / inferred]`
- **Implementation mechanism:** After the mandatory exact-browser M0 probe, extend the contracts with typed action/result and audit-event shapes; implement one paper-origin state interface with deterministic reset; route human and tool mutations through the same actions; require a focused confirmation token for citation blocking; commit the citation block and discrepancy note as one outcome or return a structured failure; render the Semantic Stage from committed evidence IDs and state; attach ordered trace assertions to each hard-gate transition. `[provided / inferred]`
- **Proof/risk control:** Contract tests enforce that tools return evidence rather than conclusions. Parity tests invoke each action through human and tool adapters. Negative tests inject persistence and execution failures and require unchanged citation state plus a recoverable error. Reload, reset, and kill-switch browser checks use the same fixture IDs and audit events. `[provided / inferred]`
- **Golden path:** Clean deterministic reset → native two-origin evidence retrieval using the topology proven at M0 → external derivation → evidence-ID composition → focused human confirmation → atomic block-and-note transaction → visible audit event → agent-free reload → persistent state and provenance rehydrate → registration abort/fresh observation → human inspect/reset remains available. `[provided / inferred]`
- **Primary metric:** One clean-session evidence bundle satisfies H1–H10 with ordered source/test/browser proof and no manual state repair between reset, mutation, reload, and kill-switch checks. `[inferred]`
- **Guardrail metric:** `0` divergent human/tool publisher-action implementations, `0` saved/blocked success states after a failed persistence operation, and `0` mutations on confirmation rejection. `[provided / inferred]`
- **Decisive assumption:** Browser-owned storage on the paper origin is durable and accessible across an agent-free reload in the exact in-app browser, and can support an atomic-enough block-plus-note outcome for this fixture. `[unknown]`
- **Cost:** High relative build cost because action contracts, storage, audit events, adapters, negative tests, and reload evidence must be completed together. It may reduce debugging and demo risk later, but exact calendar cost is `[unknown]`; the relative assessment is `[inferred]`.
- **Failure mode:** The persistence boundary cannot guarantee truthful block-plus-note results, shared adapters drift, or transaction/audit breadth consumes the deadline before native two-origin and human experience are judgeable. `[unknown / inferred]`

## Official evidence-bounded score

The scores below evaluate what the authorized current evidence proves, not what each strategy promises to build. The 0–5 official scale is weighted as `score / 5 × weight`. Execution is below the 3/5 measurement cap because no reproducible browser evidence was available. No hard fail is asserted from missing evidence alone, but every unevidenced hard gate remains open.

| Strategy | WebMCP leverage /30 | Execution /30 | Potential impact /20 | Creativity & ambition /20 | Adversarial adjustment | Current total | Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| A1 — Native Gate Ladder | 2/5 = 12 | 1/5 = 6 | 1/5 = 4 | 1/5 = 4 | 0; the ablation and collaboration are designed in but not yet demonstrated | **26/100** | low |
| A2 — Sequential Provenance Relay | 1/5 = 6 | 1/5 = 6 | 1/5 = 4 | 1/5 = 4 | 0; sequential native behavior and retained context are unverified | **20/100** | low |
| A3 — Transaction Proof Ledger | 2/5 = 12 | 1/5 = 6 | 1/5 = 4 | 1/5 = 4 | 0; shared actions and persistence are specified but absent from authorized source | **26/100** | low |

**Variance note:** The judge-lens spread is load-bearing rather than averaged away. Alex Nahas's protocol lens has a typed native-registration prototype to inspect; Jude Gao, Sean Roberts, and Justin Rushing still lack browser, state, recovery, deployment, and collaboration observations. Sarah Drasner's and Ilya Grigorik's presentation/interaction evidence is absent from the authorized source. Andrew Galloni's publisher/open-web thesis is specified but not deployed. `[verified / inferred]`

**Mandatory adversarial tests:**

- **Ceiling:** All strategies remain far below 60 on current evidence; no wrapper, responsive human UI, or live native route has been browser-verified. `[verified]`
- **WebMCP ablation:** The approved counterfactual is strong in intent, but the required fresh observation with zero publisher tools is `[unknown]`.
- **Collaboration:** Indispensable agent retrieval/derivation and human confirmation are `[provided]`; their working integration is `[unknown]`. No subtraction is applied because non-collaboration is not established, but no credit beyond claimed intent is granted.
- **Measurement cap:** Applied; Execution is `1/5` for all three strategies because the authorized evidence contains contracts, not a reproducible end-to-end product. `[verified]`
- **Hard-fail screen:** No strategy intentionally requires a fake fallback, fabricated proof, publisher-side arithmetic, or unsafe mutation. Actual H1–H12 passage is `[unknown]`.

## Node A finalist

### `WEAK FINALIST — A1: Native Gate Ladder — 26/100, low confidence`

A1 and A3 tie on evidence-bounded official score. A1 wins the Node A nomination because it attacks the current bottleneck and the approved design's highest-risk gate before the more expensive state and experience build. A3 remains the preferred post-M0 construction discipline if A1's native matrix passes; that does not revise either frozen card. `[verified / inferred]`

- **Strongest evidence:** The current contract implementation directly uses `document.modelContext`, passes origin exposure into awaited native registrations, returns truthful unsupported/error status, and uses a shared abort signal for removal; deterministic evidence objects keep source origin, locator, excerpt, and provenance attached. This is source evidence, not exact-browser evidence. `[verified]`
- **Decisive assumption:** The exact judging browser exposes and executes top-level and cross-origin-frame tools in one task with trustworthy provenance and refreshes the inventory after abort. `[unknown]`
- **Most important second-order downside:** A strict feasibility gate can consume scarce delivery time and still leave the complete human workspace, persistence, accessibility, and visual proof unfinished; technical honesty alone is not a competitive submission. `[inferred]`
- **Evidence that would reverse the score/ranking:** A recorded exact-browser matrix showing native WebMCP unavailable, frame-origin tools undiscoverable, provenance untrustworthy, or unregister invisible after a fresh observation would invalidate A1 as written. If the same run then proves one-agent evidence retention across sequential origin navigation, A2 becomes the honest topology candidate. If A1 passes but shared-action/persistence defects dominate the next milestone, A3 becomes the implementation priority. `[inferred]`
- **Cheapest discriminating experiment:** In the exact in-app judging browser, host the smallest paper page and independent video page/frame using the existing registration helper, register one evidence-returning tool per origin, issue one generic prompt with no tool names, capture discovered origins and both exact results, abort both registrations, and capture a fresh zero-tool observation. Do not build the Semantic Stage before recording the result. `[inferred]`

Because the finalist is below 60 and the unknown native-browser behavior could reverse the ranking, the correct escalation state is **`INSUFFICIENT EVIDENCE` for implementation commitment beyond the Phase 0 discriminating experiment**. The experiment is implementation-local and already required by the approved design; any move to sequential positioning after a failed frame test must preserve the documented honest-fallback condition. `[provided / inferred]`

## Isolation attestation

I completed and froze these three Node A strategies using only the Goal Command and Node A mechanics in `docs/evaluation/DELPHI_PROTOCOL.md`, `docs/evaluation/VEDAXI_RUBRIC.md`, `docs/VEDAXI_BUILD_SCOPE.md`, `docs/superpowers/specs/2026-08-30-vedaxi-protocol-proof-design.md`, and the current source under `VEDAXI - Elastic WEB/packages/contracts`. I did not read or receive Node B output, did not read red-team drafts, did not inspect arbiter scoring, and did not revise a strategy using cross-node score leakage or social convergence. No project code was modified. This report is the sole artifact created by this Node A pass.
