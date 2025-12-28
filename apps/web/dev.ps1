$port = 3001
Write-Host "Checking port $port..."
$tcp = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($tcp) {
    Write-Host "Killing process on port $port (PID: $($tcp.OwningProcess))..."
    Stop-Process -Id $tcp.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Port cleared."
}
else {
    Write-Host "Port $port is free."
}

Write-Host "Starting Next.js..."
cmd /c "next dev -p 3001 --hostname 0.0.0.0"
