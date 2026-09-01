# VEDAXI — Devpost Submission Package

## Project Title
**VEDAXI**

## Tagline / Elevator Pitch
A publisher-side WebMCP architecture that focuses human editorial attention around AI intent while maintaining atomic shared state and full human-in-the-loop control.

---

## Inspiration
Today's AI web agents often operate as opaque external scrapers or simulate clumsy synthetic mouse clicks, detached from the actual web application state. When agents analyze complex multimodal research—such as cross-referencing published papers against laboratory recording sessions—they lack a standard, publisher-governed protocol to interact truthfully with web applications. 

We built **VEDAXI** to demonstrate how **WebMCP** transforms web applications into native, secure tool providers for AI models without sacrificing the human reading experience or surrendering human judgment.

---

## What It Does
VEDAXI is a multi-origin research integrity desk that connects AI agents and human editors:

1. **Native WebMCP Tool Exposure**: 
   - **Paper Origin** (`http://localhost:4173` / live endpoint): Registers read-only evidence search tools (`search_paper_evidence`) and a structured mutation tool (`request_discrepancy_focus`).
   - **Video Origin** (`http://localhost:4174` / live endpoint): Registers video transcript and seek tools (`search_video_evidence`, `read_video_transcript`) across an independent origin boundary.
2. **Cross-Origin Evidence Cross-Referencing**:
   - The AI agent inspects Paper evidence (40 participants recruited) and Video calibration evidence (6 sessions excluded due to sensor drift).
   - Outside the publisher boundary, the agent derives the true analyzed sample count: `40 - 6 = 34`.
3. **Human-in-the-Loop Discrepancy Focus**:
   - Rather than silently mutating data, the agent invokes `request_discrepancy_focus`.
   - The human interface smoothly animates focus to the Methods section, revealing the linked provenance drawer with exact paper and video citations.
   - The human editor reviews the evidence and explicitly clicks **Confirm Citation Block**, atomically updating publisher citation status across the workspace.
4. **Kill-Switch & Zero-Tool Teardown**:
   - An explicit WebMCP kill switch unregisters all tools in real-time, leaving zero active tools in model context while preserving full human browsing.

---

## How We Built It
- **Architecture**: Monorepo with strict origin isolation (`apps/paper`, `apps/video`, `apps/protocol-probe`, `packages/contracts`, `packages/state`).
- **WebMCP Integration**: Native browser tool registration using `@vedaxi/contracts` and `@vedaxi/state` event-driven stores.
- **Frontend & Editorial UX**: Built with React 19, TypeScript, and Vite, with custom accessible editorial styling, high-contrast chapter rails, and `prefers-reduced-motion` compliance.
- **Deterministic Quality Gates**: 28 test suites with 216 automated Vitest tests, deterministic dataset replayers, and immutable release status evaluation.

---

## Challenges We Ran Into
- **Strict Origin Separation**: Ensuring that the Video origin never imported Paper internals or precomputed discrepancy values, enforcing real multi-origin protocol boundaries.
- **Atomic State Rollback**: Ensuring that if storage persistence fails during a focus proposal, the publisher store rolls back cleanly without phantom state.
- **Deterministic Trace Ordering**: Constructing an ordered trace validator ensuring evidence retrieval strictly precedes derivation, and derivation strictly precedes human focus proposals.

---

## Accomplishments We're Proud Of
- 100% test coverage across 28 test suites (216 tests passing with 0 diagnostic errors).
- Clean WebMCP registration lifecycle with zero-tool teardown on kill switch.
- Fully accessible keyboard navigation and mobile-responsive layouts (390×844) verified via Chrome DevTools Protocol.

---

## What We Learned
- WebMCP provides a vastly superior paradigm to headless DOM scraping, turning web pages into structured, typed APIs for intelligent agents.
- Human-in-the-loop workflows thrive when agents propose focused views rather than taking autonomous destructive actions.

---

## What's Next for VEDAXI
- Expanding WebMCP adapters to support real-time collaborative multi-editor peer review.
- Packaging the VEDAXI WebMCP bridge as a reusable npm library for academic publishers and interactive dashboards.

---

## Built With
- `WebMCP`
- `TypeScript`
- `React 19`
- `Vite`
- `Vitest`
- `CSS3` (Custom Responsive & Reduced Motion)
- `Chrome DevTools Protocol (CDP)`
