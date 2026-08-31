# VEDAXI hard-quality gate

This directory is the first isolated release-veto layer. It does not replace module tests, browser evidence, or independent rendered-product review; it makes their release decision non-compensatory.

The decision order is strict: structure, deterministic prerequisites, automatic failures, per-dimension floors, then the weighted overall floor of `0.90`. A beautiful product cannot launder false protocol evidence, and a perfect test suite cannot launder generic HTML/dashboard quality.

Run the specification and rejection checks with:

```text
node evals/hard-quality/validate-hard-quality.mjs --self-test
```

An assessment file may be supplied when evidence owners have populated every prerequisite, automatic-failure decision, dimension score, and minimum evidence list:

```text
node evals/hard-quality/validate-hard-quality.mjs path/to/release.assessment.json
```

Assessment execution also resolves every path-shaped evidence reference against the repository. A reference fails closed when it is missing, escapes the repository, or is absent from the declared source commit. The declared source commit must equal repository `HEAD`, and the evaluated commit must equal that source before the gate can pass.

The JSON result is a machine-readable decision summary. `gate_status` reports the quality result, while `decision` always remains `HOLD`, `release_action` always remains `NONE`, and `release_authority` remains `HUMAN_REQUIRED`. Even a passing quality gate only makes the candidate eligible for the human gate; this evaluator never promotes or ships a release.

`current-release.assessment.json` is the live assessment template. It is deliberately non-passing: a dirty or stale source identity, any incomplete module gate, `BLOCKED`, or `NOT_EVALUATED` remains a release veto. Qualitative dimensions use `SCORED` only after the minimum evidence is attached; unevaluated dimensions keep `score: null`. Automatic failures use `CLEAR`, `TRIGGERED`, `BLOCKED`, or `NOT_EVALUATED`, so absence of review can never masquerade as a cleared veto.

The current matrix contains 16 representative cases, four per complexity stratum. It is deliberately labeled a seed and must not be presented as statistically reliable. Grow it to at least 50 cases, establish a current baseline, and cross-calibrate qualitative scores with independent human review before treating score movement as benchmark-quality signal.
