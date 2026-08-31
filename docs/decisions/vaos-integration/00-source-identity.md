# VAOS Audited Source Identity

**Artifact owner:** Sub Agent 26 // Source Snapshot

**Capture mode:** read-only external inspection; no VAOS execution or external mutation

**Captured at:** 2026-08-31T11:15:06Z

**Audit cross-reference:** [Frozen VAOS Integration Audit](./00-vaos-audit.md)

This artifact records the observable source identity of the files named under **Source paths inspected** in the frozen audit. It does not extend the audit findings and is not ECE Stage 2.

## Repository identity

| Field | Observed value |
|---|---|
| Audited source root | `C:\Users\m_jor\VDX\agentos` |
| Git repository root | `NOT AVAILABLE` — `git -C C:\Users\m_jor\VDX\agentos rev-parse --show-toplevel` reported that this path is not in a Git repository |
| HEAD commit | `NOT AVAILABLE` — no Git repository was discoverable from the audited source root |
| Branch | `NOT AVAILABLE` — no Git repository was discoverable from the audited source root |
| Relevant-file dirty status | `NOT AVAILABLE` — Git cannot compute scoped working-tree status without repository metadata |

No clean or dirty state is inferred from the absence of Git metadata.

## Directly audited files

All digests are SHA-256 over the file bytes observed at capture time. Sizes are in bytes.

| Audit path | Resolved path | Size | SHA-256 |
|---|---|---:|---|
| `decision_engine.py` | `C:\Users\m_jor\VDX\agentos\decision_engine.py` | 14,593 | `7aac8ca71e05b7a128a87b623060b5a4f0cde8c593d9de76fe3fffb772c0e3b0` |
| `vaos\pipeline.py` | `C:\Users\m_jor\VDX\agentos\vaos\pipeline.py` | 4,351 | `6b375119b79c9d15d71a2119b4a5bb396305a0f20f142cb8b863d502fb63df18` |
| `vaos\persist.py` | `C:\Users\m_jor\VDX\agentos\vaos\persist.py` | 17,598 | `c8e2e6c46b1efb28fb08cfc90d31ca024b2b4a8bfc32096781ea29fa5fa4a8aa` |
| `vaos\envelope.py` | `C:\Users\m_jor\VDX\agentos\vaos\envelope.py` | 7,146 | `83b56fa20182dabad2b725ef4427bee3fed751ddd4d0a131e440acbc227c49f9` |
| `vaos\executive.py` | `C:\Users\m_jor\VDX\agentos\vaos\executive.py` | 16,616 | `1cf6547891f4111dd120d4b5d8efed91ae3c951a67b33bbb2309559282ca5460` |

## Scope and limitations

- The five files above are exactly the files listed by the frozen audit as inspected.
- File existence, resolved path, byte size, and digest were observed directly from the filesystem.
- Repository root, commit, branch, and scoped dirty status remain unavailable because Git found no repository at or above the audited source root.
- No inbox, KGS, Qdrant, Ollama, poller, decision pipeline, or persistence operation was accessed or executed.
- This snapshot identifies source bytes; it does not validate runtime behavior or certify the audit conclusions.
