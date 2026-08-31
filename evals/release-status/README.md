# Release-status evaluator

`generate-release-status.mjs` derives a deterministic, fail-closed snapshot from Git, module and H/D gate registries, required assets, media, deployments, license, and Devpost state.

```bash
node evals/release-status/generate-release-status.mjs --json
node evals/release-status/generate-release-status.mjs --strict
node evals/release-status/generate-release-status.mjs --output release-status.json
node ./node_modules/vitest/vitest.mjs run evals/release-status/release-status.test.mjs
```

Normal CLI runs leave code verification `NOT_EVALUATED`. Strict mode exits nonzero unless everything passes. Output mode re-evaluates after writing so the saved snapshot reflects its own working-tree change. The evaluator never changes human-owned gates.
