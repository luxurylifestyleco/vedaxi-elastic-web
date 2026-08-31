# VEDAXI

VEDAXI is a controlled WebMCP research-integrity demonstration. A Paper publisher and an independent Video publisher expose bounded evidence tools; the human remains responsible for confirming any consequential focus or citation change.

## Current status

- Code quality is enforced locally and again by GitHub Actions on a clean Ubuntu checkout.
- Paper evidence search, Video transcript search, shared persistent state, and human confirmation/rejection are implemented.
- The product-evidence video and captions are intentionally **missing** until supplied by the project owner. The media validator reports `BLOCKED`; an app-shell build is not a media-readiness claim.
- Public deployment, current native-browser proof, submission video, license selection, rules acknowledgment, and final submission authorization are not yet complete.

## Repository map

```text
apps/paper/           Paper publisher and Semantic Stage
apps/video/           Independent Video publisher app shell
apps/protocol-probe/  Minimal native WebMCP diagnostic fixture
packages/contracts/   Shared evidence and WebMCP contracts
packages/state/       Shared persistent publisher state
evals/                Deterministic quality and claim-integrity gates
docs/                 Architecture, evidence, compliance, and release records
```

## Run locally

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run quality:local
```

For the two publisher origins, use separate terminals:

```bash
npm run dev:paper
npm run dev:video
```

Paper defaults to `http://localhost:4173`; Video defaults to `http://localhost:4174`. Production builds must set `VITE_VIDEO_ORIGIN` for Paper and `VITE_PAPER_ORIGIN` for Video. These values are public origins, not secrets.

## Verification model

`npm run quality:local` type-checks, runs the full test suite, builds both app shells, validates the release registries, and verifies the explicit missing-media contract. GitHub runs the same command with `--clean-install` on the pushed SHA. Neither gate converts missing human media or browser evidence into a pass.

See [module architecture](docs/MODULE_ARCHITECTURE.md), [submission pipeline](docs/SUBMISSION_PIPELINE.md), and [controlled media requirements](docs/assets/M2/README.md).

## Safety and limitations

All research content is fictional fixture data. The tool may request a focus proposal, but it cannot confirm the proposal or block a citation without an explicit human action. This repository is a prototype, not a medical or scientific decision system.

## License

An open-source license has not yet been selected by the project owner. This repository is not submission-ready until a license is chosen and committed at the root.
