# M0B Native Preflight Browser Matrix

**Artifact-bound run UTC:** `2026-08-30T20:41:28.2260985Z`  
**Source commit:** `93bb80fe9d66c4232c2b96fbb298241c1260d6b3`  
**Client:** Codex In-app Browser (`iab`), production flavor on Windows  
**Exact client version/build:** `BLOCKED` — not exposed by the runtime  
**Screenshots:** `BLOCKED` — not captured  
**Retained evidence:** raw DOM, current capability inventories, exact tool inputs/outputs, source hashes, and clean-room dispatch/report  
**Selected topology:** `sequential`

`PASS` means the expected observable behavior occurred. `FAIL` means the check ran and contradicted the expectation. `BLOCKED` means the evidence was unavailable and was not inferred.

## Outcome

| Claim | Status | Observation | Raw artifact |
| --- | --- | --- | --- |
| Paper top-level native route | PASS | Secure context; `active`; one origin-owned tool; exact score-3 paper evidence. | [`paper-active.json`](raw/2026-08-30T20-41-28Z-paper-active.json) |
| Simultaneous cross-origin-frame inventory | FAIL | The framed video was secure but `unsupported`; the paper document exposed only its paper tool. | [`paper-active.json`](raw/2026-08-30T20-41-28Z-paper-active.json) |
| Sequential clean-room two-origin route | PASS | A browser-only agent dynamically discovered the paper tool, followed the visible iframe URL, then dynamically discovered the direct-video tool. | [`clean-room-replay.md`](raw/2026-08-30T20-41-28Z-clean-room-replay.md) |
| Video top-level native route | PASS | Secure context; `active`; one origin-owned tool; exact score-2 transcript evidence. | [`video-active.json`](raw/2026-08-30T20-41-28Z-video-active.json) |
| Paper removal precursor | PASS | After disable, a fresh capability snapshot contained no tools, invocation was unavailable, and human paper/frame content remained. | [`paper-disabled.json`](raw/2026-08-30T20-41-28Z-paper-disabled.json) |
| Video removal/re-enable precursor | PASS | After disable, a fresh capability snapshot contained no tools and transcript remained; re-enable restored the tool. | [`video-disabled.json`](raw/2026-08-30T20-41-28Z-video-disabled.json), [`video-reenabled.json`](raw/2026-08-30T20-41-28Z-video-reenabled.json) |
| Full H9 kill-switch gate | N/E | M0 has no persisted discrepancy note. Removal feasibility passed, but human-page **and persisted-note** survival must be tested in M5. | M5-owned evidence |
| Exact client version/build | BLOCKED | The runtime exposed browser name/type/flavor, not an exact version/build. | [`source-binding.json`](raw/2026-08-30T20-41-28Z-source-binding.json) |
| Screenshots | BLOCKED | No screenshot was captured. Raw structured artifacts are retained instead. | [`source-binding.json`](raw/2026-08-30T20-41-28Z-source-binding.json) |

## Detailed checks

| ID | Check | Status | Evidence |
| --- | --- | --- | --- |
| M0B-01 | Paper secure context | PASS | Paper active DOM reports `window.isSecureContext: true`. |
| M0B-02 | Paper native registration and inventory | PASS | Paper active DOM is `active`; inventory names `read_paper_probe_evidence`. |
| M0B-03 | Exact paper input/result/provenance | PASS | Input `final analyzed sample`; result ID `probe.paper.methods.final-analysis`, origin `4173`, locator `Methods, participants`, score `3`. |
| M0B-04 | Frame declaration | PASS | Source commit declares the video iframe and `allow="tools"`; the visible frame is `4174`. |
| M0B-05 | Framed video secure context | PASS | Framed video DOM reports secure context `true`. |
| M0B-06 | Framed video native registration | FAIL | Framed video DOM reports `unsupported`. |
| M0B-07 | Simultaneous two-tool inventory | FAIL | Paper-document inventory contains only the paper capability. |
| M0B-08 | Direct-video native registration | PASS | Direct video DOM reports `active`; inventory names `read_video_probe_evidence`. |
| M0B-09 | Exact video input/result/provenance | PASS | Input `calibration exclusion`; result ID `probe.video.transcript.calibration-drift`, origin `4174`, locator `00:03:12`, score `2`. |
| M0B-10 | Clean-room generic dispatch | PASS | Dispatch contains the research job and URLs but no publisher tool name. |
| M0B-11 | Dynamic sequential discovery | PASS | Clean-room report records per-document `webmcp.fetchTools()` before each call. |
| M0B-12 | No publisher-side comparison | PASS | Publisher calls return only evidence/score; dispatch forbids comparison; agent report contains no conclusion. |
| M0B-13 | Paper disable/fresh inventory | PASS | Fresh post-disable inventory says no tools and the call is unavailable. |
| M0B-14 | Paper human route survives | PASS | Paper evidence and independent-publisher frame remain in the disabled DOM. |
| M0B-15 | Video disable/fresh inventory | PASS | Fresh post-disable inventory says no tools and the call is unavailable. |
| M0B-16 | Video human route survives | PASS | Transcript and provenance remain in the disabled DOM. |
| M0B-17 | Video re-enable | PASS | DOM returns to `active` and a fresh inventory contains the video tool. |
| M0B-18 | Direct event-count instrumentation | N/E | No `toolchange` event counter was installed; no event count or latency is claimed. |
| M0B-19 | Full persisted-note kill-switch behavior | N/E | Deferred to M5, where persisted state exists. |
| M0B-20 | Exact client version/build | BLOCKED | Unavailable from runtime. |
| M0B-21 | Screenshots | BLOCKED | Not captured. |

## Gate interpretation

- H1 passes for the observed local native top-level registration/discovery/invocation routes. Deployed parity is rechecked at M5.
- H2 simultaneous discovery fails. H2's documented exact-browser sequential route passes and is now authoritative for M1–M5.
- H3 passes: both tools return publisher evidence and relevance scores only.
- H4 passes for the retained clean-room dispatch; it contains no publisher tool name.
- H9 is **not evaluated** at M0. Only its removal-feasibility precursor passes.
- No M0 observation proves external-agent arithmetic, focused human confirmation, shared mutation, persistence, Semantic Stage behavior, deployment, or submission readiness.

## Artifact integrity

The local production servers used the immutable source commit recorded in [`source-binding.json`](raw/2026-08-30T20-41-28Z-source-binding.json). The raw artifact directory contains structured browser-run values, not screenshots or private reasoning. The manual registry is non-executable and validated with:

```text
node evals/validate-manual.mjs evals/registry/manifests/vedaxi-m0b-browser.manual.v1.json
```
