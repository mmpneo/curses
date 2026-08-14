<#
.SYNOPSIS
  Builds and packages the curses app for Windows.

.DESCRIPTION
  Runs the full Tauri release build (frontend typecheck + vite build + cargo build
  + installer bundling) and collects all artifacts into .\build-output:
    - curses.exe                          (standalone binary)
    - curses_<version>_x64_portable.zip   (zipped standalone binary)
    - *.msi                               (WiX installer)
    - *-setup.exe                         (NSIS installer, if produced)

  The Twitch client id is required for the Twitch login to work in the packaged
  app. Supply it with -TwitchClientId, the CURSES_TWITCH_CLIENT_ID environment
  variable, or a CURSES_TWITCH_CLIENT_ID=... line in .env / .env.local.
  The build still succeeds without it, but Twitch login will be non-functional.

.PARAMETER TwitchClientId
  Twitch application client id baked into the frontend at build time.

.PARAMETER Clean
  Delete previous frontend build output, bundle output and .\build-output first.

.PARAMETER SkipInstall
  Skip "pnpm install" (use when dependencies are already up to date).

.EXAMPLE
  .\build.ps1
.EXAMPLE
  .\build.ps1 -TwitchClientId abc123 -Clean
#>
[CmdletBinding()]
param(
  [string]$TwitchClientId,
  [switch]$Clean,
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Assert-Tool([string]$Name, [string]$Hint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "'$Name' was not found on PATH. $Hint"
  }
}

Write-Host "==> Checking prerequisites" -ForegroundColor Cyan
Assert-Tool node  "Install Node.js: https://nodejs.org"
Assert-Tool pnpm  "Install pnpm: npm install -g pnpm"
Assert-Tool cargo "Install the Rust toolchain: https://rustup.rs"

# version from src-tauri/Cargo.toml drives the artifact names
$cargoToml = Get-Content "src-tauri/Cargo.toml" -Raw
$version = [regex]::Match($cargoToml, '(?m)^version\s*=\s*"([^"]+)"').Groups[1].Value
if (-not $version) { throw "Could not read package.version from src-tauri/Cargo.toml" }
Write-Host "==> Building curses v$version" -ForegroundColor Cyan

# resolve the Twitch client id: parameter > environment > .env files
if ($TwitchClientId) {
  $env:CURSES_TWITCH_CLIENT_ID = $TwitchClientId
}
if (-not $env:CURSES_TWITCH_CLIENT_ID) {
  foreach ($envFile in @(".env.local", ".env")) {
    if (Test-Path $envFile) {
      $m = [regex]::Match((Get-Content $envFile -Raw), '(?m)^\s*CURSES_TWITCH_CLIENT_ID\s*=\s*(\S+)')
      if ($m.Success) { $env:CURSES_TWITCH_CLIENT_ID = $m.Groups[1].Value; break }
    }
  }
}
if ($env:CURSES_TWITCH_CLIENT_ID) {
  Write-Host "==> Twitch client id found" -ForegroundColor Cyan
} else {
  Write-Warning "CURSES_TWITCH_CLIENT_ID is not set - Twitch login will not work in this build."
}

$bundleDir = "src-tauri/target/release/bundle"
$outDir = Join-Path $PSScriptRoot "build-output"

if ($Clean) {
  Write-Host "==> Cleaning previous build output" -ForegroundColor Cyan
  foreach ($dir in @("dist", $bundleDir, $outDir)) {
    if (Test-Path $dir) { Remove-Item -Recurse -Force $dir }
  }
}

if (-not $SkipInstall) {
  Write-Host "==> Installing dependencies" -ForegroundColor Cyan
  pnpm install
  if ($LASTEXITCODE -ne 0) { throw "pnpm install failed (exit code $LASTEXITCODE)" }
}

Write-Host "==> Running tauri build (this can take a while)" -ForegroundColor Cyan
pnpm tauri build
if ($LASTEXITCODE -ne 0) { throw "tauri build failed (exit code $LASTEXITCODE)" }

Write-Host "==> Collecting artifacts" -ForegroundColor Cyan
if (Test-Path $outDir) { Remove-Item -Recurse -Force $outDir }
New-Item -ItemType Directory $outDir | Out-Null

$exe = "src-tauri/target/release/curses.exe"
if (-not (Test-Path $exe)) { throw "Expected binary not found: $exe" }
Copy-Item $exe $outDir
Compress-Archive -Path $exe -DestinationPath (Join-Path $outDir "curses_${version}_x64_portable.zip")

foreach ($pattern in @("$bundleDir/msi/*.msi", "$bundleDir/nsis/*.exe")) {
  Get-Item $pattern -ErrorAction SilentlyContinue | Copy-Item -Destination $outDir
}

Write-Host ""
Write-Host "Build complete. Artifacts in $outDir :" -ForegroundColor Green
Get-ChildItem $outDir | ForEach-Object {
  "  {0,-45} {1,10:N1} MB" -f $_.Name, ($_.Length / 1MB)
}
