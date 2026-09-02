$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$render = Join-Path $root 'renders\vedaxi-webmcp-demo-2m20s.mp4'
$output = Join-Path $root 'renders\vedaxi-webmcp-demo-2m20s-audio-v4.mp4'
$ambient = Join-Path $root 'assets\audio\vedaxi-ambient-bed.m4a'
$fixture = Join-Path $root 'assets\vedaxi-controlled-evidence.mp4'
$sfx = Join-Path $root 'assets\sfx'
$voice = Join-Path $root 'assets\voice'

ffmpeg -hide_banner -loglevel error -y `
  -i $render `
  -i $ambient `
  -i $fixture `
  -i (Join-Path $sfx 'impact-bass-1.mp3') `
  -i (Join-Path $sfx 'riser.mp3') `
  -i (Join-Path $sfx 'whoosh-cinematic.mp3') `
  -i (Join-Path $sfx 'click.mp3') `
  -i (Join-Path $voice 'governance-narration.mp3') `
  -i (Join-Path $voice 'bridge-narration.mp3') `
  -i (Join-Path $voice 'outro-narration.mp3') `
  -i (Join-Path $sfx 'chime.mp3') `
  -filter_complex "[1:a]volume=0.24,afade=t=in:st=0:d=2,afade=t=out:st=136:d=4[bed];[2:a]asplit=4[s0][s1][s2][s3];[s0]atrim=start=0:end=20,asetpts=PTS-STARTPTS,volume=0.72[p1];[s1]atrim=start=90:end=110,asetpts=PTS-STARTPTS,volume=0.72[p2];[s2]atrim=start=174:end=183,asetpts=PTS-STARTPTS,volume=0.8[p3];[s3]atrim=start=192:end=203,asetpts=PTS-STARTPTS,volume=0.92[p4];[3:a]volume=0.9,adelay=4000|4000[impact];[4:a]volume=0.5,adelay=9000|9000[riser];[5:a]volume=0.55,adelay=70000|70000[whoosh];[6:a]volume=0.9,adelay=107000|107000[click];[3:a]volume=0.82,adelay=119000|119000[thunk];[7:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=61000|61000[governance];[8:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=92000|92000[bridge];[9:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=118000|118000[outro];[10:a]volume=0.85,adelay=138000|138000[chime];[bed][p1][p2][p3][p4][impact][riser][whoosh][click][thunk][governance][bridge][outro][chime]amix=inputs=14:normalize=0:dropout_transition=0,alimiter=limit=0.94[a]" `
  -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart -t 140 $output

if (-not (Test-Path -LiteralPath $output)) { throw "Audio mix did not produce: $output" }
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $output
