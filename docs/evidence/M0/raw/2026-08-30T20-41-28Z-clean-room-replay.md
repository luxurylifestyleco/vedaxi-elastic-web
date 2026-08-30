# Clean-room replay — Sub Agent 11 // Replay Run

## Dispatch

> Perform a clean-room black-box evaluation of the local website using only the Codex in-app browser (Vercel Agent Browser), never source files or prior project knowledge. Start at http://localhost:4173/. Goal: find the paper publisher’s final analyzed-sample statement and the independent author-video publisher’s calibration-exclusion statement. Return each source’s exact evidence, locator, and browser-reported origin. Do not compare the statements or infer a conclusion. Record the exact sequence of navigation, WebMCP inventories, tool names discovered dynamically, exact call inputs, exact outputs, and any errors. This is read-only; make no file edits.

## Report

The agent reported browser-only execution, no source-file inspection, no file edits, and no errors.

1. It opened `http://localhost:4173/` in the Codex In-app Browser and fetched the current document's `webmcp` capability.
2. It dynamically discovered `read_paper_probe_evidence` and called it with `{"query":"final analyzed sample"}`.
3. The call returned `probe.paper.methods.final-analysis`, locator `Methods, participants`, origin `http://localhost:4173`, score `3`, and the exact excerpt: “Forty participants completed the study and were included in the final analysis.”
4. It obtained `http://localhost:4174` from the visible iframe `src`, opened that publisher as a top-level document, and fetched that document's `webmcp` capability.
5. It dynamically discovered `read_video_probe_evidence` and called it with `{"query":"calibration exclusion"}`.
6. The call returned `probe.video.transcript.calibration-drift`, locator `00:03:12`, origin `http://localhost:4174`, score `2`, and the exact excerpt: “We recruited forty participants. Six sessions had calibration drift, so we removed them before modeling and did not replace them.”
7. It did not compare the statements or infer a conclusion.

The complete tool inventories and exact outputs are retained in the sibling `paper-active.json` and `video-active.json` artifacts. This report is bound to the same local servers started from source commit `93bb80fe9d66c4232c2b96fbb298241c1260d6b3`; the exact agent dispatch above contains no tool name.
