# VEDAXI Research and Product Handoff

Use this document as the complete context for continuing the VEDAXI WebMCP hackathon project. Read it fully before researching, designing, planning, or coding. Treat settled decisions as constraints. Treat unresolved items as research questions, not invitations to silently invent answers.

## Latest Session Update — 2026-08-30

This section supersedes older scope and visual assumptions elsewhere in this document when they conflict.

### Latest scope decision

The founder explicitly chose a **narrower hackathon demonstration**. Do not begin with a universal browser extension, a multi-vertical catalogue, or a sprawling operations dashboard. The current preferred fixture is one beautifully art-directed publisher workspace containing a paper, a related video, transcript excerpts, quotations, figures, citations, and a small set of WebMCP capabilities.

The recommended central task is:

> Compare the paper's methodology with the author's explanation in the video.

This task is narrow enough to understand within seconds but still proves cross-asset retrieval, WebMCP tool discovery and execution, semantic promotion and demotion, evidence alignment, rationale, human correction, and reversibility.

The older customer-recovery workflow remains useful prior thinking, but it is no longer the preferred first demo unless the founder explicitly restores it.

### Latest visual decision

The website must be beautiful before adaptation. Do not create a deliberately ugly or cluttered “before” screen merely to make the transformed state look better. The contrast is:

> A beautiful interface designed by a publisher for everyone becomes a beautiful temporary composition organized around this user's present intent.

Use the editorial confidence of Shopify Editions Winter 2026 as design-language inspiration without copying Shopify branding, Renaissance imagery, green, or page structure. Borrow oversized editorial typography, light-theme art direction, full-view compositions, small labels paired with large semantic statements, embedded product UI as visual material, and smooth chapter-like transitions.

The interface must use **real semantic objects** to show elasticity. Objects may include:

- Paper sections and pages.
- Video and transcript segments.
- Quotations and claims.
- Figures and evidence.
- Citations and provenance.
- WebMCP actions such as search, compare, extract, and cite.
- Context objects moving toward a persistent app drawer.

Elasticity means those objects change scale, clarity, position, grouping, detail, and relationship. It is not browser zoom, a cursor fisheye, floating decoration, random card motion, or hiding content with opacity.

Three object models were explored:

1. **Card Swarm:** highly visible but risks becoming a generic dashboard.
2. **Living Document:** elegant semantic zoom within a page but less dramatic across media.
3. **Semantic Stage:** recommended. Text, video, quotations, evidence, and actions remain distinct objects and recompose into a temporary editorial scene around intent.

The signature effect is **Semantic Focus Shift**:

- The active claim or passage expands and becomes typographically dominant.
- Supporting video, quotation, figure, or citation migrates nearby.
- A relevant WebMCP action appears beside the object it acts upon.
- Less relevant objects contract and move visibly toward the app drawer.
- Spatial continuity makes the change understandable.
- A brief Why / How / Control rationale explains the adaptation.
- Undo, restore, pinning, keyboard access, and reduced-motion behavior preserve control.

### Product statement to preserve

> WebMCP tells the browser what a website can do. VEDAXI determines which capabilities and assets deserve attention for this user, on this device, at this moment.

An equally strong judge-facing line is:

> The browser stops rendering every possibility equally and begins rendering desire.

### Current design gate

The founder has approved the protocol-proof design. Semantic Stage is the selected object model. The ending is locked: block the citation, create the discrepancy note, detach the agent, reload to prove persistence, disable WebMCP, repeat the same request, and end when the agent discovers nothing while the human site remains intact.

The primary three-minute judging artifact will be recorded from a real successful run. A live run may be used during Q&A with the recording ready as fallback. The kill switch belongs at the end, after positive proof and persistence. There is no closing explanatory paragraph.

The written design specification is `docs/superpowers/specs/2026-08-30-vedaxi-protocol-proof-design.md`. Production implementation has not started. After written-spec review, create the implementation plan. Its first execution phase must be an exact-browser feasibility gate for native `document.modelContext`, tool unregistration, fresh agent observation, and cross-origin discovery. Only the browser result may decide whether the demo uses simultaneous cross-origin discovery or the sequential two-site fallback.

## Goal

Create a hackathon-ready demonstration of VEDAXI, a publisher-side WebMCP product that makes a website work differently for humans and authorized agents without creating two disconnected products.

The core idea is simple enough for a child to understand:

> People should get a beautiful web made for people. Agents should get a fast path made for agents. Both should operate the same real product.

The human sees a rich, playful, dimensional workspace. The agent discovers and calls publisher-provided WebMCP tools instead of crawling the visual interface. VEDAXI uses the agent's current intent, publisher-defined capability information, permissions, and product context to focus the human interface around the active job. Less relevant content moves out of the way into a persistent app drawer. It does not disappear.

This is a controlled hackathon demonstration. We are building both:

1. A fictional publisher application with WebMCP enabled.
2. The VEDAXI layer that interacts with the publisher application's capabilities and shared state.

The controlled environment is acceptable because the purpose is to prove a known, bounded capability honestly. Seeded data and rehearsed scenarios are allowed. The underlying tool registration, calls, state mutations, focus transitions, and displayed measurements must be real within the prototype.

## Current Progress

### Product definition is substantially settled

- Product name: **VEDAXI**. Do not use VDX.
- VEDAXI is primarily a **publisher platform**, installed by product teams to make web products agent-ready and intent-adaptive.
- The startup workspace is the controlled demonstration of the publisher platform, not a separate competing product definition.
- The external agent for the hackathon can be ChatGPT in the in-app browser. We do not need to build a foundational agent.
- The publisher provides WebMCP tools. The interaction is **agent-to-publisher-tools**, not agent-to-agent.
- WebMCP itself does not supply recommendation weights. VEDAXI supplies the ranking, weighting, policy, analytics, and focus layer around publisher-defined tools.
- Authentication and authorization can become part of the VEDAXI product layer. The prototype must clearly distinguish real implemented auth behavior from simulated demo identity.
- The human UI and agent tool handlers must mutate the same state through the same application action layer.
- The agent-side display must show an execution and decision trace, not private chain-of-thought.
- The interface must be explainable, inspectable, recoverable, and reversible.

### Golden workflow

The current anchor scenario is an at-risk customer recovery decision:

> “Our $48k customer account may churn. Prepare a recovery decision.”

The original placeholder account name was Acme. Replace it with a more distinctive fictional customer name if that improves the demo, while preserving the workflow and approximate sample value. Clearly label all figures as sample data.

The scenario should require multiple product domains so the demo proves orchestration rather than a single shortcut:

- CRM: account value, owner, renewal date, relationship history.
- Support: open incidents, severity, response history, sentiment.
- Delivery or product usage: adoption, blockers, missed milestones.
- Finance or approvals: commercial exposure and permitted offers.
- Communication: a proposed recovery plan or customer response.

The agent should retrieve the minimum relevant information, assemble a recommendation, and stop for human confirmation before any consequential action.

### Existing prototype feedback that must not regress

- Earlier top buttons such as “Get customer,” “Save a customer,” and “Ship the launch” appeared static. In the next build, every visible primary action must perform a meaningful state transition.
- Focus behavior was too static. The next version must show continuous, semantic reorganization.
- The app drawer and unfocused modules must not disappear. They move out of the way and remain recoverable.
- The agent side must not be an empty interface. It must visibly show truthful execution progress.
- Dull colors and generic dashboard styling were rejected.
- The product's job is to make the internet simpler, not add another complicated control surface.

## The Product Thesis

### The problem

Websites are built primarily for visual human navigation. An agent that already knows a user's intent often still has to inspect pages, interpret navigation, load irrelevant assets, and imitate clicks. This creates unnecessary steps, latency, ambiguity, and data transfer.

Publishers historically treated automated traffic as something to block because bot traffic can be scraping, spam, abuse, or denial-of-service traffic. The emerging opportunity is to distinguish authorized, intent-bearing agents from hostile automation and expose bounded, typed product capabilities to them.

### The VEDAXI method

1. The publisher declares available WebMCP tools and their schemas.
2. VEDAXI attaches publisher-controlled metadata such as capability priority, popularity, permissions, risk, prerequisites, and data cost.
3. The user's agent arrives with current intent and identity context.
4. VEDAXI matches intent to authorized capabilities.
5. The agent calls only the relevant tools.
6. Those calls use the same application actions and state as the human UI.
7. The human interface focuses around the active job.
8. Unrelated modules move into the app drawer but remain available.
9. Consequential actions pause for human confirmation.
10. The system records what changed, why it changed, what was deferred, and how to reverse it.

### The elasticity concept

“Elastic” does not mean deleting features or generating a completely new product for every prompt. It means dynamically changing prominence, placement, detail, and interaction priority while preserving capability reachability.

The interface should be able to:

- Promote modules relevant to the current job.
- Compact less relevant modules into the drawer.
- Restore modules immediately.
- Pin a module so automation cannot move it.
- Assemble a temporary focus pack for a specific job.
- Explain every material reorganization.
- Reverse an adaptation.
- React to a workflow shift without destroying earlier context.

### The human-focus principle

The interface must demonstrate an understanding of human attention. Showing every option with equal importance creates confusion. Permanently removing most options makes the product rigid. VEDAXI should occupy the useful middle:

- Keep the full capability set available.
- Present a small, ranked set for the current decision.
- Explain why those options are in focus.
- Let the human widen, narrow, pin, reject, or reverse the focus.
- Allow the workspace to change when intent changes.

The product is not making the decision instead of the person. It is shaping a better decision environment so the person can exercise judgment with less noise.

### A simple analogy

In online banking, many visits concern statements or payments. A human website may display dozens of services, promotions, menus, and visual assets. An authorized agent already carrying a request for a statement should be able to discover the statement capability, authenticate, call it, and return the result without traversing the whole human interface. If the user asks for a less common task, the agent can discover that lower-ranked capability without the publisher hiding it.

The banking example explains the method. It is not the hackathon vertical.

## What WebMCP Is and Is Not in This Product

### Technically honest framing

- WebMCP is the browser-facing mechanism through which a publisher exposes structured tools to an agent.
- VEDAXI is the product layer that helps publishers define, rank, authorize, observe, and visually synchronize those tools.
- The publisher owns the tools and business rules.
- VEDAXI owns the orchestration method and adaptive presentation layer demonstrated here.
- The agent brings current user intent.
- Tool popularity alone is not intent. It can be one ranking signal among several.
- Static publisher weights alone are not enough. Intent relevance, permissions, risk, prerequisites, recency, and current state must be considered.
- The “magical CLI” is VEDAXI's human-readable visualization of WebMCP discovery and execution. Do not claim that WebMCP is literally a CLI protocol.
- Do not display private chain-of-thought. Display structured events and concise rationales that the product can actually know.

### Truthful agent trace vocabulary

The agent surface may display events such as:

```text
INTENT
Prepare a recovery decision for Northstar Labs

AUTH
Identity verified
Allowed: read account, read incidents, draft plan
Confirmation required: commercial offer, outbound message

DISCOVER
12 publisher capabilities available

RANK
get_customer_health       0.96
get_open_incidents        0.91
get_delivery_risk         0.87
prepare_recovery_plan     0.84
launch_campaign           deferred

EXECUTE
customer health retrieved
blocking incident identified
delivery milestone checked
recovery plan prepared

CONFIRM
Approve a 30-day extension and send the draft?
```

Scores must be labeled as sample, calculated, or publisher-configured depending on their actual source. Never present invented precision as measured production truth.

## Human View Versus Agent View

The contrast is the signature demonstration.

### Human side

- Approximately 65 to 70 percent of the desktop composition.
- A bright, playful, tactile, dimensional product workspace.
- Real readable HTML remains the semantic and accessible layer.
- CRM, support, delivery, revenue, communication, and related modules can appear as spatial objects or object-like surfaces.
- Focus is shown through depth, scale, position, lighting, clarity, and motion.
- Modules not required for the active task move toward or into a persistent edge drawer.
- The user can restore, pin, inspect, reject, or undo.
- The surface remains useful before, during, and after agent activity.

### Agent side

- Approximately 30 to 35 percent of the desktop composition.
- A VEDAXI-native command rail rather than a generic black terminal.
- It can use animated command capsules, structured rows, timing, and clear tool states.
- It stays calm and highly legible while the human side is more expressive.
- It shows intent, auth, discovery, ranking, execution, state mutation, deferred work, confirmation, timing, and result.
- Each trace event should have a visible counterpart on the human side.

### Shared-state proof

The same action should work from either side:

```text
Human click ─┐
             ├─> shared application action ─> shared state ─> human UI update
WebMCP call ─┘                                      └─> trace event
```

WebMCP tool handlers must not directly manipulate visual components. They should call typed application actions. UI controls should call those same actions.

## Demo Choreography

The ideal first 30 seconds:

1. Show the complete publisher workspace in its rich default state.
2. Show that all major modules are reachable and that primary buttons work.
3. Enter or send the customer-recovery intent through the real agent path.
4. The agent rail acknowledges the intent and checks authorization.
5. Tool discovery appears immediately.
6. Relevant spatial objects respond to discovery with a restrained signal.
7. Ranked tools become clearer while irrelevant capabilities are marked deferred.
8. As tools execute, CRM, support, and delivery objects glide into the focus field.
9. Other modules move toward the app drawer. They do not fade into nonexistence.
10. The agent assembles one focused recovery decision.
11. The human sees a concise recommendation with evidence and tradeoffs.
12. A consequential action pauses for explicit confirmation.
13. The user can inspect “why this changed,” undo the focus transformation, or restore any module.
14. Show a small comparison: traditional visual traversal versus WebMCP tool route.

The demo should include a reset control and named presets so it can be replayed reliably. A clearly labeled fallback presentation mode is acceptable for stage reliability, but it must not be passed off as live tool execution.

## Animation and Interaction Direction

### Visual premise

Science-fiction HUD styling should feel like the past. The future here is friendly, tactile, colorful, and obvious. Taste comes from fun objects, physical movement, and intent discovery, not neon grids, fake holograms, or dense cockpit chrome.

### Settled visual constraints

- Bright rather than dark-first.
- Playful rather than corporate-dull.
- Dimensional rather than flat-card-only.
- One disciplined accent system rather than unrelated rainbow UI.
- Soft off-white and cool neutral surfaces are preferable to pure white or pure black.
- Avoid generic AI purple gradients.
- Avoid cyberpunk, fake HUD panels, decorative hexagons, excessive glass, and gratuitous glow.
- Avoid a generic shadcn or Vercel dashboard appearance.
- Do not use 3D merely as a background ornament. The spatial system must communicate hierarchy and state.
- Text, forms, and controls should remain normal DOM elements for legibility and accessibility.

### Animation must communicate one of four things

1. Hierarchy: what matters now.
2. Story: what the agent is doing in sequence.
3. Feedback: what changed because of an action.
4. State transition: how the workspace reorganized.

If an animation communicates none of these, remove it.

### Proposed motion grammar

- **Discover:** a subtle surface response identifies capabilities that match the intent.
- **Rank:** relevant objects gain clarity, scale, or proximity. Do not use generic progress bars.
- **Select:** one object gains a crisp active edge and moves onto the focus plane.
- **Execute:** a short connection trail links the agent event to the affected object.
- **Defer:** objects reduce prominence and move toward the drawer, while remaining visible during transit.
- **Focus:** selected objects form a temporary task composition rather than a static grid.
- **Confirm:** motion settles and the interface becomes deliberately still around the decision.
- **Undo:** objects retrace their spatial transition, making reversibility visible.
- **Workflow shift:** the existing focus pack loosens, the new set reorganizes, and pinned items retain position.

### Motion safety and performance

- Prefer transform and opacity animation.
- Honor reduced-motion preferences with static or instant state changes.
- Keep readable UI out of WebGL.
- Lazy-load the 3D layer where practical.
- Provide a non-WebGL or low-motion fallback.
- Test laptop and in-app browser performance, not just a powerful development machine.
- Avoid continuous React state updates for pointer or animation values.
- Every animation loop must clean up safely.

## Candidate Technical Direction

Validate this against the actual repository and current WebMCP/browser support before implementation.

- React with TypeScript.
- Vite or Next.js depending on the current repo. Do not migrate frameworks without evidence.
- React Three Fiber on top of Three.js for the spatial focus field.
- Motion for DOM layout transitions, drawer motion, and agent-rail choreography.
- Do not let Three.js and Motion compete over the same element or render loop.
- A reducer, Zustand store, or another small typed store for shared application state.
- Pure ranking and adaptation functions where possible.
- Client-safe WebMCP tool registration with cleanup.
- Vitest or the repository's existing test runner for state parity and ranking tests.
- Playwright or browser-level interaction checks for the golden workflow if feasible.

Avoid adding backend services, databases, generic plugin systems, or extensibility layers unless the golden demonstration requires them.

## Capability Model to Research and Refine

A useful initial capability definition may include:

```ts
type CapabilityDefinition = {
  id: string
  label: string
  description: string
  inputSchema: unknown
  publisherPriority: number
  usageFrequency: number
  risk: "read" | "draft" | "commit"
  permissions: string[]
  prerequisites: string[]
  estimatedDataCost?: number
  estimatedLatencyMs?: number
  uiModuleId: string
}
```

A useful ranking input may include:

```ts
type RankingContext = {
  intent: string
  authorizedPermissions: string[]
  currentWorkspaceState: unknown
  recentActions: string[]
  pinnedModuleIds: string[]
}
```

Do not treat these shapes as final APIs. Research whether WebMCP annotations or schemas already cover part of this metadata. Keep VEDAXI-specific metadata separate from standards-defined fields.

The ranking model should start deterministic and explainable. A possible structure is:

```text
eligibility gate
  -> permission check
  -> prerequisite check
  -> intent relevance
  -> publisher priority
  -> usage evidence
  -> current-state relevance
  -> risk and data-cost adjustment
  -> ranked capability set
```

Do not begin with opaque machine learning. The hackathon needs an understandable method that can be demonstrated and evaluated.

## Authentication and Trust

Authentication is part of the VEDAXI product opportunity, but the prototype scope must be precise.

Research and distinguish:

- Agent identity.
- User identity.
- Publisher session identity.
- Tool-level authorization.
- Read, draft, and commit risk levels.
- Human confirmation for consequential operations.
- Rate limiting and abuse controls.
- Auditability of agent-triggered actions.
- How a publisher distinguishes authorized agent traffic from scraping or hostile automation.

The prototype may use a controlled identity fixture, but it must display that fact honestly. Do not claim a production security model if one has not been implemented.

## AEO, GEO, SEO, Performance, and Traffic Claims

VEDAXI's methodology may make several publisher outcomes easier, but these must be separated into demonstrated, inferred, and aspirational claims.

### Plausible product story

- SEO helps traditional search engines discover and rank human-facing pages.
- AEO and GEO help answer systems understand and cite publisher content.
- VEDAXI focuses on executable agent access to product capabilities.
- Structured tools may reduce the need for agents to parse visual pages or load irrelevant assets.
- Publishers can serve humans with rich visual experiences while giving authorized agents compact structured interactions.
- Visual advertisements are generally irrelevant to an agent completing a tool task and may represent unnecessary transfer if the agent must load the human page.

### Do not overclaim

- Do not claim WebMCP automatically improves SEO, AEO, or GEO.
- Do not claim universal traffic reduction without measuring the compared paths.
- Do not claim agents never need web content.
- Do not equate fewer visual page loads with lower total publisher traffic in every scenario.
- Do not invent a measured latency advantage.
- Do not call recommendation engines novel by themselves. The innovation claim must concern the combined publisher-controlled WebMCP capability layer, intent-aware ranking, shared-state UI adaptation, and visible human-agent synchronization.

### Measurements the prototype can credibly produce

- Number of tools discovered.
- Number of tools called.
- Number of visual navigation steps in the comparison path.
- Bytes or response payload sizes for controlled calls.
- Modules loaded, focused, compacted, and deferred.
- Time from intent receipt to prepared decision in the controlled environment.
- Number of consequential operations requiring confirmation.
- State parity between a UI action and the equivalent WebMCP action.

Label the comparison as a controlled demonstration, not a universal benchmark.

## ICP, Buyer, JTBD, and Market Questions

These are the most important remaining research questions.

### Working ICP hypothesis

The likely first customer is a software publisher with:

- A complex authenticated web application.
- Repeated high-frequency user jobs.
- Existing APIs or action layers that can be wrapped as WebMCP tools.
- Strong pressure to support agent workflows.
- A product or platform team able to install a client-side SDK and define permissions.
- A measurable cost from navigation complexity, support load, or agent incompatibility.

Candidate verticals include CRM, customer success, project operations, commerce administration, finance operations, and support tooling. Research should recommend one beachhead rather than keeping all of them.

### Working buyer hypothesis

- Economic buyer: VP Product, Chief Product Officer, CTO, or Head of Digital Platform.
- Technical champion: staff frontend engineer, platform engineer, AI product lead, or developer-experience lead.
- Daily beneficiary: end user working with an authorized assistant or agent.

### Working publisher JTBD

> When customers begin using agents to operate my product, help me expose safe, efficient capabilities without forcing agents through the visual UI or sacrificing the human experience, so I can remain discoverable, useful, and measurable in an agent-mediated web.

### Working end-user JTBD

> When I need to complete a complex job across several product areas, help my agent collect the relevant evidence and reorganize the workspace around the decision, so I can act quickly without losing control or context.

### Questions research must resolve

1. Which first vertical has the clearest repeated jobs and strongest willingness to pay?
2. Who owns the budget for becoming agent-ready?
3. Is the first commercial product an SDK, management console, analytics product, auth gateway, or a tightly scoped combination?
4. Which existing categories are adjacent: API management, agent gateways, headless platforms, personalization, search optimization, browser automation, or digital experience platforms?
5. Where is VEDAXI genuinely differentiated, and where is it repackaging known ideas?
6. Which part creates recurring value after the initial integration?
7. Should capability weights be manually configured, learned from publisher analytics, or hybrid? The likely answer is hybrid, starting with explicit configuration.
8. What production auth pattern is realistic for publisher-provided browser tools?
9. Which AEO, GEO, SEO, latency, and traffic benefits can be demonstrated now versus placed on the roadmap?
10. What is the smallest install path a publisher team would accept?

## Channel of Execution and Commercial Hypothesis

The likely execution channel is publisher integration, not a consumer destination website.

### Product delivery hypothesis

1. A publisher installs a small VEDAXI browser SDK or integration package.
2. The publisher maps existing application actions to WebMCP tools.
3. The publisher configures permissions, risk, confirmation, and initial ranking metadata.
4. VEDAXI exposes a validation and observability surface for product teams.
5. The same integration can optionally power the adaptive human focus layer.

### Adoption motion to research

- Developer-led proof of concept for one high-frequency job.
- Product-team expansion across additional capabilities.
- Security and platform review before consequential actions are enabled.
- Usage analytics and ranking refinement after deployment.
- Enterprise control plane for policy, audit, and multi-product governance if demand is proven.

Do not assume all of these belong in the first product. Research which component is the initial paid wedge and which components are expansion revenue.

### Monetization hypotheses to test

- Subscription by publisher application or environment.
- Usage-based pricing for successful authorized tool executions.
- Tiered pricing based on capabilities, policy, observability, and audit retention.
- Enterprise pricing for governance, identity integration, and support.

The hackathon workspace is not itself the primary distribution channel. It is evidence that the publisher integration works.

## Habit Formation and Retention Logic

VEDAXI should create a habit through repeated successful decisions, not through engagement tricks.

```text
User states a job
  -> agent finds the shortest authorized route
  -> workspace focuses around the evidence
  -> human reviews and confirms
  -> outcome is completed
  -> user learns that the product becomes clearer when intent is expressed
```

The habit loop is:

- **Cue:** a real job, risk, or decision appears.
- **Routine:** the user asks the agent in natural language instead of manually opening many modules.
- **Reward:** the right evidence and actions arrive in one focused workspace.
- **Trust reinforcement:** the user can see what happened, control commitments, and undo adaptations.
- **Publisher learning:** aggregated, privacy-respecting usage evidence can improve default capability ordering.

The product must avoid a dangerous counter-habit where users blindly approve agent recommendations. Confirmation design should encourage inspection of evidence, tradeoffs, and consequences.

## Market and Prior-Art Research Brief

Research must use primary sources for technical claims and current sources for market claims. Clearly distinguish facts, interpretations, and product hypotheses.

Investigate:

- Current WebMCP specification, explainer, examples, browser support, tool registration lifecycle, schemas, annotations, prompts/resources if applicable, and security considerations.
- Hackathon rules, judging criteria, submission requirements, deadline, public-repo requirements, video limits, and supported environments.
- Mixed-initiative interaction principles, particularly user control, intervention timing, rationale, reversibility, and graceful automation.
- Runtime task-driven interface adaptation and explainable adaptive UI prior art.
- Shopify and other publisher-side agent or commerce capability initiatives as adjacent validation, not automatic direct competitors.
- API management and agent gateway products that may already cover tool auth, policy, observability, and routing.
- Digital experience and personalization platforms that adapt interfaces based on behavior.
- AEO and GEO tooling, including what they actually optimize and what evidence they provide.
- Agent-friendly web proposals, structured actions, browser-native tool APIs, and the direction of agent-oriented operating environments.
- Omarchy as inspiration for malleable, agent-era computing. Do not copy its aesthetic or overstate it as a direct competitor.
- Evidence for or against the claim that structured agent tools reduce navigation steps, transferred data, or latency.

For each relevant company or project, report:

- What it does.
- Who buys it.
- Where it lives in the stack.
- Whether it exposes tools, adapts UI, manages auth, ranks capabilities, or measures agent activity.
- How it overlaps with VEDAXI.
- What VEDAXI can credibly claim that it does not.
- Source links and publication dates.

## Product Flow Research Brief

Produce a complete flow for the golden scenario, including:

1. Default workspace state.
2. Intent capture.
3. Agent and user identity context.
4. Tool discovery.
5. Eligibility and permission filtering.
6. Capability ranking.
7. Tool calls and returned data.
8. Shared state mutations.
9. Spatial focus transition.
10. Recommendation assembly.
11. Human inspection.
12. Confirmation or rejection.
13. Commit action.
14. Undo and recovery.
15. Audit event.
16. Reset for the next demo.

For each step, identify:

- Actor.
- Input.
- Output.
- Visible human feedback.
- Agent trace event.
- Failure state.
- Recovery path.
- Whether the step is real, controlled, simulated, or aspirational in the hackathon build.

Also produce a traditional-browser comparison flow. Keep the comparison fair: count actual navigation and data-fetch steps in both controlled paths.

## Animation Research Brief

Find relevant high-quality references for:

- Spatial focus and semantic zoom.
- Object regrouping and layout morphing.
- Edge drawers where objects visibly remain available.
- Shared-element transitions.
- Tactile 3D product surfaces.
- Calm command or execution traces.
- Visible cause-and-effect between two synchronized panes.
- Reduced-motion fallbacks for spatial interfaces.
- React Three Fiber performance patterns.
- Accessible HTML overlays within or above WebGL scenes.

For every reference, explain the interaction principle worth borrowing. Do not copy a site's full visual identity.

Create a motion specification with:

- Trigger.
- Start state.
- End state.
- Duration range.
- Easing or spring behavior.
- What the animation communicates.
- Reduced-motion equivalent.
- Performance risk.
- Failure or cancellation behavior.

Pay special attention to the transition from “many available things” to “one focused decision.” It must feel dynamic and intelligent, not like filtering a static dashboard.

## Product Requirements for the Prototype

### Required

- One controlled publisher workspace.
- One golden recovery workflow.
- Seeded realistic data.
- Working primary action buttons.
- Persistent capability or app drawer.
- Dynamic focus surface.
- Evolution or “why changed” history.
- Undo and restore.
- Pinning.
- Agent activity rail.
- WebMCP capability registration where supported.
- Same state path for UI and tool actions.
- Capability availability check and graceful fallback.
- Confirmation before consequential action.
- Reset and deterministic presets.
- Truthful controlled measurements.
- A 30-second aha moment.
- A full demo under the hackathon video limit once verified.

### Strongly preferred

- Actual React Three Fiber spatial layer.
- DOM-based accessible controls and text.
- Keyboard operation for major actions.
- Reduced-motion mode.
- Low-performance fallback.
- Automated state parity tests.
- A visible distinction between live execution and presentation fallback.

### Explicit non-goals for the hackathon

- General-purpose agent operating system.
- Agent-to-agent protocol.
- Full memory or knowledge-graph platform.
- Opaque ML recommendation model.
- Production-grade identity provider.
- Many vertical demos.
- A universal WebMCP crawler.
- Heavy backend infrastructure.
- A complete AEO, GEO, and SEO suite.
- Unverified claims of global traffic or latency savings.
- A marketing-only animation with no functioning state model.

## Evaluation Requirements

At minimum, test:

- Intent ranking produces the expected capability order for the seeded scenario.
- Unauthorized tools are excluded or blocked.
- Pinned modules never move into the drawer automatically.
- Compacted modules remain reachable.
- UI and WebMCP actions produce equivalent state transitions.
- Every material adaptation has a reason trace.
- Every reversible adaptation has a working undo path.
- The workspace can shift from one job to another without losing pinned context.
- Reset restores a known initial state.
- Reduced-motion mode preserves meaning.
- The primary demo completes without console errors.

## What Worked

- Reducing the concept to one contrast: human web versus agent route.
- Treating the startup workspace as a controlled publisher demo.
- Using one multi-domain customer-recovery workflow.
- Making the app drawer a recovery layer rather than a hiding place.
- Showing a truthful execution trace instead of an empty agent pane.
- Connecting agent events to visible UI changes.
- Framing adaptation as mixed-initiative and reversible.
- Separating WebMCP's actual role from VEDAXI's custom weighting and policy layer.
- Using deterministic, explainable ranking for the hackathon.

## What Did Not Work or Must Not Be Repeated

- Calling the product VDX. The name is VEDAXI.
- Describing the interaction as agent-to-agent.
- Claiming WebMCP itself contains VEDAXI's weights.
- Calling the agent surface a literal WebMCP CLI without qualification.
- Static top buttons.
- A static focus state.
- Making app modules vanish.
- Leaving the agent side blank.
- Dull, low-energy dashboard colors.
- Dark cyberpunk or fake science-fiction HUD styling.
- Generic dashboard cards with no spatial meaning.
- Too many options with equal visual importance.
- Too few permanently fixed options that make the system feel rigid.
- Overclaiming AEO, GEO, SEO, traffic, or latency outcomes.
- Treating a common recommendation engine as the unique innovation by itself.
- Building many verticals before the golden workflow works.

## Superseded Material From the Original PDF

The original `HANDOVER_PROMPT.pdf` remains useful for:

- Mixed-initiative interaction.
- Session-context adaptation.
- The capability drawer.
- Evolution events and explanations.
- Reversibility and recoverability.
- One use case and a narrow hackathon slice.
- Shared state between UI and WebMCP tools.
- Seeded presets and evaluation.

The following original direction is superseded:

- “Adaptive Mission-Control Workspace” is not the final product name or primary framing.
- The dark “graphene mission control” aesthetic is rejected.
- Long-term session frequency is not the sole or primary ranking model. Current intent and authorization are central.
- The product is now explicitly framed as a publisher platform demonstrated through a controlled workspace.
- Authentication is no longer automatically out of scope. A narrow, honest auth demonstration may be part of the product story.

## Deliverables Expected From the Research Phase

Do not return a loose list of links. Produce a decision-ready research package containing:

1. **Executive conclusion:** Is VEDAXI technically credible, differentiated, and futuristic? State the strongest and weakest parts directly.
2. **Current WebMCP reality:** What is possible today, what requires flags or special environments, and what must be simulated.
3. **ICP and buyer recommendation:** One beachhead, one buyer, and the reason.
4. **JTBD:** Publisher and end-user jobs.
5. **Problem definition:** Concise and evidence-backed.
6. **Market map:** Direct, adjacent, substitute, and enabling categories.
7. **Innovation claim:** One defensible sentence plus supporting mechanism.
8. **Product architecture:** Publisher app, VEDAXI layer, agent, auth, shared action path, and UI focus engine.
9. **Golden product flow:** Step-by-step with failure and recovery paths.
10. **Tool map:** Tool names, schemas, permissions, risk, data, UI module, and confirmation requirement.
11. **Ranking method:** Explainable formula or decision pipeline.
12. **Human versus agent storyboard:** Side-by-side frames for the first 30 seconds and full demo.
13. **Motion specification:** Spatial transitions and trace choreography.
14. **Visual reference board:** Principles and sources, not cloned aesthetics.
15. **Measurement plan:** Exact metrics and controlled baseline.
16. **Claims ledger:** Demonstrated, inferred, aspirational, and prohibited claims.
17. **Hackathon compliance checklist:** Verified against current official rules.
18. **Build recommendation:** Minimum implementation slice and explicit cuts.
19. **Open risks:** Browser support, security, performance, differentiation, monetization, and demo reliability.
20. **Final unresolved decisions:** Only decisions that genuinely require the founder.

## Instructions to the Next Researcher or Agent

1. Begin by restating the product in five plain-language sentences.
2. Identify contradictions between this handoff, the repository, and current external facts.
3. Use current official sources for WebMCP, browser behavior, and hackathon rules.
4. Use primary sources for technical research.
5. Cite every market or performance claim close to the claim.
6. Distinguish observation, inference, recommendation, and aspiration.
7. Be blunt if the differentiation or business model is weak.
8. Prefer one strong recommendation over a menu of equally weighted options.
9. Do not start implementation while a product choice would materially change the architecture.
10. Do not reopen settled naming or visual-direction decisions without concrete evidence.
11. Keep the explanation understandable to a nontechnical judge while preserving technical truth.
12. End with a prioritized action sequence for research, prototype, testing, demo recording, and submission.

## One-Line Pitch

VEDAXI lets publishers keep a rich web for people while giving authorized agents a faster, structured route to the same product capabilities, then reshapes the human workspace around the job being done.

## Short Judge-Friendly Explanation

Most websites make an agent walk through the same screens as a person. VEDAXI gives the agent a safe list of actions provided by the website. When the agent uses those actions, the person's screen reorganizes around the task, shows what happened, and keeps everything else within reach.

## Next Steps

1. Complete the research package above.
2. Resolve the beachhead, buyer, auth scope, ranking ownership, and measurable claims.
3. Inspect the actual repository and write `PRODUCT_TRUTH.md` as the governing build artifact.
4. Write the implementation plan around the golden recovery workflow.
5. Build shared state and working UI actions first.
6. Add the WebMCP tool path and parity tests.
7. Add the agent execution rail.
8. Add the spatial focus layer and drawer choreography.
9. Test in the target in-app browser.
10. Measure the controlled comparison.
11. Record the demo and verify submission compliance.
