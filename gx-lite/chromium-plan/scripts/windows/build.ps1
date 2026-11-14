param([string]$Root = "C:\src")
$ErrorActionPreference = "Stop"
$env:PATH = "$Root\depot_tools;" + $env:PATH
$env:DEPOT_TOOLS_WIN_TOOLCHAIN = "0"
$repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$src = "$Root\chromium\src"
Set-Location $src
New-Item -ItemType Directory -Force "out\Release" | Out-Null
Get-Content "$repo\config\args.common.gn" | Set-Content "out\Release\args.gn"
Add-Content "out\Release\args.gn" 'target_cpu = "x64"'
gn gen out\Release
autoninja -C out\Release chrome
Write-Host "Built. Run: $src\out\Release\chrome.exe" -ForegroundColor Green
