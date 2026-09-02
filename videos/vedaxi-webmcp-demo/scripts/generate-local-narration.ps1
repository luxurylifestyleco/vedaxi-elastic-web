Add-Type -AssemblyName System.Speech

$out = Join-Path $PSScriptRoot '..\assets\voice'
New-Item -ItemType Directory -Force $out | Out-Null

$lines = @(
  @{ File = '01-hook.wav'; Text = 'AI made research faster. But faster answers create a harder question. Can you still trace what came from where?'; Rate = -1 },
  @{ File = '02-paper.wav'; Text = 'VEDAXI starts with bounded publisher evidence. The Paper origin records forty recruited participants. The evidence stays attributable to its source.'; Rate = -1 },
  @{ File = '03-video.wav'; Text = 'A second publisher origin adds the qualifying detail. At zero three twelve, six sessions are excluded for calibration drift.'; Rate = -1 },
  @{ File = '04-derivation.wav'; Text = 'Those sources are not silently merged. Forty recruited, minus six excluded, equals thirty four analysed. The relationship is explicitly derived.'; Rate = -1 },
  @{ File = '05-focus.wav'; Text = 'The agent can request focus around evidence and provenance. It can assist the review. It does not receive final authority.'; Rate = -1 },
  @{ File = '06-human.wav'; Text = 'The researcher reviews the sources, then decides what becomes part of the record. Confirmation is a publisher decision, not an agent side effect.'; Rate = -1 },
  @{ File = '07-governance.wav'; Text = 'Confirmed work persists beyond the agent interaction. A publisher can withdraw agent capability without taking the researcher workspace with it.'; Rate = -1 },
  @{ File = '08-close.wav'; Text = 'VEDAXI. Publisher governed evidence. Agent capability. Human authority. Built with Web M C P.'; Rate = -1 }
)

foreach ($line in $lines) {
  $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice.SelectVoice('Microsoft George')
  $voice.Rate = $line.Rate
  $voice.Volume = 100
  $voice.SetOutputToWaveFile((Join-Path $out $line.File))
  $voice.Speak($line.Text)
  $voice.Dispose()
}
