# ============================================================
#  start-all.ps1 - Khoi dong toan bo he thong STTN Recommend
#  Chay: .\start-all.ps1  (tu thu muc sttn-recommend)
# ============================================================

$root = $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   STTN Recommend - Khoi dong he thong  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ---------- 1. Backend (Node/Express :4000) ----------
Write-Host "[1/3] Khoi dong Backend  (http://localhost:4000)..." -ForegroundColor Yellow
$backendCmd = "Set-Location '$root\backend'; Write-Host '--- BACKEND (:4000) ---' -ForegroundColor Yellow; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $backendCmd

Start-Sleep -Seconds 3

# ---------- 2. Frontend (Vite :5173) ----------
Write-Host "[2/3] Khoi dong Frontend (http://localhost:5173)..." -ForegroundColor Green
$frontendCmd = "Set-Location '$root\frontend'; Write-Host '--- FRONTEND (:5173) ---' -ForegroundColor Green; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $frontendCmd

Start-Sleep -Seconds 2

# ---------- 3. ML Service (FastAPI :8001) ----------
Write-Host "[3/3] Khoi dong ML Service (http://localhost:8001)..." -ForegroundColor Magenta

$venvActivate = "$root\ml-service\venv\Scripts\Activate.ps1"

if (Test-Path $venvActivate) {
    $mlCmd = "`$env:PYTHONIOENCODING='utf-8'; Set-Location '$root\ml-service'; Write-Host '--- ML SERVICE (:8001) ---' -ForegroundColor Magenta; & '$venvActivate'; python -m uvicorn app:app --reload --port 8001"
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $mlCmd
}
else {
    Write-Host "  [!] Khong tim thay venv. Chay bang python he thong..." -ForegroundColor Red
    $mlCmd = "`$env:PYTHONIOENCODING='utf-8'; Set-Location '$root\ml-service'; Write-Host '--- ML SERVICE (:8001) ---' -ForegroundColor Magenta; python -m uvicorn app:app --reload --port 8001"
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $mlCmd
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Da khoi dong 3 cua so Terminal rieng biet!" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend   -> http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend    -> http://localhost:4000" -ForegroundColor Yellow
Write-Host "  ML Service -> http://localhost:8001" -ForegroundColor Magenta
Write-Host ""
Write-Host "  (De dung: Dong ca 3 cua so Terminal tren)" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
