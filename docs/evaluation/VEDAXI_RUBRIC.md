# VEDAXI Challenge Rubric

This rubric challenges each milestone against deterministic product truth before any subjective quality score is accepted. It combines the live Devpost criteria, the approved protocol-proof design, the installed evaluation method, and the project’s visual/accessibility constraints.

## Release rule

A milestone passes only when:

1. Every applicable hard gate passes.
2. Official weighted quality score is at least `85/100`.
3. No official quality dimension scores below `4/5`.
4. Evidence is attached for every score: test output, browser observation, screenshot, trace, or cited file/line.

An attractive screenshot cannot compensate for a failed protocol gate. A passing unit suite cannot compensate for an incoherent product experience.

## Hard gates

| ID | Gate | Evidence required |
| --- | --- | --- |
| H1 | Native WebMCP uses `document.modelContext`; no silent polyfill or direct-call fallback. | Source citation plus browser observation. |
| H2 | Paper and video evidence are owned by different origins, or the exact-browser sequential fallback is explicitly documented. | Origin URLs, browser trace, and tool provenance. |
| H3 | Publisher tools return evidence only; none returns “contradiction,” “discrepancy,” or `n=34`. | Tool schema/result inspection and source test. |
| H4 | The external agent prompt contains the user job but no publisher tool names. | Captured prompt/trace artifact. |
| H5 | Agent derives `40 - 6 = 34` only after retrieving both exact evidence objects. | Ordered trace with results and rationale. |
| H6 | Citation blocking requires focused human confirmation; rejection causes no mutation. | Browser test for confirm and reject. |
| H7 | Human controls and WebMCP handlers call the same typed publisher actions. | Code path citation and parity tests. |
| H8 | Citation status and discrepancy note survive an agent-free reload. | Browser reload observation. |
| H9 | Kill switch unregisters tools under a fresh observation while the human page and persisted note remain usable. | Before/after tool inventory and UI observation. |
| H10 | Failure states never display saved/blocked success when persistence or tool execution fails. | Negative tests and browser observation. |
| H11 | Live URL works in ChatGPT’s in-app browser, and public repository contains complete source, instructions, and visible open-source license. | Fresh-session check and public URLs. |
| H12 | Public demo video is under three minutes, includes audio, and shows the real successful run without cuts hiding protocol or persistence. | Final video duration and shot checklist. |

## Devpost submission gates

These gates are independent of the product score and must all pass before submission:

| ID | Requirement | Evidence required |
| --- | --- | --- |
| D1 | Working live URL exposes the real native WebMCP experience in the target in-app browser. | Public URL plus clean-session trace. |
| D2 | Public repository contains complete source, reproduction instructions, and a visible open-source license. | Public repository URL and clean-clone reproduction. |
| D3 | Public demo video is under three minutes and contains audio. | Public video URL, measured duration, and audio check. |
| D4 | Submission includes a concise text explanation of the project and how WebMCP is used. | Draft cross-checked against the verified claims ledger. |
| D5 | Submission names only agents/clients in which the project was actually tested. | Tested-client matrix with version/build, result, date, and evidence path. |

No score can compensate for a failed D gate. Final submission remains a user-authorized external action.

## Weighted quality dimensions

### 1. WebMCP leverage — 30%

| Score | Description |
| --- | --- |
| 1.00 | Dynamic discovery across true origins, skillful schemas/descriptions, non-trivial multi-tool workflow, provenance, lifecycle removal, and no hardcoded agent coupling. |
| 0.80 | Native tools and golden workflow work, but cross-origin proof, lifecycle evidence, or schema quality has a minor gap. |
| 0.60 | WebMCP works only as a shallow single-origin wrapper or relies on tool-name knowledge. |
| 0.30 | Tools exist but the demonstrated outcome primarily uses direct internal calls. |
| 0.00 | No native working WebMCP route. |

### 2. Product execution — 30%

| Score | Description |
| --- | --- |
| 1.00 | Complete, coherent research workspace with working human controls, responsive behavior, persistence, reset, error recovery, clean console, and reliable deployment. |
| 0.80 | Golden path is complete and reliable with only minor non-blocking polish gaps. |
| 0.60 | Runnable proof of concept but visibly incomplete, brittle, or dependent on operator intervention. |
| 0.30 | Mostly static mockup or scripted animation. |
| 0.00 | Not runnable. |

### 3. Potential impact — 20%

| Score | Description |
| --- | --- |
| 1.00 | The research-integrity problem, user, consequence, and WebMCP advantage are obvious from the product behavior within 30 seconds. |
| 0.80 | Problem and value are specific and credible but need brief narration. |
| 0.60 | Interesting capability with weak evidence of a real consequential job. |
| 0.30 | Generic “agent-ready web” claim without demonstrated user value. |
| 0.00 | No credible problem/solution connection. |

### 4. Creativity and ambition — 20%

| Score | Description |
| --- | --- |
| 1.00 | Shopify-Editions-level chapter pacing supports a distinct Semantic Focus Shift where real paper/video/provenance objects reorganize around intent while context remains recoverable. |
| 0.80 | Strong editorial art direction and meaningful focus transition with a few conventional areas. |
| 0.60 | Polished interface but adaptation is ordinary filtering, cards, or layout swapping. |
| 0.30 | Generic dashboard or decorative animation. |
| 0.00 | No meaningful adaptive presentation. |

### Trust, evidence, and accessibility — scoring constraint

This is not a fifth unofficial dimension. It constrains WebMCP Leverage and Execution and can trigger hard-gate failure.

| Score | Description |
| --- | --- |
| 1.00 | Provenance stays attached; confirmation, rejection, undo/reset, keyboard use, reduced motion, truthful support state, and audit trace all work. |
| 0.80 | Core trust and accessibility paths work with minor presentation gaps. |
| 0.60 | Evidence is visible but one material control/recovery/accessibility path is incomplete. |
| 0.30 | Opaque agent recommendation or weak human control. |
| 0.00 | Misleading state or inaccessible consequential action. |

## Review questions

Every implementation/review agent must answer these before approval:

1. What claim does this change make, and what observable evidence proves it?
2. Does the change strengthen the golden workflow or add breadth that should be cut?
3. Could the same demo still appear to work if WebMCP were removed? If yes, the protocol proof is weak.
4. Is any publisher tool doing reasoning the external agent is supposed to do?
5. Is the human page genuinely useful with WebMCP disabled?
6. Does motion explain a state relationship, or is it decoration?
7. What remains visible and reachable after an object is demoted?
8. Can a judge reproduce the outcome from a clean session without private context?
9. Does the implementation match the written intent, or have the docs and code drifted?
10. What would a skeptical judge call fake, hardcoded, overbuilt, or copied?
