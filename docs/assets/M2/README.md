# M2 Late-Bound Media Slot

This directory is the delivery contract for the controlled in-product evidence video. It is not the public Devpost demo.

## HEAD status

| Artifact | Required path | Current tree |
| --- | --- | --- |
| Video | `apps/video/public/media/vedaxi-controlled-evidence.mp4` | Present. Validator reports 210.000s, H.264 + AAC. |
| Captions | `apps/video/public/media/vedaxi-controlled-evidence.vtt` | Present. Cue covering `00:03:12` includes `six` and `did not replace`. |
| Manifest | `docs/assets/M2/media-manifest.json` | `delivery_state: "READY_FOR_VALIDATION"` |

`node evals/validate-m2-media-slot.mjs` exits `0` when `ffprobe` can probe the MP4. A slot `PASS` is not a recorded M2 module exit and is not Devpost D3 (`<180s` YouTube demo).

## Contract

| Artifact | Rule |
| --- | --- |
| MP4 | `video/mp4`, H.264 video, AAC audio, duration **strictly greater than 192 seconds** |
| WebVTT | UTF-8. A cue covering `00:03:12.000` must include `six` and `did not replace` |
| Excerpt | Must include calibration/drift context. Must not contain `34`, `contradiction`, or `discrepancy` |

## How ffmpeg is used

The validator shells out to **`ffprobe`** (not an encode). It reads container name, duration, and stream codecs. Locally, `ffprobe` must be on `PATH` (Windows also checks a known WinGet Gyan.FFmpeg layout). GitHub Actions Ubuntu installs the `ffmpeg` package so `ffprobe` exists on the CI runner.

```text
node evals/validate-m2-media-slot.mjs
```

If the MP4 is removed, set `delivery_state` back to `MISSING_MEDIA` so the gate exits `2` (`BLOCKED`) instead of failing closed.
