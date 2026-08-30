# VEDAXI Phase 0 WebMCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-origin React/TypeScript fixture that proves VEDAXI can register, expose, invoke, and remove native WebMCP evidence tools before the full Semantic Stage is built.

**Architecture:** An npm workspace contains a paper publisher on port 4173, a video publisher on port 4174, and shared typed evidence/WebMCP contracts. Each publisher owns its own evidence and registers only its own read-only tool through `document.modelContext`; an abort controller provides the protocol kill switch without disabling the human interface.

**Tech Stack:** React 19, TypeScript 5, Vite 7, Vitest, native WebMCP draft API (`document.modelContext`)

**Spec:** `docs/superpowers/specs/2026-08-30-vedaxi-protocol-proof-design.md`

## Global Constraints

- The outside agent must not import publisher functions or receive hardcoded tool names.
- Paper and video evidence remain independently owned by separate origins.
- No publisher tool may compute the methodological contradiction or `n=34`.
- WebMCP removal must preserve the complete human website.
- Unsupported browsers must show a truthful unsupported state; no polyfill or silent direct-call fallback.
- Tool registration must use `document.modelContext` and abortable registration signals.

---

### Task 1: Workspace and evidence contracts

**Files:**
- Create: `VEDAXI - Elastic WEB/package.json`
- Create: `VEDAXI - Elastic WEB/tsconfig.json`
- Create: `VEDAXI - Elastic WEB/packages/contracts/package.json`
- Create: `VEDAXI - Elastic WEB/packages/contracts/src/evidence.ts`
- Test: `VEDAXI - Elastic WEB/packages/contracts/src/evidence.test.ts`

**Interfaces:**
- Consumes: the paper and video fixture statements in the approved design.
- Produces: `EvidenceObject`, `EvidenceSearchResult`, `searchEvidence(query, evidence)`.

- [ ] **Step 1: Write failing evidence-search tests**

Test exact paper and video matches, stable provenance fields, and an empty result for unrelated queries.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- packages/contracts/src/evidence.test.ts`
Expected: FAIL because the contracts package is not implemented.

- [ ] **Step 3: Implement minimal typed evidence search**

Normalize the query into meaningful tokens, score exact token matches in title/excerpt/keywords, and return evidence without deriving a contradiction.

- [ ] **Step 4: Run the focused test and verify success**

Run: `npm test -- packages/contracts/src/evidence.test.ts`
Expected: PASS.

### Task 2: Native WebMCP adapter

**Files:**
- Create: `VEDAXI - Elastic WEB/packages/contracts/src/webmcp.ts`
- Create: `VEDAXI - Elastic WEB/packages/contracts/src/webmcp.d.ts`
- Test: `VEDAXI - Elastic WEB/packages/contracts/src/webmcp.test.ts`

**Interfaces:**
- Consumes: `document.modelContext.registerTool(tool, { signal, exposedTo })`.
- Produces: `WebMcpStatus`, `registerWebMcpTools(tools, exposedTo)`, and a handle with `disable()`.

- [ ] **Step 1: Write adapter tests with a fake ModelContext**

Verify unsupported detection, promise-based registration, origin exposure, JSON-string results, and abort-driven removal.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- packages/contracts/src/webmcp.test.ts`
Expected: FAIL because the adapter does not exist.

- [ ] **Step 3: Implement the adapter**

Register each tool with one shared `AbortController`; expose an explicit unsupported result and never call handlers as a fallback.

- [ ] **Step 4: Run the focused test and verify success**

Run: `npm test -- packages/contracts/src/webmcp.test.ts`
Expected: PASS.

### Task 3: Independent paper and video origins

**Files:**
- Create: `VEDAXI - Elastic WEB/apps/paper/index.html`
- Create: `VEDAXI - Elastic WEB/apps/paper/package.json`
- Create: `VEDAXI - Elastic WEB/apps/paper/vite.config.ts`
- Create: `VEDAXI - Elastic WEB/apps/paper/src/main.tsx`
- Create: `VEDAXI - Elastic WEB/apps/paper/src/paperEvidence.ts`
- Create: `VEDAXI - Elastic WEB/apps/paper/src/styles.css`
- Create: `VEDAXI - Elastic WEB/apps/video/index.html`
- Create: `VEDAXI - Elastic WEB/apps/video/package.json`
- Create: `VEDAXI - Elastic WEB/apps/video/vite.config.ts`
- Create: `VEDAXI - Elastic WEB/apps/video/src/main.tsx`
- Create: `VEDAXI - Elastic WEB/apps/video/src/videoEvidence.ts`
- Create: `VEDAXI - Elastic WEB/apps/video/src/styles.css`

**Interfaces:**
- Consumes: shared evidence search and WebMCP registration adapter.
- Produces: paper origin `search_paper_evidence`; video origin `search_video_transcript`; visible protocol state and independent kill switches.

- [ ] **Step 1: Add the exact deterministic evidence fixtures**

Paper returns the final analyzed sample of 40. Video returns six excluded calibration-drift sessions and “did not replace them.”

- [ ] **Step 2: Build publisher pages around human-first content**

Each page must remain useful and complete when WebMCP is unsupported or disabled.

- [ ] **Step 3: Register origin-owned read-only tools**

Register on mount, report `checking`, `active`, `disabled`, `unsupported`, or `error`, and disable only through the registration abort signal.

- [ ] **Step 4: Embed the video origin into the paper workspace**

Use an iframe pointing at `http://localhost:4174` and expose video tools to `http://localhost:4173`.

### Task 4: Verification and operator documentation

**Files:**
- Create: `VEDAXI - Elastic WEB/README.md`
- Create: `VEDAXI - Elastic WEB/docs/phase-0-browser-matrix.md`
- Modify: `VEDAXI - Elastic WEB/package.json`

**Interfaces:**
- Consumes: both runnable origins.
- Produces: one-command local start, build/test commands, and a factual browser verification record.

- [ ] **Step 1: Install workspace dependencies**

Run: `npm install`
Expected: workspace lockfile created without audit failure blocking development.

- [ ] **Step 2: Run unit tests**

Run: `npm test`
Expected: all evidence and WebMCP adapter tests pass.

- [ ] **Step 3: Build both origins**

Run: `npm run build`
Expected: paper and video production bundles compile with no TypeScript errors.

- [ ] **Step 4: Record the browser gate honestly**

Document product, version, flags/origin trial, same-origin registration/discovery/invocation, unregister behavior, cross-origin discovery, provenance, and result. Unverified rows remain “not yet run,” never “pass.”

