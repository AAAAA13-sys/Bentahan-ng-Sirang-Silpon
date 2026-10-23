$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
& (Join-Path $root 'scripts\start.ps1') -NoBrowser
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw 'First startup failed.' }
$first=(Invoke-WebRequest 'http://127.0.0.1:8090/health' -UseBasicParsing).Content | ConvertFrom-Json
if ($first.application -ne 'silicon-trading' -or $first.database -ne 'connected') { throw 'Application is not ready.' }
$statePath=Join-Path $root 'storage\app\local-server-8090.json'
$firstPid=if (Test-Path $statePath) { (Get-Content -Raw $statePath | ConvertFrom-Json).pid } else { 0 }
& (Join-Path $root 'scripts\start.ps1') -NoBrowser
if ($firstPid -and (Get-Content -Raw $statePath | ConvertFrom-Json).pid -ne $firstPid) { throw 'Warm startup launched a duplicate server.' }
if ((Invoke-WebRequest 'http://127.0.0.1:8090/' -UseBasicParsing).StatusCode -ne 200) { throw 'Homepage failed.' }
Write-Host 'PASS: application readiness, homepage, and repeat startup without duplicate server.'
