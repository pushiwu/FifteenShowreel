$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $root
$publicRoot = (Resolve-Path -LiteralPath (Join-Path $root "public")).Path
$backupRoot = Join-Path $workspaceRoot ".release-source-backup-v1"

$relativeTargets = @(
  "projects\showreel.mp4",
  "projects\bihua.mp4",
  "projects\wilderness-drums.mp4",
  "projects\heartbeat-metronome.mp4",
  "projects\old-bell.mp4",
  "projects\village-song.mp4",
  "projects\qixia-road-wind.mp4",
  "projects\base-tone.mp4",
  "projects\land-dadia\land-dadia.mp4",
  "projects\family-portrait\family-portrait.mp4",
  "projects\listen-archives\listen-archives.mp4",
  "projects\after-tomorrow\after-tomorrow.mp4",
  "projects\tangled\tangled.mp4",
  "projects\p7-featured.jpg",
  "about-profile.png",
  "projects\mai-miao-growth\poster.png"
)

$poemRoot = Join-Path $publicRoot "projects\poem"
$relativeTargets += Get-ChildItem -LiteralPath $poemRoot -File -Filter *.png |
  ForEach-Object { $_.FullName.Substring($publicRoot.Length + 1) }

New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
$resolvedBackupRoot = (Resolve-Path -LiteralPath $backupRoot).Path
$movedBytes = 0
$movedCount = 0

foreach ($relativePath in $relativeTargets) {
  $sourcePath = Join-Path $publicRoot $relativePath
  if (-not (Test-Path -LiteralPath $sourcePath)) { continue }

  $resolvedSource = (Resolve-Path -LiteralPath $sourcePath).Path
  $destinationPath = Join-Path $resolvedBackupRoot $relativePath
  $destinationDirectory = Split-Path -Parent $destinationPath

  if (-not $resolvedSource.StartsWith($publicRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing source outside public: $resolvedSource"
  }
  if (-not $destinationPath.StartsWith($resolvedBackupRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing destination outside backup: $destinationPath"
  }

  New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
  $movedBytes += (Get-Item -LiteralPath $resolvedSource).Length
  Move-Item -LiteralPath $resolvedSource -Destination $destinationPath -Force
  $movedCount += 1
}

Write-Host "Archived $movedCount file(s), $([math]::Round($movedBytes / 1MB, 1)) MiB."
