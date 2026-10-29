"""Passwords, two-step codes, sessions and encryption.

Two layers of keys: a master key in the data folder, and one data key per client, kept encrypted with the
master key. Files, results and report text are encrypted with the client's key, so destroying that one key
makes everything belonging to the client unreadable, including any copies in old backups.
"""

import base64
import hashlib
import io
import secrets
from datetime import timedelta

import pyotp
import qrcode
import qrcode.image.svg
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from cryptography.fernet import Fernet, InvalidToken
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from . import config
from .db import now

_hasher = PasswordHasher()
_master: Fernet | None = None


def master() -> Fernet:
    global _master
    if _master is None:
        path = config.MASTER_KEY_PATH
        if not path.exists():
            config.ensure_dirs()
            path.write_bytes(Fernet.generate_key())
        _master = Fernet(path.read_bytes().strip())
    return _master


def seal(data: bytes) -> bytes:
    return master().encrypt(data)


def unseal(token: bytes) -> bytes:
    return master().decrypt(token)


# ---------- Per-client keys ----------


def new_client_key() -> bytes:
    return seal(Fernet.generate_key())


def client_cipher(sealed_key: bytes | None) -> Fernet:
    if not sealed_key:
        raise PermissionError('This client’s data has been deleted.')
    return Fernet(unseal(sealed_key))


def encrypt_text(sealed_key: bytes | None, text: str) -> bytes:
    return client_cipher(sealed_key).encrypt(text.encode())


def decrypt_text(sealed_key: bytes | None, token: bytes | None) -> str:
    if not token:
        return ''
    try:
        return client_cipher(sealed_key).decrypt(token).decode()
    except (InvalidToken, PermissionError):
        return ''


# ---------- Passwords ----------


def hash_password(pw: str) -> str:
    return _hasher.hash(pw)


def check_password(hashed: str, pw: str) -> bool:
    try:
        return _hasher.verify(hashed, pw)
    except VerifyMismatchError:
        return False
    except Exception:  # noqa: BLE001 - malformed hash
        return False


def password_problem(pw: str) -> str | None:
    if len(pw) < 10:
        return 'Use at least 10 characters.'
    if pw.lower() == pw or pw.upper() == pw or not any(c.isdigit() for c in pw):
        return 'Mix upper and lower case letters with at least one number.'
    return None


def temp_password() -> str:
    return 'Cl-' + secrets.token_urlsafe(9)


# ---------- Two-step codes (authenticator apps) ----------


def new_totp_secret() -> bytes:
    return seal(pyotp.random_base32().encode())


def totp_uri(sealed_secret: bytes, email: str) -> str:
    return pyotp.TOTP(unseal(sealed_secret).decode()).provisioning_uri(name=email, issuer_name='Clearline')


def totp_qr_svg(uri: str) -> str:
    img = qrcode.make(uri, image_factory=qrcode.image.svg.SvgPathImage, box_size=8, border=2)
    buf = io.BytesIO()
    img.save(buf)
    return buf.getvalue().decode()


def totp_plain(sealed_secret: bytes) -> str:
    return unseal(sealed_secret).decode()


def check_totp(sealed_secret: bytes | None, code: str) -> bool:
    if not sealed_secret or not code or not code.isdigit():
        return False
    return pyotp.TOTP(unseal(sealed_secret).decode()).verify(code, valid_window=1)


# ---------- Sessions ----------


def new_session_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    return token, hash_token(token)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def session_expiry():
    return now() + timedelta(hours=config.SESSION_HOURS)


# Short-lived proof that the password step passed, carried to the code step.
def _signer() -> URLSafeTimedSerializer:
    master()
    secret = hashlib.sha256(b'clearline-login' + config.MASTER_KEY_PATH.read_bytes()).hexdigest()
    return URLSafeTimedSerializer(secret, salt='login-step')


def pending_token(user_id: int) -> str:
    return _signer().dumps({'u': user_id})


def read_pending(token: str, max_age: int = 300) -> int | None:
    try:
        return int(_signer().loads(token, max_age=max_age)['u'])
    except (BadSignature, SignatureExpired, KeyError, ValueError):
        return None


def b64(data: bytes) -> str:
    return base64.b64encode(data).decode()
