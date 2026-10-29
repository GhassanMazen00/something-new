"""Start the workspace: python -m clearline

Other commands:
  python -m clearline reset EMAIL   new temporary password and two-step setup for one person (e.g. a lost phone)
  python -m clearline check         checks the activity log hasn't been edited
"""

import sys
import threading
import webbrowser

from . import config


def serve() -> None:
    import uvicorn

    from .app import create_app

    url = f'http://{config.HOST}:{config.PORT}'
    print(f'\n  Clearline workspace is running at {url}\n  Data folder: {config.DATA_DIR}\n  Keep this window open. Press Ctrl+C to stop.\n')
    threading.Timer(1.5, lambda: webbrowser.open(url)).start()
    uvicorn.run(create_app(), host=config.HOST, port=config.PORT, log_level='warning')


def reset(email: str) -> None:
    from sqlalchemy import select

    from . import audit, db, security

    db.init()
    s = db.SessionLocal()
    u = s.scalar(select(db.User).where(db.User.email == email.strip().lower()))
    if not u:
        sys.exit(f'No account with the email {email}.')
    temp = security.temp_password()
    u.password_hash = security.hash_password(temp)
    u.must_change_password = True
    u.totp_secret = security.new_totp_secret()
    u.totp_confirmed = False
    u.locked_until = None
    u.failed_logins = 0
    for x in s.scalars(select(db.LoginSession).where(db.LoginSession.user_id == u.id)):
        s.delete(x)
    s.commit()
    audit.log(s, None, f'Reset {u.name}’s password and two-step sign-in from this computer')
    print(f'\n  {u.name} can now sign in with the temporary password:  {temp}\n  They will set a new password and scan a new code.\n')


def check() -> None:
    from . import audit, db

    db.init()
    ok, bad = audit.verify(db.SessionLocal())
    print('\n  Activity log intact.\n' if ok else f'\n  The activity log was changed at entry {bad}.\n')


def main() -> None:
    args = sys.argv[1:]
    if not args:
        serve()
    elif args[0] == 'reset' and len(args) == 2:
        reset(args[1])
    elif args[0] == 'check':
        check()
    else:
        print(__doc__)


if __name__ == '__main__':
    main()
