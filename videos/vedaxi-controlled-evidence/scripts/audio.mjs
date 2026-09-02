#!/usr/bin/env node
/**
 * audio.mjs — narration slot tooling.
 *
 *   node scripts/audio.mjs placeholders
 *       Writes silent MP3s of exactly each line's slot length into
 *       assets/audio/. Lets you preview, check and render the composition
 *       with correct timing BEFORE any real voiceover exists.
 *
 *   node scripts/audio.mjs verify
 *       Reads the real MP3s in assets/audio/ and reports whether each one
 *       fits its pinned slot. THIS IS THE GATE. If L6 overruns, the
 *       critical line no longer lines up with the 00:03:12 cue in
 *       transcript.vtt and the demo breaks silently.
 *
 * Requires ffmpeg + ffprobe on PATH.
 */

import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const spec = JSON.parse(readFileSync(resolve(ROOT, "narration.json"), "utf8"));
const AUDIO = resolve(ROOT, "assets/audio");

const file = (line) => resolve(AUDIO, `vo-${line.id.toLowerCase()}.mp3`);
const slot = (line) => line.end - line.start;
const mode = process.argv[2];

if (mode === "placeholders") {
  mkdirSync(AUDIO, { recursive: true });
  for (const line of spec.lines) {
    const d = slot(line).toFixed(3);
    execFileSync("ffmpeg", [
      "-y", "-loglevel", "error",
      "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
      "-t", d, "-q:a", "9", file(line),
    ]);
    console.log(`  ✓ vo-${line.id.toLowerCase()}.mp3  ${d}s (silent placeholder)`);
  }
  console.log("\n  Replace each file with the real ElevenLabs render, then:");
  console.log("  node scripts/audio.mjs verify\n");
  process.exit(0);
}

if (mode === "verify") {
  let failed = false;
  for (const line of spec.lines) {
    const f = file(line);
    if (!existsSync(f)) {
      console.log(`  ✗ ${line.id}  MISSING ${f}`);
      failed = true;
      continue;
    }
    const actual = Number(
      execFileSync("ffprobe", [
        "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", f,
      ]).toString().trim(),
    );
    const budget = slot(line);
    const slack = budget - actual;
    const tag = line.atomic ? " [CRITICAL]" : "";
    // MP3 encodes in 1152-sample frames, so a file is padded up to ~26ms past
    // its true content length. Two frames of tolerance keeps encoder rounding
    // from reading as a real overrun.
    if (slack < -0.075) {
      console.log(`  ✗ ${line.id}  ${actual.toFixed(2)}s in a ${budget.toFixed(2)}s slot — OVERRUNS by ${(-slack).toFixed(2)}s${tag}`);
      failed = true;
    } else if (slack > budget * 0.35) {
      console.log(`  ! ${line.id}  ${actual.toFixed(2)}s in a ${budget.toFixed(2)}s slot — ${slack.toFixed(2)}s of dead air${tag}`);
    } else {
      console.log(`  ✓ ${line.id}  ${actual.toFixed(2)}s in a ${budget.toFixed(2)}s slot${tag}`);
    }
  }
  if (failed) {
    console.error(
      "\n  Slot violation. Fix by re-rendering that line slower/faster, or by\n" +
      "  editing its window in narration.json and re-running build-transcript.mjs.\n" +
      "  Never leave audio and transcript.vtt disagreeing — that is the one\n" +
      "  failure a judge will find.\n",
    );
    process.exit(1);
  }
  console.log("\n  ✓ all narration fits its pinned slots\n");
  process.exit(0);
}

console.error("usage: node scripts/audio.mjs <placeholders|verify>");
process.exit(1);
