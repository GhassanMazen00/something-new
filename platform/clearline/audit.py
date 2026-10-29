"""The activity log. Each entry carries a hash of the one before it, so a deleted or edited entry breaks the chain."""

import hashlib

from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import Activity, User, now


def _digest(prev: str, at: str, user: str, client: int | None, action: str) -> str:
    return hashlib.sha256(f'{prev}|{at}|{user}|{client}|{action}'.encode()).hexdigest()


def log(db: Session, user: User | None, action: str, client_id: int | None = None) -> None:
    last = db.scalar(select(Activity).order_by(Activity.id.desc()).limit(1))
    prev = last.hash if last else '0' * 64
    at = now()
    name = user.name if user else 'System'
    db.add(Activity(at=at, user_id=user.id if user else None, user_name=name, client_id=client_id, action=action, prev_hash=prev, hash=_digest(prev, at.isoformat(), name, client_id, action)))
    db.commit()


def verify(db: Session) -> tuple[bool, int | None]:
    """True if the chain is intact; otherwise the id of the first entry that doesn't fit."""
    prev = '0' * 64
    for a in db.scalars(select(Activity).order_by(Activity.id)):
        if a.prev_hash != prev or a.hash != _digest(prev, a.at.isoformat(), a.user_name, a.client_id, a.action):
            return False, a.id
        prev = a.hash
    return True, None
