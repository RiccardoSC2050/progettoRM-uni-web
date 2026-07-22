[CmdletBinding()]
param(
    [ValidateSet('start', 'stop', 'diagnostics')]
    [string]$Action = 'start'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
$Runtime = Join-Path $Root '.runtime'
$Tools = Join-Path $Runtime 'tools'
$Downloads = Join-Path $Runtime 'downloads'
$BootstrapLog = Join-Path $Runtime 'logs\bootstrap.log'
New-Item -ItemType Directory -Force -Path $Tools, $Downloads, (Split-Path $BootstrapLog) | Out-Null

function Write-Step([string]$Message) {
    Write-Host $Message -ForegroundColor Cyan
    Add-Content -Path $BootstrapLog -Value "[$(Get-Date -Format s)] $Message"
}

function Test-PythonExecutable {
    param(
        [Parameter(Mandatory = $true)][string]$Executable,
        [string[]]$PrefixArguments = @()
    )

    try {
        if (-not (Test-Path $Executable) -and -not (Get-Command $Executable -ErrorAction SilentlyContinue)) {
            return $null
        }
        $result = & $Executable @PrefixArguments -c "import sys; print('.'.join(map(str, sys.version_info[:3])))" 2>$null
        if ($LASTEXITCODE -ne 0 -or -not $result) {
            return $null
        }
        $version = [version]($result | Select-Object -Last 1)
        if ($version.Major -eq 3 -and $version.Minor -ge 12) {
            return [pscustomobject]@{
                Executable = $Executable
                PrefixArguments = $PrefixArguments
                Version = $version
            }
        }
    } catch {
        return $null
    }
    return $null
}

function Find-Python {
    $localPython = Join-Path $Tools 'python-3.12\python.exe'
    $candidates = @(
        @{ Exe = $localPython; Args = @() },
        @{ Exe = 'py.exe'; Args = @('-3.12') },
        @{ Exe = 'python.exe'; Args = @() },
        @{ Exe = (Join-Path $env:LOCALAPPDATA 'Programs\Python\Python312\python.exe'); Args = @() },
        @{ Exe = (Join-Path $env:ProgramFiles 'Python312\python.exe'); Args = @() }
    )

    foreach ($candidate in $candidates) {
        if ([string]::IsNullOrWhiteSpace($candidate.Exe)) { continue }
        $found = Test-PythonExecutable -Executable $candidate.Exe -PrefixArguments $candidate.Args
        if ($found) { return $found }
    }
    return $null
}

function Install-PrivatePython {
    $version = '3.12.10'
    $architecture = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'amd64' }
    $url = "https://www.python.org/ftp/python/$version/python-$version-$architecture.exe"
    $installer = Join-Path $Downloads "python-$version-$architecture.exe"
    $target = Join-Path $Tools 'python-3.12'

    Write-Step "Python 3.12 non trovato: download e installazione privata nella cartella del progetto..."
    if (-not (Test-Path $installer)) {
        Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $installer
    }

    New-Item -ItemType Directory -Force -Path $target | Out-Null
    $arguments = @(
        '/quiet',
        'InstallAllUsers=0',
        "TargetDir=`"$target`"",
        'PrependPath=0',
        'Include_launcher=0',
        'Include_pip=1',
        'Include_tools=1',
        'Include_test=0',
        'Include_doc=0',
        'Include_tcltk=0',
        'Shortcuts=0',
        'Include_dev=1'
    )
    $process = Start-Process -FilePath $installer -ArgumentList $arguments -Wait -PassThru
    if ($process.ExitCode -ne 0) {
        throw "Installazione privata di Python non riuscita. Codice: $($process.ExitCode)."
    }

    $python = Find-Python
    if (-not $python) {
        throw 'Python è stato scaricato ma non risulta eseguibile.'
    }
    return $python
}

try {
    Add-Content -Path $BootstrapLog -Value "`r`n=== NUOVA ESECUZIONE $(Get-Date -Format s) / $Action ==="
    $python = Find-Python

    if (-not $python) {
        if ($Action -eq 'stop') {
            Write-Host 'Python non è presente e non risultano runtime locali da arrestare.'
            exit 0
        }
        $python = Install-PrivatePython
    }

    Write-Step "Python disponibile: $($python.Version)"
    $invokeArguments = @()
    $invokeArguments += $python.PrefixArguments
    $invokeArguments += @("-m", "runtime_launcher.$Action")
    & $python.Executable @invokeArguments
    exit $LASTEXITCODE
} catch {
    $message = $_.Exception.Message
    Write-Host "`nERRORE DI PREPARAZIONE: $message" -ForegroundColor Red
    Add-Content -Path $BootstrapLog -Value "ERRORE: $message`r`n$($_.ScriptStackTrace)"
    Write-Host "Dettagli: $BootstrapLog"
    exit 1
}
