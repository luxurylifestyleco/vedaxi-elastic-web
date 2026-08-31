# M6 Reproduction Foundation

> **Status:** foundation only. M6 is `NOT_STARTED`; this document does not pass M6, H11, H12, or D2–D8, select a license, establish rights, acknowledge rules, deploy, or authorize submission.

This is the minimum reviewer map for a future frozen submission candidate. The authoritative details remain in the [module architecture](MODULE_ARCHITECTURE.md), [submission pipeline](SUBMISSION_PIPELINE.md), [module gates](evaluation/MODULE_GATES.md), [rights ledger](compliance/RIGHTS_LEDGER.md), and [official-rules matrix](compliance/OFFICIAL_RULES_MATRIX.md).

## Architecture and load-bearing flow

| Surface | Authority and side effects |
| --- | --- |
| Paper origin (`apps/paper`) | Owns the human workspace, paper evidence, pending focus request, human confirmation controls, citation state, discrepancy note, and browser-local persistence. |
| Video origin (`apps/video`) | Owns independent transcript evidence and human seek behavior. Its tools are read-only and must not derive `34` or judge a contradiction. |
| WebMCP contract (`packages/contracts`) | Registers bounded native tools and removes them through their lifecycle. There is no direct-call fallback presented as native success. |
| Publisher state (`packages/state`) | Applies typed actions atomically. A tool may request focus; only an explicit human confirmation may block the citation and create the linked note. |
| External agent | Discovers tools and retrieves `40` and `6`, then derives `34` outside both publishers. It does not own publisher facts or the consequential decision. |

The load-bearing sequence is: discover Paper evidence → discover independent Video evidence → derive externally → request focus → wait for human confirmation → commit through Paper state → verify persistence after an agent-free reload → disable registrations and verify that only the agent route disappears. The full public sequence remains unverified until M5 exits.

Trust boundaries:

- Runtime origin and exact evidence provenance identify the publisher surface; they are not signatures or authentication.
- The Paper/Video readiness handshake accepts only the configured origin, expected frame/parent, and exact versioned payload.
- Browser `localStorage` is the current persistence boundary. No backend, production identity system, or server-side authorization exists.
- No email workflow, cron job, queue worker, or automated submission path exists.

## Environment and reproduction inputs

Requirements are Node.js 22 and npm. Start with `npm ci`, then `npm run quality:local`. Local development uses `npm run dev:paper` and `npm run dev:video` in separate terminals.

| Variable | Consumer | Current behavior | Release requirement |
| --- | --- | --- | --- |
| `VITE_VIDEO_ORIGIN` | Paper | Defaults to `http://localhost:4174` only in development; production fails closed when absent or invalid. | Set explicitly to the independent public Video origin; do not rely on the localhost fallback in production. |
| `VITE_PAPER_ORIGIN` | Video | Defaults to `http://localhost:4173` only in development; production fails closed when absent or invalid. | Set explicitly to the public Paper origin. It must differ from the Video runtime origin. |

These values are public origins, not secrets. No client-side secret, API key, credential, auth token, email configuration, cron configuration, or database URL is currently required. The examples are [Paper `.env.example`](../apps/paper/.env.example) and [Video `.env.example`](../apps/video/.env.example).

## Test and evidence matrix

`LOCAL AUTOMATED` means source behavior is exercised locally; it is not browser, deployment, or module-exit proof.

| Boundary | Current evidence classification | Still unverified |
| --- | --- | --- |
| Contracts, registration lifecycle, evidence schemas | `LOCAL AUTOMATED`; M0 also has a recorded historical browser baseline. | Current deployed-client parity. |
| Paper evidence and human workspace | `LOCAL AUTOMATED`; recorded M1 browser evidence is partial and source-bound. | Current integrated-source keyboard, responsive, unsupported/error, and exit evidence. |
| Video evidence, schemas, origin checks, readiness, seek precursor | `LOCAL AUTOMATED`. | Human media playback/seek, keyboard browser proof, physical MP4/VTT, and M2 exit. |
| Shared actions, persistence, rollback, reset, defensive cloning | `LOCAL AUTOMATED`. | Current rendered/browser reload evidence and M3 exit. |
| Semantic Stage navigation and focus behavior | `LOCAL AUTOMATED`. | Current desktop/mobile/reduced-motion browser review and M4 exit. |
| Ordered multi-origin workflow and kill-switch semantics | Local integration coverage only. | Public origins, clean approved-client trace, public reload/ablation, independent M5 review, and M5 exit. |
| Clean clone, public repository, license, deployment, demo, tested-client matrix | `UNVERIFIED` / `PENDING`. | All M6, H11/H12, and D2–D8 evidence. |

Use the [release registry](pipeline/release-registry.v1.json) and current hard-quality assessment for release status. A passing source test must never silently promote a module or submission gate.

## Automation and authority guardrails

Automation may install locked dependencies, type-check, test, build, validate registries/claims, and inspect links and files. Those actions do not authorize deployment or release.

- Evidence/search tools are read-only.
- The focus tool can create only a pending proposal; it cannot confirm on the human's behalf.
- Disabling WebMCP must remove registrations without deleting the human workspace or persisted note.
- Missing media, invalid origins, unavailable persistence, unsupported WebMCP, and incomplete release evidence remain explicit failures or blocks.
- Agents must not choose the project license, attest authorship or rights, acknowledge official rules, publish a demo, submit Devpost fields, or cross the Human Gate without the required human authority.
- Repository claim and hard-quality gates remain authoritative. Do not introduce a parallel release-status generator or infer eligibility from builds alone.

## Prior work versus challenge-period work

The official boundary is **2026-08-25 11:00 am PT** (`2026-08-25T18:00:00Z`). The earliest commit in the current repository history is `d31ca363f35e537aedc9a8c1528bf3bc618dcfcd`, recorded `2026-08-31T01:03:02+05:30`, after that boundary. Repository history therefore shows the tracked implementation beginning during the challenge period.

That fact is not a legal originality determination and does not answer the Devpost New/Existing field for the user. Earlier concepts, reference materials, inspiration, names, or externally authored assets must be disclosed separately. The retired operational Board is not a product or release surface. See the [inspiration ledger](evaluation/INSPIRATION_LEDGER.md) and [rights ledger](compliance/RIGHTS_LEDGER.md).

## Dependency, media, and provenance status

- Dependency metadata has been inventoried, but final license-text and obligation review is pending.
- No root project license has been selected; that is a human decision.
- Controlled MP4/VTT media is missing, and its manifest still requires creator, license, rights, hash, and recording provenance.
- Screenshot privacy/rights, fixture authorship, product/third-party marks, final AI-tool disclosure, and overall ownership remain pending.
- Public deployment, public repository access, logged-out video access, and judging-period availability remain unverified.

Nothing in this document clears D7. Record final evidence in the [rights ledger](compliance/RIGHTS_LEDGER.md) rather than duplicating it here.

## AI-assistance disclosure template

Complete this from actual records before drafting submission copy:

```text
Tool/service and version or account tier:
Dates used:
Purpose and project scope:
Inputs supplied (confirm whether any private or third-party material was included):
Outputs incorporated into source, copy, design, media, or tests:
Human reviewer and review date:
Material edits or rejection of generated output:
Terms, license, attribution, and rights basis:
Verification evidence (tests, file paths, hashes, or review record):
Known limitations or unresolved disclosure questions:
```

Do not claim that assistance was harmless, original, confidential, licensed, or fully reviewed unless the corresponding evidence has been retained. Final disclosure and submission authorization remain human-owned.
