@echo off
setlocal
echo ===================================================
echo   Silicon Trading - PERN Stack Launcher
echo   PostgreSQL + Express.js + React 19 + Node.js
echo ===================================================

cd /d "%~dp0"

echo [1/3] Preparing Database Schema...
call npm run db:setup --prefix backend

echo [2/3] Starting Backend Express API on port 5000...
start "Silicon Backend API (Port 5000)" cmd /c "cd backend && npm start"

echo [3/3] Starting Frontend React UI on port 8090...
start "Silicon Frontend UI (Port 8090)" cmd /c "cd frontend && npm run dev"

timeout /t 4 >nul
echo Opening application in browser...
start http://127.0.0.1:8090

echo Ready! Log in using test accounts:
echo   - Buyer:  user1 / 1234
echo   - Seller: user2 / 1234
echo   - Admin:  user3 / 1234
