# VEDAXI Submission Pipeline

This is the master execution and submission checklist for VEDAXI. It reports repository truth; it does not replace official Devpost data or convert blocked evidence into a pass.

## Milestone progress

> **Current position:** R0 complete. R1 in progress. M1 formal exit is still not `PASS`. M2–M4 source is in tree; M2 media slot validates when `ffprobe` is available.

| Progress lens | Completed | How far | Meaning |
| --- | ---: | ---: | --- |
| Release milestones | 1 of 5 | **20%** | R0 complete; R1–R4 have not met their stop conditions. |
| Module exits | 1 of 7 | **14%** | M0 exited. M1 exit not recorded as PASS (current-source 390×844 + keyboard artifacts exist). M2–M4 source implemented, exits not recorded. M5–M6 not started. |
| Source modules implemented | 5 of 7 | **71%** | M0–M4 source exists locally; M5 has local predeployment adapters only. Source presence does not convert blocked or unevaluated release gates into passes. |
| Devpost submission gates | 0 of 8 | **0%** | D1–D8 require the deployed product, M6 submission assets, access/rights evidence, and a current live-rules recheck. |

These are count-based progress indicators, not time estimates. Later modules—especially M5 deployment proof and M6 media/submission—carry more risk than their item count suggests.

| Release milestone | Status | Evidence / completion condition |
| --- | --- | --- |
| R0 — Protocol and architecture gate | **COMPLETE** | M0 contracts and exact-browser sequential topology approved and pushed. |
| R1 — Judgeable vertical slice | **IN PROGRESS — M1 EXIT NOT PASS** | M1 source plus 2026-09-01 current-source browser artifacts exist; formal M1 PASS is not recorded. R1 also requires M2, M3, and M4 exits. |
| R2 — Quality and trust | **NOT STARTED** | Begins after the functional vertical slice; requires negative, accessibility, responsive, audit, and intended-vs-implemented proof. |
| R3 — Deployment and judge proof | **NOT STARTED** | Requires two public origins, clean-session native reproduction, public repo/license/instructions, and demo rehearsal. |
| R4 — Submission assets | **NOT STARTED** | Requires the real recorded run, audio, captions if useful, Devpost copy, thumbnail, and verified fields. |

```text
R0 COMPLETE → R1 IN PROGRESS [M1 EXIT NOT PASS] → R2 → R3 → R4 → USER-APPROVED SUBMISSION
```

## Operating contract

- **Build mode:** Autonomous, one bounded module at a time.
- **Sequence:** M0 → M1 → M2 → M3 → M4 → M5 → M6. A later module does not begin until the current module has a recorded exit decision.
- **Verification:** Deterministic tests first, integration checks second, exact-browser evidence third, independent adversarial review last.
- **Git cadence:** Push an immutable source candidate, then push its evidence/exit checkpoint. Every pushed checkpoint must name its source commit.
- **Evaluation:** Versioned deterministic evals and separately labeled manual browser evidence. Dual Delphi is mandatory at M0, the M3/M4 vertical-slice connection, M5, and M6.
- **Inspiration firewall:** External sites, Drive documents, repositories, papers, OpenAI Evals, and Ponytail may influence structure and evaluation only. No copied runtime source, assets, branding, or text.
- **Submission authority:** Preparing assets is autonomous. The final Devpost submission requires explicit user confirmation.
- **Official-rule recheck:** The live [Official Rules](https://webmcp.devpost.com/rules) and current [Challenge page](https://webmcp.devpost.com/) must be re-fetched immediately before the Human Gate. Cached local requirements cannot authorize submission.
- **Two-video boundary:** Controlled in-product evidence and the submission demo are distinct artifacts. The controlled evidence asset must extend beyond `00:03:12` (`>192s`); the public YouTube submission demo must be strictly `<180s`, include audio, and show the real working project. Neither artifact may be substituted for the other.
- **Rights and access:** Third-party SDKs, APIs, data, trademarks, music, media, and other protected material require a recorded authorization or rights basis. Judge access must remain free and usable through the end of judging.

## Current status

| Workstream | State | Evidence / next decision |
| --- | --- | --- |
| GitHub | **CURRENT** | Branch `codex/phase-0-webmcp`; remote `https://github.com/luxurylifestyleco/vedaxi-elastic-web.git`. Quality Gate CI installs FFmpeg then runs `evals/run-quality-gate.mjs --clean-install`. |
| Local candidate checkpoint | **SEE GIT HEAD** | Do not treat an uncommitted worktree as an immutable release identity. |
| M0 Protocol Foundation | **COMPLETE** | Sequential two-origin topology selected and approved. See `docs/evidence/M0/exit-record.md`. |
| M1 Paper Origin source | **IMPLEMENTED** | Paper Integrity Desk, evidence search, and shared-action wiring exist. Deterministic precursor `vedaxi.m1-paper.dev.v2`. |
| M1 Paper Origin exit | **NOT PASS** | Current-source 390×844 screenshot and keyboard traces from 2026-09-01 are in `docs/evidence/M1/raw/`. Formal PASS still needs a v4 manual registry and recorded exit. See `docs/evidence/M1/exit-record.md`. |
| M2 Video Origin source | **IMPLEMENTED; SLOT VALID; EXIT NOT RECORDED** | Video app, seek, MP4+VTT, and `vedaxi.m2-video.dev.v1` exist. Path: `apps/video/public/media/vedaxi-controlled-evidence.mp4`. Validator PASSes with ffprobe. Formal M2 exit remains open. |
| M3 Shared Actions source | **IMPLEMENTED; EXIT NOT RECORDED** | Deterministic precursor `vedaxi.m3-actions.dev.v1` / shared `PublisherStore.dispatch`; module exit/browser evidence remain open. |
| M4 Semantic Stage source | **IMPLEMENTED; EXIT NOT RECORDED** | Deterministic precursor `vedaxi.m4-semantic-stage.dev.v1`; current rendered target-browser and visual review remain open. |
| M5 Native Proof / hosting | **WAITING ON VERCEL URL** | Local tests are done. Public two-origin webpage will be hosted on Vercel. **Vercel live URL: (to be provided).** Paper origin (public): (to be provided). Video origin (public): (to be provided). |
| M6 Submission/Reproduction | **NOT STARTED** | Requires verified M5 evidence and human-selected/public release inputs. |
| Official rules acknowledgment | **USER ACTION REQUIRED** | `.devpost-hackathon-state.json` records `rules_acknowledged: false`; never change this on the user's behalf. |
| Devpost submission | **NOT SUBMITTED** | Nothing has been sent to Devpost. |

## Master checklist

- [x] **1. Establish protocol contracts and honest topology — M0**
  Spec ref: `docs/MODULE_ARCHITECTURE.md > M0 — Protocol Foundation`
  What was built: Typed evidence/search contracts, native registration lifecycle, same-origin and two-origin probes, strict browser evidence registry, and a clean-room sequential fallback after simultaneous frame discovery failed.
  Acceptance: Native paper and direct-video evidence routes work without a polyfill or direct-call fallback; failures and blocked facts remain visible.
  Verify: `npm test`; `npx tsc --noEmit`; `npm run build:probe`; validate `vedaxi.m0b-browser.manual.v1`.
  Git: `d31ca36`, `93bb80f`, `632ad09`, `53d3c85` pushed.

- [ ] **2. Close the Paper Origin exit — M1**
  Spec ref: `docs/MODULE_ARCHITECTURE.md > M1 — Paper Origin`
  Recorded baseline: Complete editorial paper, exact publisher evidence, human search, one read-only native tool, lifecycle controller, responsive layouts, deterministic evals, screenshots, and production browser evidence. The current integrated worktree extends that baseline and remains unexited and unverified in a current browser.
  Remaining: Obtain permitted real keyboard traversal evidence and real unsupported-browser evidence where possible; retain a truthful error-state limitation if no natural native error can be produced. The repository browser policy requires explicit approval before switching from Vercel Agent Browser to Chrome.
  Acceptance: S1–S3 pass; support state is truthful; human paper remains useful with registrations absent; keyboard evidence is retained or an explicitly approved limitation decision is recorded.
  Verify: `npm test -- apps/paper/src/paper`; `npm run build:paper`; validate `vedaxi.m1-paper-browser.manual.v1`; independent exit review.
  Git: Recorded baseline source `06a9512` and historical evidence checkpoint `617c475` pushed; a current integrated-source exit checkpoint remains pending.

- [ ] **3. Build independent Video Origin — M2**
  Spec ref: `docs/MODULE_ARCHITECTURE.md > M2 — Video Origin`
  What to build: Human-first video/transcript workspace on origin B, stable `video.transcript.calibration-drift` evidence, exact “six” and “did not replace” statement, human seek/focus path, paper-independent service, and read-only native tools.
  Acceptance: S4–S5 pass; runtime origin differs from Paper; output never contains `34`, a contradiction, or paper-owned state; unavailable media and tool states are truthful; keyboard path retained.
  Verify: Focused fixture/schema/no-reasoning tests; type-check/build; production browser origin/tool/result/seek evidence; adversarial review.
  Git: Push immutable M2 source candidate, then its evidence and exit checkpoint.

- [ ] **4. Build shared actions and persistence — M3**
  Spec ref: `docs/MODULE_ARCHITECTURE.md > M3 — Shared Actions and Persistence`
  What to build: `@vedaxi/state`, focus request, confirm/reject, atomic citation block plus discrepancy note, audit events, deterministic reset, storage adapter, reload rehydration, and shared human/WebMCP action adapters.
  Acceptance: Rejection causes zero mutation; confirmation requires focused evidence; one linked note is created atomically; human and tool routes call the same public action; storage failure rolls back and never shows false success.
  Verify: Unit/property-style state tests, human/tool parity integration, agent-free reload, reset, injected write failure, C03 contract test, Dual Delphi.
  Git: Push immutable M3 source candidate, then its evidence and exit checkpoint.

- [ ] **5. Build the Semantic Stage — M4**
  Spec ref: `docs/MODULE_ARCHITECTURE.md > M4 — Semantic Stage`
  What to build: Editorial chapter rail, recoverable context drawer, provenance-preserving evidence promotion, derived arithmetic presentation, focused confirmation, restore path, and restrained state-explaining motion. Prefer DOM/CSS; add 3D only if the claim cannot be met more simply.
  Acceptance: Real paper/video/provenance objects reorganize around the externally derived discrepancy; context remains reachable; reduced motion preserves meaning; no stage component owns persistence or computes publisher evidence.
  Verify: State-to-layout tests, C04 regression against M3, desktop/tablet/mobile, keyboard/focus order, reduced motion, overflow/performance/console checks, visual originality review, Dual Delphi with M3.
  Git: Push immutable M4 source candidate, then its evidence and exit checkpoint.

- [ ] **6. Deploy and prove the native golden workflow — M5**
  Spec ref: `docs/MODULE_ARCHITECTURE.md > M5 — Native End-to-End Proof`
  What to build: Two public origins, deployed registration adapters, mutation tools calling M3 actions, generic external-agent job prompt, ordered evidence trace, focus/confirmation, agent-free persistence proof, and full kill-switch ablation.
  Acceptance: Clean target-browser session dynamically discovers both origins sequentially; retrieves `40` then `6`; derives `34` externally; requires human confirmation; persists block/note; survives reload; disabling registrations removes the agent route but preserves the human site and note.
  Verify: Public URLs; clean-session H1–H10 trace; D1; C01–C05; renamed/reordered tool resilience; network/console capture; WebMCP-off ablation; Dual Delphi ≥85/100 with no dimension below 4/5. H11 remains downstream of the M6 package.
  Git: Push deployment source/config candidate, then the exact public evidence and M5 exit checkpoint.

- [ ] **7. Complete reviewable shipping documentation — M6 foundation**
  Spec ref: `docs/MODULE_ARCHITECTURE.md > M6 — Submission and Reproduction`
  Foundation map: `docs/M6_REPRODUCTION_FOUNDATION.md` (documentation scaffold only; no M6 or submission gate is promoted).
  What to build: Public `README.md`, human-selected visible open-source `LICENSE`, install/run/test/reproduction instructions, and concise `documentation/` artifacts: architecture, load-bearing flows/trust boundaries, permissions/no-auth truth, variables/secrets, existing/proposed test coverage, and WebMCP automation/tool guardrails. Include a dated prior-versus-new-work boundary and a rights ledger for third-party SDKs, APIs, data, marks, music, media, and assistance. State explicitly that no email, cron, or backend exists if still true.
  Acceptance: The current public repository contains every source file, asset, and instruction required to run the submitted project; its license is visible on the public repository page. A reviewer can understand intent, trust boundaries, configuration, exact tool surfaces, side effects, kill switch, verified/unverified tests, and which work predates the challenge without private context. Every third-party component has a recorded authorization/license basis. No secret is bundled client-side.
  Verify: Clean clone/install/test/build; link and file checks; documentation-to-code intended-vs-implemented review; public repository access.
  Git: Push the documentation/reproduction checkpoint before recording the demo.

- [ ] **8. Produce the real demo package — M6 media**
  Spec ref: `docs/VEDAXI_BUILD_SCOPE.md > R4 — Submission assets`
  What to build: A continuous real-run recording showing dynamic discovery, paper evidence, independent video evidence, external derivation, Semantic Focus Shift, human confirmation, persistence after reload, and kill-switch ablation. This submission demo is separate from the `>192s` controlled evidence asset. Add audio and captions only after the real recording exists.
  Acceptance: The demo is publicly and anonymously viewable on YouTube, is strictly under 180 seconds, includes audio, names only tested clients, and contains no cut that hides discovery, persistence, or removal. Every third-party mark, image, clip, voice, music track, and other protected material has a recorded rights basis. Target pacing is approximately 154 seconds.
  Verify: Measured duration/audio, logged-out public YouTube playback, rights-ledger review, shot checklist, trace-to-video comparison, independent reviewer playback, and an explicit check that the `>192s` controlled evidence asset was not used as the submission demo.
  Git: Push shot list, timing record, transcript/caption source, and public video URL evidence; do not commit fabricated media proof.

- [ ] **9. Prepare and audit the Devpost package — M6 submission**
  Spec ref: `docs/evaluation/VEDAXI_RUBRIC.md > Devpost submission gates`
  What to build: `devpost-submission.md`, concise project/WebMCP explanation, public live URL, public repository URL, public video URL, tested-client matrix, claims ledger, AI/Codex usage disclosure, screenshots/thumbnail, and D1–D8 eval records.
  Acceptance: The frozen package is ready for downstream release evaluation: every submission claim points to M5/M6 evidence, access and rights inputs are complete, and no blocked or provisional fact is presented as verified. User acknowledgment and final authorization occur only after the release gates at the separate Human Gate.
  Verify: Final Intended-vs-Implemented review, final Dual Delphi, and independent clean reproduction at the candidate SHA. Then evaluate H11–H12 and D2–D8 against that frozen package before presenting separate rules-acknowledgment and final-authorization records at the Human Gate. D1 is already owned by M5.
  Git: Push the submission-candidate checkpoint. Submission itself remains unperformed.

- [ ] **10. Explicit final approval and Devpost handoff**
  Spec ref: `.devpost-hackathon-state.json > submission`
  What to do: Present the final field-by-field package, unresolved risks, exact public URLs, tested-client names, and submission diff to the user.
  Acceptance: User explicitly confirms the official rules acknowledgment and separately authorizes final submission. A successful Devpost response and public project URL are verified live.
  Verify: Live Devpost status; public project page; final repository SHA; final URL/video/repo access check.
  Git: Record only the verified public submission URL/status after submission succeeds.

## Hard-gate status

| Gate | Current state | Owner / next proof |
| --- | --- | --- |
| H1 Native WebMCP, no fallback | **PARTIAL PASS** | M0/M1 local source/browser pass; M5 deployed re-verification pending. |
| H2 Separate origins or documented sequential route | **LOCAL PASS** | M0 selected sequential topology; M2 independent origin and M5 public trace pending. |
| H3 Publisher evidence only | **PARTIAL PASS** | M0/M1 pass; M2 and full M5 regression pending. |
| H4 Generic prompt, no tool names | **PENDING** | M5 ordered prompt/trace. |
| H5 External derivation after both results | **PENDING** | M5 ordered trace. |
| H6 Focused confirmation; reject is zero mutation | **PENDING** | M3 then M5 browser proof. |
| H7 Human/tool shared actions | **PENDING** | M3 parity and M5 adapters. |
| H8 Agent-free persistence | **PENDING** | M3 local and M5 deployed reload. |
| H9 Kill switch preserves site and persisted note | **PRECURSOR PASS** | M0/M1 removal works; M5 must retain the persisted note. |
| H10 No false saved/blocked state | **PARTIAL PASS** | M1 status/controller pass; M3–M5 negative browser paths pending. |
| H11 Public URL/repo/license/instructions | **PENDING** | M5 deployment and M6 reproduction package; verify free judge access through judging end and a current public repo containing all source/assets/instructions plus a visible human-selected open-source license. |
| H12 Real public YouTube demo under three minutes with audio | **PENDING** | M6 media package; verify `<180s`, logged-out YouTube playback, rights clearance, and separation from the `>192s` controlled evidence artifact. |

## Devpost-gate status

| Gate | Current state | Required artifact |
| --- | --- | --- |
| D1 Working public native URL | **PENDING** | M5 public URL plus clean-session trace. |
| D2 Public complete source, assets, instructions, visible license | **PENDING** | Current public repository, clean-clone reproduction, visible human-selected license, dated prior-versus-new-work evidence, and third-party authorization ledger. |
| D3 Public YouTube demo `<180s` with audio | **PENDING** | Logged-out YouTube URL, measured duration/audio checks, protected-material rights review, and proof it is distinct from the `>192s` controlled evidence asset. |
| D4 Concise project and WebMCP explanation | **PENDING** | Evidence-backed `devpost-submission.md`. |
| D5 Only actually tested agents/clients named | **PENDING** | Tested-client matrix with version/build or explicit blocked value. |
| D6 Free judge access through judging | **PENDING** | Clean-session access record, credentials/instructions if applicable, and a named availability owner/end date. |
| D7 Third-party rights and licenses | **PENDING** | Complete dependency/data/asset/marks/media rights ledger with authorization basis and reviewer. |
| D8 Current official rules and fields | **PENDING** | Timestamped live-rule and submission-field fetch/diff immediately before the Human Gate. |

## Provisional wow moment

A judge gives VEDAXI only the research-integrity job. The agent dynamically discovers two publisher-owned evidence routes, retrieves `40` and `6` from their true origins, derives `34` outside publisher tools, and causes the same human research workspace to reorganize around the discrepancy. Nothing consequential changes until the human confirms; the block and evidence-linked note then survive an agent-free reload, while the kill switch removes only the agent route.

This is provisional until the complete M5 run exists. Submission copy and demo narration must consume that verified run rather than promise it in advance.

## Immediate next actions

1. Freeze the integrated M0–M5-predeployment source in an immutable candidate after the local code-quality gate passes while retaining the expected release `HOLD`/`BLOCKED` markers.
2. Keep M1–M4 exits not PASS until a recorded v4/browser package (M1) and remaining M2–M4 evidence exist; do not infer exits from source tests. M2 still needs the MP4.
3. Supply and validate the distinct controlled M2 media asset without substituting the `<180s` submission demo.
4. Create the public two-origin deployment and run the clean target-browser M5 trace.
5. Re-fetch the current official rules and submission fields for D8, then present them at the separate Human Gate for explicit user acknowledgment.

## Source of truth

- Product scope: `docs/VEDAXI_BUILD_SCOPE.md`.
- Module sequence and boundaries: `docs/MODULE_ARCHITECTURE.md`.
- Exit rules: `docs/evaluation/MODULE_GATES.md`.
- Hard and submission gates: `docs/evaluation/VEDAXI_RUBRIC.md`.
- M0 evidence: `docs/evidence/M0/`.
- M1 evidence: `docs/evidence/M1/`.
- Local Devpost progress only: `.devpost-hackathon-state.json`.

The formal guided-build files `docs/hackathon-build/prd.md` and `docs/hackathon-build/spec.md` do not exist. This document therefore does not mark the guided-build learning flow complete or mutate its state; it is the repository's operational submission pipeline derived from the approved VEDAXI architecture and verified module records.
