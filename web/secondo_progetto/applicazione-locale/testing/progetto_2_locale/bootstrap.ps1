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

function Get-PythonInstallerInfo {
    $version = '3.12.10'

    if (-not [Environment]::Is64BitOperatingSystem) {
        return [pscustomobject]@{
            Version = $version
            Architecture = 'x86'
            FileName = "python-$version.exe"
        }
    }

    $isArm64 = ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') -or
               ($env:PROCESSOR_IDENTIFIER -match 'ARM64')
    if ($isArm64) {
        return [pscustomobject]@{
            Version = $version
            Architecture = 'arm64'
            FileName = "python-$version-arm64.exe"
        }
    }

    return [pscustomobject]@{
        Version = $version
        Architecture = 'amd64'
        FileName = "python-$version-amd64.exe"
    }
}

function Install-PrivatePython {
    $info = Get-PythonInstallerInfo
    $url = "https://www.python.org/ftp/python/$($info.Version)/$($info.FileName)"
    $installer = Join-Path $Downloads $info.FileName
    $installerLog = Join-Path $Runtime 'logs\python-installer.log'
    $target = Join-Path $Tools 'python-3.12'

    Write-Step "Python 3.12 non trovato: download e installazione privata nella cartella del progetto..."
    Add-Content -Path $BootstrapLog -Value "Sistema: Windows $([Environment]::OSVersion.Version); architettura: $($info.Architecture); destinazione: $target"

    # Un file parziale può rimanere dopo un download interrotto.
    if (Test-Path $installer) {
        $size = (Get-Item $installer).Length
        if ($size -lt 10MB) {
            Remove-Item -Force $installer
        }
    }

    if (-not (Test-Path $installer)) {
        Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $installer
    }

    # Rimuove il blocco "file scaricato da Internet" quando presente.
    Unblock-File -Path $installer -ErrorAction SilentlyContinue

    # Elimina un'eventuale installazione locale incompleta.
    if (Test-Path $target) {
        Remove-Item -Recurse -Force $target
    }
    New-Item -ItemType Directory -Force -Path $target | Out-Null

    # Start-Process unisce gli array di ArgumentList in una stringa e può perdere
    # le virgolette esterne. Usiamo quindi una singola stringa con virgolette
    # esplicite: è indispensabile quando il progetto è in una cartella con spazi.
    $argumentString = @(
        '/quiet',
        'InstallAllUsers=0',
        ('TargetDir="{0}"' -f $target),
        'PrependPath=0',
        'Include_launcher=0',
        'Include_pip=1',
        'Include_tools=1',
        'Include_test=0',
        'Include_doc=0',
        'Include_tcltk=0',
        'Shortcuts=0',
        'Include_dev=1',
        ('/log "{0}"' -f $installerLog)
    ) -join ' '

    $process = Start-Process -FilePath $installer -ArgumentList $argumentString -Wait -PassThru
    if ($process.ExitCode -ne 0) {
        throw "Installazione privata di Python non riuscita. Codice: $($process.ExitCode). Log: $installerLog"
    }

    Start-Sleep -Milliseconds 500

    $localPython = Join-Path $target 'python.exe'
    $python = Test-PythonExecutable -Executable $localPython
    if (-not $python) {
        # Secondo controllo sulle posizioni standard, nel caso l'installer abbia
        # scelto una cartella utente nonostante TargetDir.
        $python = Find-Python
    }
    if (-not $python) {
        throw "Python è stato scaricato ma non risulta eseguibile. Consultare: $installerLog"
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
