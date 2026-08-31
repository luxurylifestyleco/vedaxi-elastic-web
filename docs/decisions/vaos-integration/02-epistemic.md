# ECE Stage 2 — VAOS Integration Epistemic Map

**Stage owner:** Sub Agent 28 // VAOS Epistemic

**Decision lane:** ECE — consequential architecture decision

**Stage status:** `EPISTEMIC_COMPLETE / RECOMMENDATION_BLOCKED`

**Frozen inputs:** [`00-vaos-audit.md`](./00-vaos-audit.md), [`00-source-identity.md`](./00-source-identity.md), and [`01-kernel.md`](./01-kernel.md)
**Authority:** classification only; this record recommends no integration, invokes no VAOS component, and authorizes no implementation, persistence, or release change.

## Classification rules

- **KNOWN** — directly stated as observed or fixed policy in a frozen input.
- **INFERRED** — a bounded consequence of one or more known items, not directly exercised or observed.
- **ASSUMED** — a premise or intended contract carried by the decision framing but not established by the frozen evidence.
- **UNKNOWN** — the frozen inputs do not establish the item.

Confidence describes confidence in the classification, not product fitness: **high** means the frozen record is direct and unambiguous; **medium** means the item is a constrained interpretation; **low** means a premise is retained only to expose a gap. No runtime behavior is promoted from an inference or assumption.

## Decision-bearing knowledge map

| ID | Classification | Confidence | Decision-bearing item | Epistemic gap / limit | Evidence that would close the gap | Effect on later recommendation |
|---|---|---|---|---|---|---|
| E01 | KNOWN | High | The inspected source root was `C:\Users\m_jor\VDX\agentos`. | None for the observed path. | Already closed by the frozen source-identity record. | Does not block; fixes inspection scope. |
| E02 | KNOWN | High | The five inspected files have captured byte sizes and SHA-256 digests. | A digest identifies bytes but does not establish behavior or lineage. | Re-inspection against the same digests plus behavioral evidence for relevant paths. | Does not block Stage 2; limits claims to the captured bytes. |
| E03 | UNKNOWN | High | Git repository, commit, branch, and relevant-file dirty state are unavailable at or above the inspected root. | Source lineage and change history cannot be reconstructed from the packet. | Repository metadata or an independently versioned immutable source bundle tied to the captured digests. | Limits reproducibility; blocks any recommendation that depends on maintained upstream lineage, not all possible boundaries. |
| E04 | KNOWN | High | The audit performed no VAOS execution, inbox poll, KGS write, Qdrant write, or Ollama call. | Runtime behavior and health were not exercised. | An authorized, isolated execution record with fixtures, captured outputs, side effects, and failure observations. | Blocks a runtime or mutating recommendation; does not block read-only analysis. |
| E05 | KNOWN | High | The poller reads sorted `vaos/inbox/*.json`; invalid JSON remains in the inbox. | Recovery, quarantine, and operational accumulation were not exercised. | Isolated poller tests covering malformed input, retries, quarantine/dead-letter behavior, and restart. | Blocks autonomous poller adoption; otherwise limits scope. |
| E06 | KNOWN | High | Accepted signals are loosely accessed through top-level and payload fields; canonical `Envelope` fields are not validated. | Exact malformed-field and type behavior remains untested. | Schema-contract tests across missing, extra, mistyped, and adversarial fields. | Blocks treating queue admission as a trusted boundary. |
| E07 | KNOWN | High | The source guard is only `source.startswith('observer.')`; it is spoofable and schema-blind. | No authenticated source identity or integrity mechanism is established. | A specified trust model and adversarial tests of authenticated envelope verification and replay resistance. | Blocks any recommendation that lets machine signals influence consequential scheduling or release authority. |
| E08 | KNOWN | High | Signals below the documented confidence threshold, with trivial severity, and limited duplicates are dropped. | Drop semantics, audit trail, collision behavior, and false-drop rate are untested. | Fixed-fixture tests and an outcome dataset for duplicate and threshold decisions. | Blocks unattended loss-sensitive queue use; otherwise limits scope. |
| E09 | KNOWN | High | `process_signal()` follows Kernel → Cognition → Broker retrieval → Lenses → Executive. | The packet establishes call order by inspection, not end-to-end correctness. | Isolated trace tests tied to the captured source bytes. | Does not alone block an advisory experiment; blocks claims of validated cognition. |
| E10 | KNOWN | High | Kernel, cognition, lenses, and executive are local rule/template code. | Correctness, completeness, and class-selection outcomes were not tested. | Versioned fixtures with expected stage records and independent scoring. | Blocks relying on these stages for consequential recommendations. |
| E11 | KNOWN | High | UUIDs, timestamps, live KGS retrieval, and Ollama embeddings make the full runtime nondeterministic. | Variance, seeding/control options, and replay equivalence are unmeasured. | Repeated controlled runs with dependency capture and replay comparison. | Blocks describing the full chain as deterministic or reproducible. |
| E12 | KNOWN | High | Broker retrieval calls `127.0.0.1:8765/search`; failure yields low-confidence placeholders. | Service contract, authentication, freshness, ranking, scoping, and stale-data behavior are unknown. | Endpoint schema/configuration plus isolated success, stale, empty, cross-scope, timeout, and failure tests. | Blocks memory-informed runtime integration. |
| E13 | KNOWN | High | Broker results are not passed into Cognition or Executive. | None about the inspected data-flow gap; intended future wiring is unknown. | A source change plus trace tests would close a future implementation gap. | Blocks claims that retrieved graph memory informs synthesis in the captured implementation. |
| E14 | KNOWN | High | Executive provenance comes from input sentences, not KG-derived evidence. | Claim-to-evidence resolution and falsification behavior are not established. | A typed evidence contract and tests resolving each consumed claim to frozen evidence. | Blocks provenance certification and evidence-bearing recommendations. |
| E15 | KNOWN | High | Verification consists of four same-process structural checks at a `0.60` threshold, ignores `evidence_gaps`, and does not reject missing verification. | Independence and outcome validity have not been demonstrated. | Independently executed verification with failure fixtures, evidence-gap vetoes, and recorded disagreement handling. | Blocks treating VAOS verification as an independent assurance gate. |
| E16 | KNOWN | High | Replay creates a fresh opportunity UUID; idempotency applies only when the same opportunity ID is reused. | Duplicate-delivery effects and stable signal-to-decision identity are not established. | Stable idempotency-key specification and crash/replay/concurrency tests. | Blocks mutating or queue-coupled integration. |
| E17 | KNOWN | High | `verify_persisted` writes and retrieves a synthetic probe rather than verifying the original decision. | Original-record durability and read-after-write integrity remain unverified. | Tests that retrieve and compare the exact persisted decision identity and content. | Blocks relying on persistence verification. |
| E18 | KNOWN | High | The signal is archived before queue save and dispatch; a non-atomic failure can lose work. | Actual failure frequency is unknown, but the loss window is present in the inspected flow. | Atomic handoff design plus fault-injection tests at every boundary. | Blocks autonomous poller/dispatcher use. |
| E19 | KNOWN | High | A persistence error does not stop dispatch. | Divergence, retry, and reconciliation behavior are unknown. | Failure-state contract plus fault-injection and reconciliation tests. | Blocks dispatch that depends on durable, traceable decisions. |
| E20 | KNOWN | High | The poller has no human approval gate. | No external compensating gate is established by the frozen packet. | A separately evidenced fail-closed Human Gate integration and bypass tests. | Blocks consequential autonomous action. |
| E21 | KNOWN | High | KGS, Qdrant, and Ollama runtime health are unknown. | Availability, configuration, data state, credentials, latency, and failure modes are unobserved. | Authorized read-only health/configuration evidence followed, if separately authorized, by isolated failure tests. | Blocks runtime-dependent recommendation; does not block repository-only evaluation. |
| E22 | KNOWN | High | Frozen policy keeps repository decision records authoritative; KGS/Qdrant are supplementary, and external mutation requires in-scope authorization. | None for present authority order. | A later Human Gate decision would be required to change it. | Does not block; constrains every later option. |
| E23 | KNOWN | High | VAOS cannot replace tests, hard-quality gates, independent perceptual judgment, evidence requirements, or the Human Gate. | None for present policy. | A later Human Gate decision would be required to change it. | Does not block; constrains every later option. |
| E24 | KNOWN | High | Direct user instructions remain authoritative and source guarding applies only to machine-generated queue signals. | The current runtime's user-input routing was not inspected or tested in the frozen packet. | Adapter contract and tests proving user instructions bypass machine-envelope rejection without being recast as observer signals. | Blocks a shared ingestion boundary that could reject or distort user authority. |
| E25 | ASSUMED | Low | The handover's named chain is the intended VAOS contract. | Intent does not establish the captured implementation's completeness or fitness. | An authoritative versioned specification mapped field-by-field and stage-by-stage to the captured source and tests. | Does not justify integration; limits semantic comparison until closed. |
| E26 | UNKNOWN | High | Concrete VEDAXI use cases and measurable benefit exceeding integration cost are not established. | No outcome target, baseline, volume, or value metric is present. | A bounded use-case record with baseline, success metric, operational cost, and counterfactual. | Blocks any recommendation to integrate rather than merely investigate. |
| E27 | UNKNOWN | High | Whether repository-only decision records already meet the immediate need is not established. | No comparative trial or requirements fit analysis exists. | Side-by-side evaluation of repository-only and VAOS-assisted workflows on fixed cases. | Blocks selecting a more committed boundary. |
| E28 | UNKNOWN | High | Acceptable latency, availability, and failure budgets are not defined. | No service-level or consequence-specific thresholds exist. | Human-owned operational requirements for routine and consequential decisions. | Blocks runtime topology and operational recommendation. |
| E29 | UNKNOWN | High | External-persistence authorization owner and incident-recovery owner are not named. | Accountability for writes, rollback, reconciliation, and recovery is absent. | Explicit owner assignments and an approved runbook. | Blocks any mutating recommendation. |
| E30 | UNKNOWN | High | Security, privacy, tenancy, licensing, packaging, deployment, and resource constraints are not established. | The audit packet did not cover these operational domains. | Scoped security/privacy review, dependency/license inventory, and deployment/resource evidence. | Blocks production integration; may only limit an isolated non-mutating experiment if no sensitive data is used. |
| E31 | INFERRED | High | The captured system can be considered only an untrusted advisory producer under current evidence. | The audit labels read-only advisory use as safe, but no adapter behavior was tested. | Fixed-fixture adapter evaluation showing strict non-authority, no external mutation, and explicit untrusted status. | Does not authorize that boundary; defines the maximum scope that can still be evaluated without resolving runtime gaps. |
| E32 | INFERRED | High | Making VAOS a current-release dependency would add an unverified failure and authority boundary. | Magnitude of delivery impact is unmeasured. | Dependency simulation against release workflows with failure and rollback evidence. | Blocks making VAOS a release prerequisite. |

## Epistemic gaps by consequence

### Recommendation-blocking gaps

The following must be closed before any later stage can support a recommendation to integrate VAOS into live orchestration, consequential cognition, or release work:

1. **Trusted admission:** E06–E08 — schema validation, authenticated machine-source identity, replay resistance, and observable drop behavior.
2. **Evidence-bearing cognition:** E10–E15 — tested stage behavior, actual memory-to-synthesis flow, resolvable provenance, and independent verification.
3. **Queue and persistence safety:** E16–E19 — stable identity, original-record verification, atomic acknowledgement, and reconciled partial failures.
4. **Human authority:** E20 and E24 — an evidenced fail-closed Human Gate and preservation of direct user authority.
5. **Runtime and operating contract:** E21, E28–E30 — dependencies, budgets, ownership, security/privacy, packaging, and recovery.
6. **Decision value:** E26–E27 — a concrete use case and evidence that VAOS adds value beyond repository-only records.

E03 additionally blocks any recommendation whose safety or maintainability depends on upstream source lineage. E11 blocks any claim that the complete runtime is deterministic or exactly replayable.

### Scope-limiting gaps

These do not prevent later ECE stages from analyzing a non-mutating, fixed-fixture, untrusted advisory experiment, but they strictly limit what such analysis could claim:

- absent Git lineage while byte digests remain frozen (E02–E03);
- unexercised runtime behavior (E04, E09–E12, E21);
- unknown release-impact magnitude (E32);
- missing production operational evidence where the experiment has no runtime dependency, external write, sensitive data, or authority (the bounded portion of E28–E30).

No scope-limiting gap becomes permission to invoke VAOS or mutate an external store.

## Stage boundary

Stage 2 has classified the decision-bearing contents of the three frozen inputs and exposed the gaps that distinguish source-inspected facts from intended contract, inference, assumption, and unknown runtime behavior. The Kernel's former downstream-input gate is now satisfied only for epistemic mapping because the frozen audit and byte-level source identity are present. It is not satisfied for an integration recommendation.

The next ECE stage may trace these classified items only to the frozen evidence already named. It must not upgrade inferred or assumed items to facts, manufacture runtime evidence, or treat this record as approval to execute VAOS.
