"""Settings. Everything lives in one data folder next to the app unless CLEARLINE_DATA points elsewhere."""

import os
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get('CLEARLINE_DATA', APP_DIR.parent / 'data'))
FILES_DIR = DATA_DIR / 'files'
DB_PATH = DATA_DIR / 'clearline.db'
MASTER_KEY_PATH = DATA_DIR / 'master.key'
STATIC_DIR = APP_DIR / 'static'

# Only this computer can reach the app until it moves to a server.
HOST = os.environ.get('CLEARLINE_HOST', '127.0.0.1')
PORT = int(os.environ.get('CLEARLINE_PORT', '8000'))

SESSION_HOURS = 12
LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
RETENTION_DAYS = 30  # after the report is delivered
WORKING_DAYS = 60  # the longest a job can keep files before delivery, unless an admin extends it
MAX_UPLOAD_MB = 200

# The AI slot. Off until Claude is connected on a secure server.
AI_ENABLED = False


def ensure_dirs() -> None:
    FILES_DIR.mkdir(parents=True, exist_ok=True)
