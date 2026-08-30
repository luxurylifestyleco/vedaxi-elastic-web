# Evaluation Inspiration Ledger

This ledger keeps external references auditable and out of the implementation. References may shape an original VEDAXI decision rule or evaluation pattern; their wording, source code, layouts, assets, and brand elements must not enter product code.

## Clean-room rule

1. Record the source and the abstract principle.
2. Restate the principle for VEDAXI's research-integrity workflow.
3. Implement from the VEDAXI spec and types, never from source material.
4. During review, reject copied phrasing, identifiers, visual composition, assets, or implementation details.
5. Preserve the source only as documentation provenance; never add it as a runtime dependency.

## Sources

### OpenAI Evals

- Source: `https://github.com/openai/evals`
- Accessed: 2026-08-31
- Use: data-driven cases, versioned eval identity, explicit expected behavior, reusable evaluators, recorded metrics, and meta-evaluation of judge quality.
- VEDAXI transformation: keep deterministic application checks local; express agent/browser cases as versioned JSONL records; use the judge rubric for model-graded cases only where deterministic assertions cannot decide the result.
- Excluded: repository code, example content, legacy model configuration, or an API-key dependency in the core product.

### Experiment Ledger & Scorecards

- Source: `https://docs.google.com/document/d/1m72c9gT_AlYQwZu8tVbAcxnnMqs5ulI97bBJiD1Y9q8/edit?usp=drive_link`
- Accessed: 2026-08-31 through the Vercel Agent Browser.
- Use: pre-register a falsifiable hypothesis, one primary change, observable evidence, a guardrail, review timing, and a decision rule before results exist; verify measurement integrity before interpreting behavior; keep qualitative feedback distinct from behavioral evidence; retain learning from stopped tests.
- VEDAXI transformation: every module gate declares its claim, fixture, primary assertion, guardrail assertion, evidence artifact, failure rule, and next action before implementation begins.
- Excluded: Grain Studio terminology, product examples, scorecard wording, growth tactics, document prose, and document structure.

### Shopify Editions Winter 2026

- Source: `https://www.shopify.com/editions/winter2026`
- Accessed: 2026-08-30 through the Vercel Agent Browser.
- Use: chapter continuity, full-viewport narrative pacing, persistent orientation, and product demonstration embedded in the story.
- VEDAXI transformation: original research chapters (`Paper → Method → Video → Evidence → Decision`) and an evidence-led Semantic Focus Shift.
- Excluded: Shopify brand, navigation, artwork, copy, source code, torn-paper motif, and scene composition.

### Karpathy arXiv projects

- Sources: `https://github.com/karpathy/arxiv-sanity-lite`, `https://github.com/karpathy/arxiv-sanity-preserver`, and `https://github.com/karpathy/researchlei`
- Accessed: 2026-08-31 from the authors' GitHub repositories. The live arXiv Sanity site was blocked by the in-app browser URL policy and was not inspected.
- Use: keep the paper itself primary; attach concise metadata, abstract/evidence text, stable tags, search/rank/sort controls, similarity/relevance signals, and saved-interest state without turning the reading surface into a generic dashboard. Prefer a small core value proposition over a dependency-heavy research portal.
- VEDAXI transformation: one dense but legible paper reading surface, stable evidence locators, provenance close to each passage, and task-led focusing that changes prominence while preserving the full paper context.
- Excluded: repository source code, templates, screenshots, ranking implementations, copy, visual styling, data pipelines, and dependencies.

### Ponytail

- Source: `https://github.com/DietrichGebert/ponytail`; installed Codex plugin version `4.9.0`.
- Accessed: 2026-08-31.
- Use: before new code, prefer no feature, existing code, standard library, native platform behavior, or an installed dependency—in that order. Require one runnable check for non-trivial logic.
- VEDAXI transformation: every module review includes a deletion/duplication pass; new abstractions need a second real consumer; browser-native behavior is preferred to a wrapper; validation, persistence failure handling, security, and accessibility are never minimized away.
- Excluded: Ponytail code and benchmark claims from product runtime or submission claims unless independently reproduced for VEDAXI.

## Review evidence

Every visual or evaluation review must answer: `Can this choice be derived from the VEDAXI product problem and spec without access to the inspiration source?` If not, redesign it.
