# VEDAXI Protocol-Proof Demo Design

**Status:** Approved design, pending written-spec review  
**Date:** 2026-08-30  
**Primary artifact:** Recorded three-minute hackathon demonstration  

## 1. Goal

Build a narrow demonstration in which a genuinely external browser agent discovers WebMCP capabilities from publishers whose code it did not import, retrieves evidence from two origins, independently identifies a methodological contradiction, asks a human for a consequential decision, and leaves a durable artifact in publisher-owned state.

The visual experience must also prove VEDAXI's core presentation thesis: a beautiful publisher-designed interface can reorganize around current user intent without becoming a bland dashboard or deleting peripheral capabilities.

The judge-facing claim is:

> An outside agent imported none of the publishers' code. It discovered capabilities across two origins, gathered evidence, found a contradiction the original interface did not express, asked a human, and left a durable artifact in publisher state.

## 2. Why WebMCP Is Necessary

The external agent must not import publisher functions, receive publisher tool names in its prompt, or use a prebuilt “compare methodology” workflow. It receives only the user's request and whatever capability descriptions and schemas the active browser exposes.

The protocol counterfactual is an explicit acceptance test:

- With WebMCP registered, the outside agent discovers and invokes publisher capabilities.
- With WebMCP unregistered, the same human website remains complete and usable.
- A fresh agent observation of the same request discovers no publisher capabilities and cannot complete the workflow.

Deleting WebMCP must therefore break the agent route while preserving the human route. If both routes remain pixel- and behavior-identical after WebMCP removal, the implementation has failed the central product proof.

The current draft surface is `document.modelContext`. Any fallback to the deprecated `navigator.modelContext` alias or to a polyfill must be explicit and must not be misrepresented as native browser support. Primary technical reference: <https://webmachinelearning.github.io/webmcp/>.

## 3. Controlled Research Fixture

The demo uses fictional research content so the discrepancy is deterministic and no real paper is misrepresented.

### Paper claim

> “Forty participants completed the study and were included in the final analysis.”

### Video claim

> “We recruited forty participants. Six sessions had calibration drift, so we removed them before modeling and did not replace them.”

### Agent-derived finding

```text
Paper reports final analyzed sample: 40
Video implies final analyzed sample: 40 - 6 = 34
Difference: 6 participants
Status: unresolved methodological discrepancy
```

The phrase “did not replace them” is required. It prevents the two statements from being explained as different but compatible recruitment stages.

The workflow must end with a real research-integrity decision:

> **Block the citation and create a discrepancy note.**

An email draft is explicitly out of scope. It is generic language-model behavior and does not prove WebMCP, capability discovery, human confirmation, or shared publisher state.

## 4. System Architecture

### 4.1 Outside browser agent

The agent is operationally separate from both publishers. It imports no publisher application code and contains no hardcoded publisher tool names. It:

1. Receives the user's comparison request.
2. Discovers available tool descriptions, schemas, annotations, and origins.
3. Selects and invokes evidence-retrieval capabilities.
4. Compares the independently returned evidence.
5. Derives the discrepancy.
6. Requests a focused composition using semantic object IDs.
7. Proposes blocking the citation.
8. Waits for human approval.
9. Invokes publisher mutation capabilities.

The visible agent trace shows structured facts—intent, origin, discovered capability, call, result, rationale, confirmation, and mutation. It must not display private chain-of-thought.

### 4.2 Origin A: paper publisher and VEDAXI composition shell

This origin owns:

- The primary editorial page.
- Paper sections, figures, quotations, and citations.
- The Semantic Stage presentation engine.
- The persistent capability drawer.
- Citation status.
- Discrepancy notes.
- The generic focus-composition capability.
- The consequential mutation capabilities.

### 4.3 Origin B: independent video publisher

This origin owns:

- The video player.
- Video chapters.
- Transcript segments.
- Video timestamps and provenance.
- Its own independent WebMCP registration.

The target composition embeds this publisher as a genuine cross-origin frame inside the paper workspace. Tool provenance must retain the video origin.

### 4.4 Persistent publisher state

Citation status and discrepancy notes must be stored outside transient animation state and outside agent memory. Reloading the ordinary paper page with no agent attached must retrieve the note and blocked status from publisher-owned persistence.

The final persistence technology will follow the repository and deployment environment, but in-memory process state is unacceptable because it may disappear across a reload or serverless invocation. The implementation plan must select a storage mechanism with a deterministic reset path for repeated demos.

### 4.5 Shared action boundary

Human controls and WebMCP tool handlers call the same typed application actions. Tool handlers never manipulate visual components directly.

```text
Human confirmation ─┐
                    ├─> typed publisher action ─> persistent state
WebMCP invocation ──┘                              ├─> UI update
                                                   └─> audit event
```

## 5. Capability Surface

Exact names may change during implementation, but responsibilities may not be collapsed into a precomputed comparison tool.

### Paper origin

- Search paper evidence using an open query.
- Read one semantic evidence object by ID.
- Compose the interface around agent-selected primary and supporting object IDs.
- Block a citation after confirmation.
- Create a discrepancy note referencing evidence object IDs.

### Video origin

- Search transcript evidence using an open query.
- Read one transcript evidence object by ID.
- Seek the video to an evidence timestamp.

Every returned evidence object includes a stable ID, asset type, source origin, locator, excerpt, and provenance. The focus capability accepts IDs and a concise rationale; it does not decide what matters. There is no `compare_sources` capability.

Tool descriptions and schemas must be sufficient for a generic agent to choose them without knowing their names in advance.

## 6. Semantic Stage and Money Shot

The starting site is already beautiful, useful, light, editorial, and publisher-authored. It is not a deliberately cluttered straw man.

When the agent identifies the discrepancy:

1. The paper phrase `Forty participants` moves onto the focal plane.
2. The video object moves beside it and seeks to the exact timestamp.
3. The transcript phrase `Six sessions ... removed` becomes a second dominant object.
4. A restrained calculation object forms between them: `40 - 6 = 34`.
5. A visual tension line connects `reported n=40` and `implied n=34`.
6. Provenance remains attached to each claim.
7. Related evidence forms a context ring.
8. Peripheral objects travel visibly toward the app drawer rather than disappearing.
9. A Why / How / Control rationale explains the change.
10. Motion settles around the human decision.

The user can inspect context, reject the interpretation, restore objects, or confirm the block. Reduced-motion mode produces the same hierarchy and meaning without animated travel.

After confirmation, the interface displays a durable note containing:

- `Citation blocked`
- Reported and implied sample sizes
- The exact paper passage
- The exact video timestamp and transcript
- Concise agent rationale
- Evidence provenance
- Human confirmation time
- `Unresolved` resolution status

## 7. Three-Minute Choreography

The judging artifact is recorded. The run shown in the recording must be a real successful end-to-end execution; recording is used to remove model-latency and network-risk exposure from judging, not to substitute animation for execution. A live run may be used during Q&A, with the recording immediately available as fallback.

Target active sequence: approximately 154 seconds, leaving about 26 seconds of slack.

### 0:00–0:12 — Beautiful human experience

Show the complete publisher-designed paper and embedded video workspace. Major objects and the drawer are visibly real and interactive.

### 0:12–0:32 — Outside agent discovery

Issue the methodology-comparison request. Show capability discovery from both origins, including tool provenance. Do not narrate implementation detail.

### 0:32–1:08 — Evidence retrieval

The agent searches and reads the paper evidence and video evidence independently. No comparison capability is called.

### 1:08–1:40 — Semantic Focus Shift

The agent derives the discrepancy and requests focus using the selected object IDs. The stage forms the `40`, `-6`, and `34` composition.

### 1:40–1:58 — Human decision

The agent proposes blocking the citation. The user inspects provenance and confirms.

### 1:58–2:12 — Durable mutation

The publisher blocks the citation and creates the discrepancy note through shared typed actions.

### 2:12–2:22 — Agent-free persistence proof

Detach the agent and reload the ordinary publisher page. The citation remains blocked and the note remains attached to the paper.

### 2:22–2:34 — Protocol kill switch

Turn WebMCP registration off. Run the same request through a fresh agent observation. The agent discovers no publisher capabilities while the human website and persistent note remain intact.

Stop immediately. There is no 25-second closing explanation. The counterfactual is the final image.

## 8. Registration Kill Switch

Tool registrations should have explicit lifecycles, preferably through abortable registration signals supported by the target browser build. The kill switch unregisters tools only; it must not disable the human UI, erase data, or change the visual composition to simulate failure.

Because browser-agent observation timing is implementation-defined, the implementation must verify how the exact demo browser refreshes its tool view after `toolchange`. The demo may explicitly request a fresh observation or start a fresh agent turn. It must not claim immediate rediscovery behavior that the browser does not provide.

## 9. Phase 0: Exact-Browser Feasibility Gate

This is the first implementation activity and the highest-risk gate. Documentation is not sufficient evidence.

Record the exact browser product, version, build, flags, origin-trial state, and agent host used for the demo. Then prove, in that environment:

1. `document.modelContext` exists or the precise required enablement is known.
2. A same-origin tool can register, be discovered by the external agent, execute, and return a result.
3. A registration can be removed and a fresh agent observation no longer exposes it.
4. The target browser surfaces tools from the second origin in the intended frame arrangement.
5. Origin provenance is available to the agent or visible through trustworthy browser metadata.
6. The external agent can execute tools from both origins in one task.
7. Permission Policy and explicit exposure settings behave as required.
8. The implementation works in the exact recording environment, not only a developer console or polyfill test.

The preferred result is simultaneous discovery from a top-level paper origin and cross-origin video frame.

If that exact browser does not implement the required cross-origin behavior, use the honest fallback: the same external agent visits each origin sequentially, discovers each active origin's tools dynamically, retains the evidence, returns to the paper origin, and requests the final focus and mutation. Do not fake simultaneous cross-origin discovery.

If native WebMCP itself is unavailable in the target environment, stop and resolve the demo-browser strategy before building the full interface.

## 10. Failure Handling

- **No WebMCP support:** show a truthful unsupported state; do not silently treat direct internal calls as WebMCP.
- **Second origin not discoverable:** use sequential discovery only after the Phase 0 result is recorded.
- **Tool removed during execution:** surface a structured unavailable result and allow a fresh observation.
- **Agent latency:** use the recorded successful run for judging; retain a deterministic reset and fallback recording for live Q&A.
- **Evidence missing:** do not manufacture the discrepancy; present insufficient evidence.
- **Persistence failure:** do not show the note as saved. Keep the citation unchanged and display a recoverable error.
- **Focus failure:** evidence and decision controls remain accessible in a stable DOM layout.
- **Reduced motion:** skip travel animations while preserving grouping, hierarchy, rationale, drawer reachability, and state changes.

## 11. Evaluation and Tests

### Protocol tests

- The agent bundle contains no publisher tool imports.
- The agent prompt contains no publisher tool names.
- Tool discovery succeeds from descriptions and schemas.
- Renaming or reordering tools without changing semantics does not break the golden task.
- WebMCP off produces zero relevant capabilities under a fresh observation.
- Human functionality remains available with WebMCP off.
- Each tool call records its true origin.

### Reasoning-fixture tests

- Paper search returns the exact `n=40` evidence object.
- Transcript search returns the exact exclusion evidence object.
- No publisher tool directly returns “contradiction” or `n=34`.
- The agent calculation is supported only by retrieved evidence.
- Ambiguous or missing fixture evidence prevents a confident block recommendation.

### Shared-state tests

- Human and WebMCP actions use the same publisher action functions.
- Blocking requires explicit confirmation.
- The note references both evidence IDs.
- Citation block and note survive an agent-free reload.
- Reset returns the fixture to a known clean state.

### Presentation tests

- Every promoted object remains readable.
- Every demoted object remains reachable through the drawer.
- Provenance remains attached during transitions.
- Reduced-motion mode preserves the full meaning.
- The recorded run contains no console errors, fake success states, hidden direct-call fallback, or unexplained cuts around persistence.
- The active demonstration fits within 154 seconds in the target browser, preserving at least 20 seconds of contingency.

## 12. Explicit Non-Goals

- Universal browser extension
- General research agent
- Multiple workflows or verticals
- Publisher-provided comparison engine
- Generated clarification email
- Opaque intent classifier
- Cursor-driven adaptation
- Decorative animation without state meaning
- Production identity platform
- Unverified cross-origin claims
- Marketing-only prototype with no durable mutation

## 13. Done Criteria

The demo is complete only when:

1. The outside agent dynamically discovers publisher capabilities.
2. The two pieces of evidence come from independently owned origins or the documented sequential fallback.
3. The agent, not a publisher tool, derives the discrepancy.
4. The Semantic Stage visibly expresses the contradiction.
5. A human confirms the consequential block.
6. The note persists after the agent is detached and the page reloads.
7. The kill switch removes the agent route without damaging the human site.
8. The recorded three-minute artifact shows the entire proof and ends on the failed counterfactual request without explanatory narration.

