# Frozen VAOS Integration Audit

**Audit owner:** Sub Agent 15 // VAOS Audit

**Audit mode:** read-only, non-mutating

**Frozen packet time:** 2026-08-31T10:12:19Z

**Source identity available from the audit packet:** local working tree rooted at `C:\Users\m_jor\VDX\agentos`. The exact external-repository commit and dirty state were not captured and are `UNKNOWN`.

This artifact freezes the read-only audit packet. The findings below preserve the packet's conclusions without extending them.

## VERIFIED PIPELINE

- The poller reads sorted `vaos/inbox/*.json` files. Invalid JSON remains in the inbox.
- An accepted signal is loosely accessed through top-level `source`, `id`, and `payload`, and payload `signal_type`, `change`, `confidence`, `severity`, and text variants. Canonical `Envelope` fields are not validated.
- Signals with `confidence < 0.3`, `trivial` severity, and limited duplicates are dropped.
- `process_signal()` runs Kernel → Cognition → Broker retrieval → Lenses → Executive.
- Kernel, cognition, lenses, and executive are local rule/template code. Timestamps, UUIDs, live KGS retrieval, and Ollama embeddings make the full runtime non-deterministic.
- Broker retrieval sends `GET` requests to `127.0.0.1:8765/search`; failure yields low-confidence placeholders.
- Persist attempts KGS and Qdrant writes.

## CLAIM GAPS

- The source guard is only `source.startswith('observer.')`; it is spoofable and schema-blind.
- Broker results are not passed into Cognition or Executive. Executive provenance comes from input sentences, so the KG-derived provenance claim is false.
- Verification is four same-process structural checks at a `0.60` threshold and ignores `evidence_gaps`; missing verification is not rejected.
- Replay creates a fresh opportunity UUID; idempotency holds only for the same opportunity ID.
- `verify_persisted` writes and retrieves a synthetic probe, not the original decision.
- A signal is archived before queue save and dispatch; non-atomic failure can lose work.
- A persistence error does not stop dispatch.
- The poller has no human approval gate.

## SAFE APPLICATIONS

- Call `process_signal()` through a separately validated, read-only advisory adapter.
- Treat its output as an `UNTRUSTED DRAFT`.
- Route the draft through the VEDAXI hard eval and Human Gate.

## UNSAFE APPLICATIONS

- Do not use the poller, persistence, or automatic dispatch from VEDAXI.
- Do not use VAOS output for authentication or provenance certification.
- Do not use VAOS output for release decisions.

## UNKNOWN RUNTIME STATE

- Runtime health of KGS, Qdrant, and Ollama is `UNKNOWN` because the audit performed no execution.

## Source paths inspected

- `C:\Users\m_jor\VDX\agentos\decision_engine.py`
- `C:\Users\m_jor\VDX\agentos\vaos\pipeline.py`
- `C:\Users\m_jor\VDX\agentos\vaos\persist.py`
- `C:\Users\m_jor\VDX\agentos\vaos\envelope.py`
- `C:\Users\m_jor\VDX\agentos\vaos\executive.py`

No VAOS runtime, inbox poll, KGS write, Qdrant write, or Ollama call was performed by the audit.
