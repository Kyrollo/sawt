@echo off
title Sawt - Arabic Speech QA
cls
echo ========================================================
echo       Sawt - Arabic Speech QA & Dialect Analytics
echo ========================================================
echo.
echo [1/3] Checking dependencies...
python -c "import uvicorn, fastapi" 2>nul || pip install fastapi uvicorn
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend && npm install && cd ..
)

echo [2/3] Starting Backend API (Port 8010)...
start "Sawt API (Port 8010)" cmd /k "cd /d %~dp0backend && python -m uvicorn src.sawt.main:app --port 8010 --reload"

echo [3/3] Starting Frontend UI (Port 3010)...
start "Sawt UI (Port 3010)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul
start http://localhost:3010
echo.
echo Sawt is running!
echo   Frontend : http://localhost:3010
echo   Backend  : http://localhost:8010/docs
echo.
echo Press any key to stop all Sawt processes...
pause >nul
taskkill /fi "WINDOWTITLE eq Sawt API*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq Sawt UI*" /f >nul 2>&1
echo Done.
