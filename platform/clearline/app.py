"""The web app: the API plus the workspace screens, served from this computer only."""

from __future__ import annotations

import threading
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse

from . import ai, config, db
from .api import api, retention_sweep

SAFE = {'GET', 'HEAD', 'OPTIONS'}
CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"


def _sweeper(stop: threading.Event) -> None:
    while not stop.wait(3600):
        _sweep_once()


def _sweep_once() -> None:
    s = db.SessionLocal()
    try:
        retention_sweep(s)
    finally:
        s.close()


def create_app(database_url: str | None = None) -> FastAPI:
    db.init(database_url)

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        _sweep_once()
        stop = threading.Event()
        threading.Thread(target=_sweeper, args=(stop,), daemon=True).start()
        yield
        stop.set()

    app = FastAPI(title='Clearline workspace', docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)

    @app.middleware('http')
    async def guard(request: Request, call_next):
        # Changes must come from our own screens: a page on another site can't add this header.
        if request.url.path.startswith('/api/') and request.method not in SAFE and request.headers.get('x-clearline') != '1':
            return JSONResponse({'detail': 'Request blocked.'}, status_code=403)
        t0 = time.perf_counter()
        response = await call_next(request)
        response.headers['Content-Security-Policy'] = CSP
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Referrer-Policy'] = 'no-referrer'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
        if request.url.path.startswith('/api/'):
            response.headers['Cache-Control'] = 'no-store'
        response.headers['Server-Timing'] = f'app;dur={(time.perf_counter() - t0) * 1000:.0f}'
        return response

    app.include_router(api)

    @app.get('/api/ai/status')
    def ai_status():
        return ai.status()

    @app.get('/api/{rest:path}')
    def api_missing(rest: str):
        return JSONResponse({'detail': 'Not found.'}, status_code=404)

    static = config.STATIC_DIR.resolve()

    @app.api_route('/{path:path}', methods=['GET', 'HEAD'])
    def screens(path: str):
        target = (static / path).resolve()
        if path and target.is_file() and static in target.parents:
            return FileResponse(target)
        index = static / 'index.html'
        if index.exists():
            return FileResponse(index, headers={'Cache-Control': 'no-cache'})
        return PlainTextResponse('The screens haven’t been built yet. Run: npm run build:platform', status_code=503)

    return app
