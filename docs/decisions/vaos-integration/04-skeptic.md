# ECE Stage 4 — VAOS Integration Skeptic

**Stage owner:** Sub Agent 35 // VAOS Skeptic
**Decision lane:** ECE — consequential architecture decision
**Stage status:** `SKEPTIC_COMPLETE / RECOMMENDATION_BLOCKED`
**Frozen inputs:** [`00-vaos-audit.md`](./00-vaos-audit.md), [`00-source-identity.md`](./00-source-identity.md), [`01-kernel.md`](./01-kernel.md), [`02-epistemic.md`](./02-epistemic.md), and [`03-provenance.md`](./03-provenance.md)
**Authority:** constitutional challenge only. This record does not recommend, synthesize, invoke VAOS, authorize implementation or persistence, or advance the Human Gate.

## Challenge method

This stage attacks both the apparent safe conclusion—keep VAOS advisory-only—and the alternatives that could be presented later. It distinguishes:

- **SUPPORTED CHALLENGE:** follows from a frozen audit finding, source-identity limit, policy constraint, or explicitly preserved unknown.
- **HYPOTHETICAL CHALLENGE:** plausible failure or opportunity cost not established by the frozen packet. It remains a test target, not a fact.

“Safe” below means only that an option has been proposed as bounded. It does not mean the option has passed an adapter test, runtime test, security review, comparative evaluation, or Human Gate.

## Attack on the apparent safe-advisory conclusion

The audit calls a separately validated, read-only advisory adapter a safe application, and the Epistemic map limits the captured system to an untrusted advisory producer under current evidence. That conclusion is weaker than it first appears.

### Supported challenges

1. **The named safe adapter does not yet exist as evidence.** E31 explicitly says no adapter behavior was tested. “Separately validated,” “read-only,” “untrusted,” and “advisory” are required properties of a future boundary, not properties established for the captured runtime.
2. **Calling `process_signal()` is not equivalent to a hermetic read-only computation.** The inspected chain includes live Broker retrieval and Ollama embeddings, and the full runtime is nondeterministic (E11–E12). Even if external stores are not written, network/service reads, changing memory, timestamps, and UUIDs can alter outputs and make a decision record non-replayable.
3. **An advisory label does not neutralize decision influence.** If humans or agents rely on persuasive output, an “untrusted draft” can still anchor scheduling, architecture, or release judgment. The frozen policy forbids substitution for independent gates (E23), but there is no tested enforcement boundary.
4. **The advisory output cannot currently carry the evidence status its shape may imply.** Broker results do not reach synthesis, Executive provenance is input-sentence-derived, and verification is same-process structural checking (E13–E15). A structured decision record could therefore look more evidenced than it is.
5. **Source admission remains unsafe even when action is downstream-gated.** The `observer.*` prefix check is spoofable and canonical envelopes are not enforced (E06–E07). A Human Gate cannot reliably assess a draft if the identity and integrity of its initiating signal are falsely represented.
6. **The Human Gate is policy, not demonstrated plumbing.** The poller has no gate (E20), and no adapter has shown that missing approval prevents every dispatch, write, or release-affecting side effect.
7. **The frozen audit itself is not independently reproducible at claim level.** Its interpretation is tied only to five byte digests, without Git lineage, line citations, or a finding-to-file matrix. The Provenance stage correctly ranks it below direct source identity and does not independently reproduce it.

### Hypothetical challenges

1. **Advisory output may create automation bias or review fatigue.** Repeated drafts could become a de facto default even if every record says “untrusted.” No usage study is frozen.
2. **A read-only dependency may still leak sensitive context.** Endpoint scoping, authentication, privacy, tenancy, and data handling are unknown (E12, E30). No leak is established, but absence of writes is not proof of confidentiality.
3. **Failure placeholders may be mistaken for low-confidence knowledge.** The Broker fallback could conceal service failure inside a plausible record rather than forcing an unmistakable degraded state. The frozen packet does not show the rendered consumer behavior.
4. **A disabled or experimental adapter could become permanent shadow infrastructure.** Maintenance, dependency, and cognitive costs may accrue without measurable value or a removal trigger.

### Evidence that would disconfirm these challenges

- A fixed-fixture adapter contract and tests proving no poller, persistence, dispatch, KGS/Qdrant write, or release mutation is reachable.
- Captured dependency manifests showing all external reads, deterministic substitutes for tests, explicit degraded-state output, and repeat-run comparisons.
- Typed signal authentication and replay-resistance tests, including adversarial `observer.*` spoofing fixtures.
- Claim-level evidence references that resolve every consumed factual claim to frozen repository or approved KGS evidence, with missing references vetoing output.
- A separately executed verifier that rejects evidence gaps and records disagreement without editing the synthesis input.
- End-to-end fail-closed Human Gate tests showing that absent, expired, malformed, or conflicting approval cannot dispatch or persist.
- A blinded human-factors evaluation comparing decisions with and without advisory drafts, measuring anchoring and false confidence.

## Option-by-option constitutional attack

These options are challenge surfaces inferred from the Kernel's reversibility gradient and boundaries. Listing them does not select or endorse them.

### Option A — No integration; retain only the frozen records

**Supported challenges**

- Concrete VEDAXI use cases, comparative value, and repository-only sufficiency are unknown (E26–E27). Therefore “do nothing” is not evidence-based merely because integration is currently under-evidenced.
- The user-provided handover intends one cognition chain and durable memory. Non-integration leaves that intended consolidation unevaluated; the packet cannot show whether duplicated decision work or forgotten prior decisions already impose cost.
- Byte snapshots without Git lineage can go stale silently. A permanent non-integration posture based on this packet may judge a moving system by frozen, unversioned bytes.

**Hypothetical challenges**

- VEDAXI may repeatedly reopen settled questions, duplicate ECE labor, or lose reusable decision context that a properly bounded memory layer could retrieve.
- Delaying all experimentation may make later integration more expensive if decision schemas and orchestration records diverge.
- Refusing an imperfect system may preserve an equally opaque manual process whose error rate is not measured.

**Disconfirming evidence required**

- A measured repository-only baseline covering retrieval success, repeated-decision rate, time cost, error rate, and release outcomes.
- A bounded requirements-fit analysis showing repository records satisfy current decision-memory needs at acceptable cost.
- A version-monitoring rule proving the frozen source identity is not being mistaken for current VAOS state.

### Option B — Documentation-only alignment or repository-only fixed-fixture emulation

**Supported challenges**

- The handover chain is only an intended contract (E25). Recreating its names or shapes in VEDAXI could falsely imply semantic compatibility with VAOS.
- Rule/template stages have not been outcome-tested (E10). A fixture may prove serialization and boundaries while proving nothing about decision quality.
- Repository-only emulation can avoid runtime risks but also cannot validate Broker, Ollama, KGS, Qdrant, persistence, replay, or failure behavior (E11–E21).

**Hypothetical challenges**

- The emulation may become a second cognition implementation, directly contradicting the intended “one cognition, no second copy” design.
- Golden fixtures may encode the evaluator's expectations and reward structural mimicry instead of useful reasoning.
- A compatibility layer may fossilize an undocumented schema before an authoritative, versioned VAOS contract exists.

**Disconfirming evidence required**

- An authoritative versioned specification mapped field-by-field and stage-by-stage to the captured byte identities.
- Outcome-based, complexity-stratified fixtures maintained separately from implementation tests, with independent scoring and explicit sample counts.
- A deletion or migration boundary proving the fixture harness cannot become a divergent production engine.

### Option C — Live read-only advisory invocation

**Supported challenges**

- Runtime health and operational contracts are unknown (E21, E28–E30).
- Live retrieval does not inform Cognition or Executive in the captured implementation, so the main memory-value claim is not realized (E13).
- The full chain is not deterministic or exactly replayable (E11), and provenance and verification are inadequate (E14–E15).
- Direct-user routing is untested (E24), while source admission is spoofable and schema-blind (E06–E07).

**Hypothetical challenges**

- Local services may expose stale, cross-scope, or poisoned memory and still return syntactically successful records.
- Advisory latency or service outages may stall orchestration despite the nominal absence of release authority.
- Runtime invocation may have side effects not visible in the five-file audit, including logging, caching, telemetry, or model artifact creation.

**Disconfirming evidence required**

- Authorized isolated traces on frozen inputs with dependency versions, endpoint contracts, side-effect inventory, timeouts, and repeated-run variance.
- Empty, stale, poisoned, cross-scope, unavailable, and timeout memory tests with explicit fail-closed consumer behavior.
- A complete call-graph and side-effect review tied to immutable source lineage, not only five packet-level digests.

### Option D — Supplementary KGS/Qdrant persistence

**Supported challenges**

- Replay identity is unstable, original decisions are not what `verify_persisted` verifies, archive ordering can lose work, and persistence failure does not stop dispatch (E16–E19).
- Authorization and incident-recovery ownership are unnamed (E29), while external mutation requires explicit in-scope authorization (E22).
- Runtime configuration, tenancy, privacy, security, licensing, and recovery behavior are unknown (E21, E30).

**Hypothetical challenges**

- Dual writes may diverge, duplicate, or reorder under partial failure; stale vectors may continue surfacing records after graph correction.
- “Supplementary” storage may become de facto authority if retrieval is easier than consulting repository records.
- Deletion, retention, embedding-model changes, and reindexing may break auditability or make exact record reconstruction impossible.

**Disconfirming evidence required**

- A stable signal-to-decision idempotency specification and crash/replay/concurrency fault-injection suite.
- Exact original-record read-after-write comparison across both stores, plus reconciliation and tombstone tests.
- Named authorization and recovery owners, approved retention/privacy boundaries, namespace isolation, and an exercised rollback runbook.
- Consumer tests proving repository records win every conflict and missing supplementary stores never rewrite repository truth.

### Option E — Queue, orchestration, or release coupling

**Supported challenges**

- Archive-before-save/dispatch creates a loss window; persistence errors do not stop dispatch; the poller has no Human Gate (E18–E20).
- Source admission is unauthenticated (E06–E07), and verification cannot provide independent assurance (E15).
- Current policy prohibits VAOS from replacing deterministic tests, quality gates, independent judgment, evidence requirements, or human approval (E23).
- Making VAOS a release dependency adds an unverified failure and authority boundary (E32).

**Hypothetical challenges**

- A compromised or malformed signal could consume worker capacity, reorder priorities, or create denial-of-service without directly shipping anything.
- “Human approval required” could degrade into rubber-stamping when queue pressure makes review the bottleneck.
- Coupling may cause unrelated delivery to stop whenever VAOS, Broker, Ollama, KGS, or Qdrant is degraded.

**Disconfirming evidence required**

- Authenticated admission, quotas, quarantine, dead-lettering, audit trails, and adversarial queue tests.
- Atomic acknowledgement and dispatch semantics with fault injection at every ordering boundary.
- Independent verification and Human Gate bypass tests, including approval timeout, revocation, disagreement, and unavailable-verifier cases.
- Dependency simulations proving unrelated product and release work continues safely through every VAOS dependency failure.

## Cross-cutting attacks on evidence sufficiency

### Static interpretation is carrying too much weight

**Supported:** The audit did not execute the runtime, its findings lack line-level traceability, and source lineage stops at byte digests. Consequently, even strong static findings establish the existence of obvious gaps but do not measure frequency, consequence, exploitability, recovery, or the behavior of uninspected dependencies.

**Hypothetical:** The five inspected files may omit wrappers, configuration, tests, or external compensating controls that materially improve or worsen the real system.

**Disconfirming evidence:** An immutable source bundle or repository identity, a finding-to-file-and-line matrix, dependency/config inventory, and authorized isolated behavioral traces.

### “Deterministic cognition” may be a category error

**Supported:** Local rule/template stages can be deterministic while the complete runtime is not, because it includes timestamps, UUIDs, live retrieval, and embeddings (E10–E12). Calling the whole chain deterministic is unsupported.

**Hypothetical:** Even deterministic stage code may produce unstable business meaning when input normalization, memory ranking, or lens selection changes.

**Disconfirming evidence:** A precisely scoped determinism claim, canonical input/output serialization, dependency capture, seeded or substituted services, and repeated replay with semantic as well as byte-level equivalence thresholds.

### Provenance may be decorative rather than causal

**Supported:** Broker memory does not feed synthesis and Executive provenance derives from input sentences (E13–E14). The current record cannot prove that cited evidence caused or constrained the conclusion.

**Hypothetical:** Future claim links could still be post-hoc decorations if the reasoning path can ignore them without failing.

**Disconfirming evidence:** Typed claim-evidence dependencies, mutation tests where changing or removing evidence changes or vetoes the output, and independent resolution of every cited source.

### A Human Gate may be nominal rather than fail-closed

**Supported:** The captured poller has no Human Gate (E20). Present policy demands one, but no implementation evidence exists.

**Hypothetical:** Approval could be bypassed through retries, alternate code paths, stale tokens, timeout defaults, or writes that occur before the gate.

**Disconfirming evidence:** A single auditable promotion boundary, deny-by-default state machine, capability-scoped approval, and fault/adversarial tests proving that no mutation or dispatch precedes valid approval.

## What would make the current caution wrong?

The current recommendation block could itself become wrong if new frozen evidence shows all of the following: a valuable VEDAXI use case that repository-only records handle materially worse; an immutable and traceable VAOS version; authenticated admission; evidence-causal cognition; independent verification; stable replay identity; atomic queue semantics; exact persistence verification; explicit operational ownership; and a tested fail-closed Human Gate. None of those conditions is established by the current packet. Their absence justifies continued challenge, not a permanent rejection.

Conversely, caution may be insufficient if the five-file audit omitted reachable mutation, sensitive-data exposure, or alternate dispatch paths. No such behavior is established, but the current packet is too narrow to rule it out.

## Stage boundary

This stage has challenged every plausible boundary from non-integration through release coupling, including the apparently safe advisory position. Supported challenges remain tied to frozen evidence; hypotheticals remain explicitly unproven; each challenge names evidence capable of disconfirming it.

The next ECE stage may synthesize a bounded decision only from the frozen record plus these challenges. It must not convert a hypothetical into a fact, treat an absence of evidence as proof of safety, or interpret this constitutional attack as a recommendation. Any eventual action still requires independent verification and a fail-closed Human Gate.
