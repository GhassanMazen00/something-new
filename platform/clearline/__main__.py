"""Start the workspace: python -m clearline"""

import threading
import webbrowser

import uvicorn

from . import config
from .app import create_app


def main() -> None:
    url = f'http://{config.HOST}:{config.PORT}'
    print(f'\n  Clearline workspace is running at {url}\n  Your data folder: {config.DATA_DIR}\n  Keep this window open. Press Ctrl+C to stop.\n')
    threading.Timer(1.5, lambda: webbrowser.open(url)).start()
    uvicorn.run(create_app(), host=config.HOST, port=config.PORT, log_level='warning')


if __name__ == '__main__':
    main()
