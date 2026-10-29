@echo off
rem One-time setup on Windows: makes a private Python environment in this folder and installs what the app needs.
setlocal
cd /d "%~dp0"
echo.
echo   Clearline workspace - setup
echo   ---------------------------
set "PY="
for %%V in (3.12 3.13 3.11) do (
  if not defined PY (
    py -%%V -c "import sys" >nul 2>nul && set "PY=py -%%V"
  )
)
if not defined PY (
  python -c "import sys; sys.exit(0 if (3,11) <= sys.version_info[:2] <= (3,13) else 1)" >nul 2>nul && set "PY=python"
)
if not defined PY (
  echo   Python 3.11, 3.12 or 3.13 is needed and was not found.
  echo   Install Python 3.12 from https://www.python.org/downloads/windows/
  echo   and tick "Add python.exe to PATH" on the first screen. Then run setup.bat again.
  echo.
  pause
  exit /b 1
)
echo   Using %PY%
if not exist .venv\Scripts\python.exe (
  %PY% -m venv .venv || goto :failed
)
.venv\Scripts\python -m pip install --upgrade pip --quiet || goto :failed
echo   Installing the analysis libraries. This takes a few minutes the first time...
.venv\Scripts\python -m pip install -r requirements.txt --quiet || goto :failed
.venv\Scripts\python -c "import clearline.app" || goto :failed
echo.
echo   Done. Double-click start.bat to open the workspace.
echo.
pause
exit /b 0

:failed
echo.
echo   Setup stopped with an error (see above). Check the internet connection and run setup.bat again.
echo.
pause
exit /b 1
