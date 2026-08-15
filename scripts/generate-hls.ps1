[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectSlug,
  [string]$SourceRoot = "public/projects/web-video",
  [string]$OutputRoot = "dist-hls",
  [string]$Ffmpeg = "E:\Buzz\ffmpeg.EXE"
)

$ErrorActionPreference = "Stop"
$sourceDirectory = (Resolve-Path (Join-Path $SourceRoot $ProjectSlug)).Path
$outputBase = if (Test-Path $OutputRoot) { (Resolve-Path $OutputRoot).Path } else { (New-Item -ItemType Directory -Path $OutputRoot -Force).FullName }
$outputDirectory = Join-Path $outputBase "hls\$ProjectSlug"
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

$segments = Get-ChildItem $sourceDirectory -Filter "segment-*.mp4" -File | Sort-Object Name
if (-not $segments) { throw "No segment-*.mp4 files found for $ProjectSlug" }

$concatFile = Join-Path $outputDirectory "inputs.txt"
try {
  $lines = $segments | ForEach-Object { "file '$($_.FullName.Replace("'", "'\''"))'" }
  Set-Content -Encoding ascii $concatFile $lines

  & $Ffmpeg -y -f concat -safe 0 -i $concatFile `
    -filter_complex "[0:v]split=3[v360][v480][v720];[v360]scale=w=640:h=-2:force_original_aspect_ratio=decrease[v360out];[v480]scale=w=854:h=-2:force_original_aspect_ratio=decrease[v480out];[v720]scale=w=1280:h=-2:force_original_aspect_ratio=decrease[v720out]" `
    -map "[v360out]" -map 0:a? -map "[v480out]" -map 0:a? -map "[v720out]" -map 0:a? `
    -c:v:0 libx264 -preset veryfast -profile:v:0 main -b:v:0 700k -maxrate:v:0 850k -bufsize:v:0 1400k `
    -c:v:1 libx264 -preset veryfast -profile:v:1 main -b:v:1 1400k -maxrate:v:1 1700k -bufsize:v:1 2800k `
    -c:v:2 libx264 -preset veryfast -profile:v:2 high -b:v:2 2800k -maxrate:v:2 3400k -bufsize:v:2 5600k `
    -c:a aac -b:a 96k -ac 2 -ar 48000 -g 48 -keyint_min 48 -sc_threshold 0 `
    -f hls -hls_time 6 -hls_playlist_type vod -hls_segment_type fmp4 `
    -hls_flags independent_segments -master_pl_name master.m3u8 `
    -var_stream_map "v:0,a:0,name:360p v:1,a:1,name:480p v:2,a:2,name:720p" `
    (Join-Path $outputDirectory "stream_%v.m3u8")

  if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed for $ProjectSlug" }
}
finally {
  Remove-Item $concatFile -Force -ErrorAction SilentlyContinue
}

Write-Output "Generated HLS: $outputDirectory"
