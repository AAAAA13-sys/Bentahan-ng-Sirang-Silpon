param([int]$Port=8090)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$statePath=Join-Path $projectRoot "storage\app\local-server-$Port.json"
if (!(Test-Path -LiteralPath $statePath)) { Write-Host 'No launcher-owned server to stop.'; exit 0 }
$state=Get-Content -Raw -LiteralPath $statePath | ConvertFrom-Json
if ($state.project -ne $projectRoot) { throw 'The server record belongs to another project.' }
$process=Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$state.pid)" -ErrorAction SilentlyContinue
$public=Join-Path $projectRoot 'public'
if ($process) {
    if ($process.Name -ne 'php.exe' -or !$process.CommandLine.Contains($public) -or !$process.CommandLine.Contains("127.0.0.1:$($state.port)")) { throw 'Process identity changed; no process was stopped.' }
    Stop-Process -Id ([int]$state.pid)
}
Remove-Item -LiteralPath $statePath
Write-Host 'Silicon Trading web server stopped. MySQL was left running for other apps.'
