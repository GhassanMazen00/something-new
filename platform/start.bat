@echo off
rem Starts the workspace and opens it in the browser. Keep this window open while you work.
rem Each start first fetches the newest version from GitHub (update.ps1); client data is never touched.
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
  echo   Run setup.bat first.
  pause
  exit /b 1
)
if exist update.ps1 powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update.ps1"
.venv\Scripts\python -m clearline %*
pause
