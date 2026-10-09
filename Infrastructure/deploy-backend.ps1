<#
.SYNOPSIS
  Backend Services Deployment Script for Athlon-Sport
.DESCRIPTION
  Uploads built Spring Boot microservice JARs to the production server and restarts their systemd services.
#>

param (
    [string[]]$Services = @("GATEWAYSERVICE", "IDENTITYSERVICE", "MARKETPLACESERVICE", "TOURNAMENTSERVICE", "AUTHSERVICE")
)

$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Dinesh\Projects\Athlon-Sport"
$KeyPath = "$ProjectRoot\Infrastructure\athlon-key.pem"
$ServerHost = "ubuntu@15.252.63.6"
$RemoteServicesDir = "/home/ubuntu/services"

$ServiceMap = @{
    "GATEWAYSERVICE"     = "gatewayservice"
    "IDENTITYSERVICE"    = "identityservice"
    "MARKETPLACESERVICE" = "marketplaceservice"
    "TOURNAMENTSERVICE"  = "tournamentservice"
    "AUTHSERVICE"        = "authservice"
    "PAYMENTSERVICE"     = "paymentservice"
}

Write-Host "=== Athlon-Sport Backend Deployment ===" -ForegroundColor Cyan
Write-Host "Target services: $($Services -join ', ')" -ForegroundColor Yellow

foreach ($svc in $Services) {
    $jarPath = "$ProjectRoot\ATHLON\$svc\build\libs\$svc-0.0.1-SNAPSHOT.jar"
    if (-not (Test-Path $jarPath)) {
        Write-Warning "JAR not found: $jarPath. Building with Gradle..."
        Set-Location "$ProjectRoot\ATHLON"
        .\gradlew.bat ":$svc:bootJar"
        if ($LASTEXITCODE -ne 0) { throw "Gradle build failed for $svc" }
    }

    $systemdName = $ServiceMap[$svc]
    Write-Host "`n[Uploading] $svc-0.0.1-SNAPSHOT.jar -> $RemoteServicesDir..." -ForegroundColor Cyan
    scp -i $KeyPath -o StrictHostKeyChecking=no $jarPath "${ServerHost}:${RemoteServicesDir}/$svc-0.0.1-SNAPSHOT.jar"
    if ($LASTEXITCODE -ne 0) { throw "SCP failed for $svc" }

    Write-Host "[Restarting] $systemdName.service..." -ForegroundColor Cyan
    ssh -i $KeyPath -o StrictHostKeyChecking=no $ServerHost "sudo systemctl restart $systemdName"
    if ($LASTEXITCODE -ne 0) { throw "Service restart failed for $systemdName" }

    Write-Host "[Verifying] $systemdName.service status..." -ForegroundColor Green
    ssh -i $KeyPath -o StrictHostKeyChecking=no $ServerHost "sudo systemctl is-active $systemdName"
}

Write-Host "`n=== All specified backend services successfully deployed and restarted! ===" -ForegroundColor Green
