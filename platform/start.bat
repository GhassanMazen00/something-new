@echo off
rem Starts the workspace and opens it in the browser. Keep this window open while you work.
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
  echo   Run setup.bat first.
  pause
  exit /b 1
)
.venv\Scripts\python -m clearline %*
pause
