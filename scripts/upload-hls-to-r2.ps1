[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Bucket,
  [Parameter(Mandatory = $true)]
  [string]$InputRoot,
  [string]$Prefix = "hls"
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path $InputRoot).Path
$files = Get-ChildItem $root -Recurse -File
if (-not $files) { throw "No HLS files found under $InputRoot" }

foreach ($file in $files) {
  $relative = [IO.Path]::GetRelativePath($root, $file.FullName).Replace("\", "/")
  $key = "$Prefix/$relative"
  $contentType = switch ($file.Extension.ToLowerInvariant()) {
    ".m3u8" { "application/vnd.apple.mpegurl"; break }
    ".m4s" { "video/iso.segment"; break }
    default { "application/octet-stream" }
  }

  Write-Output "Uploading $key"
  & npx.cmd wrangler r2 object put "$Bucket/$key" --file $file.FullName --content-type $contentType --remote
  if ($LASTEXITCODE -ne 0) { throw "R2 upload failed for $key" }
}
