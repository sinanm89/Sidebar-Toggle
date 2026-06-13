<#
  pack.ps1 — build store-ready packages from src/.

  Each package zips the CONTENTS of src/ (so manifest.json sits at the archive
  root, as every store requires) into dist/. Targets:

    chrome   -> dist/sidebar-toggle-<version>.zip          (Chrome Web Store + Edge)
    firefox  -> dist/sidebar-toggle-<version>-firefox.zip  (addons.mozilla.org)
                plus an unpacked build at dist/firefox/ for `web-ext lint`/`run`.

  The Firefox package is built from the SAME src/; only manifest.json is
  transformed at build time:
    • a gecko add-on id is added (required by AMO AND by Firefox for
      chrome.storage.sync to work), and
    • the Chrome `background.service_worker` is swapped for Firefox's event-page
      `background.scripts` form.
  background.js guards importScripts() so the one file works under both runtimes.

  Zips are written with .NET ZipFile (forward-slash entry paths) rather than
  Compress-Archive, which has historically emitted backslash separators that
  Firefox/AMO can fail to read for nested folders (popup/, icons/).

  Usage:
    pwsh -NoProfile -File scripts/pack.ps1                  # both (default)
    pwsh -NoProfile -File scripts/pack.ps1 -Target chrome
    pwsh -NoProfile -File scripts/pack.ps1 -Target firefox
#>
param(
  [ValidateSet('all', 'chrome', 'firefox')]
  [string]$Target = 'all',
  # Permanent AMO add-on id. Once published this must not change, or AMO treats it
  # as a brand-new listing. Override only if you know what you're doing.
  [string]$GeckoId = 'sidebar-toggle@sinanm89.github.io',
  [string]$Repo = (Split-Path -Parent $PSScriptRoot)
)
$ErrorActionPreference = 'Stop'

$src = Join-Path $Repo 'src'
$dist = Join-Path $Repo 'dist'
$srcManifest = Join-Path $src 'manifest.json'

if (-not (Test-Path $srcManifest)) {
  throw "manifest.json not found under $src"
}

$version = (Get-Content $srcManifest -Raw | ConvertFrom-Json).version
New-Item -ItemType Directory -Force $dist | Out-Null

function New-ExtensionZip([string]$sourceDir, [string]$zipPath) {
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
  # includeBaseDirectory = $false -> entries are relative to $sourceDir, so
  # manifest.json lands at the zip root. .NET writes '/'-separated entry names.
  [System.IO.Compression.ZipFile]::CreateFromDirectory(
    $sourceDir, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)
  $kb = [math]::Round((Get-Item $zipPath).Length / 1KB, 1)
  Write-Host "  -> $zipPath ($kb KB)"
}

if ($Target -in @('all', 'chrome')) {
  Write-Host "Packing Chrome/Edge  v$version"
  New-ExtensionZip $src (Join-Path $dist "sidebar-toggle-$version.zip")
}

if ($Target -in @('all', 'firefox')) {
  Write-Host "Packing Firefox/AMO  v$version"
  # Unpacked Firefox copy of src/ with a Firefox-flavoured manifest.
  $fxDir = Join-Path $dist 'firefox'
  if (Test-Path $fxDir) { Remove-Item $fxDir -Recurse -Force }
  New-Item -ItemType Directory -Force $fxDir | Out-Null
  Copy-Item (Join-Path $src '*') $fxDir -Recurse -Force

  $fx = Get-Content $srcManifest -Raw | ConvertFrom-Json
  $fx.background = [pscustomobject]@{ scripts = @('sites.js', 'background.js') }
  $fx | Add-Member -NotePropertyName 'browser_specific_settings' -Force `
    -NotePropertyValue ([pscustomobject]@{
      gecko = [pscustomobject]@{
        id = $GeckoId
        # Firefox "built-in data consent": this extension collects and transmits
        # nothing (all state is local storage.sync), so declare no data collection.
        # No strict_min_version: AMO derives the MV3 floor (Firefox 109); the
        # data_collection_permissions key is honored on 142+ and ignored below.
        data_collection_permissions = [pscustomobject]@{ required = @('none') }
      }
    })
  $fx | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $fxDir 'manifest.json') -Encoding utf8

  New-ExtensionZip $fxDir (Join-Path $dist "sidebar-toggle-$version-firefox.zip")
  Write-Host "  unpacked: $fxDir  (run 'web-ext lint -s dist/firefox' to validate for AMO)"
}
