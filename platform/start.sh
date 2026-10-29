#!/usr/bin/env sh
# Mac and Linux: sets up on first run, then starts the workspace.
set -e
cd "$(dirname "$0")"
if [ ! -x .venv/bin/python ]; then
  PY=$(command -v python3.12 || command -v python3.13 || command -v python3.11 || command -v python3)
  "$PY" -m venv .venv
  .venv/bin/python -m pip install --upgrade pip --quiet
  .venv/bin/python -m pip install -r requirements.txt --quiet
fi
exec .venv/bin/python -m clearline "$@"
