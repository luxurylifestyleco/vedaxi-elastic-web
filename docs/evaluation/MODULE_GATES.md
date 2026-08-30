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

## Exit rule

A module exits only when:

1. its deterministic assertions pass;
2. applicable hard gates in `VEDAXI_RUBRIC.md` pass or are explicitly marked future-browser evidence;
3. code review finds no scope leak or copied inspiration material;
4. the module's OpenAI-Evals-style records are valid and versioned;
5. failures and unknowns are recorded rather than averaged away.
