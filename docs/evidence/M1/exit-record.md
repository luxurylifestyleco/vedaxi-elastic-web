# M1 Exit Record

## Identity and decision

| Field | Value |
| --- | --- |
| Module | M1 — Paper Origin / Paper Integrity Desk |
| Deterministic eval | `vedaxi.m1-paper.dev.v2` (v1 retained unchanged) |
| Browser evidence eval | `vedaxi.m1-paper-browser.manual.v3` (v1/v2 retained unchanged) |
| Source artifact | `85e139735da224f16985be1aeb11152dce4d20f4` (Paper runtime); v3 recorded repository HEAD `e6c440f` at capture time, not as the current repository HEAD; that commit did not change Paper sources |
| Recorded | `2026-08-31T08:12:19.575Z` / `2026-08-31T13:42:19.5757937+05:30` |
| Source review | Sub Agent 14 // Paper Plan — APPROVED; Sub Agent 15 // Paper Red Team — APPROVED; Sub Agent 16 // Paper Experience — APPROVED |
| Status | `RECORDED V3 PAPER RUNTIME PARTIALLY VERIFIED; CURRENT INTEGRATED WORKTREE UNEXITED AND UNVERIFIED` |

The original in-app-browser evidence is retained as v1 and the earlier Chrome follow-up as v2. The recorded v3 evidence is bound to Paper runtime `85e1397`: native discovery/call, exact human-search navigation, lifecycle, source identity, origins, and logs pass for that captured runtime. The browser service then failed to attach a fresh local page for the narrow run; in-app CUA Tab remained on `BODY` and Chrome local-preview navigation timed out. v3 marks those observations `BLOCKED`; it does not inherit v2 keyboard or responsive results as passes for either v3 or the later integrated worktree. The current integrated Paper/M3/M4 worktree remains unexited and unverified in a current browser. M5 still owns public deployment parity and final end-to-end re-verification.

The v2 deterministic manifest is the current source-precursor registry. It expands deterministic coverage of the integrated Paper boundary but is not browser evidence and does not change this exit decision from `BLOCKED`.

## Expected and observed

| Expectation | Observation | Decision |
| --- | --- | --- |
| Human-useful editorial paper | Complete fictional research note with article structure, outline, methods evidence, provenance, figure, references, disclosure, and independent search. | PASS |
| Exact paper-owned evidence | Stable `paper.methods.final-analysis`; exact forty-participant passage, locator, provenance, and current origin only. | PASS |
| Native evidence route | One strict read-only tool in production; exact result; page, visible provenance, inventory, and result origins equal. | PASS |
| No publisher reasoning | No video evidence, subtraction, `34`, contradiction judgment, mutation, persistence, or recommendation in output/runtime. | PASS |
| Human route survives kill switch | Fresh inventory changed one → zero → one; disabled call rejected; full paper and human search remained. | PASS |
| Responsive experience | The recorded source baseline passed narrow layout. V3 could not attach a page for the requested 390 × 844 measurement, so it does not claim that result for the recorded v3 runtime or the later integrated worktree. | BLOCKED — current-source browser evidence missing |
| Real keyboard traversal | The recorded source baseline passed in Chrome. V3 in-app CUA Tab stayed on `BODY`, and Chrome local-preview navigation timed out; it does not claim that pass for the recorded v3 runtime or the later integrated worktree. | BLOCKED — current-source browser evidence missing |
| Real unsupported browser state | Both approved clients expose native WebMCP; a natural unsupported-client observation was unavailable. Deterministic truthful-state/controller coverage passes separately. | BLOCKED — non-gating environment limitation |
| Natural native registration error | No natural native rejection occurred; deterministic rejection/status tests pass separately. | BLOCKED — non-gating environment limitation |
| Exact client version/build | Exact browser builds were not exposed; Chrome extension version `1.2.27268.51612_0` is retained. | BLOCKED — non-gating environment limitation |

## Verification

### Recorded v3 validation

```text
npm run build:paper
PASS — Vite production build; JS 207.76 kB, CSS 10.59 kB, HTML 0.63 kB

npm test -- apps/paper/src/paper
PASS — 4 files, 35/35 tests

npm test
PASS — 10 files, 76/76 tests

npx tsc --noEmit
PASS — no diagnostics

node evals/validate-manual.mjs evals/registry/manifests/vedaxi-m1-paper-browser.manual.v3.json
PASS — v3 manual registry valid (7 cases: 4 PASS, 0 FAIL, 3 BLOCKED)

git diff --check
PASS — no whitespace errors (line-ending warnings only)
```

### Recorded-source verification

From `VEDAXI - Elastic WEB`:

```text
npm test
PASS — 9 files, 69/69 tests

npm test -- apps/paper/src/paper
PASS — 4 files, 35/35 tests

npx tsc --noEmit
PASS — no diagnostics

npm run build:paper
PASS — production build; JS 206.70 kB, CSS 9.62 kB, HTML 0.63 kB

npm run preview:paper -- --host 0.0.0.0
PASS — production preview at http://localhost:4173/
```

From repository root:

```text
node evals/validate-manual.mjs evals/registry/manifests/vedaxi-m1-paper-browser.manual.v1.json
PASS — retained v1 manual registry valid (7 cases)

node evals/validate-manual.mjs evals/registry/manifests/vedaxi-m1-paper-browser.manual.v2.json
PASS — v2 manual registry valid (7 cases: 5 PASS, 0 FAIL, 2 BLOCKED)

git diff --check
PASS — no whitespace errors
```

The adversarial reviewer's fresh sandboxed Vite development start on another port hit a dependency-optimizer access-denied error. This environment-specific observation is retained and the development command is not claimed as passing. Production build/preview were healthy in both review paths.

## Evidence index

- Browser matrix: `docs/evidence/M1/M1_BROWSER_MATRIX.md`.
- Production inventory/call/origin export: `docs/evidence/M1/raw/2026-08-30T21-25-53Z-production-browser.json`.
- Disable/re-enable ablation: `docs/evidence/M1/raw/2026-08-30T21-25-53Z-lifecycle.json`.
- Responsive metrics and screenshot hashes: `docs/evidence/M1/raw/2026-08-30T21-25-53Z-responsive.json`.
- Explicit blocked evidence: `docs/evidence/M1/raw/2026-08-30T21-25-53Z-browser-limitations.json`.
- Desktop screenshot: `docs/evidence/M1/raw/desktop-production.jpg`.
- Narrow screenshot (390 × 844 requested; 375 × 812 captured): `docs/evidence/M1/raw/mobile-390-requested.jpg`.
- Retained deterministic dataset/manifest: `evals/registry/data/vedaxi/m1-paper-dev-v1.jsonl`, `evals/registry/manifests/vedaxi-m1-paper.dev.v1.json`.
- Current deterministic precursor dataset/manifest: `evals/registry/data/vedaxi/m1-paper-dev-v2.jsonl`, `evals/registry/manifests/vedaxi-m1-paper.dev.v2.json`.
- Manual dataset/manifest: `evals/registry/data/vedaxi/m1-paper-browser-manual-v1.jsonl`, `evals/registry/manifests/vedaxi-m1-paper-browser.manual.v1.json`.
- Chrome follow-up: `docs/evidence/M1/M1_CHROME_FOLLOWUP.md`.
- Chrome keyboard trace: `docs/evidence/M1/raw/2026-08-31T03-11-29Z-chrome-keyboard.json`.
- Chrome corroborating screenshot: `docs/evidence/M1/raw/chrome-keyboard-result.jpg` (SHA-256 `E19968E8B09D32E08AC4AF320B1312865A6A68DB0C93081BF029E5B87EC1A16F`).
- Versioned follow-up dataset/manifest: `evals/registry/data/vedaxi/m1-paper-browser-manual-v2.jsonl`, `evals/registry/manifests/vedaxi-m1-paper-browser.manual.v2.json`.
- Current-runtime dataset/manifest: `evals/registry/data/vedaxi/m1-paper-browser-manual-v3.jsonl`, `evals/registry/manifests/vedaxi-m1-paper-browser.manual.v3.json`.
- Current-runtime production export: `docs/evidence/M1/raw/2026-08-31T08-12-19Z-current-paper-browser.json`.

## Boundary and traceability

- M1 owns the paper fixture, shared paper search service, paper-only tool factory, Paper UI, foundation tokens, and the local same-origin read-only registration bridge.
- M4 owns Semantic Stage components, state-driven spatial focus, and motion semantics.
- M5 owns deployed two-origin orchestration, mutation adapters, full ordered trace, and native re-verification.
- The human search calls the shared paper service directly; it never invokes the WebMCP handler.
- The registration controller disposes stale completions and covers registered, unsupported, cancelled, empty, error, rejection, pending disable, re-enable, and teardown.
- The scope evaluator recursively scans every non-test M1 runtime file, the HTML shell, and app/root dependency manifests.

## Judge-rubric view

| Dimension | Current evidence | Status |
| --- | --- | --- |
| Working | Recorded v3 native discovery/call, exact search navigation, and ablation pass; keyboard and narrow-layout browser observations remain explicit blocks, and the later integrated worktree is unverified. | PARTIAL — current integrated runtime cannot exit |
| Execution | Complete editorial paper, provenance, responsive layouts, tests, lifecycle safety, and no fallback. | PASS at source/observed surfaces |
| Impact | Makes publisher evidence visible and usable before later cross-source citation work. | PROVISIONAL — M3–M5 own end-to-end user outcome |
| Creativity | Protocol status, evidence provenance, and human/agent parity are integrated into an editorial research artifact. | PROVISIONAL — no final judge score invented |

## Inspiration and minimalism review

- Shopify Editions, supplied Drive documents, Karpathy repositories, and arXiv patterns influenced information hierarchy and paper discoverability only. No copied text, assets, source, branding, or identifiable layout entered the runtime.
- OpenAI Evals inspired versioned data/manifest separation; its runtime was not added.
- Ponytail constrained the module to React, React DOM, the existing contracts workspace, and small testable seams. It did not remove validation, accessibility, provenance, cancellation, or truthful failure states.
- No Three.js, animation library, storage library, WebMCP polyfill, model grader, crawler, or direct-call fallback was added.

## Exit limitations and next owner

The user approved Chrome only after the in-app browser automation surface could not yield a real Tab trace. Chrome resolved the keyboard acceptance criterion for the recorded source. It could not manufacture an unsupported WebMCP client or a natural registration rejection, so those observations remain `BLOCKED`, not synthetic passes. They do not prevent the bounded source-baseline exit because deterministic injected-state/controller tests prove the required truthful non-success behavior and the real production lifecycle proves registrations can be removed without damaging the human route.

The current integrated worktree still needs a fresh 390 × 844 browser measurement and a real keyboard trace after browser attachment is available. M5 must also repeat the native route from the deployed public client and may only promote deployment parity if that fresh evidence exists.

## Fresh agent browser attempt

- **Execution Date**: `2026-09-01T02:30:00.448Z` / `2026-09-01T08:00:00+05:30`
- **Browser & Driver**: Headless Google Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`) driven via native Chrome DevTools Protocol (CDP WebSocket session).
- **Target URL**: `http://127.0.0.1:4173/` (Vite production preview build).
- **Captured Evidence Artifacts**:
  1. **Narrow Viewport Screenshot (390 × 844)**:
     - File: `docs/evidence/M1/raw/2026-09-01T02-30-00.448Z-mobile-390x844.jpg`
     - Device Metrics: Width `390px`, Height `844px`, DPR `2.0`, Mobile viewport emulation active.
  2. **Keyboard Traversal Trace**:
     - Trace File: `docs/evidence/M1/raw/2026-09-01T02-30-00.448Z-current-paper-browser-evidence.json`
     - Traversal: 14 distinct focus steps driving Tab and text input navigation from `Skip to paper` -> `Identity link` -> `paper-query` input (typed query `"Forty"`) -> `Search` button -> quick filter chips -> Chapter navigation rails.
  3. **Evidence Passage Verification**:
     - Verified exact Forty participants passage: *"Forty participants completed the study and were included in the final analysis."*
     - Verified page origin `http://127.0.0.1:4173` and visible provenance.

## Fresh browser-evidence attempt

- **Execution Date**: `2026-09-01T03:39:21.900Z`
- **Browser & automation**: Playwright Chromium headless (`playwright` via hermes-agent Node package), viewport forced to 390×844 against live `http://localhost:4173/` (did not start/stop the server).
- **Measured viewport**: `innerWidth=390`, `innerHeight=844`, `devicePixelRatio=1` (JPEG pixels also 390×844).
- **Items**:
  1. **390×844 narrow screenshot** — **captured** → `docs/evidence/M1/raw/2026-09-01T03-39-21Z-m1-390x844-screenshot.jpg`
  2. **Keyboard-only traversal trace** — **captured** → `docs/evidence/M1/raw/2026-09-01T03-39-21Z-m1-keyboard-trace.json` (Tab to `#paper-query`, typed `final analyzed sample`, Enter submit, Tab to suggestion / evidence, Enter to `#methods-participants`)
  3. **Forty-participant + origin integrity** — **captured** → `docs/evidence/M1/raw/2026-09-01T03-39-21Z-m1-origin-integrity.json` (exact excerpt present; page/provenance/inventory/result origins all `http://localhost:4173`). Native `navigator.modelContext` remains unavailable in Playwright Chromium (noted in that JSON; human evidence path used).
- **Remaining BLOCKED**: none of the three requested evidence items. Native WebMCP tool surface inside this automation browser is still absent (not required as a fourth deliverable here).
