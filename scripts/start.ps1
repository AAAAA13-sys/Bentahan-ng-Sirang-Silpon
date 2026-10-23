[CmdletBinding()]
param([switch]$NoBrowser, [int]$Port=8090, [string]$XamppPath='C:\xampp')
$ErrorActionPreference='Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$url = "http://127.0.0.1:$Port"
function Test-SiliconPort([string]$HostName,[int]$Number) {
    $client = New-Object Net.Sockets.TcpClient
    try { $task=$client.ConnectAsync($HostName,$Number); return ($task.Wait(600) -and $client.Connected) } catch { return $false } finally { $client.Dispose() }
}
function Get-SiliconIdentity {
    try {
        $response=Invoke-WebRequest "$url/health" -UseBasicParsing -TimeoutSec 3
        $data=$response.Content | ConvertFrom-Json
        return ($data.application -eq 'silicon-trading')
    } catch { return $false }
}
function Wait-SiliconPort([string]$HostName,[int]$Number) {
    $deadline=(Get-Date).AddSeconds(30)
    while ((Get-Date) -lt $deadline) {
        if (Test-SiliconPort $HostName $Number) { return }
        Start-Sleep -Milliseconds 300
    }
    throw "Service did not start on $HostName`:$Number. Check storage\logs and the XAMPP control panel."
}
if ($Port -lt 1024 -or $Port -gt 65535) { throw 'Choose a port between 1024 and 65535.' }
$lockName='Local\SiliconTrading-'+([BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($projectRoot))).Replace('-','').Substring(0,16))
$mutex=New-Object Threading.Mutex($false,$lockName)
$locked=$false
try {
    $locked=$mutex.WaitOne(45000)
    if (!$locked) { throw 'Another Silicon Trading startup is still running. Try again shortly.' }
    Set-Location -LiteralPath $projectRoot
    foreach ($file in @('.env','vendor/autoload.php')) { if (!(Test-Path -LiteralPath (Join-Path $projectRoot $file))) { throw "Missing $file. Complete first-time setup in README.md." } }
    $phpCommand=Get-Command php -ErrorAction SilentlyContinue
    $phpExe=if ($phpCommand) { $phpCommand.Source } else { Join-Path $XamppPath 'php\php.exe' }
    if (!(Test-Path -LiteralPath $phpExe)) { throw 'PHP was not found. Install XAMPP or add PHP to PATH.' }
    $infoText=& $phpExe (Join-Path $PSScriptRoot 'runtime.php') --info
    if ($LASTEXITCODE -ne 0) { throw 'Laravel could not load. Check PHP extensions and Composer dependencies.' }
    $info=$infoText | ConvertFrom-Json
    if (!$info.has_key) { throw 'APP_KEY is missing. Run php artisan key:generate once.' }
    if ($info.driver -notin @('mysql','mariadb')) { throw 'This launcher expects DB_CONNECTION=mysql or mariadb in .env.' }
    if (!(Test-SiliconPort $info.host $info.port)) {
        if ($info.host -notin @('127.0.0.1','localhost','::1') -or $info.port -ne 3306) { throw 'The configured database is offline. Start that database and try again; only local XAMPP on port 3306 is auto-started.' }
        $mysqlExe=Join-Path $XamppPath 'mysql\bin\mysqld.exe'
        $mysqlIni=Join-Path $XamppPath 'mysql\bin\my.ini'
        if (!(Test-Path -LiteralPath $mysqlExe) -or !(Test-Path -LiteralPath $mysqlIni)) { throw 'XAMPP MySQL was not found. Start MySQL manually or pass -XamppPath to scripts\start.ps1.' }
        Write-Host 'Starting local XAMPP MySQL...'
        Start-Process -FilePath $mysqlExe -ArgumentList ('--defaults-file="'+$mysqlIni+'"'),'--bind-address=127.0.0.1' -WindowStyle Hidden | Out-Null
        Wait-SiliconPort $info.host $info.port
    }
    & $phpExe (Join-Path $PSScriptRoot 'runtime.php')
    if ($LASTEXITCODE -ne 0) { throw 'Database preflight failed. Startup never resets or reseeds your data.' }
    if (Test-SiliconPort '127.0.0.1' $Port) {
        if (!(Get-SiliconIdentity)) { throw "Port $Port is occupied by another app or an unhealthy instance. Close that instance or use -Port with an unused port." }
        Write-Host "Silicon Trading is already running at $url"
    } else {
        $public=Join-Path $projectRoot 'public'
        $router=Join-Path $projectRoot 'vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php'
        $arguments=@('-S',"127.0.0.1:$Port",'-t',('"'+$public+'"'),('"'+$router+'"'))
        $process=Start-Process -FilePath $phpExe -ArgumentList $arguments -WorkingDirectory $public -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot "storage\logs\server-$Port.log") -RedirectStandardError (Join-Path $projectRoot "storage\logs\server-$Port-error.log") -PassThru
        @{ pid=$process.Id; project=$projectRoot; port=$Port } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $projectRoot "storage\app\local-server-$Port.json") -Encoding ASCII
        $deadline=(Get-Date).AddSeconds(30)
        while (!(Get-SiliconIdentity)) {
            if ((Get-Date) -gt $deadline -or $process.HasExited) { throw 'The web server did not become ready. Check storage\logs\server-error.log.' }
            Start-Sleep -Milliseconds 300
        }
        Write-Host "Silicon Trading is ready at $url"
    }
    if (!$NoBrowser) { Start-Process $url }
} finally {
    if ($locked) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
