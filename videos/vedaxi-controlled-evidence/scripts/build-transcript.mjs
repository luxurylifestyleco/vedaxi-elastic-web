#!/usr/bin/env node
/**
 * build-transcript.mjs
 *
 * Derives transcript.vtt + transcript.json from narration.json.
 * These two files are what the VEDAXI video origin serves to
 * `search_video_evidence`. They are generated, never hand-edited.
 *
 *   node scripts/build-transcript.mjs
 *
 * Guarantees enforced here (build fails if any is violated):
 *   1. The line marked `critical_cue` starts at exactly `critical_timestamp`.
 *   2. That cue is atomic — never split across two cues — so a timestamp
 *      query at 00:03:12 returns BOTH the recruited figure and the
 *      excluded figure in one payload.
 *   3. No two cues overlap, and no cue runs past the composition duration.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const spec = JSON.parse(readFileSync(resolve(ROOT, "narration.json"), "utf8"));

const MIN_WPM = 100;
const MAX_WPM = 165;

const words = (t) => t.trim().split(/\s+/).filter(Boolean).length;

function hms(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`;
}

function parseHms(str) {
  const [h, m, s] = str.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

/** Split a line into sentence-level cues, apportioned by word count. */
function cuesFor(line) {
  if (line.atomic) {
    return [{ start: line.start, end: line.end, text: line.text.trim() }];
  }
  const sentences = line.text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [line.text.trim()];
  const total = sentences.reduce((n, s) => n + words(s), 0);
  const span = line.end - line.start;
  let t = line.start;
  return sentences.map((s, i) => {
    const share = (words(s) / total) * span;
    const start = t;
    // last sentence absorbs float drift so the line ends exactly on line.end
    const end = i === sentences.length - 1 ? line.end : Number((start + share).toFixed(3));
    t = end;
    return { start: Number(start.toFixed(3)), end, text: s };
  });
}

const problems = [];
const cues = [];
let seq = 0;

for (const line of spec.lines) {
  const wpm = (words(line.text) / (line.end - line.start)) * 60;
  const rate = `${wpm.toFixed(0)} wpm`;
  if (wpm > MAX_WPM) problems.push(`${line.id}: ${rate} — too fast to read naturally; shorten the text or widen the slot.`);
  if (wpm < MIN_WPM) problems.push(`${line.id}: ${rate} — slot is much longer than the text; expect dead air.`);

  for (const c of cuesFor(line)) {
    cues.push({
      id: `${line.id}.${++seq}`,
      lineId: line.id,
      slide: line.slide,
      start: c.start,
      end: c.end,
      startTimecode: hms(c.start),
      endTimecode: hms(c.end),
      atomic: Boolean(line.atomic),
      text: c.text,
    });
  }
  console.log(`  ${line.id}  ${hms(line.start)} → ${hms(line.end)}  ${String(words(line.text)).padStart(3)}w  ${rate.padStart(8)}`);
}

// --- invariants -------------------------------------------------------------

const critical = cues.filter((c) => c.lineId === spec.critical_cue);
if (critical.length !== 1) {
  problems.push(`critical cue ${spec.critical_cue} produced ${critical.length} cues; it must be exactly 1 (set "atomic": true).`);
} else {
  const want = parseHms(spec.critical_timestamp + ".000");
  if (Math.abs(critical[0].start - want) > 0.001) {
    problems.push(`critical cue starts at ${critical[0].startTimecode}, must be ${spec.critical_timestamp}.000`);
  }
  for (const n of ["forty", "six"]) {
    if (!critical[0].text.toLowerCase().includes(n)) {
      problems.push(`critical cue no longer contains "${n}" — the discrepancy demo depends on both figures being in ONE cue.`);
    }
  }
}

for (let i = 1; i < cues.length; i++) {
  if (cues[i].start < cues[i - 1].end - 0.001) {
    problems.push(`cues ${cues[i - 1].id} and ${cues[i].id} overlap.`);
  }
}
const last = cues[cues.length - 1];
if (last.end > spec.duration) problems.push(`last cue ends at ${last.endTimecode}, past the ${spec.duration}s composition.`);

if (problems.length) {
  console.error("\nTRANSCRIPT BUILD FAILED\n" + problems.map((p) => "  ✗ " + p).join("\n") + "\n");
  process.exit(1);
}

// --- emit -------------------------------------------------------------------

mkdirSync(resolve(ROOT, "dist"), { recursive: true });

const vtt =
  "WEBVTT\n\n" +
  `NOTE Synthetic demo fixture for VEDAXI. Not a real study.\n\n` +
  cues
    .map((c) => `${c.id}\n${c.startTimecode} --> ${c.endTimecode}\n${c.text}\n`)
    .join("\n");
writeFileSync(resolve(ROOT, "dist/transcript.vtt"), vtt);

writeFileSync(
  resolve(ROOT, "dist/transcript.json"),
  JSON.stringify(
    {
      source: spec.output,
      durationSeconds: spec.duration,
      fixture: true,
      fixtureNotice: "Synthetic demo fixture generated for the VEDAXI WebMCP demo. Does not describe a real study.",
      criticalCueId: critical[0]?.id ?? null,
      cues: cues.map(({ lineId, atomic, ...c }) => c),
    },
    null,
    2,
  ) + "\n",
);

console.log(`\n  ✓ ${cues.length} cues → dist/transcript.vtt, dist/transcript.json`);
console.log(`  ✓ critical cue ${critical[0].id} pinned at ${critical[0].startTimecode}`);
