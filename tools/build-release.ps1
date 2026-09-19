$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$moduleRoot = Split-Path $PSScriptRoot -Parent
$manifest = Get-Content -LiteralPath (Join-Path $moduleRoot 'module.json') -Raw | ConvertFrom-Json
if ($manifest.id -notmatch '^[a-z0-9-]+$' -or $manifest.version -notmatch '^[0-9A-Za-z._-]+$') { throw 'Invalid package id or version.' }
foreach ($entry in @($manifest.esmodules) + @($manifest.scripts) + @($manifest.styles)) {
    if ($null -eq $entry) { continue }
    $relative = if ($entry -is [string]) { $entry } else { $entry.src }
    if (!$relative -or !(Test-Path -LiteralPath (Join-Path $moduleRoot $relative))) { throw "Missing declared file: $relative" }
}
$locks = @()
$zip = $null
$tempZip = $null
try {
    foreach ($pack in $manifest.packs) {
        $packPath = Join-Path $moduleRoot $pack.path
        if (!(Test-Path -LiteralPath (Join-Path $packPath 'CURRENT'))) { throw "Missing pack: $($pack.path)" }
        $lockPath = Join-Path $packPath 'LOCK'
        if (Test-Path -LiteralPath $lockPath) {
            try { $locks += [IO.File]::Open($lockPath, 'Open', 'Read', 'None') }
            catch { throw "Pack is in use. Shut down the Foundry world before packaging: $($pack.path)" }
        }
    }
    $outputDir = Join-Path $moduleRoot 'dist'
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
    $tempZip = Join-Path $outputDir (([guid]::NewGuid().ToString()) + '.zip')
    $targetZip = Join-Path $outputDir "$($manifest.id)-$($manifest.version).zip"
    $zip = [IO.Compression.ZipFile]::Open($tempZip, 'Create')
    $files = @(Get-Item -LiteralPath (Join-Path $moduleRoot 'module.json'))
    foreach ($folder in 'scripts','styles','images','packs','lang') {
        $folderPath = Join-Path $moduleRoot $folder
        if (Test-Path -LiteralPath $folderPath) { $files += Get-ChildItem -LiteralPath $folderPath -Recurse -File }
    }
    foreach ($file in $files) {
        if ($file.Name -in @('LOCK','LOG','LOG.old')) { continue }
        $relative = $file.FullName.Substring($moduleRoot.Length + 1).Replace('\','/')
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relative, 'Optimal') | Out-Null
    }
    $zip.Dispose(); $zip = $null
    $check = [IO.Compression.ZipFile]::OpenRead($tempZip)
    try { if (!$check.GetEntry('module.json')) { throw 'Archive has no root module.json.' } }
    finally { $check.Dispose() }
    Move-Item -LiteralPath $tempZip -Destination $targetZip -Force
    Copy-Item -LiteralPath (Join-Path $moduleRoot 'module.json') -Destination (Join-Path $outputDir 'module.json') -Force
    Write-Output "Built: $targetZip"
    if (!$manifest.manifest -or !$manifest.download) { Write-Warning 'Publication URLs are missing. Add them and rebuild before publishing.' }
}
finally {
    if ($zip) { $zip.Dispose() }
    foreach ($handle in $locks) { $handle.Dispose() }
    if ($tempZip -and (Test-Path -LiteralPath $tempZip)) { Remove-Item -LiteralPath $tempZip }
}


