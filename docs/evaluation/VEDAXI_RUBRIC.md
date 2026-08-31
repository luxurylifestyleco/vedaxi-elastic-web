# VEDAXI Challenge Rubric

This rubric challenges each milestone against deterministic product truth before any subjective quality score is accepted. It combines the live Devpost criteria, the approved protocol-proof design, the installed evaluation method, and the project’s visual/accessibility constraints.

## Official judging source

Verified on **2026-08-31** against the [WebMCP Challenge Official Rules](https://webmcp.devpost.com/rules). Stage Two defines the four criteria below as **equally weighted**, so each contributes `25%`. If this rubric conflicts with the Official Rules or another Hackathon Website update, the official source prevails. Recheck the live rules and [Challenge page](https://webmcp.devpost.com/) before every new Dual Delphi score and again immediately before the Human Gate.

## Release rule and foundation gates

The official weighted score is meaningful only once a judge can exercise a coherent end-to-end product. It is therefore a hard release gate at M5 and M6, and a diagnostic interval before then. M0–M4 exit on their applicable hard gates and module evidence; they must not be failed or score-inflated for capabilities owned by later modules.

A judgeable release passes only when:

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
| H11 | Live URL works in ChatGPT’s in-app browser; judge access stays free through the end of judging; and the current public repository contains all source, assets, instructions, and a human-selected open-source license visible on the repository page. | Fresh-session and logged-out checks, availability plan through judging end, public URLs, clean clone, and public license visibility. |
| H12 | A public YouTube demo is strictly under three minutes, includes audio, and shows the real successful run without cuts hiding protocol or persistence. It is distinct from the controlled evidence video, which must extend beyond `00:03:12` (`>192s`). All third-party marks, music, media, and protected material are rights-cleared. | Logged-out YouTube playback, measured `<180s` duration/audio, shot checklist, controlled-evidence identity/duration check, and rights ledger. |
| H13 | Prior work and challenge-period work are clearly separated with dated evidence; every third-party SDK, API, dataset, asset, and technical contribution has a recorded authorization or license basis. | Dated commit boundary/prior-vs-new statement plus dependency, data, asset, and assistance rights ledger. |
| H14 | The current official rules and submission fields are rechecked immediately before submission; the Human Gate remains closed until the user acknowledges the current rules and separately authorizes submission. | Timestamped live-rule snapshot/diff and explicit user-owned acknowledgment/authorization records. |

## Devpost submission gates

These gates are independent of the product score and must all pass before submission:

| ID | Requirement | Evidence required |
| --- | --- | --- |
| D1 | Working live URL exposes the real native WebMCP experience in the target in-app browser. | Public URL plus clean-session trace. |
| D2 | Current public repository contains all source, assets, reproduction instructions, and a visible human-selected open-source license, with a clear prior-versus-new-work boundary. | Public repository URL, logged-out visibility, clean-clone reproduction, license detection, and dated work-boundary evidence. |
| D3 | Public YouTube demo is `<180s`, contains audio, is rights-cleared, and is not the separate `>192s` controlled evidence artifact. | Logged-out YouTube URL, measured duration/audio, artifact identity check, and rights ledger. |
| D4 | Submission includes a concise text explanation of the project and how WebMCP is used. | Draft cross-checked against the verified claims ledger. |
| D5 | Submission names only agents/clients in which the project was actually tested. | Tested-client matrix with version/build, result, date, and evidence path. |
| D6 | Live app/test build remains free and accessible to judges through the end of judging; credentials and instructions are supplied if access is private. | Clean-session access record, credential/instruction review if applicable, and availability owner/end date. |
| D7 | Third-party SDKs, APIs, data, marks, music, media, and other protected material are authorized and license-compliant. | Dependency/data/asset rights ledger with source, terms/license, authorization basis, and reviewer. |
| D8 | Live official rules and submission fields were rechecked immediately before the Human Gate. | Timestamped official-link fetch/diff and unresolved-change record. |

No score can compensate for a failed D gate. Final submission remains a user-authorized external action.

## Equally weighted quality dimensions

### 1. WebMCP Leverage — 25%

| Score | Description |
| --- | --- |
| 1.00 | Dynamic discovery across true origins, skillful schemas/descriptions, non-trivial multi-tool workflow, provenance, lifecycle removal, and no hardcoded agent coupling. |
| 0.80 | Native tools and golden workflow work, but cross-origin proof, lifecycle evidence, or schema quality has a minor gap. |
| 0.60 | WebMCP works only as a shallow single-origin wrapper or relies on tool-name knowledge. |
| 0.30 | Tools exist but the demonstrated outcome primarily uses direct internal calls. |
| 0.00 | No native working WebMCP route. |

### 2. Execution — 25%

| Score | Description |
| --- | --- |
| 1.00 | Complete, coherent research workspace with working human controls, responsive behavior, persistence, reset, error recovery, clean console, and reliable deployment. |
| 0.80 | Golden path is complete and reliable with only minor non-blocking polish gaps. |
| 0.60 | Runnable proof of concept but visibly incomplete, brittle, or dependent on operator intervention. |
| 0.30 | Mostly static mockup or scripted animation. |
| 0.00 | Not runnable. |

### 3. Potential Impact — 25%

| Score | Description |
| --- | --- |
| 1.00 | The research-integrity problem, user, consequence, and WebMCP advantage are obvious from the product behavior within 30 seconds. |
| 0.80 | Problem and value are specific and credible but need brief narration. |
| 0.60 | Interesting capability with weak evidence of a real consequential job. |
| 0.30 | Generic “agent-ready web” claim without demonstrated user value. |
| 0.00 | No credible problem/solution connection. |

### 4. Creativity & Ambition — 25%

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
