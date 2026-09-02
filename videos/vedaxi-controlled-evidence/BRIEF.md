---
workflow: general-video
flow: automation
storyboard: no
message: "Forty were recruited; six drifted and were removed — stated on the record at 00:03:12"
destination: vedaxi-video-origin
aspect: 1920x1080
language: en
length: 210s
angle: fixture
---

## Intent

A controlled evidence fixture for the VEDAXI WebMCP demo, not a piece of
communication. It plays the part of a recorded academic methodology talk so
that VEDAXI's video origin has something authentic-looking to serve, and so
`search_video_evidence` has a real timestamped transcript to query.

The whole asset exists to deliver one sentence at one timestamp. Everything
else is plausible scaffolding around it.

## Assets

- `assets/audio/vo-l*.mp3` — seven narration lines, one per pinned slot. Ships with silent placeholders of exact slot length; replace with the ElevenLabs renders.
- `assets/vendor/gsap.min.js` — GSAP vendored locally so the render makes no network call.
- `narration.json` — single source of truth for line text and timings.
- `dist/transcript.vtt`, `dist/transcript.json` — generated; served by the video origin.

## Customizations

- **Hard pin at 00:03:12.** The critical line is its own audio element at `data-start="192"`. Every line is separately pinned with deliberate silence between, so an earlier line re-rendering longer cannot push the critical line off its timestamp.
- **Atomic critical cue.** Both figures ("forty", "six") live in ONE transcript cue spanning 00:03:12.000 → 00:03:21.500. Split across two cues, a timestamp query at 03:12 would return the recruitment figure without the exclusion, and the discrepancy demo would show nothing.
- **Burnt-in timecode**, bottom right, driven off the timeline. A judge scrubbing to the cited timestamp sees the frame confirm it.
- **Count-up on the cohort figures**, resolved by ~175s so 40 / 6 / 34 are settled and legible well before the line is spoken at 192s.
- **Fixture notice** in the footer of every frame and in the transcript JSON, so the fabricated study cannot be mistaken for a real one if the file leaves the demo.

## Notes

- Two corrections were made to the source script, both recorded in `README.md` § "What changed and why". The original had an unassigned 02:50–03:00 gap and a critical block labelled 03:00 whose content had to start at 03:12; it also carried only ~69s of speech across 210s.
- The critical line's wording is load-bearing and must not be reworded — the paper fixture and the Devpost demo narration both quote it.
- Render length is fixed by the root `data-duration="210"`, read at compile time.
