#!/usr/bin/env bash
set -e

PORT="${PORT:-8000}"

python -c "import email_validator; print('email_validator OK')"

alembic upgrade head

# ✅ Seed (no duplica porque tu seed revisa count())
python -m app.db.seed_runner

exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
