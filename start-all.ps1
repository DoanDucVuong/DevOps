# ============================================================
#  start-all.ps1  —  Khởi động toàn bộ hệ thống STTN Recommend
#  Chạy: .\start-all.ps1  (từ thư mục sttn-recommend)
# ============================================================

$root = $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   STTN Recommend — Khởi động hệ thống" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ---------- 1. Backend (Node/Express :4000) ----------
Write-Host "[1/3] Khởi động Backend  (http://localhost:4000)" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", `
    "cd '$root\backend'; Write-Host '--- BACKEND ---' -ForegroundColor Yellow; npm run dev"

Start-Sleep -Seconds 3   # đợi backend sẵn sàng trước

# ---------- 2. Frontend (Vite :5173) ----------
Write-Host "[2/3] Khởi động Frontend (http://localhost:5173)" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", `
    "cd '$root\frontend'; Write-Host '--- FRONTEND ---' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

# ---------- 3. ML Service (FastAPI :8001) ----------
Write-Host "[3/3] Khởi động ML Service (http://localhost:8001)" -ForegroundColor Magenta

$venvActivate = "$root\ml-service\venv\Scripts\Activate.ps1"

if (Test-Path $venvActivate) {
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", `
        "`$env:PYTHONIOENCODING='utf-8'; cd '$root\ml-service'; Write-Host '--- ML SERVICE ---' -ForegroundColor Magenta; & '$venvActivate'; python -m uvicorn app:app --reload --port 8001"
}
else {
    Write-Host "  [!] Không tìm thấy venv. Thử chạy bằng python hệ thống..." -ForegroundColor Red
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", `
        "`$env:PYTHONIOENCODING='utf-8'; cd '$root\ml-service'; Write-Host '--- ML SERVICE ---' -ForegroundColor Magenta; python -m uvicorn app:app --reload --port 8001"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  3 cửa sổ terminal đã được mở!" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend  -> http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend   -> http://localhost:4000" -ForegroundColor Yellow
Write-Host "  ML Service-> http://localhost:8001" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Để dừng: đóng cả 3 cửa sổ terminal." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
