# M1 Current-Source Evidence Plan

## Decision now

M1 remains **BLOCKED**. The newest immutable M1 browser package is `vedaxi.m1-paper-browser.manual.v3`, bound to Paper runtime commit `85e139735da224f16985be1aeb11152dce4d20f4`. It contains four passing cases but explicitly blocks fresh narrow-responsive and real-keyboard observations. The current Paper candidate has changed after that commit (`PaperApp.tsx`, `styles.css`, and the new `stage/**` surface), including chapter navigation and a focus-handoff repair. Therefore neither v1/v2 nor v3 can be inherited as current-source proof.

This file is a run plan only. It does not alter the M1 exit record, registry, manifests, datasets, or promotion state.

## Evidence lineage and permitted use

| Evidence | Source binding | What it proves | Current-source use |
| --- | --- | --- | --- |
| v1 browser matrix and raw records | `06a9512c3e30672556d6eb524ac7d5d97221001a` | Native route, human search, lifecycle, desktop render, and a 375 × 812 capture after requesting 390 × 844; in-app keyboard remained blocked. | Historical baseline only. Its responsive result predates the current chapter rail and styles. |
| v2 Chrome follow-up | `06a9512c3e30672556d6eb524ac7d5d97221001a` | Real Chrome keyboard order, lifecycle operation, human-search result focus, skip-link focus, and empty diagnostics. | Historical keyboard baseline only. It must not pass the current navigation/focus implementation. |
| v3 current-runtime package / Sub Agent 4 // Browser Proof | `85e139735da224f16985be1aeb11152dce4d20f4` | Fresh native inventory/result/schema, exact human-search navigation, one → zero → one lifecycle, origin equality, source identity, and empty captured diagnostics. Narrow and keyboard cases are `BLOCKED`. | Historical protocol baseline only. All UI-sensitive cases require rerun, and protocol cases require rerun if the final source diff touches registration, services, fixture, app composition, or build output. |
| Sub Agent 22 browser observation | Later working-tree candidate; no immutable M1 raw artifact or source identity is present under `docs/evidence/M1/`. | An intermediate observation reportedly exposed a mobile chapter-navigation regression and led to a subsequent repair. | Diagnostic only. It is superseded by the repair and cannot be scored as a pass. Preserve its finding in the new run's regression checklist. |
| Sub Agent 30 browser observation | Later working-tree candidate; no immutable M1 raw artifact or source identity is present under `docs/evidence/M1/`. | A later mobile/keyboard observation reportedly found focus loss after chapter activation. | Diagnostic only. It predates the latest focus-handoff change and must be rerun. No pass may be inferred from a chat/agent packet. |
| Current deterministic source checks | Uncommitted working tree, not an immutable artifact | Focused tests can show the intended chapter rail and focus-handoff behavior at source level. | Supporting evidence only. Tests do not replace real keyboard or 390 × 844 browser traces. |

The Sub Agent 22 and 30 rows deliberately record only the findings needed to define the rerun. If their structured completion packets are later retained, copy their exact timestamps, clients, source identities, and observations into a separate immutable raw record; do not rewrite this plan or promote the reports themselves into browser evidence.

## Freeze the candidate before observing it

The evidence operator must first freeze the exact Paper candidate. A dirty working tree described only by `HEAD` is not a source identity. Prefer a reviewed commit. If a commit is not yet permitted, create a read-only snapshot identity containing the tracked and untracked Paper files and hash the canonical inventory plus file bytes. Do not use a patch hash alone because untracked `stage/**` files are part of the runtime.

Record all of the following before launch:

- full repository commit and whether the tree is clean;
- canonical, sorted list of every runtime/build input under `apps/paper/`, including untracked files if any;
- SHA-256 for each listed file and one SHA-256 for the canonical inventory;
- package-lock SHA-256, Node/npm/Vite versions, OS, build command, preview command, host, and port;
- production asset filenames and SHA-256 values after `npm run build:paper`;
- exact browser/client name and version/build when exposed, otherwise `null` with `BLOCKED` status;
- UTC and local timestamps and the evidence operator identity.

Any source or dependency-file change after freezing invalidates the run. Rebuild and mint a new version rather than editing an existing dataset or raw record.

## Required v4 observation sequence

Run deterministic validation first, then one uninterrupted production-preview browser sequence against the frozen candidate. A browser/tool limitation is recorded as `BLOCKED`; a product behavior that is observable and wrong is `FAIL`.

1. **Deterministic preflight:** focused Paper/stage tests, full tests, TypeScript, Paper production build, and `git diff --check`. Retain commands, exit codes, counts, and build assets. A failure stops browser promotion.
2. **Desktop human baseline:** load the production preview at the recorded desktop viewport. Capture page title, landmarks, chapter navigation, exact paper passage, search controls, console errors/warnings, horizontal overflow, and a screenshot.
3. **Current 390 × 844 layout:** set both requested and measured viewport values. Prove no document-level horizontal overflow (`scrollWidth <= clientWidth`), no clipped controls, minimum 44 × 44 interactive targets, usable mobile chapter rail, readable paper/search/evidence content, and reachability of all five chapters. Capture full-page screenshot plus measured geometry JSON.
4. **Real keyboard trace:** starting from a clean navigation, record every `Tab`/`Shift+Tab`/`Enter` step by accessible name, role, element ID/href, and active element. It must cover skip link, protocol control, mobile or desktop chapter navigation appropriate to the viewport, human-search input/submit/result, native-tool disable/re-enable controls, and return/recovery focus.
5. **Chapter focus regression:** keyboard-activate each of Paper, Method, Video, Evidence, and Decision. The URL target must update, the destination heading must receive visible programmatic focus without an extra scroll jump, the next `Tab` must continue from the destination's DOM position, and focus must never fall to `BODY`. Repeat at desktop and 390 × 844. Pointer activation must not steal focus from the pointer user.
6. **Search focus parity:** execute `final analyzed sample` by keyboard. Prove the result is announced, the result control is reachable, activation moves focus to `#methods-participants`, the exact forty-participant passage and provenance remain present, and the next keyboard action continues logically.
7. **Native Paper route:** from a fresh tool inventory, record the one strict read-only `search_paper_evidence` tool, schema/annotations, exact result, and equality of page, visible-provenance, tool, and result origins. Human search must remain a direct human route, not a fallback native execution.
8. **Lifecycle ablation:** record fresh inventory one → zero → one, rejection of the stale handle, survival of paper/search/chapter navigation while disabled, focus retention/recovery around the toggle, and exact result restoration after re-enable.
9. **Diagnostics and reduced motion:** retain console/network errors and warnings for the full sequence. Repeat chapter activation under `prefers-reduced-motion: reduce` and prove semantic focus/order equivalence without relying on animation.
10. **Independent review:** a reviewer who did not implement the focus fix checks raw trace completeness, source binding, screenshots, geometry, and dataset statuses before any exit-record change.

Unsupported-client behavior, a natural registration rejection, and exact client build remain non-gating environmental observations when unavailable. They must stay `BLOCKED`, not be manufactured or converted from deterministic controller tests.

## Immutable v4 artifacts and required fields

Mint these names only after the frozen run timestamp is known; replace `<UTC>` with `YYYY-MM-DDTHH-mm-ssZ` and never overwrite an existing file:

- `docs/evidence/M1/raw/<UTC>-paper-source-snapshot-v4.json`
- `docs/evidence/M1/raw/<UTC>-paper-production-build-v4.json`
- `docs/evidence/M1/raw/<UTC>-paper-desktop-browser-v4.json`
- `docs/evidence/M1/raw/<UTC>-paper-narrow-390x844-v4.json`
- `docs/evidence/M1/raw/<UTC>-paper-keyboard-focus-v4.json`
- `docs/evidence/M1/raw/<UTC>-paper-native-lifecycle-v4.json`
- `docs/evidence/M1/raw/<UTC>-paper-reduced-motion-v4.json`
- `docs/evidence/M1/raw/<UTC>-paper-desktop-v4.png`
- `docs/evidence/M1/raw/<UTC>-paper-narrow-390x844-v4.png`
- `evals/registry/data/vedaxi/m1-paper-browser-manual-v4.jsonl`
- `evals/registry/manifests/vedaxi-m1-paper-browser.manual.v4.json`

Every raw JSON record must include `schema_version`, `artifact_id`, `captured_at_utc`, `captured_at_local`, `module`, `case_id`, `status`, `operator`, `source_identity`, `environment`, `commands_or_actions`, `expected`, `observed`, `assertions`, `diagnostics`, `limitations`, `artifact_paths`, and `artifact_sha256`. `source_identity` must include the commit, clean/dirty state, canonical inventory hash, per-file hashes, lockfile hash, and production asset hashes. Browser records must also include requested/measured viewport, client/version, URL/origin, ordered focus trace where applicable, and console/network observations. The manifest must enumerate every case and artifact by path and SHA-256 and report exact `PASS`/`FAIL`/`BLOCKED` counts.

## Strict decision rule

M1 may be proposed as **PASS** only when all of the following are true for one frozen source identity:

- deterministic preflight passes;
- desktop and exact measured 390 × 844 observations pass;
- real keyboard traversal and the post-fix chapter-focus regression pass at desktop and narrow viewports;
- search focus parity, exact native evidence, origin equality, lifecycle ablation, human-route survival, reduced-motion equivalence, and diagnostics pass;
- every required artifact exists, hashes match, the v4 manual manifest validates, and independent review finds no source/evidence mismatch;
- no product failure is relabeled as an environment block and no result is inherited from v1–v3 or an intermediate agent run.

If an observable required behavior is wrong, the decision is **FAIL / REPAIR** and the owning source module must be repaired before minting a new evidence version. If the approved browser cannot attach, dispatch real input, expose a required page, or retain an artifact, the decision is **BLOCKED**. A blocked required current-source narrow or keyboard case blocks M1 promotion even when deterministic tests pass. Non-gating natural limitations may remain `BLOCKED` only when explicitly separated as above. Until a complete v4 package passes this rule, the existing exit record and release registry must remain unchanged.
