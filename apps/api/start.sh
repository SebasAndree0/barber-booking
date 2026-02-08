#!/usr/bin/env bash
set -e

PORT="${PORT:-8000}"

python -c "import email_validator; print('email_validator OK')"

alembic upgrade head

# 👇 DEBUG: counts BEFORE seed
python -c "from app.db.session import SessionLocal; \
from app.models.barber import Barber; from app.models.service import Service; \
db=SessionLocal(); \
print('BEFORE seed -> barbers:', db.query(Barber).count(), 'services:', db.query(Service).count()); \
db.close()"

python -m app.db.seed_runner

# 👇 DEBUG: counts AFTER seed
python -c "from app.db.session import SessionLocal; \
from app.models.barber import Barber; from app.models.service import Service; \
db=SessionLocal(); \
print('AFTER seed -> barbers:', db.query(Barber).count(), 'services:', db.query(Service).count()); \
db.close()"

exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
