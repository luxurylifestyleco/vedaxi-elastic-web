# M1 Browser Matrix

| Surface | Environment | Observation | Status |
| --- | --- | --- | --- |
| Production bundle | Codex In-app Browser, Windows, `http://localhost:4173/` | Loaded hashed asset `index-BQyKP_0H.js` from source commit `06a9512`; no new production console errors. | PASS |
| Native active | Same | One strict read-only `search_paper_evidence` tool; exact score-3 evidence; page, visible provenance, inventory, and result origins all equal. | PASS |
| Human search | Same | Exact paper result works without invoking the native handler. | PASS |
| Disabled / re-enabled | Same | Fresh zero-tool inventory and rejected call while paper/search survive; exact tool returns after re-enable. | PASS |
| Desktop visual | Same | Editorial desktop screenshot retained. | PASS |
| Narrow responsive | Same | Requested 390 × 844; captured/layout viewport is 375 × 812. Three-line title, mobile outline, 44px/56px buttons, no horizontal overflow; screenshot retained. | PASS |
| Real keyboard traversal | Same | CUA Tab and page-driver Tab did not move focus from `BODY`; no pass inferred. | BLOCKED |
| Native unsupported state | Same | Target browser supports WebMCP; policy-blocked harness was not bypassed. | BLOCKED |
| Native registration error | Same | No natural native registration rejection occurred. | BLOCKED |
| Exact client version/build | Same | Runtime value unavailable. | BLOCKED |

The blocked rows are evidence limitations, not rewritten deterministic passes. Static semantic/accessibility tests and injected status/controller tests remain separate source evidence.
