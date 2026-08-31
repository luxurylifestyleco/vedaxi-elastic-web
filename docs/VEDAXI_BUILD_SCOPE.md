# VEDAXI Build Scope

## Outcome

Ship a live, public, judgeable VEDAXI vertical slice in which ChatGPT's in-app browser discovers tools from a paper publisher and an independent video publisher, retrieves evidence from both, derives a six-participant discrepancy, asks the human to block the citation, and leaves a durable publisher-owned discrepancy note.

The product must feel like a complete editorial research workspace before, during, and after agent activity. A protocol probe by itself is not enough.

## Judge alignment

The live Devpost criteria are the product rubric:

| Criterion | What VEDAXI must prove |
| --- | --- |
| WebMCP Leverage | Native `document.modelContext` tools, two true origins, dynamic discovery, non-trivial multi-tool workflow, and a kill switch that removes the agent route only. |
| Execution | A coherent, polished human product with working controls, persistence, failure states, accessibility, and a reliable live URL. |
| Potential Impact | A specific research-integrity job: reconcile inconsistent methodology claims before allowing a citation. |
| Creativity & Ambition | Semantic Focus Shift visibly reorganizes real publisher objects around the discovered contradiction without becoming a dashboard. |

## Product slice

### Authoritative surface inventory

- `apps/paper` is the required human product and Paper WebMCP origin.
- `apps/video` is the required independent Video WebMCP origin.
- `apps/protocol-probe` is the required narrow protocol-validation harness; it is not a third product surface.
- The former operational Board is retired and is not a required WebMCP, product, evaluation, or release surface. Any residual Board files are non-authoritative, and restoring an operations utility requires a separate human decision.

### Human starting state

- Light, editorial paper workspace with a real title, abstract, methods passage, figure, citations, and provenance.
- Independent video publisher embedded as a cross-origin frame with chapter markers and transcript.
- Persistent capability drawer; peripheral content remains reachable.
- Protocol status is factual: active, disabled, unsupported, or error.

### Agent path

1. Discover paper and video capabilities from their descriptions and schemas.
2. Search and read the paper statement that 40 participants were included in final analysis.
3. Search and read the video statement that six of 40 sessions were removed and not replaced.
4. Derive `40 - 6 = 34` outside publisher tools.
5. Request a composition using stable evidence IDs.
6. Present the discrepancy with provenance and ask the human for the consequential decision.
7. On confirmation, block the citation and create the discrepancy note through the same typed actions used by the human UI.
8. Reload without the agent and show the persisted state.
9. Disable WebMCP registrations and show a fresh observation with no tools while the human product still works.

### Explicit cuts

- No universal browser extension.
- No general research agent or open-web ingestion.
- No production identity platform.
- No email drafting.
- No publisher-provided comparison or contradiction tool.
- No server infrastructure unless browser-owned persistence fails the reload acceptance test.
- No marketing landing page, pricing page, bento feature grid, or generic dashboard.
- No generated decorative media until the real product workflow is complete.

## Architecture

```text
apps/paper (origin A)
  editorial workspace
  semantic stage
  citation + note persistence
  paper evidence tools
  focus + mutation tools
            |
            | cross-origin iframe
            v
apps/video (origin B)
  video/transcript experience
  transcript evidence tools
  seek tool

packages/contracts
  evidence objects
  WebMCP types/registration lifecycle
  action/result contracts
  audit events

packages/state
  typed publisher actions
  browser-owned persistent store
  deterministic reset
```

React and TypeScript are used for both origins. The first implementation keeps persistence local to the paper publisher origin so reload proof is deterministic and deployable without a backend. The storage boundary remains an interface so a hosted database can replace it only if a demonstrated requirement appears.

## Visual direction

Use the approved Semantic Stage with an editorial-luxury treatment:

- Warm paper background, near-black type, violet and restrained gold for protocol/evidence accents.
- Syne for display, Newsreader for research prose, DM Mono for provenance and agent trace.
- Oversized but readable editorial statements; the central contradiction is typography, not a collection of cards.
- Spatial continuity: promoted evidence moves to the focal plane; peripheral objects travel toward the drawer.
- Motion communicates state change and provenance. It never exists only to decorate.
- DOM owns text and controls. Three.js, if used, owns spatial connective material rather than inaccessible content.
- Reduced motion preserves hierarchy, grouping, provenance, and controls.

### Shopify Editions template translation

The structural reference is Shopify Editions Winter 2026, translated into VEDAXI rather than copied:

| Editions pattern | VEDAXI translation |
| --- | --- |
| Fixed minimal top navigation | VEDAXI identity, protocol status, reset, and capability drawer. |
| Persistent left chapter rail | `Paper → Method → Video → Evidence → Decision`, with the active chapter and source provenance visible. |
| Full-viewport art-directed chapters | Research scenes that each elevate one semantic object rather than listing equal-weight modules. |
| One oversized narrative statement per scene | Paper claim, video exclusion, derived arithmetic, and the final human decision each receive their own focal plane. |
| Product UI embedded into visual storytelling | The real paper passage, video player, transcript, provenance, and confirmation controls are the visual material. |
| Scene-to-scene continuity | Shared evidence objects travel between states; context moves toward the drawer instead of disappearing. |
| Alternating cinematic and editorial fields | A restrained opening field yields to a warm paper workspace; the discrepancy moment uses contrast without becoming cyberpunk. |

Do not reuse Shopify artwork, the Renaissance concept, torn-paper edges, its exact navigation, or its layout code. The implementation borrows pacing, hierarchy, chapter continuity, and the treatment of working UI as art direction.

Reusable reference patterns:

- `Builders WEEK/VDX MEM/website/components/MemoryScene.tsx`
- `Builders WEEK/VDX MEM/website/components/AppsMemoryConstellation.tsx`
- `Builders WEEK/VDX MEM/website/app/globals.css`
- `Builders WEEK/VDX MEM/brand/BRAND_TOKENS.md`

The VDX mark is not reused unless the founder explicitly decides VEDAXI belongs under that identity.

## Capability stack

### Engineering

| Capability | Assigned role |
| --- | --- |
| Karpathy Guidelines | Surface assumptions, prefer minimum code, and define observable success. |
| Lean Build | Deliver one complete vertical slice and stop at its acceptance boundary. |
| Superpowers Writing Plans | Convert each milestone into exact files, tests, and commands. |
| Superpowers TDD | Evidence search, registration lifecycle, shared actions, persistence, and state transitions. |
| Superpowers Subagent Development | Bounded implementation and independent review with file ownership. |
| Superpowers Systematic Debugging | Required when browser/protocol behavior diverges from expectation. |
| Superpowers Review + Verification | Spec compliance, code quality, and evidence before completion claims. |
| Intended vs Implemented | Compare the approved design and documented boundaries against actual code. |

### Product and visual quality

| Capability | Assigned role | Deliberate exclusions |
| --- | --- | --- |
| Design System | Primitive → semantic → component tokens and state specifications. | No hardcoded styling scattered across components. |
| High-End Visual Design | Editorial-luxury art direction, spatial rhythm, custom easing, performance guardrails. | No mandatory dark glass, double bezels everywhere, or motion on every element. |
| GPT Taste | Late-stage checks for headline width, contrast, overflow, density, and interaction polish. | No AIDA landing-page structure, random layout selection, or compulsory bento/GSAP patterns. |
| Existing VDX assets | Typography, evidence vocabulary, Three.js lifecycle, reduced-motion and responsive patterns. | No Android product claims, screenshots presented as VEDAXI, external form endpoint, or blind Next.js copy. |

### Browser and protocol

| Capability | Assigned role |
| --- | --- |
| Official WebMCP specification | API source of truth for `document.modelContext`, schemas, exposure, and abortable registration. |
| Devpost connector | Live judging, dates, requirements, and final submission preparation. |
| Vercel Agent Browser / in-app browser | Default interactive test surface; observe → act → verify. |
| Browser harness repository | Fallback reference only; switching requires explicit approval under repository rules. |
| Chrome | Optional secondary proof only when explicitly requested or approved. |

### Delivery

| Capability | Assigned role |
| --- | --- |
| GitHub connector + local Git | Public source, review, CI, and release evidence. |
| Vercel or another approved host | Two public origins and a judge-accessible live URL; final choice follows the first deployment spike. |
| Shipping Artifacts | Short `documentation/` set for architecture, flows, permissions, variables, tests, and automation. |
| Higgsfield narration/subtitles | Optional final demo audio/caption polish after the real screen recording exists. |

## Milestones and stop conditions

### R0 — Protocol and architecture gate

Build two minimal origins and prove registration, invocation, origin exposure, abort-driven unregister, and a truthful unsupported state in ChatGPT's in-app browser.

Stop condition: a recorded browser matrix names the exact environment and each claim is pass, fail, or blocked with evidence.

### R1 — Judgeable vertical slice

Build the complete human paper/video experience, deterministic evidence, Semantic Focus Shift, confirmation, shared mutations, persistence, reset, and kill switch.

Stop condition: the golden workflow completes end to end after a clean reset, and the human route still works with WebMCP disabled.

### R2 — Quality and trust

Add negative tests, failure handling, keyboard access, reduced motion, responsive layout, audit trace, and intended-vs-implemented review.

Stop condition: automated tests pass; browser checks show no console errors, inaccessible controls, fake success, or missing provenance.

### R3 — Deployment and judge proof

Deploy two origins, verify in the in-app browser, add public license/readme/testing instructions, connect the GitHub remote, and rehearse the sub-three-minute run.

Stop condition: fresh judge-like session can open the live URL, invoke WebMCP, and reproduce the result from documented instructions.

### R4 — Submission assets

Record the real run, add concise audio and captions if useful, prepare Devpost text and thumbnail, and verify every submission field.

Stop condition: public video is under three minutes, public repository includes a visible open-source license, and nothing is submitted without explicit confirmation.

## Known setup facts

- Local Git exists on `codex/phase-0-webmcp`.
- The application folder was empty when implementation began.
- The GitHub connector currently returns no accessible repositories, and local `git remote -v` returns no remote. This must be resolved before R3 despite the earlier verbal setup status.
- Devpost submissions close at `2026-09-03T20:00:00Z`; the schedule prioritizes a complete vertical slice over optional infrastructure.
- Devpost requires a live URL, a public source repository with a visible open-source license, a public demo video under three minutes with audio, and named tested WebMCP agents/clients.

## Definition of done

VEDAXI is done only when the protocol proof, coherent product experience, impact story, and creative Semantic Stage all appear in the same reproducible run. A beautiful mockup without native WebMCP fails. A technically correct tool demo without the finished human product also fails.
