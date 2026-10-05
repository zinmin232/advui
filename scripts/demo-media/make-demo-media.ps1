# Makes the demo clips the Video and Audio Player examples play, in
# apps/docs/public/media (published with the docs site):
#
#   handwashing.mp4, handwashing.jpg   video with speech, and its poster
#   handwashing.en.vtt                 its captions
#   handwashing-loop.mp4               square loop of the steps, without sound
#   flood-safety.mp3                   radio message (Audio Player)
#   voice-message.mp3                  short voice message (Audio Player, compact)
#
# The speech comes from the voices built into Windows (Microsoft David and
# Zira), so the captions are timed from the length of each spoken line rather
# than by hand. Edit the lines below and run it again (Windows, ffmpeg on PATH):
#
#   powershell -ExecutionPolicy Bypass -File scripts/demo-media/make-demo-media.ps1

param([string]$Out = (Join-Path $PSScriptRoot '..\..\apps\docs\public\media'))

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
Add-Type -AssemblyName System.Drawing

$Out = [IO.Path]::GetFullPath($Out)
$work = Join-Path ([IO.Path]::GetTempPath()) "advui-demo-media"
Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $work, $Out | Out-Null

$rate = 22050

function Invoke-Ffmpeg([string[]]$arguments) {
  & ffmpeg -hide_banner -loglevel error -y @arguments
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed: $arguments" }
}

function Get-Duration([string]$path) {
  [double](& ffprobe -v error -show_entries format=duration -of csv=p=0 $path)
}

function Save-Speech([string]$text, [string]$voice, [int]$speed, [string]$path) {
  $raw = "$path.raw.wav"
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  try {
    $synth.SelectVoice($voice)
    $synth.Rate = $speed
    $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
      $rate, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
      [System.Speech.AudioFormat.AudioChannel]::Mono)
    $synth.SetOutputToWaveFile($raw, $format)
    $synth.Speak($text)
  } finally {
    $synth.Dispose()
  }
  # The voices add silence around each line; cut it, so the captions start
  # and end with the words and the pauses are the ones set below.
  $trim = 'silenceremove=start_periods=1:start_threshold=-50dB'
  Invoke-Ffmpeg @('-i', $raw, '-af', "$trim,areverse,$trim,areverse", '-c:a', 'pcm_s16le', $path)
}

function Save-Silence([double]$seconds, [string]$path) {
  Invoke-Ffmpeg @('-f', 'lavfi', '-i', "anullsrc=r=$($rate):cl=mono", '-t', "$seconds",
    '-c:a', 'pcm_s16le', $path)
}

# Speaks each line with a pause between them, into one WAV file. Returns the
# lines with their start and end times, for captions and slides.
function New-Speech([string]$name, [string]$voice, [int]$speed, [object[]]$lines,
  [double]$lead = 0.5, [double]$gap = 0.6, [double]$tail = 1.0) {
  $parts = @()
  $leadFile = Join-Path $work "$name-lead.wav"
  $gapFile = Join-Path $work "$name-gap.wav"
  $tailFile = Join-Path $work "$name-tail.wav"
  Save-Silence $lead $leadFile
  Save-Silence $gap $gapFile
  Save-Silence $tail $tailFile
  $parts += $leadFile
  $time = $lead
  $timed = @()
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $file = Join-Path $work "$name-$i.wav"
    Save-Speech $line.say $voice $speed $file
    $length = Get-Duration $file
    $timed += [pscustomobject]@{ line = $line; start = $time; end = $time + $length }
    $parts += $file
    $time += $length
    if ($i -lt $lines.Count - 1) { $parts += $gapFile; $time += $gap }
  }
  $parts += $tailFile
  $list = Join-Path $work "$name.txt"
  $parts | ForEach-Object { "file '$($_ -replace '\\', '/')'" } | Set-Content -Encoding ascii $list
  $wav = Join-Path $work "$name.wav"
  Invoke-Ffmpeg @('-f', 'concat', '-safe', '0', '-i', $list, '-c', 'copy', $wav)
  [pscustomobject]@{ wav = $wav; lines = $timed; length = $time + $tail }
}

function Format-Time([double]$seconds) {
  [TimeSpan]::FromSeconds([Math]::Round($seconds, 3)).ToString('hh\:mm\:ss\.fff')
}

# Each caption stays up a moment after its line ends, but not into the next.
function Save-Captions([object[]]$timed, [string]$path, [double]$hold = 0.4) {
  $text = "WEBVTT`n"
  $n = 1
  foreach ($t in $timed) {
    $text += "`n$n`n$(Format-Time $t.start) --> $(Format-Time ($t.end + $hold))`n$($t.line.caption)`n"
    $n++
  }
  [IO.File]::WriteAllText($path, $text, (New-Object Text.UTF8Encoding($false)))
}

function Save-Mp3([string]$wav, [string]$path) {
  Invoke-Ffmpeg @('-i', $wav, '-c:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', '-map_metadata', '-1', $path)
}

# --- Slides for the videos ---------------------------------------------------

$colors = @{
  background = [Drawing.Color]::FromArgb(236, 246, 249)
  ink = [Drawing.Color]::FromArgb(15, 42, 61)
  muted = [Drawing.Color]::FromArgb(74, 98, 116)
  accent = [Drawing.Color]::FromArgb(14, 116, 144)
  dot = [Drawing.Color]::FromArgb(186, 214, 224)
}

function Draw-Centered($g, [int]$width, [string]$text, $font, $color, [int]$top, [int]$boxHeight) {
  $format = New-Object Drawing.StringFormat
  $format.Alignment = [Drawing.StringAlignment]::Center
  $format.LineAlignment = [Drawing.StringAlignment]::Center
  $brush = New-Object Drawing.SolidBrush($color)
  $g.DrawString($text, $font, $brush, (New-Object Drawing.RectangleF(48, $top, ($width - 96), $boxHeight)), $format)
  $brush.Dispose()
}

# A title card (step 0) or a step: number, name and detail, starting at `top`.
# In the 16:9 video the bottom stays empty for the captions.
function Save-Slide($slide, [int]$steps, [string]$path, [int]$width, [int]$height, [int]$top) {
  $bitmap = New-Object Drawing.Bitmap($width, $height)
  $g = [Drawing.Graphics]::FromImage($bitmap)
  $g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear($colors.background)
  $family = 'Segoe UI'
  $label = New-Object Drawing.Font($family, 22, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
  $title = New-Object Drawing.Font($family, 84, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
  $detail = New-Object Drawing.Font($family, 36, [Drawing.FontStyle]::Regular, [Drawing.GraphicsUnit]::Pixel)
  $digit = New-Object Drawing.Font($family, 44, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)

  $muted = New-Object Drawing.SolidBrush($colors.muted)
  $g.DrawString('HANDWASHING', $label, $muted, 48, 44)
  $muted.Dispose()
  for ($i = 1; $i -le $steps; $i++) {
    $fill = if ($i -le $slide.step) { $colors.accent } else { $colors.dot }
    $brush = New-Object Drawing.SolidBrush($fill)
    $g.FillEllipse($brush, ($width - 48 - ($steps - $i) * 30 - 16), 50, 16, 16)
    $brush.Dispose()
  }

  if ($slide.step -eq 0) {
    Draw-Centered $g $width $slide.title $title $colors.ink ($top + 50) 140
    Draw-Centered $g $width $slide.detail $detail $colors.muted ($top + 190) 80
  } else {
    $brush = New-Object Drawing.SolidBrush($colors.accent)
    $g.FillEllipse($brush, [int]($width / 2 - 48), $top, 96, 96)
    $brush.Dispose()
    Draw-Centered $g $width "$($slide.step)" $digit ([Drawing.Color]::White) $top 96
    Draw-Centered $g $width $slide.title $title $colors.ink ($top + 116) 120
    Draw-Centered $g $width $slide.detail $detail $colors.muted ($top + 240) 70
  }
  foreach ($f in $label, $title, $detail, $digit) { $f.Dispose() }
  $g.Dispose()
  $bitmap.Save($path, [Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

# Writes a concat list that shows each image for its duration.
function Save-SlideList([object[]]$shown, [string]$path) {
  $list = @()
  foreach ($s in $shown) {
    $list += "file '$($s.png -replace '\\', '/')'"
    $list += "duration $([Math]::Round($s.duration, 3))"
  }
  # The concat demuxer needs the last image again for its duration to count.
  $list += "file '$($shown[-1].png -replace '\\', '/')'"
  $list | Set-Content -Encoding ascii $path
}

$slides = @(
  @{ step = 0; title = 'Handwashing in 5 steps'; detail = 'Clean hands stop germs from spreading.' },
  @{ step = 1; title = 'Wet'; detail = 'Clean, running water' },
  @{ step = 2; title = 'Lather'; detail = 'Backs, between fingers, under nails' },
  @{ step = 3; title = 'Scrub'; detail = 'At least 20 seconds' },
  @{ step = 4; title = 'Rinse'; detail = 'Under clean, running water' },
  @{ step = 5; title = 'Dry'; detail = 'A clean towel, or air dry' }
)

# --- Handwashing video, with speech and captions ------------------------------

$lines = @(
  @{ slide = 0; say = 'Handwashing, in five steps.'; caption = 'Handwashing, in five steps.' },
  @{ slide = 1; say = 'Step one. Wet your hands with clean, running water.'; caption = 'Step 1: Wet your hands with clean, running water.' },
  @{ slide = 2; say = 'Step two. Lather them with soap.'; caption = 'Step 2: Lather them with soap.' },
  @{ slide = 2; say = 'The backs of your hands, between your fingers, and under your nails.'; caption = 'The backs of your hands, between your fingers,' + "`n" + 'and under your nails.' },
  @{ slide = 3; say = 'Step three. Scrub for at least twenty seconds.'; caption = 'Step 3: Scrub for at least 20 seconds.' },
  @{ slide = 4; say = 'Step four. Rinse them well under clean, running water.'; caption = 'Step 4: Rinse them well under clean, running water.' },
  @{ slide = 5; say = 'Step five. Dry them with a clean towel, or let them air dry.'; caption = 'Step 5: Dry them with a clean towel, or let them air dry.' }
)
$speech = New-Speech 'handwashing' 'Microsoft Zira Desktop' 0 $lines
Save-Captions $speech.lines (Join-Path $Out 'handwashing.en.vtt')

# Each slide shows from its first line until the next slide's first line.
$starts = for ($i = 0; $i -lt $slides.Count; $i++) {
  if ($i -eq 0) { 0 } else { ($speech.lines | Where-Object { $_.line.slide -eq $i } | Select-Object -First 1).start }
}
$shown = for ($i = 0; $i -lt $slides.Count; $i++) {
  $png = Join-Path $work "wide-$i.png"
  Save-Slide $slides[$i] 5 $png 1280 720 120
  $end = if ($i -lt $slides.Count - 1) { $starts[$i + 1] } else { $speech.length }
  [pscustomobject]@{ png = $png; duration = $end - $starts[$i] }
}
$slideList = Join-Path $work 'wide.txt'
Save-SlideList $shown $slideList

Invoke-Ffmpeg @('-f', 'concat', '-safe', '0', '-i', $slideList, '-i', $speech.wav,
  '-c:v', 'libx264', '-preset', 'slow', '-tune', 'stillimage', '-crf', '28',
  '-pix_fmt', 'yuv420p', '-r', '24', '-vf', 'scale=960:540',
  '-c:a', 'aac', '-b:a', '64k', '-ac', '1',
  '-shortest', '-movflags', '+faststart', '-map_metadata', '-1',
  (Join-Path $Out 'handwashing.mp4'))
Invoke-Ffmpeg @('-i', $shown[0].png, '-vf', 'scale=960:540', '-q:v', '4',
  (Join-Path $Out 'handwashing.jpg'))

# --- Square loop of the steps, without sound -----------------------------------

$shown = for ($i = 1; $i -lt $slides.Count; $i++) {
  $png = Join-Path $work "square-$i.png"
  Save-Slide $slides[$i] 5 $png 720 720 200
  [pscustomobject]@{ png = $png; duration = 1.6 }
}
$slideList = Join-Path $work 'square.txt'
Save-SlideList $shown $slideList
# Cut at the sum of the durations: the repeated last image would add one more.
$total = ($shown | Measure-Object -Property duration -Sum).Sum
Invoke-Ffmpeg @('-f', 'concat', '-safe', '0', '-i', $slideList, '-t', "$total",
  '-c:v', 'libx264', '-preset', 'slow', '-tune', 'stillimage', '-crf', '28',
  '-pix_fmt', 'yuv420p', '-r', '24', '-vf', 'scale=540:540', '-an',
  '-movflags', '+faststart', '-map_metadata', '-1',
  (Join-Path $Out 'handwashing-loop.mp4'))

# --- Audio Player clips -------------------------------------------------------

$radio = New-Speech 'flood-safety' 'Microsoft David Desktop' 0 @(
  @{ say = 'This is a flood safety message from your community radio.' },
  @{ say = 'When heavy rain is forecast, keep drinking water, medicine and important papers in a waterproof bag.' },
  @{ say = 'If the water rises, move to higher ground, and follow the advice of your village leaders.' },
  @{ say = 'Never walk or drive through flood water.' },
  @{ say = 'Stay safe, and listen for updates.' }
)
Save-Mp3 $radio.wav (Join-Path $Out 'flood-safety.mp3')

$message = New-Speech 'voice-message' 'Microsoft Zira Desktop' 1 @(
  @{ say = "Hi, it's Hla. The hygiene kits arrived this morning." },
  @{ say = "We'll start the distribution tomorrow at nine. See you there!" }
) -lead 0.3 -gap 0.4 -tail 0.5
Save-Mp3 $message.wav (Join-Path $Out 'voice-message.mp3')

Remove-Item $work -Recurse -Force
Get-ChildItem $Out | Format-Table Name, Length -AutoSize
