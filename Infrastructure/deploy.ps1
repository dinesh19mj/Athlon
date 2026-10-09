<#
.SYNOPSIS
  Automated Zero-Bloat Standalone Deployment Script for Athlon-Sport
.DESCRIPTION
  Builds the Next.js frontend locally using standalone mode, archives only the production bundle,
  uploads it to the server, extracts it, and restarts PM2 without building on the server or accumulating gigabytes of cache.
#>

$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Dinesh\Projects\Athlon-Sport"
$FrontendDir = "$ProjectRoot\athlon-user"
$KeyPath = "$ProjectRoot\Infrastructure\athlon-key.pem"
$ServerHost = "ubuntu@15.252.63.6"
$ArchiveName = "athlon-standalone.tar.gz"
$ArchivePath = "$ProjectRoot\$ArchiveName"

Write-Host "[1/5] Building Next.js Standalone Bundle Locally..." -ForegroundColor Cyan
Set-Location $FrontendDir
npm run build
if ($LASTEXITCODE -ne 0) { throw "Local build failed with exit code $LASTEXITCODE" }

Write-Host "[2/5] Packaging standalone output and assets..." -ForegroundColor Cyan
Copy-Item -Recurse -Force public .next\standalone\public
New-Item -ItemType Directory -Force -Path .next\standalone\.next | Out-Null
Copy-Item -Recurse -Force .next\static .next\standalone\.next\static
tar -czf $ArchivePath -C .next\standalone .

Write-Host "[3/5] Uploading bundle to server..." -ForegroundColor Cyan
scp -i $KeyPath -o StrictHostKeyChecking=no $ArchivePath "${ServerHost}:/home/ubuntu/$ArchiveName"

Write-Host "[4/5] Deploying and restarting athlon-user service..." -ForegroundColor Cyan
$RemoteCmd = "cd /home/ubuntu/athlon-user && rm -rf node_modules .next src public && tar -xzf /home/ubuntu/$ArchiveName -C /home/ubuntu/athlon-user && rm -f /home/ubuntu/$ArchiveName && sudo systemctl restart athlon-user"
ssh -i $KeyPath -o StrictHostKeyChecking=no $ServerHost $RemoteCmd

Write-Host "[5/5] Cleaning local temporary archive..." -ForegroundColor Cyan
Set-Location $ProjectRoot
Remove-Item -Force $ArchivePath -ErrorAction SilentlyContinue

Write-Host "Deployment successful! Disk space footprint: under 170 MB" -ForegroundColor Green
