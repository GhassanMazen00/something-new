"""Client files on disk, encrypted with the client's own key. Names on disk are random; real names stay in the database."""

import secrets

from . import config
from .security import client_cipher


def save(sealed_key: bytes | None, data: bytes) -> str:
    name = secrets.token_hex(16) + '.bin'
    (config.FILES_DIR / name).write_bytes(client_cipher(sealed_key).encrypt(data))
    return name


def load(sealed_key: bytes | None, name: str) -> bytes:
    return client_cipher(sealed_key).decrypt((config.FILES_DIR / name).read_bytes())


def remove(name: str) -> None:
    path = config.FILES_DIR / name
    if path.exists():
        # Overwrite before deleting; the client key is destroyed too, which is what really protects the data.
        path.write_bytes(secrets.token_bytes(min(path.stat().st_size, 1 << 20)))
        path.unlink()
