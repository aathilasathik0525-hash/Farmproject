@echo off
TITLE FarmDirect - Development Launcher (SIH26033)
echo ========================================================
echo   Starting FarmDirect Full-Stack Platform...
echo ========================================================
echo.

echo 1. Starting Backend Server on http://localhost:5000/api...
start "FarmDirect Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 2. Starting Frontend Web App on http://localhost:5173...
start "FarmDirect Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   FarmDirect is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000/api
echo ========================================================
