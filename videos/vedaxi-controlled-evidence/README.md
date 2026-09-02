# vedaxi-controlled-evidence

The controlled research-video fixture for the VEDAXI WebMCP demo. Renders to
`vedaxi-controlled-evidence.mp4` (1920×1080, 30 fps, exactly 210.0 s) plus the
timestamped transcript that `search_video_evidence` queries.

**This is a synthetic fixture.** No such study exists. The notice is burnt into
every frame and carried in `transcript.json`.

---

## What changed and why

Three corrections to the original script. Each one was load-bearing.

**1. The critical line had no unambiguous start time.** The original had a block
labelled `[03:00 – 03:20]` annotated "MUST OCCUR AT 03:12". Anything reading the
label would have placed the line at 03:00, twelve seconds early, and the
`search_video_evidence` call at `00:03:12` would have returned the wrong cue.
The line is now its own audio element pinned at `data-start="192"`, which is
03:12.000 exactly.

**2. There was an unassigned gap and a collision.** Nothing covered 02:50–03:00,
and a ~9 s line starting at 03:12 would have run into the block labelled 03:20.
Reflowed: bridge line 02:50.5–03:09, two seconds of deliberate silence, critical
line 03:12.0–03:21.5, close 03:22.0–03:29.5. Still lands on 210.0 s.

**3. The script held ~69 s of speech in a 210 s video.** Two-thirds dead air,
which reads as a broken recording rather than a scholarly pause. The four
methodology segments were expanded to fill their slots at a natural 126–136 wpm.
The critical line and the overall structure are untouched.

**The critical line is verbatim and must stay that way.** The paper fixture and
the Devpost demo narration both quote it:

> We recruited forty participants. Six sessions had calibration drift, so we
> removed them before modeling and did not replace them.

---

## How the 03:12 pin survives re-recording

Each of the seven narration lines is a separate `<audio>` element with its own
`data-start` and an explicit `data-duration` equal to its slot. Lines are not
chained end to end, so a line that comes back from ElevenLabs a second longer
than planned eats into its own trailing silence and **cannot** push the critical
line off 03:12.

`transcript.vtt` and `transcript.json` are generated from the same
`narration.json` as those slot timings, so audio and transcript cannot drift
apart by hand-editing one of them.

---

## Finish it (Windows, PowerShell)

```powershell
cd D:\Github\<your-vedaxi-repo>\videos\vedaxi-controlled-evidence
npm install   # not required; the CLI runs via npx
```

**1. Record the seven narration lines.** Text, per-line delivery notes and exact
slot budgets are in `SCRIPT.md`. Save as MP3 to:

```
assets/audio/vo-l1.mp3 … vo-l7.mp3
```

The repo ships silent placeholders of exactly the right length, so preview and
render work before you have any real audio.

**2. Verify every line fits its slot.** This is the gate — do not skip it.

```powershell
node scripts/audio.mjs verify
```

Overruns fail loudly. `L6` is flagged `[CRITICAL]`. If it overruns, either
re-render that line slower, or widen its window in `narration.json` and re-run
`node scripts/build-transcript.mjs` so the transcript follows.

**3. Rebuild the transcript.**

```powershell
node scripts/build-transcript.mjs
```

Emits `dist/transcript.vtt` and `dist/transcript.json`. It fails the build if the
critical cue is not at 00:03:12.000, is split across cues, or has lost either
figure.

**4. Check, preview, render.**

```powershell
npx hyperframes check
npx hyperframes preview
npx hyperframes render
```

**5. Place the outputs.**

```
apps/video/public/media/vedaxi-controlled-evidence.mp4
apps/video/public/media/transcript.vtt      ← from dist/
apps/video/public/media/transcript.json     ← from dist/
```

---

## Wiring the video origin

`search_video_evidence` should read `transcript.json`, not decode the MP4. For a
timestamp query, return the cue where `start <= t < end`:

```js
const hit = transcript.cues.find((c) => t >= c.start && t < c.end);
// query t = 192  →  cue L6.19
// "We recruited forty participants. Six sessions had calibration drift,
//  so we removed them before modeling and did not replace them."
```

Return `startTimecode` alongside the text so the agent can cite `00:03:12` and a
human can scrub to it and see the burnt-in timecode agree.

---

## Files

| Path                          | What it is                                              |
| ----------------------------- | ------------------------------------------------------- |
| `narration.json`              | **Source of truth.** Line text, slot timings, invariants |
| `SCRIPT.md`                   | Generated recording script with delivery notes           |
| `BRIEF.md`                    | Confirmed intent for this run                            |
| `index.html`                  | The composition                                          |
| `scripts/build-transcript.mjs`| narration.json → transcript.vtt + transcript.json        |
| `scripts/audio.mjs`           | Silent placeholders · slot verification gate             |
| `assets/vendor/gsap.min.js`   | Vendored GSAP (no render-time network fetch)             |
| `snapshots/`                  | Reviewed frames, including 03:12                         |

Edit `narration.json`, never `SCRIPT.md` or `dist/` directly.
