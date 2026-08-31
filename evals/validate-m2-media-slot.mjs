import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifestRelativePath = "docs/assets/M2/media-manifest.json";
const requiredVideoPath = "apps/video/public/media/vedaxi-controlled-evidence.mp4";
const requiredCaptionPath = "apps/video/public/media/vedaxi-controlled-evidence.vtt";
const evidenceSeconds = 192;
const placeholder = /REPLACE_|NOT_YET_PUBLISHED/;

function blocked(message) {
  console.error(`BLOCKED: ${message}`);
  process.exitCode = 2;
}

function fail(message) {
  throw new Error(message);
}

function repoPath(relativePath, label) {
  if (typeof relativePath !== "string" || relativePath.length === 0 || path.isAbsolute(relativePath)) {
    fail(`${label} must be a non-empty repository-relative path`);
  }
  const resolved = path.resolve(repoRoot, relativePath);
  if (resolved !== repoRoot && !resolved.startsWith(`${repoRoot}${path.sep}`)) fail(`${label} escapes repository`);
  return resolved;
}

function requireString(value, label, { allowPlaceholder = false } = {}) {
  if (typeof value !== "string" || value.trim().length === 0) fail(`${label} must be a non-empty string`);
  if (!allowPlaceholder && placeholder.test(value)) fail(`${label} still contains a template placeholder`);
}

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function sha256(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function parseClock(value, label) {
  const match = /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/.exec(value);
  if (!match) fail(`${label} must use HH:MM:SS.mmm or HH:MM:SS`);
  const [, hours, minutes, seconds, milliseconds = "0"] = match;
  if (Number(minutes) > 59 || Number(seconds) > 59) fail(`${label} is not a valid clock time`);
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) / 1000;
}

function parseWebVtt(source) {
  if (!source.startsWith("WEBVTT")) fail("captions must begin with WEBVTT");
  const cues = [];
  for (const block of source.replace(/^\uFEFF/, "").split(/\r?\n\r?\n+/)) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex < 0) continue;
    const timing = lines[timingIndex].split("-->").map((part) => part.trim().split(/\s+/)[0]);
    if (timing.length !== 2) fail(`invalid WebVTT cue timing: ${lines[timingIndex]}`);
    const start = parseClock(timing[0], "WebVTT cue start");
    const end = parseClock(timing[1], "WebVTT cue end");
    if (end <= start) fail("WebVTT cue end must follow start");
    cues.push({ start, end, text: lines.slice(timingIndex + 1).join(" ") });
  }
  if (cues.length === 0) fail("captions must contain at least one timed cue");
  return cues;
}

function readFfprobe(videoPath) {
  let output;
  try {
    output = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=format_name,duration:stream=codec_type,codec_name", "-of", "json", videoPath], { encoding: "utf8" });
  } catch (error) {
    fail(`ffprobe failed; install FFmpeg and ensure ffprobe is on PATH: ${error.message}`);
  }
  try {
    return JSON.parse(output);
  } catch (error) {
    fail(`ffprobe did not return JSON: ${error.message}`);
  }
}

const manifestPath = repoPath(manifestRelativePath, "manifest path");
if (!fs.existsSync(manifestPath)) fail(`manifest does not exist: ${manifestRelativePath}`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest?.delivery_state === "MISSING_MEDIA") {
  blocked("late-bound M2 media has not been supplied; no media claim is validated");
} else if (manifest?.delivery_state !== "READY_FOR_VALIDATION") {
  fail("delivery_state must be MISSING_MEDIA or READY_FOR_VALIDATION");
} else {
  const { video, captions, evidence, provenance } = manifest;
  if (!video || !captions || !evidence || !provenance) fail("manifest must include video, captions, evidence, and provenance objects");
  if (video.path !== requiredVideoPath) fail(`video.path must equal ${requiredVideoPath}`);
  if (captions.path !== requiredCaptionPath) fail(`captions.path must equal ${requiredCaptionPath}`);
  if (video.container !== "mp4" || video.mime_type !== "video/mp4") fail("only MP4 / video/mp4 is accepted");
  if (video.video_codec !== "h264" || video.audio_codec !== "aac") fail("only H.264 video with AAC audio is accepted");
  if (video.minimum_duration_seconds_exclusive !== evidenceSeconds) fail(`minimum duration must remain strictly greater than ${evidenceSeconds} seconds`);
  if (evidence.timestamp !== "00:03:12" || evidence.timestamp_seconds !== evidenceSeconds) fail("evidence timestamp must remain 00:03:12 / 192 seconds");
  if (captions.format !== "webvtt" || captions.encoding !== "utf-8") fail("captions must declare UTF-8 WebVTT");
  if (provenance.source_evidence_id !== "video.transcript.calibration-drift") fail("wrong source evidence ID");
  for (const [label, value] of Object.entries({ "video.sha256": video.sha256, "captions.alignment_source": captions.alignment_source, "evidence.transcript_excerpt": evidence.transcript_excerpt, "provenance.recording_source": provenance.recording_source, "provenance.creator": provenance.creator, "provenance.license": provenance.license, "provenance.rights_confirmation": provenance.rights_confirmation, "provenance.public_url": provenance.public_url })) requireString(value, label);
  if (!/^[a-f0-9]{64}$/.test(video.sha256)) fail("video.sha256 must be 64 lowercase hexadecimal characters");
  if (!Array.isArray(evidence.required_phrases) || JSON.stringify(evidence.required_phrases) !== JSON.stringify(["six", "did not replace"])) fail("evidence.required_phrases must preserve the exact required phrases");
  if (!Array.isArray(evidence.required_context_terms) || JSON.stringify(evidence.required_context_terms) !== JSON.stringify(["calibration", "drift"])) fail("evidence.required_context_terms must preserve calibration and drift");
  if (!Array.isArray(evidence.forbidden_phrases) || JSON.stringify(evidence.forbidden_phrases) !== JSON.stringify(["34", "contradiction", "discrepancy"])) fail("evidence.forbidden_phrases must preserve the publisher reasoning boundary");

  const videoPath = repoPath(video.path, "video.path");
  const captionsPath = repoPath(captions.path, "captions.path");
  if (!fs.existsSync(videoPath) || !fs.existsSync(captionsPath)) fail("READY_FOR_VALIDATION requires both final video and final captions");
  if (sha256(videoPath) !== video.sha256) fail("video SHA-256 does not match manifest");

  const probe = readFfprobe(videoPath);
  const formatNames = String(probe.format?.format_name ?? "").split(",");
  if (!formatNames.includes("mov") && !formatNames.includes("mp4")) fail("ffprobe did not identify an MP4-family container");
  const duration = Number(probe.format?.duration);
  if (!Number.isFinite(duration) || duration <= evidenceSeconds) fail(`actual video duration must be strictly greater than ${evidenceSeconds} seconds`);
  const streamCodecs = Object.fromEntries((probe.streams ?? []).map((stream) => [stream.codec_type, stream.codec_name]));
  if (streamCodecs.video !== "h264" || streamCodecs.audio !== "aac") fail("actual streams must be H.264 video and AAC audio");

  const cues = parseWebVtt(fs.readFileSync(captionsPath, "utf8"));
  const matchingCueText = normalize(cues.filter((cue) => cue.start <= evidenceSeconds && cue.end >= evidenceSeconds).map((cue) => cue.text).join(" "));
  if (matchingCueText.length === 0) fail("no caption cue covers 00:03:12.000");
  const excerpt = normalize(evidence.transcript_excerpt);
  for (const phrase of evidence.required_phrases) {
    if (!matchingCueText.includes(phrase) || !excerpt.includes(phrase)) fail(`caption cue and transcript excerpt must include ${JSON.stringify(phrase)}`);
  }
  for (const term of evidence.required_context_terms) {
    if (!excerpt.includes(term)) fail(`transcript excerpt must include ${JSON.stringify(term)}`);
  }
  for (const phrase of evidence.forbidden_phrases) {
    if (matchingCueText.includes(phrase) || excerpt.includes(phrase)) fail(`publisher evidence must not contain forbidden phrase ${JSON.stringify(phrase)}`);
  }
  console.log(`PASS: M2 media slot valid (${duration.toFixed(3)}s, SHA-256 verified, aligned WebVTT evidence at 00:03:12)`);
}
