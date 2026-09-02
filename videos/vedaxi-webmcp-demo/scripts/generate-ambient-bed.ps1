$out = Join-Path $PSScriptRoot '..\assets\audio'
New-Item -ItemType Directory -Force $out | Out-Null

ffmpeg -hide_banner -loglevel error -y `
  -f lavfi -i "sine=frequency=55:sample_rate=48000:duration=140" `
  -f lavfi -i "sine=frequency=110:sample_rate=48000:duration=140" `
  -f lavfi -i "sine=frequency=220:sample_rate=48000:duration=140" `
  -f lavfi -i "anoisesrc=color=pink:sample_rate=48000:duration=140" `
  -filter_complex "[0:a]volume=0.095[a];[1:a]volume=0.036[b];[2:a]volume=0.013,lowpass=f=1600[c];[3:a]lowpass=f=1200,volume=0.006[d];[a][b][c][d]amix=inputs=4:normalize=0,highpass=f=34,afade=t=in:st=0:d=2,afade=t=out:st=136:d=4,alimiter=limit=0.55" `
  -c:a aac -b:a 128k (Join-Path $out 'vedaxi-ambient-bed.m4a')
