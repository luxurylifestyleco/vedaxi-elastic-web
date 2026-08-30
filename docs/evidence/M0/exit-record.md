# M0 Exit Record

## Identity and decision

| Field | Value |
| --- | --- |
| Module | M0 — Protocol Foundation (M0A contracts + M0B native preflight) |
| Contract eval | `vedaxi.contracts.dev.v3` (v2 preserved unchanged) |
| Browser evidence eval | `vedaxi.m0b-browser.manual.v1` |
| Source artifact | `93bb80fe9d66c4232c2b96fbb298241c1260d6b3` on `codex/phase-0-webmcp` |
| Exit-bundle tree | Uncommitted evidence/eval/docs tree pending independent approval and checkpoint commit |
| Recorded | `2026-08-30T20:51:55.4380289Z` / `2026-08-31T02:21:55.4385430+05:30` |
| Status | `APPROVED — local sequential M0` |
| Topology decision | `sequential` |
| Reviewer | Sub Agent 5 // Contract Review — `APPROVE` |

M0's authoritative boundary is evidence/search/native-registration contracts plus exact-browser topology. Shared publisher actions, result envelopes, persistence, and audit vocabulary are owned by M3.

## Expected and observed

| Expectation | Observation | Decision |
| --- | --- | --- |
| Native top-level paper registration/discovery/invocation | Paper secure/active; exact publisher-owned result with score `3`. | PASS |
| Simultaneous paper + cross-origin-frame inventory | Secure video iframe reported `unsupported`; paper inventory contained only its tool. | FAIL; do not use simultaneous topology |
| Evidence-backed sequential alternative | Clean-room browser agent discovered paper, followed visible video URL, then discovered video; exact score `2` result; no comparison. | PASS; selected topology |
| Native removal feasibility | Fresh post-disable capability snapshots contained zero tools; calls unavailable; human content remained; video re-enabled. | PASS precursor only |
| Full H9 persisted-note kill switch | No persisted note exists in M0. | N/E; M5 owner |
| Exact client version/build | Runtime did not expose it. | BLOCKED |
| Screenshots | Not captured. | BLOCKED |

The simultaneous failure and blocked evidence forms are retained; neither is rewritten as a pass. Native viability for the selected local sequential route is proven. Deployment parity remains M5 work.

## Verification commands and results

Run on Windows from `VEDAXI - Elastic WEB` unless noted:

```text
npm test
PASS — 5 files, 37/37 tests

npx tsc --noEmit
PASS — no diagnostics

npm run build:probe
PASS — paper and video Vite production builds
```

Run from repository root:

```text
node evals/validate-manual.mjs evals/registry/manifests/vedaxi-m0b-browser.manual.v1.json
PASS — M0B manual registry valid (8 cases)

Get-Content -Raw docs/evidence/M0/raw/*.json | ConvertFrom-Json
PASS — six JSON artifacts parse

git diff --check
PASS — no whitespace errors; line-ending warnings only
```

Browser environment and origins:

- Codex In-app Browser (`iab`), production flavor, Windows.
- Paper: `http://localhost:4173/`.
- Independent video publisher: `http://localhost:4174/`.
- Server/start commands from `VEDAXI - Elastic WEB`: `npm run dev:probe:paper` and `npm run dev:probe:video`. The scripts bind Vite with strict ports `4173` and `4174`; the run used local loopback URLs only.
- Exposure policy: paper registers with `exposedTo: []`; its iframe declares `allow="tools"`; video registers with `exposedTo: ["http://localhost:4173"]`.
- Clean/reset state: the artifact rerun opened a fresh paper tab from `4173`; the isolated clean-room agent created its own new paper tab and then a new direct-video tab. Lifecycle observations called the current document's `webmcp.fetchTools()` after each disable/re-enable instead of reusing a prior tool snapshot.
- Exact browser version/build: `BLOCKED`, not inferred.

## Evidence index

- Contract v3 dataset: `evals/registry/data/vedaxi/contracts-dev-v3.jsonl`.
- Contract v3 manifest: `evals/registry/manifests/vedaxi-contracts.dev.v3.json`.
- Manual browser dataset: `evals/registry/data/vedaxi/m0b-browser-manual-v1.jsonl`.
- Manual browser manifest: `evals/registry/manifests/vedaxi-m0b-browser.manual.v1.json`.
- Strict validator: `evals/validate-manual.mjs`.
- Browser matrix: `docs/evidence/M0/M0B_BROWSER_MATRIX.md`.
- Raw artifact root: `docs/evidence/M0/raw/`.
- Source/hash binding: `docs/evidence/M0/raw/2026-08-30T20-41-28Z-source-binding.json`.
- Clean-room dispatch/report: `docs/evidence/M0/raw/2026-08-30T20-41-28Z-clean-room-replay.md`.
- Frozen Dual Delphi boards and neutral arbitration: `docs/evaluation/delphi/m0-node-a.md`, `m0-node-b.md`, `m0-arbiter.md`.

## Fact labels

| Fact | Label | Basis |
| --- | --- | --- |
| Source commit and file hashes | verified | Git and SHA-256 output retained in source-binding artifact |
| 37 tests, typecheck, and both builds pass | verified | Fresh local command output |
| Paper/video exact results and lifecycle states | verified | Raw in-app-browser DOM/inventory/call exports |
| Clean-room sequential discovery | verified | Isolated Sub Agent 11 dispatch/report plus matching raw call artifacts |
| Shopify Editions, supplied Drive documents, OpenAI Evals, Ponytail, and Karpathy repositories are inspiration only | provided + repository-verified | User instruction plus source/dependency inspection; no copied runtime/assets introduced |
| Exact client version/build | unknown — BLOCKED | Runtime unavailable |
| Screenshot evidence | unknown — BLOCKED | Not captured |
| Deployed parity, persisted note, agent derivation, shared mutation, Semantic Stage, and final judge score | unknown — N/E | Owned by M3–M6 |

## Known failures and owners

| Item | Current state | Owner / consequence |
| --- | --- | --- |
| Cross-origin iframe native registration | FAIL | M1–M5 use sequential navigation; a later browser change must be re-probed before topology changes. |
| Full H9 | N/E | M5 must prove removal plus human-page and persisted-note survival. |
| Exact browser version and screenshots | BLOCKED | M5 should capture if the deployed runtime exposes them; never infer. |
| Aggregate legacy eval ID drift and later D-gate records | Open documentation/eval debt | Repair in the owning module; does not broaden M0. |

## Downstream invalidation

The new public cancellation/lifecycle semantics affect C01 and C02 registration adapters and C05 end-to-end removal. Any incompatible change to `EvidenceObject`, search validation, `WebMcpTool`, `WebMcpRegistration`, registration status, lifecycle cancellation, or selected topology reopens M0 and invalidates downstream browser evidence. A simultaneous-topology claim requires a new passing exact-browser artifact; it cannot replace this recorded failure by assertion.

## Inspiration and minimalism review

- External references remain design/evaluation inspiration and do not enter runtime code, fixtures, assets, branding, or dependencies.
- OpenAI Evals inspired versioned datasets and evaluator separation; its runtime was not added.
- Ponytail informed deletion of unsupported claims and avoidance of new abstractions/dependencies; validation, lifecycle safety, provenance, and truthful failure states were retained.
- The M0 runtime remains a narrow contract package plus two minimal probes. No UI framework, storage layer, model grader, polyfill, aggregator, or direct-call fallback was added.
