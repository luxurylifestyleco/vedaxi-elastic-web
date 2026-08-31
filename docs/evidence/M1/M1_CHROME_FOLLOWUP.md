# M1 Chrome Keyboard Follow-up

## Decision

User-approved Chrome verification closes the only unresolved user-interaction uncertainty for the recorded M1 source baseline. Real keyboard input traversed the production Paper experience in logical order, operated the native-tool lifecycle, completed human search, reached the dynamic result, and activated the skip link. Chrome emitted no warnings or errors.

The run does **not** convert unavailable observations into passes. Both approved clients exposed WebMCP, no natural registration rejection occurred, and the exact Chrome browser version was unavailable. Those rows remain `BLOCKED` as truthful, non-gating environment limitations; deterministic unsupported/error/rejection coverage and the observed one → zero → one browser lifecycle satisfy M1's behavioral gates. Public deployment parity remains mandatory in M5.

## Retained observations

| Scenario | Production observation | Decision |
| --- | --- | --- |
| Initial focus order | Skip link → identity → protocol control → section links → query input → Search. | PASS |
| Protocol keyboard operation | Enter disabled registrations, retained focus on the recovery control, and Enter re-enabled the native tool. | PASS |
| Human search | Keyboard-only query returned one exact result; the next Tab focused `#methods-participants`. | PASS |
| Skip link | First Tab reached “Skip to paper”; Enter moved focus to `MAIN#paper-content`. | PASS |
| Browser diagnostics | No Chrome warnings or errors. | PASS |
| Native unsupported client | Both approved clients exposed WebMCP. | BLOCKED — non-gating environment limitation |
| Natural registration rejection | No natural rejection occurred. | BLOCKED — non-gating environment limitation |
| Exact client version | Extension version retained; Chrome browser version unavailable. | BLOCKED — non-gating environment limitation |

## Provenance

- Immutable source: `06a9512c3e30672556d6eb524ac7d5d97221001a`.
- Structured trace: `docs/evidence/M1/raw/2026-08-31T03-11-29Z-chrome-keyboard.json`.
- Corroborating screenshot: `docs/evidence/M1/raw/chrome-keyboard-result.jpg`.
- Screenshot SHA-256: `E19968E8B09D32E08AC4AF320B1312865A6A68DB0C93081BF029E5B87EC1A16F`.
- Manual registry: `vedaxi.m1-paper-browser.manual.v2`.

The screenshot is corroboration only. The structured browser focus trace is the primary keyboard evidence. This follow-up binds to source commit `06a9512c3e30672556d6eb524ac7d5d97221001a`; any later Paper runtime change requires a new versioned browser-evidence run rather than inheriting this result.
