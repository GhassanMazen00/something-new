"""Database tables. SQLite on this computer; the same models move to Postgres on a server later."""

from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, LargeBinary, String, Text, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

from . import config


def now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(200), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(20))  # admin, analyst, reviewer
    password_hash: Mapped[str] = mapped_column(String(200))
    totp_secret: Mapped[bytes | None] = mapped_column(LargeBinary)  # encrypted with the master key
    totp_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    failed_logins: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class LoginSession(Base):
    __tablename__ = 'sessions'
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    user: Mapped[User] = relationship()


class Client(Base):
    __tablename__ = 'clients'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    industry: Mapped[str] = mapped_column(String(200), default='')
    sector: Mapped[str] = mapped_column(String(40), default='general')
    contact: Mapped[str] = mapped_column(String(200), default='')
    question: Mapped[str] = mapped_column(Text, default='')
    analyst_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'))
    reviewer_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'))
    status: Mapped[str] = mapped_column(String(30), default='Intake')
    received_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime)
    delete_on: Mapped[datetime] = mapped_column(DateTime)
    # This client's own data key, encrypted with the master key. Deleting it makes every file and result unreadable.
    data_key: Mapped[bytes | None] = mapped_column(LargeBinary)
    shredded: Mapped[bool] = mapped_column(Boolean, default=False)
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    summary: Mapped[bytes | None] = mapped_column(LargeBinary)  # report summary, encrypted
    review_comment: Mapped[str] = mapped_column(Text, default='')
    analyst: Mapped[User | None] = relationship(foreign_keys=[analyst_id])
    reviewer: Mapped[User | None] = relationship(foreign_keys=[reviewer_id])


class DataFile(Base):
    __tablename__ = 'files'
    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey('clients.id'))
    name: Mapped[str] = mapped_column(String(300))
    blob: Mapped[str] = mapped_column(String(80))
    size: Mapped[int] = mapped_column(Integer)
    kind: Mapped[str | None] = mapped_column(String(30))
    columns: Mapped[list] = mapped_column(JSON, default=list)
    mapping: Mapped[dict] = mapped_column(JSON, default=dict)
    options: Mapped[dict] = mapped_column(JSON, default=dict)
    rows: Mapped[int] = mapped_column(Integer, default=0)
    ready: Mapped[bool] = mapped_column(Boolean, default=False)
    health: Mapped[dict] = mapped_column(JSON, default=dict)
    uploaded_by: Mapped[int | None] = mapped_column(ForeignKey('users.id'))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class Run(Base):
    __tablename__ = 'runs'
    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey('clients.id'))
    service_id: Mapped[str] = mapped_column(String(80))
    params: Mapped[dict] = mapped_column(JSON, default=dict)
    level: Mapped[str] = mapped_column(String(10))
    result: Mapped[bytes] = mapped_column(LargeBinary)  # encrypted with the client's key
    files: Mapped[list] = mapped_column(JSON, default=list)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_by: Mapped[int | None] = mapped_column(ForeignKey('users.id'))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)


class ReportSection(Base):
    __tablename__ = 'report_sections'
    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey('clients.id'))
    run_id: Mapped[int] = mapped_column(ForeignKey('runs.id'))
    position: Mapped[int] = mapped_column(Integer, default=0)
    note: Mapped[bytes | None] = mapped_column(LargeBinary)  # analyst's commentary, encrypted


class Activity(Base):
    __tablename__ = 'activity'
    id: Mapped[int] = mapped_column(primary_key=True)
    at: Mapped[datetime] = mapped_column(DateTime, default=now)
    user_id: Mapped[int | None] = mapped_column(Integer)
    user_name: Mapped[str] = mapped_column(String(120))
    client_id: Mapped[int | None] = mapped_column(Integer)
    action: Mapped[str] = mapped_column(Text)
    prev_hash: Mapped[str] = mapped_column(String(64))
    hash: Mapped[str] = mapped_column(String(64))


engine = None
SessionLocal: sessionmaker[Session] | None = None


def init(url: str | None = None) -> None:
    global engine, SessionLocal
    config.ensure_dirs()
    engine = create_engine(url or f'sqlite:///{config.DB_PATH}', connect_args={'check_same_thread': False})

    @event.listens_for(engine, 'connect')
    def _pragmas(conn, _):  # noqa: ANN001
        cur = conn.cursor()
        cur.execute('PRAGMA foreign_keys=ON')
        cur.execute('PRAGMA journal_mode=WAL')
        cur.close()

    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(engine, expire_on_commit=False)


def get_db():
    assert SessionLocal is not None
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
