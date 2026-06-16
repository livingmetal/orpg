@echo off
setlocal
cd /d "%~dp0"
title ORPG Host

REM ── One-click launcher for the ORPG host (used by ORPG-Host.exe too) ──

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js / npm not found. Install Node.js first: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [setup] Installing dependencies ^(first run^)...
  call npm install
  if errorlevel 1 ( echo [ERROR] npm install failed & pause & exit /b 1 )
)

if not exist ".next" (
  echo [setup] Building app ^(first run^)...
  call npm run build
  if errorlevel 1 ( echo [ERROR] build failed & pause & exit /b 1 )
)

echo.
echo [host] Starting ORPG host... ^(close this window to stop^)
echo.
call npm run host

echo.
echo [host] Server stopped.
pause
