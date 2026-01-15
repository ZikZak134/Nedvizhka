param(
    [string]$Command
)

# --- Configuration ---
$Root = $PSScriptRoot
$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "EstateAnalytics Management Script (Windows)" -ForegroundColor Cyan
    Write-Host "Root: $Root" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Usage: .\manage.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  install    - Install Backend and Frontend dependencies"
    Write-Host "  api-dev    - Run Backend (FastAPI)"
    Write-Host "  web-dev    - Run Frontend (Next.js)"
    Write-Host "  verify     - Run Full Verification (Lint, Typecheck, Test)"
    Write-Host "  ui-smoke   - Run Playwright UI Smoke Test"
    Write-Host "  clean      - Remove temporary files"
}

if (-not $Command) {
    Show-Help
    exit
}

Write-Host "Project Root: $Root" -ForegroundColor DarkGray

try {
    switch ($Command) {
        "install" {
            Write-Host "Installing Backend..." -ForegroundColor Green
            Set-Location "$Root\apps\api"
            pip install -e ".[test]"
            
            Write-Host "Installing Frontend..." -ForegroundColor Green
            Set-Location "$Root\apps\web"
            npm install
        }
        "api-dev" {
            Set-Location "$Root\apps\api"
            powershell -ExecutionPolicy Bypass -File ./dev.ps1
        }
        "web-dev" {
            Set-Location "$Root\apps\web"
            powershell -ExecutionPolicy Bypass -File ./dev.ps1
        }
        "verify" {
            Write-Host "--- VERIFICATION START ---" -ForegroundColor Cyan
            
            # Backend Verification
            Set-Location "$Root\apps\api"
            Write-Host "[1/4] Backend Linting (ruff)..."
            ruff check .
            Write-Host "[2/4] Backend Typecheck (mypy)..."
            mypy .
            Write-Host "[3/4] Backend Tests (pytest)..."
            pytest
            
            # Frontend Verification
            Set-Location "$Root\apps\web"
            Write-Host "[4/4] Frontend Linting..."
            npm run lint
            
            Write-Host "--- VERIFICATION PASSED ---" -ForegroundColor Green
        }
        "ui-smoke" {
            Set-Location "$Root\apps\web"
            Write-Host "Running UI Smoke Test..."
            if (Test-Path "tests/smoke.spec.ts") {
                npx playwright test tests/smoke.spec.ts
            }
            else {
                Write-Host "Smoke test file not found. Please create apps/web/tests/smoke.spec.ts" -ForegroundColor Yellow
            }
        }
        "clean" {
            Set-Location $Root
            Get-ChildItem -Recurse -Include __pycache__, .pytest_cache, .mypy_cache | Remove-Item -Recurse -Force
            Write-Host "Cleaned."
        }
        Default {
            Show-Help
        }
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
