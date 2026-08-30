# VEDAXI Dual Delphi Protocol

## Purpose

Use the exact Dual Delphi structure to challenge consequential product and implementation choices without allowing one review frame to contaminate the other. This adaptation preserves the skill's isolated Node A, isolated Node B, and neutral-arbiter sequence while replacing its commercial marketing rubric with the Elastic Web judge rubric.

## Goal Command

| Field | Value | Provenance |
| --- | --- | --- |
| Product | VEDAXI, a publisher-side WebMCP research-integrity proof across paper and video origins. | provided |
| Audience | Elastic Web hackathon judges first; researchers, reviewers, and research publishers as the demonstrated user ecosystem. | provided / inferred |
| Evaluation job | Select or reject an implementation strategy and identify the cheapest evidence that could falsify its claims. | provided |
| Desired outcome | A reproducible, browser-native golden workflow that is useful to humans, meaningfully better with WebMCP, and strong enough to be a finalist. | provided |
| Stage | Pre-launch build. | verified from repository state |
| Channel | Deployed website, native WebMCP agent run, public repository, and sub-three-minute demo video. | verified from challenge requirements |
| Current bottleneck | The exact-browser sequential topology is proven locally, but a coherent publisher UI vertical slice and deployed parity do not yet exist. | verified from repository state |
| Proof available | Approved design, typed contracts/tests, official challenge criteria, prior judge analysis, and artifact-bound native browser observations. | verified |
| Constraints | No publisher-side contradiction arithmetic; no fake fallback; human confirmation for consequential mutation; persistence; kill switch; accessibility; submission deadline. | provided / verified |

Confidence begins at `medium`: the product decision and challenge criteria are known, but real-browser protocol support and deployment remain unverified.

## Isolation sequence

1. Give Node A only the Goal Command, current artifact package, and Node A mechanics below.
2. Complete and freeze three A concepts before creating Node B output.
3. Give Node B only the Goal Command, the same pre-review artifact package, and Node B alchemy below. Do not provide Node A output.
4. Record an isolation check: no shared drafts, score leakage, or cross-node revision.
5. Only then give both frozen outputs and evidence to the neutral arbiter.
6. The arbiter scores; it does not rewrite either node's proposal.

## Node A — Protocol Mechanics

Question: **How can the proof become easier to reproduce, harder to fake, safer to operate, and faster for a judge to understand?**

Primary judge lenses:

- Alex Nahas: specification correctness, tool quality, determinism, developer ergonomics, novel browser-native pattern.
- Jude Gao: reproducible evaluation, implementation quality, state handling, failure behavior, deployment readiness.
- Sean Roberts: discoverability, authority boundaries, recovery, production usefulness, tool clarity.
- Justin Rushing: real end-to-end browser success, collaboration, safety, and generalizable insight.

Node A must generate three mechanically distinct strategies. Each card contains: ID/name, judge problem, one protocol promise, implementation mechanism, proof/risk control, golden path, primary metric, guardrail metric, decisive assumption, cost, and failure mode.

## Node B — Experience Alchemy

Question: **How can the same proof become more distinctive, meaningful, and defensible by changing the experience frame rather than adding feature breadth?**

Primary judge lenses:

- Sarah Drasner: human–agent clarity, browser-native interaction, visual quality, accessibility, developer comprehension.
- Andrew Galloni: open-web value, publisher incentives, deployability, security, and ecosystem efficiency.
- Ilya Grigorik: user value, performance, semantics, attribution, and scalability. Commerce-only questions from the historical artifact are excluded from this research fixture.

Node B must independently generate three behaviorally distinct strategies. Each card contains: ID/name, current comparison frame, new frame/ritual/signal, one belief to create, honest sacrifice, concrete website expression, primary metric, guardrail metric, decisive assumption, reputational risk, and failure mode.

## Neutral judge arbiter

### Hard-fail screen

A concept fails before scoring if it breaks an applicable hard gate in `VEDAXI_RUBRIC.md`, depends on simulated behavior presented as native, fabricates proof, creates an unacceptable privacy/accessibility/security risk, or cannot fit the deadline and declared delivery capability.

### Official weighted score

Use the shared 0–5 scale: `0 missing`, `1 claimed`, `2 prototype`, `3 credible end-to-end`, `4 strong/polished/measurable/WebMCP-native`, `5 exceptional/memorable/rigorous/difficult without WebMCP`.

Source check: the [WebMCP Challenge Official Rules](https://webmcp.devpost.com/rules), verified **2026-08-31**, define these four criteria as equally weighted. The Official Rules and current Hackathon Website prevail over this protocol if they change. Re-verify before each new score.

| Dimension | Weight |
| --- | ---: |
| WebMCP Leverage | 25 |
| Execution | 25 |
| Potential Impact | 25 |
| Creativity & Ambition | 25 |

Evidence and trust are not bonus dimensions; they constrain the official score. Unsupported claims are `N/E`, not an assumed midpoint. When evidence is insufficient, report a provisional interval and confidence (`high`, `medium`, or `low`).

### Mandatory adversarial tests

- **Ceiling:** total score cannot exceed 60 if tools are wrappers, human UI does not visibly respond, or simulated behavior is presented as live.
- **WebMCP ablation:** ask whether the same demo and value remain if WebMCP is removed. If yes, subtract 15 and explain the failed counterfactual.
- **Collaboration:** if human and agent do not each perform indispensable parts of the workflow, subtract 10.
- **Measurement cap:** absent reproducible evidence, Execution cannot exceed 3/5.
- **Variance:** report the spread between judge-lens scores; do not hide a load-bearing disagreement in an average.

For every finalist state the strongest evidence, decisive assumption, most important second-order downside, evidence that would reverse the score, and cheapest discriminating experiment.

## Decision and escalation

- Nominate one frozen finalist per node, even if it is a `WEAK FINALIST` below 60.
- Return `INSUFFICIENT EVIDENCE` when uncertainty could reverse the ranking.
- The Master Agent may resolve implementation-local choices when the winning mechanism is already required by the approved design and no product scope changes.
- Halt for human selection when a choice changes product promise, architecture, public claims, brand, or submission positioning.
- One evidence-backed repair pass is allowed; social convergence is not evidence.

## Review cadence

- Baseline: scope and architecture.
- M0: contracts and native protocol topology.
- M1/M2: independent paper and video publisher modules.
- M3/M4: shared-action vertical slice, trust, accessibility, and experience.
- M5: deployed clean-session proof and first hard `85/100` release threshold.
- M6: video and submission package, with the threshold rerun against public artifacts.

Scores before M5 are diagnostic intervals only. The arbiter evaluates what the current module owns and records later-module criteria as `N/E`; it does not turn unfinished downstream scope into an early-module failure or an inflated midpoint.

Each completed round is stored under `docs/evaluation/delphi/` with the Goal Command, frozen A concepts, frozen B concepts, isolation statement, arbiter scorecard, confidence, failure claims, and decision.
