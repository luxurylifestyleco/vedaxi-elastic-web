# VEDAXI Evaluation Test Set

The early build uses 20 outcome-based product cases across four complexity strata plus eight submission-package cases. Paths may vary; end states may not.

## Simple

| ID | Input/state | Expected outcome |
| --- | --- | --- |
| S1 | Human opens paper origin with WebMCP active. | Complete paper workspace renders and exact methods passage is readable. |
| S2 | Human opens paper origin with WebMCP unsupported. | Same human content works; support state is truthful and non-blocking. |
| S3 | Search paper evidence for final analyzed sample. | Returns stable paper evidence with `40`, locator, origin, and provenance only. |
| S4 | Search video transcript for calibration exclusions. | Returns stable video evidence with `6`, “did not replace,” timestamp, origin, and provenance only. |
| S5 | Human seeks the video evidence timestamp. | Video/transcript state moves to the exact segment and remains keyboard operable. |

## Medium

| ID | Input/state | Expected outcome |
| --- | --- | --- |
| M1 | Agent receives the comparison job with no tool names. | Discovers and selects relevant evidence tools from descriptions/schemas. |
| M2 | Both evidence objects are returned. | Agent derives `40 - 6 = 34`; no publisher result contains that conclusion. |
| M3 | Agent requests focus using the two evidence IDs. | Paper, video, transcript, arithmetic, and provenance form the Semantic Focus Shift. |
| M4 | Human rejects the proposed citation block. | No citation or note mutation; evidence remains inspectable. |
| M5 | Human confirms the proposed block. | Shared action blocks citation and writes one linked discrepancy note. |

## Complex

| ID | Input/state | Expected outcome |
| --- | --- | --- |
| C1 | Reload paper origin after confirmed mutation with no agent attached. | Blocked citation and note survive; ordinary page remains usable. |
| C2 | Activate reset. | Fixture returns to exact clean state without changing WebMCP support. |
| C3 | Disable registrations and request a fresh observation. | Zero VEDAXI tools; human content and persisted state remain. |
| C4 | Rename/reorder tools without changing semantics. | Agent still completes the golden job from descriptions/schemas. |
| C5 | Remove or corrupt video evidence. | Agent reports insufficient evidence and does not recommend blocking. |

## Very complex

| ID | Input/state | Expected outcome |
| --- | --- | --- |
| V1 | Run golden job from a clean deployed session in ChatGPT’s in-app browser. | End-to-end success with two-origin provenance and no operator-only shortcuts. |
| V2 | Run with reduced motion. | Full hierarchy, provenance, confirmation, drawer reachability, and persistence meaning remain. |
| V3 | Run at mobile/tablet viewport. | Human research path remains coherent; no clipped controls or horizontal overflow. |
| V4 | Simulate persistence write failure at confirmation. | Citation remains unchanged and UI presents recoverable failure, never fake success. |
| V5 | Rehearse recorded choreography. | Real run fits within 154 seconds with at least 20 seconds of contingency under the three-minute cap. |

## Submission package

| ID | Input/state | Expected outcome |
| --- | --- | --- |
| D1 | Open the submitted live URL in a clean target in-app-browser session. | Native WebMCP golden path is reproducible from public URLs. |
| D2 | Clone the submitted public repository without private context. | License, setup instructions, complete source, tests, and local reproduction succeed. |
| D3 | Open the submitted YouTube demo in a logged-out session and inspect the video artifact. | The video is publicly viewable without authentication, duration is under three minutes, audio is present, and no cut hides a load-bearing protocol step. |
| D4 | Compare submission explanation with the claims ledger and trace. | Every product/WebMCP claim is accurate, supported, and understandable. |
| D5 | Compare the submitted tested-agent/client list with the browser matrix. | Every named client has a recorded version/build and result; no untested client is claimed. |
| D6 | Open the submitted live app as a judge and review its availability plan through the end of judging. | Access remains free through judging; any required credentials and instructions work from a clean session. |
| D7 | Audit every third-party SDK, API, dataset, mark, music track, media asset, and protected work in the submission. | Every item has a recorded source, license or authorization basis, and reviewer; unresolved rights block submission. |
| D8 | Re-fetch the live official rules and current submission fields immediately before the Human Gate. | A timestamped diff records the current requirements and every unresolved change; cached local requirements cannot pass. |
