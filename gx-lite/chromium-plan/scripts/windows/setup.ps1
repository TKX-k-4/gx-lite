# Run in PowerShell. Install Git and Visual Studio 2022 first (see docs/REQUIREMENTS.md).
param(
  [string]$Root = "C:\src",
  [string]$Tag  = ""        # stable release tag to build (from chromiumdash). Empty = whatever was fetched.
)
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force $Root | Out-Null
Set-Location $Root

git config --global core.autocrlf false
git config --global core.filemode false
git config --global core.longpaths true

if (-not (Test-Path "$Root\depot_tools")) {
  git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
}
$env:PATH = "$Root\depot_tools;" + $env:PATH
$env:DEPOT_TOOLS_WIN_TOOLCHAIN = "0"
[Environment]::SetEnvironmentVariable("DEPOT_TOOLS_WIN_TOOLCHAIN", "0", "User")

New-Item -ItemType Directory -Force "$Root\chromium" | Out-Null
Set-Location "$Root\chromium"
if (-not (Test-Path "$Root\chromium\src")) {
  fetch --git-cache chromium          # big download; run the script again if it is interrupted
}

if ($Tag) {
  Set-Location "$Root\chromium\src"
  git fetch --tags
  git checkout -B "gx-$Tag" "tags/$Tag"
  Set-Location "$Root\chromium"
}
gclient sync -D --with_branch_heads --with_tags

Write-Host ""
Write-Host "Done. Add $Root\depot_tools to your PATH permanently (Environment Variables settings)," -ForegroundColor Green
Write-Host "then run scripts\windows\build.ps1" -ForegroundColor Green
