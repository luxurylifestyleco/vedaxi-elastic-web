$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$render = Join-Path $root 'renders\vedaxi-webmcp-demo-2m20s-hook-visual.mp4'
$output = Join-Path $root 'renders\vedaxi-webmcp-demo-2m20s-hook-v1.mp4'
$ambient = Join-Path $root 'assets\audio\vedaxi-ambient-bed.m4a'
$voice = Join-Path $root 'assets\voice\clean'
$sfx = Join-Path $root 'assets\sfx'

ffmpeg -hide_banner -loglevel error -y `
  -i $render `
  -i $ambient `
  -i (Join-Path $voice '01-hook.mp3') `
  -i (Join-Path $voice '02-paper.mp3') `
  -i (Join-Path $voice '03-video.mp3') `
  -i (Join-Path $voice '04-derivation.mp3') `
  -i (Join-Path $voice '05-focus.mp3') `
  -i (Join-Path $voice '06-human.mp3') `
  -i (Join-Path $voice '07-governance.mp3') `
  -i (Join-Path $voice '08-close.mp3') `
  -i (Join-Path $sfx 'impact-bass-1.mp3') `
  -i (Join-Path $sfx 'riser.mp3') `
  -i (Join-Path $sfx 'whoosh-cinematic.mp3') `
  -i (Join-Path $sfx 'click.mp3') `
  -i (Join-Path $sfx 'chime.mp3') `
  -filter_complex "[1:a]volume=0.7,afade=t=in:st=0:d=2,afade=t=out:st=139.5:d=0.5[bed];[2:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=0|0[n1];[3:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=12000|12000[n2];[4:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=30000|30000[n3];[5:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=48000|48000[n4];[6:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=63000|63000[n5];[7:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=80000|80000[n6];[8:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=99000|99000[n7];[9:a]highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=0.08:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89,adelay=118000|118000[n8];[10:a]asplit=4[h1][h2][h3][h4];[h1]volume=0.72,adelay=3800|3800[impact1];[h2]volume=0.62,adelay=5000|5000[impact2];[h3]volume=0.62,adelay=6200|6200[impact3];[h4]volume=0.8,adelay=10750|10750[snap];[11:a]volume=0.38,adelay=9000|9000[riser];[12:a]volume=0.32,adelay=62000|62000[whoosh];[13:a]volume=0.85,adelay=99000|99000[click];[14:a]volume=0.8,adelay=136000|136000[chime];[bed][n1][n2][n3][n4][n5][n6][n7][n8][impact1][impact2][impact3][snap][riser][whoosh][click][chime]amix=inputs=17:normalize=0:dropout_transition=0,alimiter=limit=0.94[a]" `
  -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart -t 140 $output

if (-not (Test-Path -LiteralPath $output)) { throw "Audio mix did not produce: $output" }
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $output
