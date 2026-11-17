# Adds up the memory of every process of each browser. Open the same tabs in each browser first, wait 2 minutes, then run:
#   powershell -ExecutionPolicy Bypass -File tools\measure-memory.ps1 -Names "GX Lite","thorium"
param([string[]]$Names = @("GX Lite", "thorium"))
foreach ($n in $Names) {
  $p = @(Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -like "*$n*" })
  if ($p.Count -eq 0) { Write-Host ("{0,-12} not running" -f $n); continue }
  $private = ($p | Measure-Object PrivateMemorySize64 -Sum).Sum / 1MB
  $ws = ($p | Measure-Object WorkingSet64 -Sum).Sum / 1MB
  Write-Host ("{0,-12} {1,3} processes   private {2,7:N0} MB   working set {3,7:N0} MB" -f $n, $p.Count, $private, $ws)
}
