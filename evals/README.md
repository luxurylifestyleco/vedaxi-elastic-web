# VEDAXI Eval Registry

The JSONL records under `registry/data/vedaxi/` follow the OpenAI Evals data/registry separation pattern, but they are not all model-graded cases.

Exact source, state, trace, browser, accessibility, and timing assertions must first run through VEDAXI's deterministic module harness. They are intentionally not registered with `ModelBasedClassify`: a model opinion cannot prove an origin, a mutation, a reload, a tool inventory, or a duration.

When a qualitative evaluator is added, it will receive its own dataset and upstream-compatible YAML identity. Its scope is limited to irreducibly qualitative criteria such as explanation clarity or creative ambition, and it cannot override a failed exact assertion.

Per-module identities use `vedaxi.<module>.<split>.v<major>`. The aggregate `module-gates.jsonl` is a human-readable migration source until the records are split and validated module by module.
