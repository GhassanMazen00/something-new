# Fetches the newest version of the Clearline workspace from GitHub before it starts.
# Run by start.bat. It never touches the data folder (clients, files, accounts) or the Python environment.
# If there is no internet, or anything goes wrong, the version already here starts as usual.

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Repo = 'GhassanMazen00/something-new'
$Branch = 'claude/gallant-goldberg-q9c9tr'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$VersionFile = Join-Path $Here 'version.txt'

# Never replaced: start.bat is running while this script runs, and Windows reads a running .bat file line by line.
$Keep = @('start.bat')

try {
    Write-Host '  Checking for a newer version...'
    $latest = (Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/commits/$Branch" -Headers @{ 'User-Agent' = 'clearline-updater' } -TimeoutSec 15).sha
    $current = if (Test-Path $VersionFile) { (Get-Content $VersionFile -Raw).Trim() } else { '' }
    if ($latest -eq $current) {
        Write-Host "  Up to date (version $($latest.Substring(0, 7)))."
        exit 0
    }

    Write-Host "  Downloading version $($latest.Substring(0, 7))..."
    $tmp = Join-Path ([IO.Path]::GetTempPath()) ("clearline-" + [Guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $tmp | Out-Null
    $zip = Join-Path $tmp 'latest.zip'
    Invoke-WebRequest -Uri "https://codeload.github.com/$Repo/zip/$latest" -OutFile $zip -TimeoutSec 300 -UseBasicParsing
    Expand-Archive -Path $zip -DestinationPath $tmp -Force
    $src = Get-ChildItem -Path $tmp -Directory | Select-Object -First 1
    $new = Join-Path $src.FullName 'platform'
    if (-not (Test-Path (Join-Path $new 'clearline\__main__.py'))) { throw 'The download does not contain the workspace.' }

    $oldReq = if (Test-Path (Join-Path $Here 'requirements.txt')) { Get-Content (Join-Path $Here 'requirements.txt') -Raw } else { '' }

    # The program itself: replaced as a whole, so files removed upstream go too.
    robocopy (Join-Path $new 'clearline') (Join-Path $Here 'clearline') /MIR /NFL /NDL /NJH /NJS /NP /XD __pycache__ | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "Copying the program failed (robocopy code $LASTEXITCODE)." }
    robocopy (Join-Path $new 'samples') (Join-Path $Here 'samples') /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
    # Loose files next to it: instructions, setup, the list of libraries, this updater.
    Get-ChildItem -Path $new -File | Where-Object { $Keep -notcontains $_.Name } | ForEach-Object {
        Copy-Item $_.FullName -Destination (Join-Path $Here $_.Name) -Force
    }

    $newReq = Get-Content (Join-Path $Here 'requirements.txt') -Raw
    $py = Join-Path $Here '.venv\Scripts\python.exe'
    if ($newReq -ne $oldReq -and (Test-Path $py)) {
        Write-Host '  This version needs new analysis libraries. Installing them (a few minutes)...'
        & $py -m pip install -r (Join-Path $Here 'requirements.txt') --quiet
        if ($LASTEXITCODE -ne 0) { throw 'Installing the new libraries failed. Run setup.bat once.' }
    }

    Set-Content -Path $VersionFile -Value $latest -NoNewline
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    Write-Host "  Updated to version $($latest.Substring(0, 7))."
}
catch {
    Write-Host "  Couldn't update ($($_.Exception.Message)). Starting the version you have."
}
exit 0
