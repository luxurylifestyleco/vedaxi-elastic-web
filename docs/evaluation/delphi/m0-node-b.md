# M0 Dual Delphi — Node B (Experience Alchemy)

**Status:** `FROZEN`  
**Node:** Sub Agent 9 // Experience Delphi (isolated Node B)  
**Review date:** 2026-08-31  
**Decision:** **REPAIR** before recording M0 exit and beginning M1 implementation  
**Confidence:** `medium-high`

## Isolation and evidence boundary

- `[verified]` This node did not read `m0-node-a`, any future arbiter output, or another current Delphi node's draft.
- `[verified]` Frozen baseline Delphi files were not used as current evidence.
- `[verified]` The reviewed package was limited to the governing Delphi/rubric/architecture documents, M0 evidence and eval registry, the current protocol-probe human surfaces, build scope/specification/inspiration ledger, and the live Official Rules.
- `[verified]` The [Official Rules](https://webmcp.devpost.com/rules) were rechecked on 2026-08-31. Stage Two still uses four equally weighted criteria and explicitly distinguishes a complete, coherent product experience from a technical proof of concept.

## Executive judgment

M0 proves a valuable but narrow fact: native WebMCP can work honestly in the target in-app browser through a **sequential** two-origin route. It does not yet prove that a judge or ordinary researcher can understand, trust, or benefit from that route.

The source/eval evidence is strong enough to retain the sequential topology. The exit package is not strong enough to record a clean M0 `PASS`: simultaneous discovery failed; exact client version/build and screenshots are blocked; the retained browser evidence is a reconstructed narrative rather than a replayable trace; the full journey never tested retained context, derivation, return navigation, human confirmation, or mutation; and the required M0 `exit-record.md` is absent from `docs/evidence/M0/`.

This is a bounded **evidence-and-experience-contract repair**, not a request to turn the protocol probe into the finished product. M1 should still own the real Paper experience.

## What is established

| Label | Finding | Evidence |
| --- | --- | --- |
| `[verified]` | A top-level paper origin registered, exposed, and executed a native `document.modelContext` evidence tool. | `M0B_BROWSER_MATRIX.md`, M0B-01/02/07/08 |
| `[verified]` | Simultaneous paper + cross-origin-frame discovery failed: the framed video reported `unsupported`, and only the paper tool appeared. | M0B-05/06; `m0b-simultaneous-frame` |
| `[verified]` | One clean-room agent sequentially visited paper then video, dynamically discovered each tool, and returned exact origin-owned evidence without DOM substitution or publisher-side comparison. | M0B-07–14; `m0b-sequential-clean-room` |
| `[verified]` | Abort followed by a fresh observation produced zero tools while the small human-readable evidence surface survived. | M0B-15–20 |
| `[verified]` | Contract/probe tests cover evidence-only outputs, truthful unsupported/error states, schema/runtime parity, and abort cleanup; the retained report records 35 passing tests. | task-0b report; `vedaxi.contracts.dev.v2` |
| `[verified]` | The current human surfaces are diagnostic pages: heading, origin/security/status text, enable/disable buttons, one evidence passage or transcript, provenance, and an iframe. | `apps/protocol-probe/**/src/main.ts` |
| `[inferred]` | The sequential route is technically viable but likely to feel like leaving the task and starting another unless the product visibly carries mission state, gathered evidence, provenance, and a return path across origins. | M0 route plus M1/M2/M4 product requirements |
| `[inferred]` | The current probe would be judged as technical proof, not as a coherent product, because it neither presents a real research workflow nor visibly reorganizes around user intent. | Official Execution criterion plus probe DOM |
| `[unknown]` | Whether the same external agent reliably retains both evidence objects through paper → video → paper in a clean deployed session. | Not exercised in M0 |
| `[unknown]` | Whether a first-time judge understands the problem, the two publisher roles, and why WebMCP matters within 30 seconds without narration. | No timed comprehension evidence |
| `[unknown]` | Whether the future Paper module remains genuinely useful with tools off, beyond displaying one fixture passage. | M1 not implemented |
| `[unknown]` | Whether keyboard, focus order, reduced motion, contrast, responsive layout, and provenance survive the final focus transition. | No M1/M4 accessibility evidence |

## Hard-gate screen

| Gate | M0 judgment | Reason |
| --- | --- | --- |
| H1 native route | `PASS, local/probe scope` | Native top-level registration/discovery/invocation was observed; deployment parity remains future evidence. |
| H2 two origins/topology | `PASS only as sequential` | Simultaneous topology failed; the documented same-agent sequential fallback passed for independent retrieval only. |
| H3 evidence-only publishers | `PASS` | Source tests and observed results omit contradiction/discrepancy/`34`. |
| H4 generic prompt | `PASS for retained M0 prompt` | Prompt contains no publisher tool names. |
| H9 removal | `PASS, probe scope` | Fresh zero inventories were observed and diagnostic human content survived. |
| H5–H8, H10 final failures, H11–H12 | `N/E for M0` | M0 does not contain derivation, consequential confirmation, shared mutation, persistence, deployed clean-session, or video evidence. |

### Exit-package defects

- `[verified]` `docs/evidence/M0/exit-record.md`, required by `MODULE_ARCHITECTURE.md`, is absent.
- `[verified]` Exact client version/build and screenshots are `BLOCKED` in the versioned manual manifest.
- `[verified]` The sequential run proves two retrievals, but not the load-bearing return-to-paper, derivation, focus, and mutation continuation.
- `[inferred]` These gaps do not invalidate the topology result; they do prevent an unqualified claim that M0 is fully reproducible.

## Official score — completed M0 artifact, not projected product

Shared 0–5 scale; each dimension contributes 25 points. The score is intentionally based on the artifact a judge could inspect now, not the written ambition for M1–M6.

| Criterion | Score | Weighted | Confidence | Rationale |
| --- | ---: | ---: | --- | --- |
| WebMCP Leverage | 3.4/5 | 17.0/25 | medium-high | Native dynamic discovery, origin provenance, lifecycle removal, and honest sequential fallback are real. The workflow is still two shallow read tools rather than the final non-trivial collaboration. |
| Execution | 2.4/5 | 12.0/25 | medium | Runnable source and a manual native run exist, but the visible surface is explicitly a probe; exact build, screenshots, deployment, final return path, recovery, and product polish are absent. Execution is below the 3/5 evidence cap. |
| Potential Impact | 1.6/5 | 8.0/25 | high | The fixture hints at a real integrity problem, but current behavior merely retrieves two already-visible snippets and never demonstrates the consequence or human decision. |
| Creativity & Ambition | 1.0/5 | 5.0/25 | high | The intended Semantic Focus Shift is documented but not present. The current DOM is conventional diagnostic text and controls. |
| **Raw total** |  | **42.0/100** |  |  |
| Collaboration deduction |  | **−10** | high | In M0, the agent retrieves evidence and a human may toggle registration, but there is no indispensable human research decision or shared consequential workflow. |
| WebMCP ablation deduction |  | **0** | medium-high | Removing WebMCP leaves the diagnostic human page, but it destroys the demonstrated agent discovery/invocation route; the counterfactual therefore does break the core M0 proof. |
| **Adjusted current score** |  | **32.0/100** | medium-high | The 60-point technical-proof ceiling is not the binding constraint; the lower evidence-backed score is. |

The `85/100` release threshold is not met. This does **not** mean M0 should absorb M1 product scope. It means the repository must explicitly distinguish an internal protocol-foundation exit from a product-quality release score. Until that governance distinction and the missing exit record are written, the move is `REPAIR`.

## Seven judge lenses

These are lens-adjusted totals on the same 100-point official frame before the common −10 collaboration deduction. They expose disagreement rather than smoothing it away.

| Judge lens | Total | Primary read |
| --- | ---: | --- |
| Alex Nahas | 55 | Strong native mechanics and honest topology selection; still shallow tool breadth and incomplete end-to-end proof. |
| Jude Gao | 46 | Good contracts/failure handling; weak replayability, deployment identity, and final-state evidence. |
| Sean Roberts | 48 | Clear tool authority and removal; no real recovery, mutation, or production usefulness yet. |
| Justin Rushing | 44 | Real browser success exists, but collaboration and complete browser journey do not. |
| Sarah Drasner | 27 | Semantic HTML basics are present; human–agent clarity, visual quality, transition meaning, and accessibility proof are absent. |
| Andrew Galloni | 32 | Two publisher origins and a plausible open-web incentive are promising, but deployability and publisher/user value are not demonstrated. |
| Ilya Grigorik | 36 | Provenance semantics are credible; user value, continuity, performance, and scale of sequential navigation remain unknown. |

**Variance:** 28 points (`55 − 27`). The load-bearing disagreement is mechanics versus human experience, exactly the distinction the official Execution criterion warns about.

## Frozen Node B concepts

### B1 — Evidence Passport — **FROZEN FINALIST**

| Field | Decision |
| --- | --- |
| Current comparison frame | Sequential navigation looks like a browser limitation and risks feeling like two disconnected demos. |
| New frame / ritual / signal | Treat navigation as an explicit chain-of-custody ritual. A persistent journey rail shows `Paper → Video → Return to Paper`; a compact evidence passport shows what has been gathered, its publisher origin, and what remains. |
| Belief to create | “The agent is carrying verified source evidence across independent publishers, and I can see exactly what crossed the boundary.” |
| Honest sacrifice | Give up the illusion of simultaneous discovery and some cinematic uninterruptedness. |
| Concrete website expression | On Paper, show the research job, source roles, current step, empty passport slots, and an explicit visit-video action. On Video, show only the carried paper evidence summary plus video evidence acquisition. On return, show both provenance stamps before any `40 − 6 = 34` derivation appears. |
| Primary metric | In a five-person cold test, at least 4/5 can state both source roles, current step, and why the agent must return to Paper after 30 seconds of the recorded flow. |
| Guardrail metric | Zero loss or mutation of evidence IDs, excerpts, locators, or publisher origins across navigation; no copied video-owned evidence in Paper source code. |
| Decisive assumption | Visible carried state makes sequential navigation feel like trustworthy federation rather than context loss. |
| Reputational risk | A badly designed passport can resemble fake app-owned orchestration or a generic progress tracker. |
| Failure mode | The judge cannot tell whether the agent actually retained evidence or the page preloaded both fixtures. |

### B2 — Paper Integrity Desk

| Field | Decision |
| --- | --- |
| Current comparison frame | The paper is currently a fixture wrapped by protocol diagnostics. |
| New frame / ritual / signal | Start with a genuinely useful citation-review desk: readable paper, methods locator, citation context, provenance, note/status history, and human navigation that works with tools off. |
| Belief to create | “This is a publisher product I could use without an agent; WebMCP adds a cross-publisher research capability rather than substituting for the website.” |
| Honest sacrifice | Delay dramatic motion and broad feature count; make M1 excellent at one paper-reading and citation-review job. |
| Concrete website expression | First viewport explains the study and citation at risk; methods passage and provenance are immediately readable; protocol state is secondary; keyboard-visible chapter navigation and a plain no-tools state retain all human content. |
| Primary metric | With WebMCP disabled, 4/5 cold users can locate the final-analysis claim and its provenance in under 30 seconds. |
| Guardrail metric | The human route never invokes a tool handler directly and never implies a discrepancy before the video evidence exists. |
| Decisive assumption | Human baseline quality increases trust in the later agent-authored focus shift. |
| Reputational risk | The Paper module may become a polished generic reader with WebMCP bolted on. |
| Failure mode | Judge sees a beautiful paper but cannot identify the WebMCP-specific advantage. |

### B3 — Publisher Relay

| Field | Decision |
| --- | --- |
| Current comparison frame | Two origins are a technical topology fact. |
| New frame / ritual / signal | Each publisher performs one visible relay handoff: Paper releases a scoped research request; Video returns one signed evidence object; Paper resumes as the decision owner. |
| Belief to create | “Independent publishers can collaborate without surrendering their data or reasoning authority.” |
| Honest sacrifice | More explicit handoff copy and less magical autonomy. |
| Concrete website expression | A publisher-owned handoff card names request scope, destination origin, evidence returned, and authority boundary. Mutation controls exist only on Paper after return. |
| Primary metric | A cold judge correctly identifies which publisher owns each fact and which one owns the final citation decision. |
| Guardrail metric | No aggregator, no hidden cross-app import, no precomputed comparison, and no mutation control on the Video origin. |
| Decisive assumption | Publisher incentives and boundaries are more memorable than a seamless-but-opaque multi-origin experience. |
| Reputational risk | Excess protocol explanation may slow the sub-three-minute demo and feel enterprise-heavy. |
| Failure mode | The relay becomes narration about architecture rather than visible user benefit. |

## Finalist challenge card

**Frozen finalist:** B1 — Evidence Passport

- **Strongest evidence:** `[verified]` The same clean-room agent already completed native sequential paper and video discovery while preserving exact origin provenance; the protocol mechanism needed by the passport exists.
- **Decisive assumption:** `[inferred]` A visible chain-of-custody layer will preserve cognitive continuity without creating an app-owned aggregator or suggesting that Paper already possesses Video evidence.
- **Most important second-order downside:** `[inferred]` Making carried state too persistent or too polished can undermine the independence claim: judges may conclude that VEDAXI copied both sources into one hidden store, or that navigation is scripted.
- **Evidence that would reverse the choice:** A cold test showing that users understand the source handoff and retained provenance equally well with only a simple chapter rail; or a browser constraint showing no trustworthy way to display retained state across origins without faking ownership.
- **Cheapest next discriminating experiment:** Before full M1 styling, build or storyboard only three first-view states—Paper departure, Video acquisition, Paper return—with real origin labels and evidence IDs. Run five unbriefed 30-second comprehension sessions. Ask: “Where did each fact come from, what is the agent doing now, what remains to be decided, and which page may mutate the citation?” Do not explain the architecture before scoring answers.

## M1 Paper priorities

1. **30-second human comprehension:** first viewport must expose the real research job, paper identity, final-analysis passage, locator/provenance, and that cross-publisher evidence is still missing. Protocol status should support this story, not lead it.
2. **Tools-off usefulness:** readable article structure, methods navigation, citation context, provenance inspection, and truthful unsupported/disabled state must work with zero tool execution.
3. **Sequential continuity contract:** define the departure/return states now, even though M2 is not built. The visible model is “gather evidence, retain provenance, return for a decision,” not “open another tab and hope the agent remembers.”
4. **Provenance before arithmetic:** carried paper evidence must retain stable ID, origin, locator, excerpt, and provenance. No `34`, contradiction label, or final discrepancy appears until both origin-owned objects have returned.
5. **Accessibility as structure:** use DOM text and controls, semantic landmarks/headings, visible keyboard focus, logical focus restoration after navigation, status announcements that do not spam, adequate contrast, and a reduced-motion-equivalent hierarchy. Do not postpone these foundations to M4.
6. **Originality firewall:** derive layout and language from the VEDAXI research job. Editorial pacing and continuity are allowed principles; Shopify composition, copy, assets, navigation, and distinctive motifs are not. Every borrowed principle must remain traceable through `INSPIRATION_LEDGER.md`.
7. **Cut decorative breadth:** no generic dashboard, marketing landing page, decorative media, or animation until the paper-reading task and sequential evidence contract pass their browser checks.

## Repair required before M0 exit

1. Add the required M0 exit record with exact command, URL/origins, clean/reset state, commit/tree state, test/eval IDs, evidence paths, reviewer roles, PASS/FAIL/BLOCKED facts, selected `sequential` topology, and downstream re-verification obligations.
2. Record a short explicit governance note: M0 may exit as a protocol foundation even though the current artifact does not meet the final `85/100` product-release score; the full release rule applies to the judgeable product milestone. If maintainers intend the rubric literally for every module, M0 cannot pass and the architecture must be reconciled before M1.
3. Capture the cheapest missing corroboration available in the target client: screenshots or exported DOM/tool-inventory artifacts for paper active, framed-video unsupported, direct-video active, and fresh zero inventory. Keep exact client version/build `BLOCKED` if the runtime genuinely does not expose it; do not invent a value.
4. Pre-register the B1 three-state 30-second comprehension experiment as M1 evidence. A full working cross-origin journey is not required before M1 starts; the continuity contract and falsification questions are.

## Recommendation

**REPAIR.** Preserve the sequential topology and all passing M0 source/browser evidence. Do not widen the probe into the product. Repair the missing exit/governance record and corroborating evidence, then begin M1 with B1 Evidence Passport as the experience contract and B2 Paper Integrity Desk as the human-baseline guardrail.

**FROZEN**
