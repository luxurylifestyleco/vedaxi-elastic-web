# M1 Exit Record

## Identity and decision

| Field | Value |
| --- | --- |
| Module | M1 — Paper Origin / Paper Integrity Desk |
| Deterministic eval | `vedaxi.m1-paper.dev.v1` |
| Browser evidence eval | `vedaxi.m1-paper-browser.manual.v1` |
| Source artifact | `06a9512c3e30672556d6eb524ac7d5d97221001a` on `codex/phase-0-webmcp` |
| Recorded | `2026-08-30T21:25:53.4867712Z` / `2026-08-31T02:55:53.4867712+05:30` |
| Source review | Sub Agent 14 // Paper Plan — APPROVED; Sub Agent 15 // Paper Red Team — APPROVED; Sub Agent 16 // Paper Experience — APPROVED |
| Status | `SOURCE APPROVED; MODULE EXIT BLOCKED` |

The M1 runtime is implemented, reviewed, tested, and pushed. The module is not marked `PASS` because real keyboard traversal and real native unsupported/error browser observations are still blocked. M2's recorded entry gate requires M1 `PASS`, so downstream implementation does not silently proceed.

## Expected and observed

| Expectation | Observation | Decision |
| --- | --- | --- |
| Human-useful editorial paper | Complete fictional research note with article structure, outline, methods evidence, provenance, figure, references, disclosure, and independent search. | PASS |
| Exact paper-owned evidence | Stable `paper.methods.final-analysis`; exact forty-participant passage, locator, provenance, and current origin only. | PASS |
| Native evidence route | One strict read-only tool in production; exact result; page, visible provenance, inventory, and result origins equal. | PASS |
| No publisher reasoning | No video evidence, subtraction, `34`, contradiction judgment, mutation, persistence, or recommendation in output/runtime. | PASS |
| Human route survives kill switch | Fresh inventory changed one → zero → one; disabled call rejected; full paper and human search remained. | PASS |
| Responsive experience | Desktop capture retained; mobile requested 390 × 844 and captured a 375 × 812 bitmap/layout viewport with no horizontal overflow and 44px/56px controls. | PASS |
| Real keyboard traversal | CUA Tab and page-driver Tab left focus on `BODY`; no pass inferred. | BLOCKED |
| Real unsupported browser state | Exact browser supports native WebMCP; a policy-blocked harness was not bypassed. | BLOCKED |
| Natural native registration error | No natural native rejection occurred; deterministic rejection/status tests pass separately. | BLOCKED |
| Exact client version/build | Runtime did not expose it. | BLOCKED |

## Verification

From `VEDAXI - Elastic WEB`:

```text
npm test
PASS — 9 files, 69/69 tests

npm test -- apps/paper/src/paper
PASS — 4 files, 32/32 tests

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
PASS — manual registry valid (7 cases)

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
- Deterministic dataset/manifest: `evals/registry/data/vedaxi/m1-paper-dev-v1.jsonl`, `evals/registry/manifests/vedaxi-m1-paper.dev.v1.json`.
- Manual dataset/manifest: `evals/registry/data/vedaxi/m1-paper-browser-manual-v1.jsonl`, `evals/registry/manifests/vedaxi-m1-paper-browser.manual.v1.json`.

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
| Working | Native discovery/call and ablation pass from immutable production source; blocked browser states remain explicit. | PARTIAL — blocked evidence prevents exit |
| Execution | Complete editorial paper, provenance, responsive layouts, tests, lifecycle safety, and no fallback. | PASS at source/observed surfaces |
| Impact | Makes publisher evidence visible and usable before later cross-source citation work. | PROVISIONAL — M3–M5 own end-to-end user outcome |
| Creativity | Protocol status, evidence provenance, and human/agent parity are integrated into an editorial research artifact. | PROVISIONAL — no final judge score invented |

## Inspiration and minimalism review

- Shopify Editions, supplied Drive documents, Karpathy repositories, and arXiv patterns influenced information hierarchy and paper discoverability only. No copied text, assets, source, branding, or identifiable layout entered the runtime.
- OpenAI Evals inspired versioned data/manifest separation; its runtime was not added.
- Ponytail constrained the module to React, React DOM, the existing contracts workspace, and small testable seams. It did not remove validation, accessibility, provenance, cancellation, or truthful failure states.
- No Three.js, animation library, storage library, WebMCP polyfill, model grader, crawler, or direct-call fallback was added.

## Blocker and next authorized action

The AGENTS browser rule permits switching from Vercel Agent Browser to Chrome only after Vercel cannot complete the task and the user approves the switch. Vercel's in-app surface did not produce a working real Tab trace and the exact browser cannot naturally represent unsupported WebMCP. Closing those rows requires either user-approved Chrome verification (for keyboard and unsupported behavior where possible) or a user-approved decision to accept the blocked evidence as an environment limitation. Until then, M1 remains blocked and M2 does not start.
