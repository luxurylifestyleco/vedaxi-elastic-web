# SCRIPT — vedaxi-controlled-evidence

**Voice:** ElevenLabs — a mature, unhurried academic register. Avoid presenter energy.
**Voice settings:** stability 0.55 · similarity 0.80 · style 0.10 · speed 1.0
**Voice direction:** A researcher reading their own methods section aloud to peers. Measured, slightly dry, no persuasion. Target 125–135 wpm throughout — the slot timings below assume it.

> Generated view of `narration.json`. Edit **narration.json**, not this file,
> then re-run `node scripts/build-transcript.mjs`.

---

## L1 — Cognitive Attention Recovery and Sensor Calibration in Analytical Workflows  ·  slide 1

**Time:** 00:00.500 – 00:26.000  ·  slot 25.5s  ·  file `assets/audio/vo-l1.mp3`

**Delivery:** Calm, unhurried, scholarly. Settle before the first word.

    Welcome to this research walkthrough on cognitive attention recovery during interrupted analytical work. In this session we examine physiological baseline tracking, pupil response, and task resumption intervals across diverse participant cohorts. We will cover the sensor apparatus, the recording conditions encountered in the field, our data sanitization protocol, and the final composition of the analyzed cohort.

## L2 — Sensor apparatus  ·  slide 2

**Time:** 00:30.500 – 01:11.000  ·  slot 40.5s  ·  file `assets/audio/vo-l2.mp3`

**Delivery:** Even, technical. Let the numbers land individually.

    Our sensor apparatus utilized dual infrared eye trackers combined with synchronized EEG capture to measure cognitive load fluctuations during sustained visual search tasks. Eye trackers sampled at two hundred and fifty hertz, with a nine point calibration routine performed at the start of every session and revalidated at the midpoint. Electroencephalography was recorded across thirty two channels, referenced to linked mastoids. Both streams were timestamped against a shared hardware clock, so that pupil dilation events could be aligned to task boundaries within a single sampling window.

## L3 — Recording conditions and known drift  ·  slide 3

**Time:** 01:15.500 – 01:56.000  ·  slot 40.5s  ·  file `assets/audio/vo-l3.mp3`

**Delivery:** Matter of fact. This is a limitation being disclosed, not defended.

    During the trial progression, environmental lighting and participant movement introduced known sensor drift parameters across several continuous recording sessions. Our laboratory space receives indirect daylight, and afternoon sessions showed a measurable shift in baseline pupil diameter that was unrelated to task demand. Participant posture change also displaced the head position estimate beyond the tolerance of the original calibration. We logged each of these conditions as they occurred rather than correcting them in software, so that the decision to retain or exclude a session could be made transparently after collection.

## L4 — Pre-modeling data sanitization  ·  slide 4

**Time:** 02:00.500 – 02:46.000  ·  slot 45.5s  ·  file `assets/audio/vo-l4.mp3`

**Delivery:** Measured. Slight emphasis on 'before any outcome variable was inspected'.

    We established rigorous pre-modeling data sanitization protocols to isolate true latency signals from mechanical sensor noise before applying our predictive attention decay modeling. Every session was reviewed against three criteria: calibration validity at both checkpoints, continuous signal coverage across the full task block, and agreement between the eye tracking and electroencephalography timestamps. Sessions that failed any single criterion were marked for exclusion. This review was completed before any outcome variable was inspected, and the exclusion list was fixed in advance of modeling, so that no decision about the data could be influenced by the result it produced.

## L5 — Cohort and exclusions  ·  slide 5

**Time:** 02:50.500 – 03:09.000  ·  slot 18.5s  ·  file `assets/audio/vo-l5.mp3`

**Delivery:** Slow down here. This sets up the key statement. End on a full stop, then hold silent.

    That brings us to the composition of the analyzed cohort. This slide reports recruitment, exclusions, and the sessions carried forward into the model. I want to state that sequence precisely, because the two figures are often reported together and confused.

## L6 — CRITICAL FIXTURE LINE  ·  slide 5

**Time:** 03:12.000 – 03:21.500  ·  slot 9.5s  ·  file `assets/audio/vo-l6.mp3`

**Delivery:** CRITICAL FIXTURE LINE. Must begin at exactly 00:03:12.000 and must remain a single unsplit cue. Deliberate, evenly paced, no rush on the two numbers. Do not reword — the paper fixture and the demo narration both quote this verbatim.

    We recruited forty participants. Six sessions had calibration drift, so we removed them before modeling and did not replace them.

## L7 — Methodology overview complete  ·  slide 6

**Time:** 03:22.000 – 03:29.500  ·  slot 7.5s  ·  file `assets/audio/vo-l7.mp3`

**Delivery:** Warm, closing down.

    The remaining cohort was processed through our attention decay pipeline. Thank you for reviewing this methodology overview.
