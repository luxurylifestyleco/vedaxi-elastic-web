# ECE Stage 1 — VAOS Integration Kernel

**Stage owner:** Sub Agent 18 // VAOS Kernel
**Decision lane:** ECE — consequential architecture decision
**Stage status:** `KERNEL_COMPLETE / DOWNSTREAM_INPUT_BLOCKED`
**Authority:** framing only; this record recommends no option and authorizes no implementation, runtime invocation, persistence, or release change.

## Input boundary

The assigned frozen input is the read-only VAOS integration audit from Sub Agent 15. That packet is not present in the repository at the time of this stage. The repository-backed orchestration ledger instead records Sub Agent 15 as `ACTIVE`, with “No repository artifact yet.” No audit text or path was available to this stage owner.

The audit packet was subsequently frozen as [`00-vaos-audit.md`](./00-vaos-audit.md). This link does not retroactively change the facts available to the Kernel stage when it was written.

Consequently:

- no statement about the behavior of `decision_engine.py`, its schemas, its storage clients, or its failure modes is treated here as an audit-verified fact;
- the user-provided VAOS handover is treated as the proposed system contract, not as evidence that the local runtime satisfies that contract; and
- later ECE stages must not proceed as if the audit had been frozen. They require the actual audit packet or a separately authorized, independently produced replacement.

## Problem class

This is a **consequential architecture, trust-boundary, and operational-governance decision**. It combines:

1. **Integration architecture:** whether VEDAXI should call, adapt, or remain separate from the local VAOS Core.
2. **Authority design:** which system may create decision inputs, retrieve memory, persist results, or influence release work.
3. **Evidence integrity:** how proposed VAOS outputs would be distinguished from verified repository facts.
4. **Reliability and recovery:** how queue safety, idempotency, partial storage failure, and replay would be handled.
5. **Release governance:** whether any VAOS-derived record can inform, but never bypass, deterministic tests, hard-quality gates, independent judgment, and the Human Gate.

It is not merely a library-selection question. A wrong boundary could allow unverified cognition or external-memory state to influence a release while appearing authoritative.

## Exact decision being made

The future Human Gate must decide:

> Whether VEDAXI should integrate the locally implemented VAOS Core at all and, if so, what the smallest safe adapter boundary is for accepting eligible machine signals, obtaining traceable decision records, and optionally persisting supplementary memory without weakening repository authority, deterministic validation, quality vetoes, or human approval.

That decision must define all of the following before implementation:

- **Invocation boundary:** no integration, offline/read-only use, subprocess or module adapter, or another explicitly evidenced boundary.
- **Eligible inputs:** how authentic machine-generated `observer.*` envelopes are distinguished from direct user instructions, which remain authoritative and must not be rejected by a machine-signal source guard.
- **Output contract:** the minimum fields, provenance links, stage status, error state, and stable identity required before VEDAXI may consume a decision record.
- **Authority order:** repository decision records remain authoritative for release; any KGS or Qdrant state is supplementary unless a later human decision changes that policy.
- **Failure behavior:** what happens on invalid input, timeouts, model/lens failure, missing memory, partial persistence, duplicate delivery, stale retrieval, or unavailable stores.
- **Mutation boundary:** whether external stores may be written at all, under what explicit authorization, and how writes are audited and replayed.
- **Promotion boundary:** VAOS output may inform work but cannot substitute for code tests, hard-quality gates, independent visual judgment, evidence requirements, or the fail-closed Human Gate.

## Constraints

### Fixed policy constraints

- Do not invoke or claim the VAOS runtime, KGS, or Qdrant until a read-only audit verifies the actual implementation, schemas, endpoints, failure behavior, and adapter boundary.
- Do not mutate external stores without in-scope authorization.
- Apply source guarding to machine-generated queue signals only; direct user instructions remain authoritative.
- Provenance must resolve to actual evidence rather than being asserted by generated text.
- Repository decision records are authoritative for release; KGS and Qdrant are supplementary memory.
- Persistence must be traceable and idempotent if it is eventually authorized.
- VAOS cannot replace deterministic tests, hard-quality evaluation, independent perceptual judgment, or human approval.
- Missing or unverified evidence fails closed; no stage may promote an unsupported claim.

### Delivery constraints

- The current VEDAXI release already has product, evidence, visual-quality, and media work in flight; an integration must not create a false release dependency unless a human explicitly chooses one.
- Any adapter work must have bounded file ownership and must not collide with active product, evaluation, registry, or evidence work.
- The proposed architecture must tolerate the local runtime or supplementary stores being unavailable without corrupting the work queue or rewriting repository truth.

## Verified facts available to this stage

Only the following are verified for this Kernel:

- The VEDAXI repository contains a project-cycle orchestration ledger that defines ECE and VAOS as policy-only in its current snapshot.
- That ledger says no ECE stage or VAOS cognition run was recorded as executed and no inbox, KGS, or Qdrant write was claimed.
- The ledger says VAOS adapter work waits for Sub Agent 15.
- The ledger currently marks Sub Agent 15 // VAOS Audit as `ACTIVE` and lists no repository artifact for its output.
- This Kernel has not run VAOS and has not inspected or mutated its inbox, KGS, or Qdrant.

The proposed chain described in the handover—Signal Envelope, Source Guard, Kernel, Cognition, Broker Memory, Lenses, Executive, and Persist—is a **claimed intended contract** pending the frozen audit. It is not promoted to a verified implementation fact by this record.

## Unknowns

### Audit-blocking unknowns

- The exact location and frozen contents of the Sub Agent 15 audit packet.
- Whether the local file identified as `decision_engine.py` exists at the claimed path and matches the described version.
- Which stages are deterministic Python transformations and which, if any, call a model, heuristic service, or nondeterministic dependency.
- The actual signal-envelope schema, source-validation logic, and spoof/replay protections.
- Whether direct user instructions enter the same code path and, if so, whether source guarding could reject or distort them.
- The real provenance representation and whether every consumed claim resolves to repository or knowledge-graph evidence.
- The memory retrieval algorithm, freshness rules, ranking behavior, tenancy/scope boundaries, and behavior when memory is empty or unavailable.
- The lens-selection rules, supported problem classes, complexity thresholds, and deterministic tie-breaking behavior.
- The executive output schema, independent-verification boundary, and handling of disagreement or insufficient evidence.
- The exact KGS and Qdrant clients, endpoints, namespaces, credentials boundary, idempotency keys, retry policy, write ordering, and partial-failure behavior.
- Whether “best effort” dual persistence can lose, duplicate, reorder, or create divergent records after a crash.
- Queue acknowledgement semantics: when an input is considered accepted, processed, persisted, retriable, quarantined, or dead-lettered.
- Runtime resource, timeout, concurrency, security, privacy, and observability characteristics.
- Licensing, packaging, environment, and deployment constraints for using VAOS from VEDAXI.

### Decision unknowns

- The concrete VEDAXI use cases whose benefit exceeds the integration and operational cost.
- Whether a repository-only decision record already satisfies the immediate need without a runtime dependency.
- The acceptable latency and failure budget for consequential versus routine decisions.
- Who may authorize external persistence and who owns incident recovery.
- What evidence threshold would justify moving from read-only evaluation to a mutating integration.

## Non-goals

This decision does not:

- choose or recommend an integration option;
- validate the VAOS handover claims;
- execute `decision_engine.py`, poll an inbox, or contact KGS or Qdrant;
- design detailed adapter code, schemas, migrations, or deployment topology;
- reopen settled VEDAXI product, story, visual-direction, or media decisions;
- make VAOS a prerequisite for the current release by default;
- delegate release authority to VAOS, ECE, an agent, or a memory store;
- acknowledge competition rules, publish, deploy, submit, or cross the Human Gate.

## Decision horizon

The decision is required **before any VEDAXI-to-VAOS adapter is implemented or any VAOS-managed external store is mutated**. Its practical horizon is the next architecture cycle in which the frozen audit and subsequent ECE records can be completed. No calendar deadline or current-release dependency is asserted by this Kernel.

If the current release can proceed without VAOS, this architecture lane should remain isolated so that missing audit evidence does not stop unrelated dependency-ready work.

## Reversibility

The decision is reversible only in layers:

- **Highly reversible:** retain VAOS as a documented, uninvoked concept; perform read-only file/schema review; generate repository-only experimental records from fixed fixtures.
- **Moderately reversible:** add a disabled adapter behind an explicit boundary with no external writes and no release authority, provided its files and dependencies remain isolated.
- **Costly to reverse:** make runtime decisions part of orchestration, allow retrieved memory to influence scheduling, or introduce operational dependence on VAOS availability.
- **Hardest to reverse:** write production decision state to shared KGS/Qdrant namespaces, treat that state as authoritative, or let VAOS outputs affect release promotion without independently reproducible repository evidence.

The later decision should prefer a reversible evidence-gathering step unless verified facts demonstrate that a more committed boundary is necessary; this is a reversibility rule, not an option recommendation.

## Kernel entry criteria

Stage 1 may frame the decision when:

- the proposed integration and authority boundary are consequential enough to require ECE;
- the user-provided intended VAOS contract is available; and
- the repository policy boundaries can be read without invoking the runtime.

These criteria are met for problem framing.

## Kernel exit criteria

This Kernel exits only when it has:

- named the problem class and exact decision;
- separated fixed constraints from unverified runtime claims;
- enumerated material unknowns and non-goals;
- defined the horizon and reversibility gradient; and
- preserved a fail-closed boundary for later stages.

Those framing criteria are met. Therefore Stage 1 is complete.

## Downstream ECE entry gate

Stage 2 (Epistemic) must not treat this record as proof of VAOS behavior. Its entry requires:

1. the frozen Sub Agent 15 audit packet, with an immutable repository path or complete forwarded text;
2. an identity for the exact local VAOS source/version inspected;
3. a clear separation of source-inspected facts, behavior actually exercised, and behavior still untested; and
4. confirmation that the audit performed no unauthorized inbox, KGS, or Qdrant mutation.

Until those items exist, the architecture lane is `DOWNSTREAM_INPUT_BLOCKED`, not failed and not approved. Unrelated VEDAXI work may continue.
