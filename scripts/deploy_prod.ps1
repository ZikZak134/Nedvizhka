$Server = "root@217.199.254.119"
$Key = ".agent\keys\vm_key"
$Cmd = "cd ~/Nedvizhka && git fetch origin && git reset --hard origin/main && docker-compose -f docker-compose.prod.yml up -d --build --force-recreate"

Write-Host "🚀 Starting Deployment to $Server..." -ForegroundColor Cyan
Write-Host "Command: $Cmd" -ForegroundColor DarkGray

# Remove StrictHostKeyChecking for automation ease, but keep normal auth flow so password prompt appears if key fails
ssh -i $Key -o StrictHostKeyChecking=no $Server $Cmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment Command Sent Successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment Failed (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
    Write-Host "Tip: If key auth failed, you should have seen a password prompt." -ForegroundColor Yellow
}
