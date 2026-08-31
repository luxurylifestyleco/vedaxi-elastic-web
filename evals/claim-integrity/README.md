# Claim-integrity gate

This deterministic pre-judgment gate prevents unsupported claims from entering release or submission copy. It is deliberately separate from weighted quality scoring: any veto fails closed and cannot be offset by an aggregate score.

## Status model

- `VERIFIED`: current evidence and an independent check support the claim.
- `INFERRED`: evidence supports a deduction, but not the claim directly.
- `ASSUMED`: accepted temporarily without proof.
- `UNKNOWN`: evidence is absent or insufficient.
- `UNSUPPORTED`: the cited source does not support the claim.
- `STALE`: source identity or freshness is no longer applicable.
- `CONTRADICTED`: repository ground truth conflicts with the claim.

Only a decision-bearing `VERIFIED` claim with zero deterministic vetoes is release eligible. Labels never substitute for evidence.

## Required lineage

Each claim supplies a source type, exact repository-relative path (or HTTPS URL plus an in-repository snapshot), content hash or commit identity, observation time and maximum age, applicability scope, quoted/paraphrased marker, and a separately identified check artifact. A producer cannot independently verify its own claim.

The gate rejects missing or escaping paths, stale hashes, circular self-reports, unsupported metrics, absent media, test/build statements without current successful command evidence, and contradictions with declared ground truth.

## Run

```powershell
node evals/claim-integrity/self-test.mjs
```

`seed-matrix.v1.json` contains exactly 20 synthetic cases across simple, medium, and complex strata. It is a development seed for veto coverage, not a statistically reliable benchmark; expand to at least 50 representative cases before interpreting pass rates as performance estimates.

The release adapter binds a versioned inventory to exact JSON values in current repository sources and always returns `HOLD` / `NONE` / `HUMAN_REQUIRED`. It fails closed when the inventory is missing or empty, IDs repeat, an assertion does not match its source, Devpost-copy absence is contradicted, or the underlying claim gate vetoes anything.

```powershell
node evals/claim-integrity/release-claims-adapter.test.mjs
node evals/claim-integrity/release-claims-adapter.mjs evals/claim-integrity/current-release-claims.v1.json
```
