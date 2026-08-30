# VEDAXI Module Gates

The project advances one bounded module at a time. A later module may be designed, but its implementation does not begin until the current module's exit gate is recorded.

## Gate record

Each module must declare before implementation:

- claim being tested
- user and system state
- one primary implementation variable
- deterministic primary assertion
- guardrail assertion
- evidence artifact to retain
- failure rule
- next action for pass, repair, or stop

Targets and scores are never backfilled after results are visible. Qualitative judge feedback is stored separately from deterministic behavioral evidence.

## Sequence

| Module | Scope | Entry condition | Exit evidence |
| --- | --- | --- | --- |
| M0A Contracts | Evidence types, search boundary, native registration lifecycle. | Approved design and current native API contract. | Unit tests, TypeScript check, source review; browser support remains explicitly unproven. |
| M0B Native Preflight | Smallest same-origin and two-origin browser probes; no product styling or shared mutations. | M0A passes. | Exact-browser identity, same-origin registration/invocation/abort, explicit iframe `allow="tools"`, video `exposedTo` paper origin, agent-visible origin provenance, fresh post-abort inventory, and fair WebMCP-off observation. Failure selects only the documented sequential topology experiment; no simulated fallback. |
| M1 Paper Origin | Human paper workspace and evidence-only WebMCP search. | M0B establishes an honest supported topology. | Exact passage/provenance test, human unsupported-state test, no-reasoning inspection. |
| M2 Video Origin | Human transcript workspace and evidence-only WebMCP search on a second origin. | M1 passes. | Exact timestamp/exclusion test, origin proof, keyboard path, no derived sample size. |
| M3 Shared Actions | Focus, confirm/reject, persistence, reset, and truthful failures through shared typed actions. | M1 and M2 pass independently. | Human/WebMCP parity tests, persistence/rejection/failure tests. |
| M4 Semantic Stage | Original editorial chapters and evidence-led focus transition. | Functional M3 vertical slice passes. | Reduced-motion, reachability, responsive, and visual-regression evidence. |
| M5 Native Reverification | Deployed clean-session, two-origin discovery, derivation, kill switch, and fair ablation. | Deployable M4 and recorded P0 topology. | In-app-browser trace, fresh tool inventory, ablation and collaboration checks; any P0-to-deployment drift blocks release. |
| M6 Submission | Public repo, license, instructions, demo video, Devpost package. | M5 hard gates pass. | Public URLs, clean reproduction, duration/audio checklist, final Delphi scorecard. |

## Current M0B topology decision

The artifact-bound in-app-browser rerun recorded at `2026-08-30T20:41:28.2260985Z` against source commit `93bb80f` is indexed by `vedaxi.m0b-browser.manual.v1` and documented under `docs/evidence/M0/`.

- Paper top-level native registration, discovery, invocation, and abort/fresh-inventory behavior: `PASS`.
- Simultaneous paper plus cross-origin-frame inventory: `FAIL`; the secure video frame reported `unsupported` and only the paper tool was inventoried.
- Clean-room one-agent sequential paper-to-video discovery and invocation: `PASS`; no DOM substitution or publisher-side comparison occurred.
- Selected implementation topology: `sequential`.
- H9 removal feasibility: precursor `PASS`; full H9 is not evaluated until M5 because M0 has no persisted note.
- Exact client version/build and screenshot evidence: `BLOCKED` and explicitly carried as evidence limitations, not converted into failures or passes.

This is an M0B feasibility result, not evidence for final product derivation, shared mutation, persistence, Semantic Stage, deployment, or submission behavior. M5 must reverify the selected topology in the deployed target environment.

## Exit rule

A module exits only when:

1. its deterministic assertions pass;
2. applicable hard gates in `VEDAXI_RUBRIC.md` pass or are explicitly marked future-browser evidence;
3. code review finds no scope leak or copied inspiration material;
4. the module's OpenAI-Evals-style records are valid and versioned;
5. failures and unknowns are recorded rather than averaged away.
