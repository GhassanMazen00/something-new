"""The web API the workspace talks to. Every client route checks that the signed-in person may see that client."""

from __future__ import annotations

import io
import json
import pickle
import threading
import time
from collections import OrderedDict
from datetime import timedelta

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Request, Response, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import audit, config, engine, intake, security, storage
from .engine.calendar import market_settings
from .db import Activity, Client, DataFile, LoginSession, ReportSection, Run, User, get_db, now

api = APIRouter(prefix='/api')
COOKIE = 'cl_session'

# ---------- Who is asking ----------


def current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(COOKIE)
    if not token:
        raise HTTPException(401, 'Sign in first.')
    s = db.get(LoginSession, security.hash_token(token))
    if not s or s.expires_at < now() or not s.user.active:
        raise HTTPException(401, 'Your session has ended. Sign in again.')
    return s.user


def admin_only(user: User = Depends(current_user)) -> User:
    if user.role != 'admin':
        raise HTTPException(403, 'Only an admin can do this.')
    return user


def visible(db: Session, user: User, client_id: int, write: bool = False) -> Client:
    c = db.get(Client, client_id)
    if not c or c.shredded:
        raise HTTPException(404, 'No such client.')
    if user.role == 'admin':
        return c
    allowed = c.analyst_id == user.id or (not write and c.reviewer_id == user.id)
    if not allowed:
        audit.log(db, user, f'Blocked: {user.name} tried to {"change" if write else "open"} {c.name}', c.id)
        raise HTTPException(403, 'This client isn’t assigned to you. The attempt has been logged.')
    return c


# ---------- First run and signing in ----------


class SetupIn(BaseModel):
    name: str
    email: str
    password: str


@api.get('/setup')
def setup_status(db: Session = Depends(get_db)):
    return {'needs_setup': db.scalar(select(User).limit(1)) is None, 'ai': config.AI_ENABLED}


@api.post('/setup')
def setup(body: SetupIn, db: Session = Depends(get_db)):
    if db.scalar(select(User).limit(1)) is not None:
        raise HTTPException(409, 'Setup is already done.')
    problem = security.password_problem(body.password)
    if problem:
        raise HTTPException(400, problem)
    u = User(email=body.email.strip().lower(), name=body.name.strip(), role='admin', password_hash=security.hash_password(body.password), totp_secret=security.new_totp_secret())
    db.add(u)
    db.commit()
    audit.log(db, u, 'Created the first admin account')
    return {'ok': True}


class LoginIn(BaseModel):
    email: str
    password: str


@api.post('/login')
def login(body: LoginIn, db: Session = Depends(get_db)):
    u = db.scalar(select(User).where(User.email == body.email.strip().lower()))
    if u and u.locked_until and u.locked_until > now():
        raise HTTPException(429, f'Too many attempts. Try again after {u.locked_until:%H:%M} UTC.')
    if not u or not u.active or not security.check_password(u.password_hash, body.password):
        if u:
            u.failed_logins += 1
            if u.failed_logins >= config.LOGIN_ATTEMPTS:
                u.locked_until = now() + timedelta(minutes=config.LOCKOUT_MINUTES)
                u.failed_logins = 0
            db.commit()
            audit.log(db, u, 'Failed sign-in (wrong password)')
        time.sleep(0.4)
        raise HTTPException(401, 'That email and password don’t match an account.')
    pending = security.pending_token(u.id)
    if not u.totp_confirmed:
        if not u.totp_secret:
            u.totp_secret = security.new_totp_secret()
            db.commit()
        uri = security.totp_uri(u.totp_secret, u.email)
        return {'step': 'enroll', 'pending': pending, 'qr': security.totp_qr_svg(uri), 'secret': security.totp_plain(u.totp_secret)}
    return {'step': 'code', 'pending': pending}


class CodeIn(BaseModel):
    pending: str
    code: str


@api.post('/login/code')
def login_code(body: CodeIn, response: Response, db: Session = Depends(get_db)):
    uid = security.read_pending(body.pending)
    u = db.get(User, uid) if uid else None
    if not u:
        raise HTTPException(401, 'That took too long. Start again.')
    if not security.check_totp(u.totp_secret, body.code.strip()):
        u.failed_logins += 1
        db.commit()
        audit.log(db, u, 'Failed sign-in (wrong code)')
        raise HTTPException(401, 'That code isn’t right. Check the time on your phone and try the newest code.')
    first = not u.totp_confirmed
    u.totp_confirmed = True
    u.failed_logins = 0
    token, h = security.new_session_token()
    db.add(LoginSession(token_hash=h, user_id=u.id, expires_at=security.session_expiry()))
    db.commit()
    response.set_cookie(COOKIE, token, httponly=True, samesite='strict', max_age=config.SESSION_HOURS * 3600, path='/')
    audit.log(db, u, 'Set up two-step sign-in and signed in' if first else 'Signed in')
    return {'ok': True, 'must_change_password': u.must_change_password}


@api.post('/logout')
def logout(request: Request, response: Response, user: User = Depends(current_user), db: Session = Depends(get_db)):
    token = request.cookies.get(COOKIE)
    if token:
        s = db.get(LoginSession, security.hash_token(token))
        if s:
            db.delete(s)
            db.commit()
    response.delete_cookie(COOKIE, path='/')
    audit.log(db, user, 'Signed out')
    return {'ok': True}


def user_out(u: User) -> dict:
    return {'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role, 'active': u.active, 'must_change_password': u.must_change_password, 'two_step': u.totp_confirmed}


@api.get('/me')
def me(user: User = Depends(current_user)):
    return {**user_out(user), 'ai': config.AI_ENABLED}


class PasswordIn(BaseModel):
    current: str
    new: str


@api.post('/me/password')
def change_password(body: PasswordIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if not security.check_password(user.password_hash, body.current):
        raise HTTPException(400, 'Your current password isn’t right.')
    problem = security.password_problem(body.new)
    if problem:
        raise HTTPException(400, problem)
    user.password_hash = security.hash_password(body.new)
    user.must_change_password = False
    db.commit()
    audit.log(db, user, 'Changed own password')
    return {'ok': True}


# ---------- People (admin) ----------


@api.get('/users')
def list_users(user: User = Depends(current_user), db: Session = Depends(get_db)):
    users = db.scalars(select(User).order_by(User.name)).all()
    if user.role != 'admin':
        return [{'id': u.id, 'name': u.name, 'role': u.role} for u in users if u.active]
    return [user_out(u) for u in users]


class NewUserIn(BaseModel):
    name: str
    email: str
    role: str


@api.post('/users')
def create_user(body: NewUserIn, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    if body.role not in ('admin', 'analyst', 'reviewer'):
        raise HTTPException(400, 'Role must be admin, analyst or reviewer.')
    email = body.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, 'Someone already uses that email.')
    temp = security.temp_password()
    u = User(email=email, name=body.name.strip(), role=body.role, password_hash=security.hash_password(temp), must_change_password=True, totp_secret=security.new_totp_secret())
    db.add(u)
    db.commit()
    audit.log(db, admin, f'Added {u.name} as {u.role}')
    return {**user_out(u), 'temp_password': temp}


class UserPatch(BaseModel):
    role: str | None = None
    active: bool | None = None
    reset: bool | None = None


@api.patch('/users/{uid}')
def update_user(uid: int, body: UserPatch, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    u = db.get(User, uid)
    if not u:
        raise HTTPException(404, 'No such person.')
    out = {}
    if body.role and body.role in ('admin', 'analyst', 'reviewer') and body.role != u.role:
        if u.id == admin.id:
            raise HTTPException(400, 'You can’t change your own role.')
        audit.log(db, admin, f'Changed {u.name}’s role from {u.role} to {body.role}')
        u.role = body.role
    if body.active is not None and body.active != u.active:
        if u.id == admin.id:
            raise HTTPException(400, 'You can’t switch off your own account.')
        u.active = body.active
        for s in db.scalars(select(LoginSession).where(LoginSession.user_id == u.id)):
            db.delete(s)
        audit.log(db, admin, f'{"Reactivated" if body.active else "Switched off"} {u.name}')
    if body.reset:
        temp = security.temp_password()
        u.password_hash = security.hash_password(temp)
        u.must_change_password = True
        u.totp_secret = security.new_totp_secret()
        u.totp_confirmed = False
        u.locked_until = None
        for s in db.scalars(select(LoginSession).where(LoginSession.user_id == u.id)):
            db.delete(s)
        out['temp_password'] = temp
        audit.log(db, admin, f'Reset {u.name}’s password and two-step sign-in')
    db.commit()
    return {**user_out(u), **out}


# ---------- Clients ----------


def _calendar(settings: dict) -> str:
    if 'ramadan' not in settings:
        return 'auto'
    if not settings['ramadan']:
        return 'other'
    return 'mena' if settings.get('weekend') == [4, 5] else 'gulf'


def client_out(c: Client, db: Session, full: bool = False) -> dict:
    out = {
        'id': c.id,
        'name': c.name,
        'industry': c.industry,
        'sector': c.sector,
        'contact': c.contact,
        'question': c.question,
        'status': c.status,
        'analyst': {'id': c.analyst.id, 'name': c.analyst.name} if c.analyst else None,
        'reviewer': {'id': c.reviewer.id, 'name': c.reviewer.name} if c.reviewer else None,
        'received_at': c.received_at.isoformat(),
        'delivered_at': c.delivered_at.isoformat() if c.delivered_at else None,
        'delete_on': c.delete_on.isoformat(),
        'currency': c.settings.get('currency', 'EGP'),
        'calendar': _calendar(c.settings),
        'files': db.query(DataFile).filter(DataFile.client_id == c.id).count(),
        'review_comment': c.review_comment,
    }
    if full:
        out['focus'] = c.settings.get('focus', [])
    return out


@api.get('/clients')
def list_clients(user: User = Depends(current_user), db: Session = Depends(get_db)):
    q = select(Client).where(Client.shredded.is_(False)).order_by(Client.received_at.desc())
    cs = db.scalars(q).all()
    if user.role != 'admin':
        cs = [c for c in cs if c.analyst_id == user.id or c.reviewer_id == user.id]
    return [client_out(c, db) for c in cs]


class ClientIn(BaseModel):
    name: str
    industry: str = ''
    sector: str = 'general'
    contact: str = ''
    question: str = ''
    analyst_id: int | None = None
    reviewer_id: int | None = None
    currency: str = 'EGP'


@api.post('/clients')
def create_client(body: ClientIn, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    c = Client(name=body.name.strip(), industry=body.industry, sector=body.sector, contact=body.contact, question=body.question, analyst_id=body.analyst_id, reviewer_id=body.reviewer_id, delete_on=now() + timedelta(days=config.WORKING_DAYS), data_key=security.new_client_key(), settings={'currency': body.currency.strip().upper() or 'EGP'})
    db.add(c)
    db.commit()
    audit.log(db, admin, f'Created client {c.name}' + (f', assigned to {c.analyst.name}' if c.analyst else ''), c.id)
    return client_out(c, db)


class ClientPatch(BaseModel):
    name: str | None = None
    industry: str | None = None
    sector: str | None = None
    contact: str | None = None
    question: str | None = None
    analyst_id: int | None = None
    reviewer_id: int | None = None
    currency: str | None = None
    calendar: str | None = None  # auto, mena (Ramadan, Fri–Sat), gulf (Ramadan, Sat–Sun), other
    extend_days: int | None = None


@api.patch('/clients/{cid}')
def update_client(cid: int, body: ClientPatch, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid, write=True)
    admin_fields = {'analyst_id', 'reviewer_id', 'extend_days'}
    changes = body.model_dump(exclude_unset=True)
    if user.role != 'admin' and admin_fields & set(changes):
        raise HTTPException(403, 'Only an admin can reassign a client or change its deletion date.')
    for k in ('name', 'industry', 'sector', 'contact', 'question'):
        if k in changes:
            setattr(c, k, changes[k])
    if 'currency' in changes:
        c.settings = {**c.settings, 'currency': (changes['currency'] or 'EGP').upper()}
    if 'calendar' in changes:
        cal = {'mena': {'ramadan': True, 'weekend': [4, 5]}, 'gulf': {'ramadan': True, 'weekend': [5, 6]}, 'other': {'ramadan': False, 'weekend': [5, 6]}}.get(changes['calendar'] or 'auto', {})
        c.settings = {**{k: v for k, v in c.settings.items() if k not in ('ramadan', 'weekend')}, **cal}
        _cache.clear()
    if 'analyst_id' in changes and changes['analyst_id'] != c.analyst_id:
        c.analyst_id = changes['analyst_id']
        db.flush()
        audit.log(db, user, f'Assigned {c.name} to {db.get(User, c.analyst_id).name if c.analyst_id else "nobody"}', c.id)
    if 'reviewer_id' in changes:
        c.reviewer_id = changes['reviewer_id']
    if changes.get('extend_days'):
        c.delete_on = c.delete_on + timedelta(days=int(changes['extend_days']))
        audit.log(db, user, f'Extended file deletion for {c.name} to {c.delete_on:%d %b %Y}', c.id)
    db.commit()
    return client_out(c, db, True)


@api.get('/clients/{cid}')
def get_client(cid: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid)
    return client_out(c, db, True)


@api.delete('/clients/{cid}')
def delete_client(cid: int, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    c = visible(db, admin, cid, write=True)
    shred(db, c, f'Deleted all of {c.name}’s data on request', admin)
    return {'ok': True}


def shred(db: Session, c: Client, reason: str, user: User | None = None) -> None:
    """Destroys the client's files and key. Results and notes, encrypted with that key, become unreadable."""
    for f in db.scalars(select(DataFile).where(DataFile.client_id == c.id)):
        storage.remove(f.blob)
        if f.options.get('std'):
            storage.remove(f.options['std'])
        db.delete(f)
    for s in db.scalars(select(ReportSection).where(ReportSection.client_id == c.id)):
        db.delete(s)
    for r in db.scalars(select(Run).where(Run.client_id == c.id)):
        db.delete(r)
    c.data_key = None
    c.summary = None
    c.shredded = True
    c.status = 'Deleted'
    db.commit()
    _cache.clear()
    audit.log(db, user, reason, c.id)


def retention_sweep(db: Session) -> int:
    due = db.scalars(select(Client).where(Client.shredded.is_(False), Client.delete_on < now())).all()
    for c in due:
        shred(db, c, f'Deleted {c.name}’s files on schedule ({c.delete_on:%d %b %Y})')
    return len(due)


# ---------- Files ----------


def file_out(f: DataFile) -> dict:
    return {'id': f.id, 'name': f.name, 'size': f.size, 'kind': f.kind, 'kind_label': intake.KINDS[f.kind].label if f.kind in intake.KINDS else None, 'columns': f.columns, 'mapping': f.mapping, 'options': {k: v for k, v in f.options.items() if k not in ('std', 'suggested')}, 'suggested': f.options.get('suggested'), 'rows': f.rows, 'ready': f.ready, 'health': f.health, 'uploaded_at': f.uploaded_at.isoformat()}


@api.get('/kinds')
def kinds(user: User = Depends(current_user)):
    return intake.describe_kinds()


@api.get('/clients/{cid}/files')
def list_files(cid: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    visible(db, user, cid)
    return [file_out(f) for f in db.scalars(select(DataFile).where(DataFile.client_id == cid).order_by(DataFile.uploaded_at))]


@api.post('/clients/{cid}/files')
async def upload(cid: int, files: list[UploadFile] = File(...), user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid, write=True)
    out = []
    for up in files:
        data = await up.read()
        if len(data) > config.MAX_UPLOAD_MB * 1024 * 1024:
            raise HTTPException(413, f'{up.filename} is over {config.MAX_UPLOAD_MB} MB. Split it or save it as CSV.')
        name = (up.filename or 'file').replace('\\', '/').split('/')[-1][:200]
        try:
            head = intake.read_raw(name, data, nrows=400)
        except ValueError as e:
            raise HTTPException(400, f'{name}: {e}') from e
        except Exception as e:  # noqa: BLE001
            raise HTTPException(400, f'{name} couldn’t be read. Is it a real CSV or Excel file? ({e})') from e
        kind, mapping, conf = intake.suggest_kind(name, head)
        f = DataFile(client_id=c.id, name=name, blob=storage.save(c.data_key, data), size=len(data), kind=kind, columns=list(head.columns), mapping=mapping, options={'suggested': {'kind': kind, 'confidence': round(conf, 2)}, 'sheets': intake.sheets(name, data)}, uploaded_by=user.id)
        db.add(f)
        db.commit()
        audit.log(db, user, f'Uploaded {name} ({len(data) / 1024:,.0f} KB, encrypted)', c.id)
        out.append(file_out(f))
    if c.status == 'Intake':
        c.status = 'Analysing'
        db.commit()
    return out


@api.get('/files/{fid}')
def get_file(fid: int, kind: str | None = None, sheet: str | None = None, header_row: int | None = None, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """The file with a preview. Trying another type, sheet or header row returns fresh column suggestions for it."""
    f = db.get(DataFile, fid)
    if not f:
        raise HTTPException(404, 'No such file.')
    c = visible(db, user, f.client_id)
    opts = {k: v for k, v in f.options.items() if k in ('sheet', 'header_row')}
    if sheet is not None:
        opts['sheet'] = sheet or None
    if header_row is not None:
        opts['header_row'] = header_row if header_row >= 0 else None
    try:
        raw = intake.read_raw(f.name, storage.load(c.data_key, f.blob), opts, nrows=400)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(400, f'That sheet or header row can’t be read: {e}') from e
    out = {**file_out(f), 'preview': intake.preview(raw, 12), 'preview_columns': list(raw.columns)}
    changed = (sheet is not None or header_row is not None) and list(raw.columns) != f.columns
    if (kind and kind in intake.KINDS and kind != f.kind) or changed:
        k = kind if kind in intake.KINDS else f.kind
        out['kind'], out['mapping'], out['columns'] = k, intake.suggest_mapping(k, raw), list(raw.columns)
    if out['kind'] == 'adswide':
        out['spend_columns'] = intake.wide_spend_columns(raw, out['mapping'])
    return out


class MappingIn(BaseModel):
    kind: str
    mapping: dict[str, str]
    options: dict = {}


@api.put('/files/{fid}/mapping')
def set_mapping(fid: int, body: MappingIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    f = db.get(DataFile, fid)
    if not f:
        raise HTTPException(404, 'No such file.')
    c = visible(db, user, f.client_id, write=True)
    if body.kind not in intake.KINDS:
        raise HTTPException(400, 'Unknown file type.')
    mapping = {k: v for k, v in body.mapping.items() if v}
    problems = intake.mapping_problems(body.kind, mapping)
    if problems:
        raise HTTPException(400, ' '.join(problems))
    opts = {k: v for k, v in body.options.items() if k in ('sheet', 'header_row', 'dayfirst')}
    raw = intake.read_raw(f.name, storage.load(c.data_key, f.blob), opts)
    if set(mapping.values()) - set(raw.columns):
        raise HTTPException(400, 'Some chosen columns aren’t in the file. Reload the page and try again.')
    try:
        std, health = intake.standardize(body.kind, raw, mapping, dict(opts))
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    if std.empty:
        raise HTTPException(400, 'No usable rows after cleaning. Check the date and number columns.')
    old_std = f.options.get('std')
    buf = io.BytesIO()
    std.to_pickle(buf)
    f.kind, f.mapping, f.rows, f.health, f.ready = body.kind, mapping, len(std), health, True
    f.options = {**{k: v for k, v in f.options.items() if k not in ('sheet', 'header_row', 'dayfirst')}, **opts, 'std': storage.save(c.data_key, buf.getvalue())}
    db.commit()
    if old_std:
        storage.remove(old_std)
    _cache.clear()
    audit.log(db, user, f'Confirmed {f.name} as {intake.KINDS[f.kind].label}: {len(std):,} clean rows', c.id)
    return file_out(f)


@api.delete('/files/{fid}')
def delete_file(fid: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    f = db.get(DataFile, fid)
    if not f:
        raise HTTPException(404, 'No such file.')
    c = visible(db, user, f.client_id, write=True)
    storage.remove(f.blob)
    if f.options.get('std'):
        storage.remove(f.options['std'])
    db.delete(f)
    db.commit()
    _cache.clear()
    audit.log(db, user, f'Deleted file {f.name}', c.id)
    return {'ok': True}


# ---------- Analysis ----------

_cache: OrderedDict = OrderedDict()
_cache_lock = threading.Lock()


def client_data(db: Session, c: Client) -> tuple[engine.Data, dict]:
    files = db.scalars(select(DataFile).where(DataFile.client_id == c.id, DataFile.ready.is_(True))).all()
    key = (c.id, tuple((f.id, f.options.get('std')) for f in files))
    with _cache_lock:
        if key in _cache:
            _cache.move_to_end(key)
            return _cache[key]
    tables: dict[str, list[pd.DataFrame]] = {}
    for f in files:
        # Our own encrypted, authenticated blob: only this app could have written it.
        tables.setdefault(intake.KINDS[f.kind].store_as or f.kind, []).append(pickle.loads(storage.load(c.data_key, f.options['std'])))  # noqa: S301
    info = {'files': [{'name': f.name, 'kind': f.kind, 'kind_label': intake.KINDS[f.kind].label, 'rows': f.rows, 'health': f.health} for f in files], 'sector': c.sector, 'currency': c.settings.get('currency', 'EGP')}
    out = (engine.build_data(tables, market_settings(info['currency'], c.settings)), info)
    with _cache_lock:
        _cache[key] = out
        while len(_cache) > 4:
            _cache.popitem(last=False)
    return out


@api.get('/catalog')
def catalog(user: User = Depends(current_user)):
    return {'departments': engine.DEPTS, 'services': engine.catalog()}


@api.get('/clients/{cid}/services')
def client_services(cid: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid)
    data, info = client_data(db, c)
    latest = {}
    for r in db.scalars(select(Run).where(Run.client_id == cid).order_by(Run.created_at)):
        latest[r.service_id] = {'id': r.id, 'at': r.created_at.isoformat(), 'level': r.level}
    out = []
    for s in engine.SERVICES:
        r = engine.readiness(s, data)
        out.append({'id': s.id, **r, 'last_run': latest.get(s.id), 'params': engine.start_params(s, data, info) if s.params else {}})
    return {'kinds': sorted(data.kinds), 'services': out}


class RunIn(BaseModel):
    service_id: str
    params: dict = {}


def run_out(r: Run, c: Client) -> dict:
    return {'id': r.id, 'service_id': r.service_id, 'level': r.level, 'params': r.params, 'created_at': r.created_at.isoformat(), 'ms': r.duration_ms, 'result': json.loads(security.client_cipher(c.data_key).decrypt(r.result))}


@api.post('/clients/{cid}/runs')
def run_service(cid: int, body: RunIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid, write=True)
    if body.service_id not in engine.BY_ID:
        raise HTTPException(404, 'No such service.')
    data, info = client_data(db, c)
    out = engine.run(body.service_id, data, body.params, info)
    name = engine.BY_ID[body.service_id].name
    if 'error' in out:
        audit.log(db, user, f'Ran “{name}”: could not complete ({out["error"][:120]})', c.id)
        return {'error': out['error'], 'level': out['level'], 'params': out.get('params', {})}
    r = Run(client_id=c.id, service_id=body.service_id, params=out['params'], level=out['level'], result=security.client_cipher(c.data_key).encrypt(json.dumps(out['result']).encode()), files=[f['name'] for f in info['files']], duration_ms=out['ms'], created_by=user.id)
    db.add(r)
    db.commit()
    audit.log(db, user, f'Ran “{name}”', c.id)
    return {**run_out(r, c), 'why': out.get('why')}


@api.get('/clients/{cid}/runs')
def list_runs(cid: int, service_id: str | None = None, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid)
    q = select(Run).where(Run.client_id == cid)
    if service_id:
        q = q.where(Run.service_id == service_id)
    runs = db.scalars(q.order_by(Run.created_at.desc()).limit(20)).all()
    return [run_out(r, c) for r in runs]


# ---------- Report and review ----------


def report_out(c: Client, db: Session) -> dict:
    secs = db.scalars(select(ReportSection).where(ReportSection.client_id == c.id).order_by(ReportSection.position, ReportSection.id)).all()
    out = []
    for s in secs:
        r = db.get(Run, s.run_id)
        if r:
            out.append({'id': s.id, 'position': s.position, 'note': security.decrypt_text(c.data_key, s.note), 'run': run_out(r, c), 'service': engine.describe(engine.BY_ID[r.service_id])})
    return {'client': client_out(c, db), 'summary': security.decrypt_text(c.data_key, c.summary), 'sections': out}


@api.get('/clients/{cid}/report')
def get_report(cid: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid)
    return report_out(c, db)


class SectionIn(BaseModel):
    run_id: int


@api.post('/clients/{cid}/report/sections')
def add_section(cid: int, body: SectionIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid, write=True)
    r = db.get(Run, body.run_id)
    if not r or r.client_id != c.id:
        raise HTTPException(404, 'No such result.')
    # One section per service: a newer run replaces the older one.
    for s in db.scalars(select(ReportSection).where(ReportSection.client_id == c.id)):
        old = db.get(Run, s.run_id)
        if old and old.service_id == r.service_id:
            s.run_id = r.id
            db.commit()
            audit.log(db, user, f'Updated “{engine.BY_ID[r.service_id].name}” in the report', c.id)
            return report_out(c, db)
    pos = len(db.scalars(select(ReportSection).where(ReportSection.client_id == c.id)).all())
    db.add(ReportSection(client_id=c.id, run_id=r.id, position=pos))
    db.commit()
    audit.log(db, user, f'Added “{engine.BY_ID[r.service_id].name}” to the report', c.id)
    return report_out(c, db)


class SectionPatch(BaseModel):
    note: str | None = None
    position: int | None = None


@api.patch('/sections/{sid}')
def update_section(sid: int, body: SectionPatch, user: User = Depends(current_user), db: Session = Depends(get_db)):
    s = db.get(ReportSection, sid)
    if not s:
        raise HTTPException(404, 'No such section.')
    c = visible(db, user, s.client_id, write=True)
    if body.note is not None:
        s.note = security.encrypt_text(c.data_key, body.note[:5000])
    if body.position is not None:
        secs = db.scalars(select(ReportSection).where(ReportSection.client_id == c.id).order_by(ReportSection.position, ReportSection.id)).all()
        secs.remove(s)
        secs.insert(max(0, min(body.position, len(secs))), s)
        for i, x in enumerate(secs):
            x.position = i
    db.commit()
    return report_out(c, db)


@api.delete('/sections/{sid}')
def delete_section(sid: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    s = db.get(ReportSection, sid)
    if not s:
        raise HTTPException(404, 'No such section.')
    c = visible(db, user, s.client_id, write=True)
    db.delete(s)
    db.commit()
    audit.log(db, user, 'Removed a section from the report', c.id)
    return report_out(c, db)


class SummaryIn(BaseModel):
    text: str


@api.put('/clients/{cid}/report/summary')
def set_summary(cid: int, body: SummaryIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid, write=True)
    c.summary = security.encrypt_text(c.data_key, body.text[:20000])
    db.commit()
    return {'ok': True}


@api.post('/clients/{cid}/report/submit')
def submit(cid: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid, write=True)
    if not db.scalar(select(ReportSection).where(ReportSection.client_id == c.id).limit(1)):
        raise HTTPException(400, 'Add at least one section before sending for review.')
    c.status = 'In review'
    c.review_comment = ''
    db.commit()
    audit.log(db, user, f'Sent the report for review{" to " + c.reviewer.name if c.reviewer else ""}', c.id)
    return client_out(c, db)


class ReviewIn(BaseModel):
    approve: bool
    comment: str = ''


@api.post('/clients/{cid}/report/review')
def review(cid: int, body: ReviewIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid)
    if user.role != 'admin' and c.reviewer_id != user.id:
        raise HTTPException(403, 'Only the reviewer or an admin can approve.')
    if c.analyst_id == user.id and user.role != 'admin':
        raise HTTPException(403, 'The analyst can’t approve their own report.')
    if c.status != 'In review':
        raise HTTPException(400, 'This report isn’t waiting for review.')
    c.status = 'Approved' if body.approve else 'Changes requested'
    c.review_comment = body.comment[:2000]
    db.commit()
    audit.log(db, user, f'{"Approved" if body.approve else "Asked for changes to"} the report' + (f': {body.comment[:120]}' if body.comment else ''), c.id)
    return client_out(c, db)


@api.post('/clients/{cid}/report/deliver')
def deliver(cid: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    c = visible(db, user, cid, write=True)
    if c.status != 'Approved':
        raise HTTPException(400, 'The report must be approved before it’s delivered.')
    c.status = 'Delivered'
    c.delivered_at = now()
    c.delete_on = now() + timedelta(days=config.RETENTION_DAYS)
    db.commit()
    audit.log(db, user, f'Marked the report delivered; files will be deleted on {c.delete_on:%d %b %Y}', c.id)
    return client_out(c, db)


@api.get('/clients/{cid}/report.{fmt}')
def export(cid: int, fmt: str, user: User = Depends(current_user), db: Session = Depends(get_db)):
    from . import reports

    c = visible(db, user, cid)
    rep = report_out(c, db)
    if not rep['sections']:
        raise HTTPException(400, 'The report has no sections yet.')
    if fmt == 'docx':
        data, mime = reports.to_docx(rep), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    elif fmt == 'xlsx':
        data, mime = reports.to_xlsx(rep), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    else:
        raise HTTPException(404, 'Choose docx or xlsx.')
    audit.log(db, user, f'Exported the report as {fmt.upper()}', c.id)
    safe = ''.join(ch for ch in c.name if ch.isalnum() or ch in ' -_').strip().replace(' ', '_') or 'report'
    return Response(data, media_type=mime, headers={'Content-Disposition': f'attachment; filename="{safe}_report.{fmt}"'})


# ---------- Activity ----------


@api.get('/activity')
def activity(client_id: int | None = None, user: User = Depends(current_user), db: Session = Depends(get_db)):
    q = select(Activity).order_by(Activity.id.desc()).limit(300)
    if client_id:
        visible(db, user, client_id)
        q = q.where(Activity.client_id == client_id)
    rows = db.scalars(q).all()
    if user.role != 'admin' and not client_id:
        mine = {c.id for c in db.scalars(select(Client).where((Client.analyst_id == user.id) | (Client.reviewer_id == user.id)))}
        rows = [a for a in rows if a.client_id in mine or a.user_id == user.id]
    names = {c.id: c.name for c in db.scalars(select(Client))}
    out = [{'at': a.at.isoformat(), 'who': a.user_name, 'client': names.get(a.client_id), 'what': a.action} for a in rows]
    intact = audit.verify(db)[0] if user.role == 'admin' else None
    return {'entries': out, 'chain_intact': intact}
