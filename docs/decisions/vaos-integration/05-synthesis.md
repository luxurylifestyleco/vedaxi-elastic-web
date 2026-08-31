# ECE Stage 5 — VAOS Integration Synthesis

**Stage owner:** Sub Agent 38 // VAOS Synthesis

**Decision lane:** ECE — consequential architecture decision

**Stage status:** `SYNTHESIS_COMPLETE / HUMAN_DECISION_BLOCKED`

**Frozen inputs:** [`00-vaos-audit.md`](./00-vaos-audit.md), [`00-source-identity.md`](./00-source-identity.md), [`01-kernel.md`](./01-kernel.md), [`02-epistemic.md`](./02-epistemic.md), [`03-provenance.md`](./03-provenance.md), and [`04-skeptic.md`](./04-skeptic.md)

**Authority:** recommendation only; this record invokes no VAOS component, authorizes no implementation or persistence, changes no release dependency, and does not cross the Human Gate. The frozen policy keeps repository records authoritative and reserves release and mutation authority for later human approval. (E22–E24)

## Executive call

**Highest-leverage bounded recommendation:** keep VAOS outside live VEDAXI orchestration, cognition, persistence, and release paths; first measure whether repository-only decision records leave a material decision-memory problem worth solving. The concrete VEDAXI use case, measurable benefit, and repository-only sufficiency are still `UNKNOWN`, so integration cost and risk cannot yet be justified. (E26–E27, E32)

If a human approves one reversible next step, run a **repository-only value-baseline experiment** using fixed, non-sensitive decision cases and no VAOS runtime: measure retrieval success, repeated-decision rate, time to reconstruct prior rationale, unsupported-claim rate, and reviewer confidence using the current repository records. This closes the first decision gap without invoking VAOS, emulating its cognition, contacting Broker/Ollama/KGS/Qdrant, or changing release behavior. (E04, E21–E23, E26–E27, E31)

Do not authorize even a fixed-fixture VAOS-shaped adapter unless that baseline demonstrates a material unmet need and the Human Gate separately approves a versioned contract experiment. The handover chain remains `ASSUMED` as an intended contract, while adapter behavior, runtime value, and user-authority preservation remain untested. (E24–E26, E31)

## Why this is the leverage point

- The current packet already establishes enough high-consequence defects and gaps to reject live coupling: admission is schema-blind and spoofable, evidence does not causally reach synthesis, verification is not independent, replay identity is unstable, queue ordering can lose work, persistence failure does not stop dispatch, and the poller lacks a Human Gate. (E06–E07, E13–E20)
- More runtime architecture work would be premature while the underlying business and operational value is `UNKNOWN`; a repository-only baseline can determine whether an integration problem exists before accepting a new trust boundary. (E26–E30)
- The baseline preserves the current authority order and does not make VAOS a release dependency, which is only `INFERRED` to add an unverified failure boundary and has not had its delivery impact measured. (E22–E23, E32)
- The source is byte-identifiable but lacks Git lineage, and no runtime behavior was exercised; this supports a frozen evaluation packet, not a maintained or production-ready integration claim. (E02–E04)

## Decision boundaries

| Boundary | Synthesis position | Provenance basis |
|---|---|---|
| Invocation | No live `process_signal()`, poller, Broker, Ollama, KGS, or Qdrant invocation under this recommendation. | E04, E11–E12, E21, E31 |
| Inputs | Direct user instructions remain authoritative; no machine signal enters a consequential path through the current prefix-only source check. | E06–E07, E24 |
| Outputs | No VAOS output is accepted as evidence, provenance certification, verified cognition, scheduling authority, or release authority. | E13–E15, E22–E23, E31 |
| Memory | Repository decision records remain authoritative; supplementary memory is neither read nor written by the proposed baseline. | E21–E23 |
| Persistence | No inbox archive, dispatch, KGS write, Qdrant write, or persistence verification is authorized. | E16–E22 |
| Release | VAOS remains isolated from the current release and cannot replace deterministic tests, quality vetoes, independent judgment, evidence, or the Human Gate. | E23, E32 |
| Source identity | Conclusions apply only to the five captured byte identities; changed bytes require re-audit, and upstream lineage remains `UNKNOWN`. | E01–E03 |
| Intended architecture | The named VAOS chain remains `ASSUMED`; semantic compatibility must not be claimed from shared stage names. | E25 |

## Reversible next experiment

The only experiment recommended for Human Gate consideration now is a **repository-only decision-memory baseline**, not a VAOS trial. (E22–E23, E26–E27)

### Inputs and method

1. Freeze a separately versioned dataset of real or sanitized VEDAXI decision cases, stratified by routine and consequential complexity, and report the exact sample size without generalizing beyond it. This dataset supplies the missing bounded use case and outcome target; both are currently `UNKNOWN`. (E26, E28, E30)
2. Ask independent reviewers to recover prior rationale using only current repository decision records; record retrieval success, elapsed time, reopened-settled-question rate, unsupported-claim rate, and confidence calibration. This tests repository-only sufficiency, which is currently `UNKNOWN`. (E27)
3. Predefine a materiality threshold and acceptable operating cost before scoring; acceptable latency, availability, and failure budgets are currently `UNKNOWN` and must remain human-owned requirements. (E28)
4. Persist results only in the repository with dataset version, scorer identity, raw outcomes, and limitations; do not write supplementary stores or assert VAOS fitness. (E22–E23, E26–E27)

### Experiment exit rule

- If repository-only records meet the predefined thresholds, stop the VAOS integration lane and retain the frozen audit as a rejected architecture record; no runtime experiment is justified by the available value evidence. (E26–E27)
- If repository-only records materially fail the predefined thresholds, the result establishes an unmet need but does **not** establish that VAOS solves it; return to a new Human Gate for permission to design a versioned, fixed-fixture adapter-contract experiment. (E25–E27, E31)
- Any future adapter-contract experiment must remain non-mutating, explicitly untrusted, isolated from release, and tested against a separately versioned outcome dataset; the current packet does not establish those adapter properties. (E22–E23, E30–E32)

## Rejected options at this stage

| Option | Disposition | Reason | Provenance basis |
|---|---|---|---|
| Treat the handover as implemented truth | Reject | The named chain is `ASSUMED`; captured bytes do not establish complete contract compatibility or fitness. | E02–E04, E25 |
| Live read-only advisory invocation | Reject for now | The full path is nondeterministic, Broker contracts and health are unknown, retrieved memory does not inform synthesis, provenance is input-derived, verification is self-contained, and adapter behavior is untested. | E11–E15, E21, E31 |
| Documentation-only VAOS emulation now | Reject for now | Shared names could imply false compatibility, stage quality is untested, and no unmet need has yet been demonstrated; a second cognition copy would not validate the captured runtime. | E10, E25–E27 |
| Supplementary KGS/Qdrant persistence | Reject | Stable replay identity, original-record verification, recovery ownership, runtime health, and production constraints are absent or `UNKNOWN`; mutation also lacks authorization. | E16–E22, E29–E30 |
| Poller, queue, or worker scheduling integration | Reject | Admission is unauthenticated, queue ordering can lose work, persistence failure does not stop dispatch, and the poller has no Human Gate. | E05–E08, E16–E20, E24 |
| Release coupling or provenance certification | Reject | Current cognition does not carry KG evidence into synthesis, verification is not independent, and policy prohibits substitution for release gates. | E13–E15, E22–E23, E32 |
| Permanent non-integration | Defer | The value of durable cognition and the adequacy of repository-only records are both `UNKNOWN`; current evidence supports caution, not a permanent rejection. | E26–E27 |

## Stop conditions

Stop the baseline immediately if any step would invoke VAOS, contact Broker/Ollama/KGS/Qdrant, mutate an external store, ingest sensitive data without an approved boundary, influence the release queue, or reinterpret a direct user instruction as an `observer.*` signal. (E04, E12, E21–E24, E30)

Stop and re-freeze the evidence packet if any of the five audited file digests changes; the existing audit is anchored only to those bytes and upstream lineage is `UNKNOWN`. (E01–E03)

Stop the integration lane after a passing repository-only baseline unless a human identifies another measured problem; the present packet contains no evidence that VAOS adds value beyond that baseline. (E26–E27)

Stop any later fixed-fixture adapter experiment if it cannot prove strict non-authority, deterministic fixture replay, explicit degraded states, no reachable mutation or dispatch, direct-user bypass, and release isolation. These properties are not currently established. (E11, E20, E23–E24, E31–E32)

Stop before any live or mutating experiment until trusted admission, evidence-causal cognition, independent verification, stable identity, atomic queue semantics, exact persistence verification, operating budgets, named owners, and security/privacy/deployment boundaries are separately evidenced. (E06–E21, E28–E30)

## Missing evidence that would change the call

The recommendation could advance from repository-only measurement to a fixed-fixture adapter-contract experiment if frozen evidence shows a material repository-memory deficit, a bounded VEDAXI use case, explicit success metrics, and a human-approved operating envelope. Those items are currently `UNKNOWN`. (E26–E30)

The recommendation could advance from fixed fixtures to an isolated live read-only trial only if new immutable source lineage and authorized tests establish authenticated canonical admission, replay resistance, explicit external dependency behavior, causal memory-to-synthesis flow, resolvable claim evidence, independent verification, preserved direct-user authority, no reachable mutation, and a fail-closed Human Gate. None is established now. (E03, E06–E15, E20–E24, E30–E31)

The recommendation could advance to supplementary persistence only if a separately authorized design and fault-injection record establishes stable signal-to-decision identity, exact original-record read-after-write verification, atomic acknowledgement, reconciled partial failures, repository precedence, approved retention/privacy boundaries, and named recovery ownership. None is established now. (E16–E22, E29–E30)

The recommendation could advance to orchestration or release influence only if independently reproduced outcome evidence shows material benefit and every deterministic, quality, evidence, independent-review, and Human Gate veto remains technically unavoidable. Present policy prohibits substitution, and current release impact is only `INFERRED` and unmeasured. (E23, E26–E28, E32)

## Exact Human Gate boundary

This synthesis stops before action. A human must explicitly choose whether to authorize the repository-only baseline, define its materiality and operating thresholds, approve its dataset scope, and name its accountable reviewer; silence, timeout, ambiguity, or partial approval means **no experiment**. (E22–E24, E26, E28–E30)

Any later move—from baseline to fixed fixtures, fixed fixtures to live read-only invocation, live invocation to external persistence, or persistence to orchestration/release influence—requires a new explicit Human Gate decision against newly frozen evidence. Approval at one boundary grants no authority at the next. (E20, E22–E24, E31–E32)

No human approval may retroactively convert `UNKNOWN`, `ASSUMED`, or `INFERRED` items into `KNOWN`; only separately captured evidence can change those classifications. (E03, E21, E25–E32)

## Handoff to independent verification

Stage 6 must independently check that this recommendation follows the Stage 3 support map, preserves all `UNKNOWN`, `ASSUMED`, and `INFERRED` classifications, rejects unsupported runtime and provenance claims, and stops before authorization. It must record disagreement without editing this synthesis. (E03, E21, E25–E32)

Stage 6 must not treat the repository-only baseline as approved, run VAOS, inspect new sources, mutate stores, or repair this record; any failure returns the lane to the owning earlier stage. (E04, E20–E24)

## Provenance coverage

This synthesis preserves and cites the full Stage 3 decision-bearing set: E01, E02, E03, E04, E05, E06, E07, E08, E09, E10, E11, E12, E13, E14, E15, E16, E17, E18, E19, E20, E21, E22, E23, E24, E25, E26, E27, E28, E29, E30, E31, and E32. The classifications remain 23 `KNOWN`, 2 `INFERRED`, 1 `ASSUMED`, and 6 `UNKNOWN`; coverage does not promote any classification or create authority. (E01–E32)
