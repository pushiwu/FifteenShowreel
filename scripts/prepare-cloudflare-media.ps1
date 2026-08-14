param(
  [string]$FfmpegPath = "C:\Program Files\SteelSeries\GG\apps\moments\ffmpeg.exe"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$materialsRoot = Split-Path -Parent $root
$outputRoot = Join-Path $root "public\projects\web-video"
$segmentSeconds = 170
$maxAssetBytes = 25MB

$media = @(
  @{ Slug = "bihua"; SourceBytes = 49597606 },
  @{ Slug = "wilderness-drums"; SourceBytes = 55222358 },
  @{ Slug = "heartbeat-metronome"; SourceBytes = 103380346 },
  @{ Slug = "old-bell"; SourceBytes = 78650164 },
  @{ Slug = "village-song"; SourceBytes = 67920101 },
  @{ Slug = "qixia-road-wind"; SourceBytes = 43647012 },
  @{ Slug = "base-tone"; SourceBytes = 141365789 },
  @{ Slug = "land-dadia"; SourceBytes = 248546341 },
  @{ Slug = "family-portrait"; SourceBytes = 164657702 },
  @{ Slug = "listen-archives"; SourceBytes = 42871009 },
  @{ Slug = "after-tomorrow"; SourceBytes = 201008492 },
  @{ Slug = "tangled"; SourceBytes = 124377202 },
  @{ Slug = "hui-ji-chun-gui"; SourceBytes = 385453380 },
  @{ Slug = "nian-nian"; SourceBytes = 389199413 },
  @{ Slug = "emotion-encapsulator"; SourceBytes = 36023549 },
  @{ Slug = "chasing-light"; SourceBytes = 92452585 }
)

function Get-DurationSeconds([string]$sourcePath) {
  $previousErrorAction = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $probeOutput = & $FfmpegPath -hide_banner -i $sourcePath 2>&1 | Out-String
  $ErrorActionPreference = $previousErrorAction
  $match = [regex]::Match($probeOutput, "Duration:\s+(\d{2}):(\d{2}):(\d{2}\.\d+)")
  if (-not $match.Success) {
    throw "Unable to read duration: $sourcePath"
  }

  return ([int]$match.Groups[1].Value * 3600) +
    ([int]$match.Groups[2].Value * 60) +
    [double]$match.Groups[3].Value
}

if (-not (Test-Path -LiteralPath $FfmpegPath)) {
  throw "FFmpeg not found: $FfmpegPath"
}

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

foreach ($item in $media) {
  $sourcePath = if ($item.SourceBytes) {
    Get-ChildItem -LiteralPath $materialsRoot -Recurse -File -Filter *.mp4 |
      Where-Object Length -eq $item.SourceBytes |
      Select-Object -First 1 -ExpandProperty FullName
  } elseif ([System.IO.Path]::IsPathRooted($item.Source)) {
    $item.Source
  } else {
    Join-Path $root $item.Source
  }

  if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Source video not found: $sourcePath"
  }

  $targetDir = Join-Path $outputRoot $item.Slug
  New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  $duration = Get-DurationSeconds $sourcePath
  $segmentCount = [math]::Ceiling($duration / $segmentSeconds)
  Write-Host "[$($item.Slug)] $([math]::Round($duration, 1))s -> $segmentCount segment(s)"

  $posterPath = Join-Path $targetDir "poster.jpg"
  if (-not (Test-Path -LiteralPath $posterPath)) {
    & $FfmpegPath -y -hide_banner -loglevel error -ss 5 -i $sourcePath `
      -frames:v 1 -vf "scale=-2:900" -q:v 3 $posterPath
    if ($LASTEXITCODE -ne 0) { throw "Poster generation failed: $sourcePath" }
  }

  for ($index = 0; $index -lt $segmentCount; $index += 1) {
    $segmentPath = Join-Path $targetDir ("segment-{0:D2}.mp4" -f ($index + 1))
    if (-not (Test-Path -LiteralPath $segmentPath)) {
      $offset = $index * $segmentSeconds
      $remaining = $duration - $offset
      $length = [math]::Min($segmentSeconds, $remaining)

      & $FfmpegPath -y -hide_banner -loglevel error -ss $offset -i $sourcePath -t $length `
        -map 0:v:0 -map "0:a:0?" -vf "scale=-2:720" `
        -c:v h264_nvenc -b:v 900k -maxrate 1100k -bufsize 2200k `
        -c:a aac -b:a 96k -movflags +faststart $segmentPath
      if ($LASTEXITCODE -ne 0) { throw "Video transcode failed: $segmentPath" }
    }

    $segmentSize = (Get-Item -LiteralPath $segmentPath).Length
    if ($segmentSize -gt $maxAssetBytes) {
      throw "Segment exceeds 25 MiB: $segmentPath ($segmentSize bytes)"
    }
  }
}

Write-Host "Cloudflare media preparation complete."
