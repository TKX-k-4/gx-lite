# GX Lite terminal start-up (Windows): runs opencode, offering to install it first if it is missing.
$extra = @("$env:APPDATA\npm", "$env:USERPROFILE\scoop\shims", "$env:ProgramData\chocolatey\bin", "$env:USERPROFILE\.opencode\bin")
$env:Path = ($extra -join ';') + ';' + $env:Path

if (-not (Get-Command opencode -ErrorAction SilentlyContinue)) {
  Write-Host "opencode is not installed yet."
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    $answer = Read-Host "Install it now with npm (npm install -g opencode-ai)? [Y/n]"
    if ($answer -match '^[nN]') { Write-Host "Skipped."; return }
    npm install -g opencode-ai
    $env:Path = "$env:APPDATA\npm;" + $env:Path
  } else {
    Write-Host "Node.js (it includes npm) is needed first. Install the LTS version from https://nodejs.org,"
    Write-Host "then press Restart in this panel."
    Write-Host "Other ways: scoop install opencode, choco install opencode, or WSL (the opencode team recommends WSL on Windows)."
    return
  }
}

if (Get-Command opencode -ErrorAction SilentlyContinue) {
  opencode @args
} else {
  Write-Host "opencode was installed but is not on the PATH yet. Close this panel, open it again, or check your PATH."
}
