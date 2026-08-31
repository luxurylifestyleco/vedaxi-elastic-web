# M2 Late-Bound Media Slot

This directory reserves the final M2 evidence video without adding, generating, downloading, embedding, or committing media. It is a delivery contract only; it does not authorize M2 runtime work before the M1 gate is recorded `PASS`.

## Required final files

| Artifact | Required repository path | Contract |
| --- | --- | --- |
| Video | `VEDAXI - Elastic WEB/apps/video/public/media/vedaxi-controlled-evidence.mp4` | MP4 container (`video/mp4`), H.264/AVC video and AAC audio; duration must be **strictly greater than 192 seconds**. |
| Captions | `VEDAXI - Elastic WEB/apps/video/public/media/vedaxi-controlled-evidence.vtt` | UTF-8 WebVTT. A cue covering `00:03:12.000` must contain both required phrases below. |
| Manifest | `docs/assets/M2/media-manifest.json` | Completed only after the two final files exist. |

The evidence timestamp is `00:03:12` (`192.000` seconds). Its normalized caption/transcript excerpt must include the literal phrases `six` and `did not replace`, and identify the exclusion/calibration-drift evidence. This contract deliberately does not permit a publisher-side derived sample-size statement, `34`, or contradiction language in the excerpt.

## Missing-media behavior

`media-manifest.json` is intentionally a template with `delivery_state: "MISSING_MEDIA"`. Running the validator in that state exits with code `2` and reports `BLOCKED`: the slot is structurally valid, but no media claim is made. It never treats a placeholder, an absent file, a declared duration, or an unverified checksum as a pass.

## Final handoff

After M1 is recorded `PASS` and a real recording exists, place the final binary and its aligned VTT file at the exact paths above, replace every `REPLACE_*` value in the manifest, and run:

```text
node evals/validate-m2-media-slot.mjs
```

The command requires `ffprobe` on `PATH` once video is present. It verifies the actual container, H.264 video stream, AAC audio stream, strictly-greater-than-192-second duration, SHA-256 checksum, caption timing/text, transcript excerpt, and provenance/license fields.

The current submission pipeline separately says the public Devpost video must be under three minutes. That is incompatible with this requested `> 192` second hold-point contract. A validator `PASS` therefore means the M2 media slot is valid; it is **not** proof of Devpost D3 readiness. Resolve that product-level conflict before using this asset as the final submission video.
