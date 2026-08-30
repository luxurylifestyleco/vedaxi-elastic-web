# VEDAXI Baseline Dual Delphi — Node B: Experience Alchemy

**Node:** Sub Agent 9 // Experience Board  
**Round:** Baseline — scope and architecture  
**Freeze status:** `FROZEN` — three concepts, no cross-node revision  
**Decision status:** `WEAK FINALIST` and `INSUFFICIENT EVIDENCE`  
**Confidence:** low

## Goal Command

Select or reject an experience-frame strategy for VEDAXI's browser-native, publisher-side research-integrity proof. The target is a reproducible golden workflow across paper and video origins in which an external agent retrieves exact evidence, derives `40 - 6 = 34`, asks a human to make the consequential decision, persists a publisher-owned discrepancy note, and proves the agent route disappears when WebMCP is disabled while the human route remains useful. The immediate audience is Elastic Web judges; the demonstrated ecosystem includes researchers, reviewers, and research publishers. `[provided]`

## Evidence boundary and provenance

Provenance labels used below:

- `[provided]`: stated by an authorized project artifact.
- `[verified]`: directly observed in the authorized `packages/contracts` source or tests.
- `[inferred]`: a reasoned consequence or proposed hypothesis, not observed behavior.
- `[unknown]`: not established by the permitted evidence set.

The present evidence supports only a contract-level prototype:

| Evidence | Finding | Provenance |
| --- | --- | --- |
| Native API boundary | `registerWebMcpTools` reads `document.modelContext`; the inspected implementation contains no direct-call or legacy API fallback. | `[verified]` — `packages/contracts/src/webmcp.ts:13-35` |
| Truthful support state | Absence of `document.modelContext` returns `unsupported` without invoking a publisher tool; registration failure returns `error`. | `[verified]` — `webmcp.ts:17-35`, `webmcp.test.ts:45-66` |
| Registration lifecycle | Tools share an abort signal; `disable()` aborts it, and the unit fake removes registered tools. | `[verified]` — `webmcp.ts:23-35`, `webmcp.test.ts:123-152` |
| Evidence semantics | Evidence objects carry stable ID, origin, locator, excerpt, and provenance. Search returns the exact paper and video fixture evidence and does not infer an analyzed sample from the video. | `[verified]` — `evidence.ts:1-37`, `evidence.test.ts:5-55` |
| End-to-end product proof | Real-browser discovery, two independently owned live origins, external-agent reasoning, visible human response, shared mutations, persistence, accessibility, deployment, and the recorded run are not established by the inspected evidence. | `[unknown]` |

Localhost origin strings in unit fixtures are not treated as proof of independently owned browser origins. Unit fakes are not treated as native browser observations. `[verified / inferred]`

## Frozen concept B1 — The Evidence Hearing

| Required card field | Frozen value |
| --- | --- |
| **ID / name** | `B1 — The Evidence Hearing` |
| **Current comparison frame** | A cinematic Semantic Focus Shift presents a contradiction as an authored visual composition: paper claim, video exclusion, arithmetic, provenance, then confirmation. `[provided]` |
| **New frame / ritual / signal** | Reframe the discrepancy moment as a short evidence hearing with three explicit roles: **publishers testify with source facts; the agent assembles and explains an inference; the human adjudicates the consequence**. The ritual progresses `Claim → Challenge → Inference → Decision`, while uncertainty remains labelled unresolved. `[inferred]` |
| **One belief to create** | “The agent can assemble a defensible case, but it cannot silently become the source or the decision-maker.” `[inferred]` |
| **Honest sacrifice** | Sacrifice free-form exploration and some cinematic ambiguity during the focal moment. The experience becomes more procedural and less like uninterrupted editorial reading. `[inferred]` |
| **Concrete website expression** | Keep the real paper passage and exact video transcript as opposing source planes, each with origin and locator attached. Form `40 - 6 = 34` only in a visually distinct agent-inference plane. Settle the motion into a focused decision bar with `Inspect evidence`, `Reject`, and `Block citation`; keep the chapter rail and drawer as recoverable context. The persistent note becomes the hearing record, not a generic alert. No gavels, courtroom decoration, copied layouts, or new feature surface. `[inferred]` |
| **Primary metric** | In a 30-second un-narrated comprehension test, the participant correctly names all three authorities: who supplied the facts, who derived `34`, and who can block the citation. Target: at least 4 of 5 participants answer all three correctly. `[inferred]` |
| **Guardrail metric** | 100% of promoted fact and inference objects retain a visible origin/locator or derivation label; 100% of decision controls remain keyboard reachable and meaningful with reduced motion. `[provided target / inferred measurement]` |
| **Decisive assumption** | A role-based hearing makes authority boundaries immediately legible without making research review feel punitive or theatrical. `[inferred]` |
| **Reputational risk** | The hearing metaphor could imply that an unresolved discrepancy is misconduct, turn publishers into defendants, or overstate a deterministic fixture as scientific judgment. `[inferred]` |
| **Failure mode** | Judges remember the hearing treatment but cannot explain dynamic discovery, provenance, or why WebMCP was necessary; the ritual becomes a themed confirmation modal. `[inferred]` |

## Frozen concept B2 — The Reproducibility Receipt

| Required card field | Frozen value |
| --- | --- |
| **ID / name** | `B2 — The Reproducibility Receipt` |
| **Current comparison frame** | The current design culminates in a memorable contradiction tableau and ends on the kill-switch counterfactual. `[provided]` |
| **New frame / ritual / signal** | Reframe the whole run as the live construction of a compact, publisher-owned reproducibility receipt. Each indispensable event adds a signed line: discovered capability and origin, exact evidence ID, agent derivation, human confirmation, durable mutation, reload verification, and tool removal. `[inferred]` |
| **One belief to create** | “This result is not agent magic; it is a sequence another judge can inspect and reproduce.” `[inferred]` |
| **Honest sacrifice** | Sacrifice some visual drama and editorial spaciousness. A receipt is more operational and risks feeling administrative. `[inferred]` |
| **Concrete website expression** | Use a narrow provenance spine beside the real editorial stage, never a generic activity dashboard. Lines appear only after the corresponding real event succeeds. Selecting a line reveals the source object in place. Reload adds a persistence verification line; a fresh observation after disable adds `publisher capabilities absent` while preserving the prior publisher record. Private chain-of-thought is excluded. `[inferred]` |
| **Primary metric** | After one un-narrated viewing, a participant reconstructs the ordered proof and correct origin for both evidence objects with no false step. Target: at least 4 of 5 participants. `[inferred]` |
| **Guardrail metric** | Zero receipt lines may claim success before the underlying operation is verified; zero private reasoning or unsupported origin claims appear in the receipt. `[provided constraint / inferred measurement]` |
| **Decisive assumption** | Reproducibility and chain of custody are more memorable to the judges than a larger visual spectacle. `[inferred]` |
| **Reputational risk** | The receipt may make VEDAXI look like an audit-log product, weaken the publisher experience, and collapse open-web research into compliance theater. `[inferred]` |
| **Failure mode** | The spine becomes an attractive scripted timeline that can be rendered without WebMCP, or it dominates the paper and video objects it is meant to substantiate. `[inferred]` |

## Frozen concept B3 — The Reversible Lens

| Required card field | Frozen value |
| --- | --- |
| **ID / name** | `B3 — The Reversible Lens` |
| **Current comparison frame** | The current experience moves from a complete publisher-authored starting state into one agent-composed focus state, with peripheral objects travelling to a drawer. `[provided]` |
| **New frame / ritual / signal** | Make semantic focus visibly reversible. A single lens control lets the human inspect three meaningful states over the same objects: `Publisher view → Evidence view → Decision record`. The agent may propose the middle state, but the human can move backward, compare, restore, or reject without losing provenance. `[inferred]` |
| **One belief to create** | “An agent can reorganize the web around intent without taking ownership of the page or erasing the publisher's context.” `[inferred]` |
| **Honest sacrifice** | Sacrifice the simplicity and speed of a one-way money shot. Reversibility creates more state combinations, test burden, and explanation pressure inside a three-minute demo. `[inferred]` |
| **Concrete website expression** | Reuse the same DOM-owned paper, video, evidence, and decision objects across three labelled stops. The paper phrase and video segment visibly move into evidence focus; the inference is added rather than replacing either source; the decision record attaches after confirmation. `Why / How / Control` remains available, and reduced motion swaps hierarchy without travel. `[provided constraints / inferred expression]` |
| **Primary metric** | A participant can restore the original publisher view and reopen either source object after the focus shift without instruction. Target: at least 4 of 5 participants in under 20 seconds. `[inferred]` |
| **Guardrail metric** | At every lens stop, 100% of demoted objects remain reachable, provenance remains attached, and focus order follows the visible hierarchy in both motion modes. `[provided target / inferred measurement]` |
| **Decisive assumption** | Reversibility will read as meaningful human control, not as a cosmetic before/after scrubber. `[inferred]` |
| **Reputational risk** | A polished reversible animation could make a non-working protocol look credible and invite the exact “beautiful mockup” criticism the rubric rejects. `[inferred]` |
| **Failure mode** | The control becomes a layout toggle: WebMCP removal does not alter its apparent value, state restoration becomes brittle, or users cannot tell authored facts from agent composition. `[inferred]` |

## Hard-gate screen

None of the three frozen strategies inherently requires fabricated proof, simulated behavior presented as native, publisher-side contradiction arithmetic, inaccessible text, or an unsafe mutation. Therefore none is rejected on proposal alone. `[inferred]`

No strategy currently passes the release gate. H1 has source-level support but lacks the required native browser observation. H3 is partially supported by the evidence-search fixture, but the complete publisher tool inventory and browser result inspection are unavailable. H9 has abort-lifecycle unit evidence but no fresh browser observation or proof that the human page and persisted note remain usable. H2 and H4-H8 and H10-H12 remain `[unknown]` in the permitted evidence set. The localhost strings in tests do not satisfy H2. `[verified / unknown]`

## Official weighted score under current evidence

The scores evaluate what is evidenced now, not the concepts' promised upside. Each concept shares the same evidence floor because no concept-specific experience exists in the permitted source. The dimensions use the protocol's 0–5 scale and official weights.

| Concept | WebMCP leverage 30 | Execution 30 | Potential impact 20 | Creativity & ambition 20 | Raw | Collaboration adjustment | Current total | Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| B1 — Evidence Hearing | 2/5 = 12 | 1/5 = 6 | 2/5 = 8 | 1/5 = 4 | 30 | -10 | **20/100** | low |
| B2 — Reproducibility Receipt | 2/5 = 12 | 1/5 = 6 | 2/5 = 8 | 1/5 = 4 | 30 | -10 | **20/100** | low |
| B3 — Reversible Lens | 2/5 = 12 | 1/5 = 6 | 2/5 = 8 | 1/5 = 4 | 30 | -10 | **20/100** | low |

Scoring rationale:

- WebMCP leverage reaches contract prototype (`2`) because native registration, origin exposure arguments, truthful unsupported behavior, evidence retrieval semantics, and abort-based removal exist in source/tests; real discovery and cross-origin execution remain `[unknown]`. `[verified]`
- Execution is claimed (`1`) because the approved experience and workflow are specified, but no visible human product, persistence, recovery, accessibility, deployment, or clean-session run is established by current evidence. `[provided / unknown]`
- Potential impact reaches prototype (`2`) only for the narrow, deterministic research-integrity job: exact paper/video evidence objects and the non-inference video search test exist. User comprehension and real consequence remain unmeasured. `[verified / unknown]`
- Creativity is claimed (`1`): Semantic Focus Shift and each new frame are written intentions, not an observed interface. `[provided / inferred]`
- The mandatory collaboration deduction applies because current evidence does not demonstrate indispensable human and agent actions. `[unknown]`

### Mandatory adversarial tests

| Test | Baseline result |
| --- | --- |
| **Ceiling** | Applies. No visible responsive human UI is established, so every concept remains below 60. `[unknown]` |
| **WebMCP ablation** | Contract evidence shows that unsupported context invokes no publisher tool and abort removes registrations in a unit fake. Whether the same judge-facing demo and value survive WebMCP removal is not established, so no unsupported success credit is granted and no additional -15 is applied. This must be rerun in the exact browser. `[verified / unknown]` |
| **Collaboration** | Fails current evidence; -10 applied. The specs require an external agent to gather/derive and a human to decide, but indispensability is not observed. `[provided / unknown]` |
| **Measurement cap** | Applies; Execution is 1/5, below the 3/5 cap. `[verified]` |
| **Variance** | Official totals tie because the permitted source contains no concept implementation. The seven-lens forecast below exposes the load-bearing disagreements instead of manufacturing score separation. `[verified / inferred]` |

## Seven-lens mapping

This is a forecast of judge sensitivity, not evidence of judge response. Every cell is `[inferred]`.

| Judge lens | B1 — Evidence Hearing | B2 — Reproducibility Receipt | B3 — Reversible Lens |
| --- | --- | --- | --- |
| **Alex Nahas — correctness, tool quality, determinism, developer ergonomics, browser-native novelty** | Role separation makes the agent inference boundary legible, but does not itself prove discovery or tool quality. | Strongest deterministic story: every proof event has an inspectable line; greatest risk of becoming a wrapper log. | Novel browser-native composition is visible, but state complexity may obscure protocol correctness. |
| **Jude Gao — reproducibility, implementation quality, state, failure, deployment** | Confirmation and rejection become obvious; persistence/failure still need explicit proof. | Strongest fit: success-gated receipt lines expose state, reload, failure, and removal. | Reversible state is testable, but multiplies failure and deployment risk. |
| **Sean Roberts — discoverability, authority, recovery, usefulness, tool clarity** | Strongest authority story: source, inference, and decision have separate owners. | Strong recovery/audit story; capability discoverability may be buried in trace language. | Strongest recovery of demoted objects; weakest direct signal of tool semantics. |
| **Justin Rushing — end-to-end browser success, collaboration, safety, generalizable insight** | Strongest visible collaboration: publishers state, agent derives, human decides. | End-to-end proof is explicit, but human participation may feel like one receipt line. | Generalizable adaptive-web insight is strong; indispensable agent contribution could look visual-only. |
| **Sarah Drasner — human-agent clarity, interaction, visual quality, accessibility, comprehension** | Strongest role clarity and decision choreography; metaphor must remain restrained and accessible. | High comprehension potential, but a provenance spine can become a generic dashboard. | Strongest recoverability and spatial continuity; focus order and reduced motion are costly. |
| **Andrew Galloni — open-web value, publisher incentives, deployability, security, ecosystem efficiency** | Publisher retains authority over consequence; adversarial hearing language could hurt incentives. | Strongest accountability/deployability frame; operational overhead and audit aesthetics may weaken publisher appeal. | Preserves publisher authorship; incentives and ecosystem efficiency are less explicit. |
| **Ilya Grigorik — user value, performance, semantics, attribution, scalability** | Clear semantics and attribution around one consequential job; ritual may not scale beyond disputes. | Strong attribution and scalable event semantics; persistent trace may add performance/storage cost. | Strong semantic continuity; transitions and multi-state synchronization carry the largest performance burden. |

## Node B nomination

### `WEAK FINALIST — B1: The Evidence Hearing`

B1 is nominated as the best hypothesis, not as a validated winner. The official scores tie and the ranking could reverse after even a small comprehension test, so the decision also carries `INSUFFICIENT EVIDENCE`. B1 wins the baseline nomination because it most directly turns the required collaboration and authority boundary into visible product behavior while preserving the narrow golden path. This is an inference from rubric fit, not implementation evidence. `[inferred]`

- **Strongest evidence:** the contract fixture already separates paper and video facts into stable provenance-bearing objects, and the video search test explicitly avoids inferring the analyzed sample. That evidence structure can support distinct source and inference roles; it does not yet prove the hearing experience. `[verified / inferred]`
- **Decisive assumption:** judges will understand publisher fact, agent inference, and human authority faster through the four-beat hearing than through the receipt or reversible-lens frames, without reading the metaphor as an accusation. `[inferred]`
- **Most important second-order downside:** repeated use could train publishers and researchers to treat unresolved metadata disagreements as adversarial verdicts, discouraging participation and flattening legitimate methodological ambiguity. `[inferred]`
- **Evidence that would reverse the score:** a blinded comprehension test shows B2 or B3 produces materially better origin attribution, WebMCP necessity, and authority understanding; participants interpret B1 as misconduct theater; or an exact-browser prototype cannot complete its four beats, confirmation, persistence, and kill-switch proof inside the 154-second active sequence. `[inferred]`
- **Cheapest discriminating experiment:** build three low-fidelity, DOM-only, reduced-motion storyboards using the exact fixture text—one per frozen concept—and show each to five judge-proxy participants for 30 seconds in counterbalanced order. Ask who supplied each fact, who derived `34`, who made the decision, what disappears with WebMCP off, and whether the discrepancy implies misconduct. Nominate a winner only if it improves correct authority attribution without increasing the misconduct inference. `[inferred]`

## Isolation attestation

Node B was generated from only the authorized Goal Command/artifact package and the present `VEDAXI - Elastic WEB/packages/contracts` source/tests. I did **not** read `docs/evaluation/delphi/baseline-node-a.md`, any Node A output, any red-team draft, or any shared concept/score draft. No Node A concept, score, finalist, or revision was disclosed to or used by this node. Shopify Editions Winter 2026 and the Drive resource folder were treated as inspiration-only constraints from the provided artifacts; no external text, assets, branding, source, or layouts were accessed or copied. The three concepts above are frozen before neutral arbitration.
