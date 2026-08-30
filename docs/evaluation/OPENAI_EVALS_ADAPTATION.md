# OpenAI Evals Adaptation

VEDAXI uses the architecture of OpenAI Evals as an evaluation reference, not as a runtime product dependency.

## What we adopt

- JSONL: one independently replayable case per line.
- Registry identity: `vedaxi.<module>.<split>.<version>` so changed fixtures or criteria require a version bump.
- Dataset/evaluator separation: cases describe input and ideal behavior; deterministic or model-graded evaluators decide outcomes.
- Recorded metrics: module pass rate, hard-gate pass rate, false-success count, unsupported-state truthfulness, and clean-session reproducibility.
- Meta-eval: human-labeled examples check whether the judge grader applies the official rubric correctly.

## Evaluator hierarchy

1. **Deterministic assertions** for evidence IDs, values, origins, state mutations, persistence, tool inventory, errors, accessibility, and timings.
2. **Trace assertions** for ordering: discovery → evidence A → evidence B → independent derivation → human confirmation → mutation.
3. **Model-graded rubric** only for semantic quality that cannot be reduced to an exact assertion, such as clarity or ambition.
4. **Dual Delphi arbiter** combines completed evidence; it never substitutes opinion for a failed deterministic gate.

Native feasibility is evaluated twice: P0 before product expansion and M5 after deployment. Passing a fake or local adapter test never substitutes for either browser observation.

## Dataset shape

Each JSONL record will contain:

```json
{
  "id": "M2",
  "eval_id": "vedaxi.shared-actions.dev.v1",
  "input": [{"role": "user", "content": "Compare the paper methods with the author's video."}],
  "ideal": "The external agent derives 34 only after retrieving both evidence objects.",
  "assertions": ["paper evidence precedes derivation", "video evidence precedes derivation", "publisher output omits 34"],
  "hard_gates": ["H3", "H4", "H5"],
  "evidence_kind": "trace",
  "provenance": "VEDAXI_TEST_SET.md"
}
```

The application remains runnable without Python, an OpenAI API key, or the upstream Evals package. Later agent-quality runs may use OpenAI Evals or the OpenAI Dashboard, but deterministic module gates always run locally and in CI.

## Source boundary

No upstream Evals source code is copied into VEDAXI. If the project later imports the package, it must be an explicit evaluation-only dependency with its license retained and must not ship in either publisher origin.
