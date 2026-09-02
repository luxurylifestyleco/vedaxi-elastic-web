$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
  throw 'OPENAI_API_KEY is required to generate the approved narration.'
}

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'assets\voice\clean'
New-Item -ItemType Directory -Force $out | Out-Null

$clips = @(
  @{ File = '01-hook.mp3'; Duration = 12; Text = 'AI made research faster. But faster answers create a harder question. Can you still trace what came from where?' },
  @{ File = '02-paper.mp3'; Duration = 18; Text = 'VEDAXI starts with bounded publisher evidence. The Paper origin records a cohort of forty recruited participants. The evidence remains attributable to the publisher that supplied it, rather than becoming an untraceable answer.' },
  @{ File = '03-video.mp3'; Duration = 18; Text = 'The agent can inspect a second, independent publisher origin: the Video transcript. At zero three twelve, it records the qualifying detail the cohort number alone leaves out. Six sessions were excluded for calibration drift.' },
  @{ File = '04-derivation.mp3'; Duration = 15; Text = 'Those are separate pieces of evidence. VEDAXI does not quietly merge them. The relationship is derived outside either publisher boundary: forty recruited, minus six excluded, equals thirty-four analysed.' },
  @{ File = '05-focus.mp3'; Duration = 17; Text = 'The agent can request focus around the relevant evidence and provenance. It can assist the review and move the next question forward. It does not rewrite the record or receive final authority.' },
  @{ File = '06-human.mp3'; Duration = 19; Text = 'The researcher reviews the paper, the video, and the derived relationship as separate things. Then the person decides what becomes part of the record. Confirmation is a publisher decision, not an agent side effect.' },
  @{ File = '07-governance.mp3'; Duration = 19; Text = 'Confirmed work persists beyond the agent interaction. A publisher can withdraw agent capability without taking the researcher workspace with it. The evidence trail and the human decision remain visible, reviewable, and intact.' },
  @{ File = '08-close.mp3'; Duration = 18; Text = 'VEDAXI keeps evidence boundaries visible. The publisher controls exposed capability. The agent retrieves and assists. The human reviews and confirms. Publisher-governed evidence, agent capability, human authority. Built with WebMCP.' }
)

$headers = @{ Authorization = "Bearer $env:OPENAI_API_KEY" }
foreach ($clip in $clips) {
  $raw = Join-Path $out ("raw-" + $clip.File)
  $final = Join-Path $out $clip.File
  $payload = @{ model = 'gpt-4o-mini-tts'; voice = 'cedar'; input = $clip.Text; instructions = 'Calm, confident editorial narration. Speak clearly at a measured pace. No long pauses, no character voice, no music.' } | ConvertTo-Json -Compress
  Invoke-WebRequest -Uri 'https://api.openai.com/v1/audio/speech' -Method Post -Headers $headers -ContentType 'application/json' -Body $payload -OutFile $raw
  $rawDuration = [double](& ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $raw)
  $tempo = $rawDuration / [double]$clip.Duration
  if ($tempo -lt 0.5 -or $tempo -gt 2.0) { throw "Cannot safely fit $($clip.File): raw duration $rawDuration s, target $($clip.Duration) s." }
  ffmpeg -hide_banner -loglevel error -y -i $raw -filter:a "atempo=$tempo,afade=t=in:st=0:d=0.08,afade=t=out:st=$([Math]::Max(0, $clip.Duration - 0.12)):d=0.12" -t $clip.Duration -c:a libmp3lame -b:a 192k $final
  Remove-Item -LiteralPath $raw -Force
  Write-Output "$($clip.File) -> $($clip.Duration)s"
}
