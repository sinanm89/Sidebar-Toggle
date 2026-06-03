<#
  pack.ps1 — build a store-ready zip from src/.

  Zips the CONTENTS of src/ (so manifest.json sits at the archive root, as both
  the Chrome Web Store and Microsoft Edge Add-ons require) into
  dist/sidebar-toggle-<version>.zip. The same artifact uploads to both stores.

  Usage:  pwsh -NoProfile -File scripts/pack.ps1
#>
param(
  [string]$Repo = (Split-Path -Parent $PSScriptRoot)
)
$ErrorActionPreference = 'Stop'

$src = Join-Path $Repo 'src'
$dist = Join-Path $Repo 'dist'

if (-not (Test-Path (Join-Path $src 'manifest.json'))) {
  throw "manifest.json not found under $src"
}

$manifest = Get-Content (Join-Path $src 'manifest.json') -Raw | ConvertFrom-Json
$version = $manifest.version

New-Item -ItemType Directory -Force $dist | Out-Null
$zip = Join-Path $dist "sidebar-toggle-$version.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }

Compress-Archive -Path (Join-Path $src '*') -DestinationPath $zip -Force

$kb = [math]::Round((Get-Item $zip).Length / 1KB, 1)
Write-Host "Packed v$version -> $zip ($kb KB)"
